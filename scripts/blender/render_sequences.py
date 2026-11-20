"""
LST Express — rendu des séquences d'images réalistes (Blender 4.x, Cycles).

Entrées  : assets-src/models/{truck,reachstacker,ship,plane}.glb (modèles sous licence, non versionnés)
           scripts/sequences.config.json (séquences, livrées, réglages)
           public/brand/lst-monogramme.png (décor LST sur la remorque / le conteneur)
Sorties  : assets-src/renders/<séquence>[-<livrée>]/frame_000.png … (RGBA, fond transparent)
           assets-src/renders/truck-side-<livrée>/wheels.json (positions des roues en % du cadre)
           assets-src/renders/wheel/frame_000.png
Ensuite  : npm run assets:encode

Usage (depuis la racine du projet) :
  blender -b -P scripts/blender/render_sequences.py --
  blender -b -P scripts/blender/render_sequences.py -- --only truck-rotate --variant yellow --samples 64
  blender -b -P scripts/blender/render_sequences.py -- --preview      (résolution 50 %, 32 échantillons)

Conventions des modèles (ajustables dans sequences.config.json > blender.models) :
  - unités en mètres, sol à Z = 0, avant du véhicule vers +X (sinon renseigner "forward") ;
  - roues du camion : objets dont le nom correspond à "wheelPattern" (masqués pour truck-side) ;
  - matériaux recolorés selon "materials" (motif de nom → rôle : cab / white / anthracite) ;
  - reachstacker : une action glTF nommée "load" (facultatif) et un objet / os "spreader".
"""

import argparse
import json
import math
import os
import random
import re
import sys

import bpy
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Matrix, Vector

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
CONFIG = json.load(open(os.path.join(ROOT, "scripts", "sequences.config.json"), encoding="utf-8"))
BL = CONFIG["blender"]
MODELS = os.path.join(ROOT, "assets-src", "models")
OUT = os.path.join(ROOT, "assets-src", "renders")
MONOGRAM = os.path.join(ROOT, "public", "brand", "lst-monogramme.png")
MONO_RATIO = 277 / 124

ROLE_COLORS = {"white": "#f2f3f5", "anthracite": "#33373d"}


# --------------------------------------------------------------------------- utilitaires
def parse_args():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    p = argparse.ArgumentParser()
    p.add_argument("--only", default="", help="séquences, séparées par des virgules")
    p.add_argument("--variant", default="", help="livrée : yellow, black (défaut : toutes)")
    p.add_argument("--samples", type=int, default=BL["samples"])
    p.add_argument("--preview", action="store_true")
    return p.parse_args(argv)


def hex_rgba(h):
    h = h.lstrip("#")
    srgb = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in srgb]
    return (*lin, 1.0)


def ease_in_out(t):
    return 0.5 - math.cos(math.pi * t) / 2


def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def setup_render(width, height, samples, preview):
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    prefs = bpy.context.preferences.addons.get("cycles")
    if prefs:
        for backend in ("OPTIX", "CUDA", "HIP", "METAL", "ONEAPI"):
            try:
                prefs.preferences.compute_device_type = backend
                prefs.preferences.get_devices()
                if any(d.type != "CPU" for d in prefs.preferences.devices):
                    for d in prefs.preferences.devices:
                        d.use = True
                    sc.cycles.device = "GPU"
                    break
            except TypeError:
                continue
    sc.cycles.samples = 32 if preview else samples
    sc.cycles.use_denoising = True
    sc.cycles.use_adaptive_sampling = True
    sc.render.film_transparent = True
    sc.render.resolution_x = width
    sc.render.resolution_y = height
    sc.render.resolution_percentage = 50 if preview else 100
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_mode = "RGBA"
    sc.render.image_settings.color_depth = "8"
    try:
        sc.view_settings.view_transform = "AgX"
    except TypeError:
        sc.view_settings.view_transform = "Filmic"
    sc.view_settings.look = "None"


def setup_world():
    """Éclairage studio doux : HDRI si fourni (assets-src/hdri/studio.exr), sinon gris neutre + 3 softboxes."""
    world = bpy.data.worlds.new("World")
    bpy.context.scene.world = world
    world.use_nodes = True
    nt = world.node_tree
    bg = nt.nodes["Background"]
    hdri = os.path.join(ROOT, BL.get("hdri", ""))
    if BL.get("hdri") and os.path.exists(hdri):
        env = nt.nodes.new("ShaderNodeTexEnvironment")
        env.image = bpy.data.images.load(hdri)
        nt.links.new(env.outputs["Color"], bg.inputs["Color"])
        bg.inputs["Strength"].default_value = 0.8
    else:
        bg.inputs["Color"].default_value = (0.6, 0.62, 0.65, 1)
        bg.inputs["Strength"].default_value = 0.35

    def area(name, loc, size, energy, color=(1, 1, 1)):
        data = bpy.data.lights.new(name, "AREA")
        data.size = size
        data.energy = energy
        data.color = color
        obj = bpy.data.objects.new(name, data)
        bpy.context.collection.objects.link(obj)
        obj.location = loc
        direction = Vector((0, 0, 1.5)) - Vector(loc)
        obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
        return obj

    area("Key", (8, -14, 18), 14, 9000)
    area("Fill", (-14, -10, 8), 18, 2500, (0.92, 0.96, 1.0))
    area("Rim", (-4, 16, 12), 10, 4000, (1.0, 0.97, 0.9))


def shadow_catcher(size=200):
    bpy.ops.mesh.primitive_plane_add(size=size, location=(0, 0, 0))
    plane = bpy.context.active_object
    plane.name = "ShadowCatcher"
    plane.is_shadow_catcher = True
    return plane


def import_glb(name):
    cfg = BL["models"][name]
    path = os.path.join(MODELS, cfg["file"])
    if not os.path.exists(path):
        raise FileNotFoundError(f"Modèle manquant : {path} (voir docs/assets.md)")
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=path)
    objs = [o for o in bpy.data.objects if o not in before]
    root = bpy.data.objects.new(f"{name}_root", None)
    bpy.context.collection.objects.link(root)
    for o in objs:
        if o.parent is None:
            o.parent = root
    # Orientation : amener l'avant du modèle sur +X.
    rot = {"+X": 0, "-X": math.pi, "+Y": -math.pi / 2, "-Y": math.pi / 2}[cfg.get("forward", "+X")]
    root.rotation_euler = (0, 0, rot)
    root.scale = [cfg.get("scale", 1.0)] * 3
    bpy.context.view_layer.update()
    # Centrer en X/Y, poser au sol.
    lo, hi = bounds(objs)
    root.location = (-(lo.x + hi.x) / 2, -(lo.y + hi.y) / 2, -lo.z)
    bpy.context.view_layer.update()
    return root, objs


def meshes(objs):
    return [o for o in objs if o.type == "MESH"]


def bounds(objs):
    pts = [o.matrix_world @ Vector(c) for o in meshes(objs) for c in o.bound_box]
    lo = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
    hi = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    return lo, hi


def make_material(name, color, roughness=0.45, metallic=0.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = hex_rgba(color)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    return mat


def recolor(objs, rules, livery):
    """Applique la livrée LST : couleur de base des matériaux dont le nom correspond au motif."""
    for o in meshes(objs):
        for slot in o.material_slots:
            m = slot.material
            if not m or not m.use_nodes:
                continue
            for pattern, role in rules.items():
                if re.search(pattern, m.name) or re.search(pattern, o.name):
                    color = livery["cab"] if role == "cab" else ROLE_COLORS[role]
                    bsdf = next((n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED"), None)
                    if bsdf:
                        for link in list(bsdf.inputs["Base Color"].links):
                            m.node_tree.links.remove(link)
                        bsdf.inputs["Base Color"].default_value = hex_rgba(color)
                        if role == "cab":
                            bsdf.inputs["Roughness"].default_value = 0.28
                    break


def decal(parent, width, center, side_y, top=False):
    """Plan texturé (monogramme LST) collé sur une face (côté −Y ou toit)."""
    height = width / MONO_RATIO
    bpy.ops.mesh.primitive_plane_add(size=1, location=center)
    p = bpy.context.active_object
    p.name = "LST_decal"
    p.scale = (width, height, 1)
    if not top:
        p.rotation_euler = (math.pi / 2, 0, 0)
        p.location.y = side_y - 0.005
    mat = bpy.data.materials.new("LST_decal")
    mat.use_nodes = True
    nt = mat.node_tree
    tex = nt.nodes.new("ShaderNodeTexImage")
    tex.image = bpy.data.images.load(MONOGRAM)
    bsdf = nt.nodes["Principled BSDF"]
    nt.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
    nt.links.new(tex.outputs["Alpha"], bsdf.inputs["Alpha"])
    bsdf.inputs["Roughness"].default_value = 0.4
    p.data.materials.append(mat)
    p.parent = parent
    p.matrix_parent_inverse = parent.matrix_world.inverted()
    return p


def container_box(name, location, color="#f2f3f5", length=12.19, width=2.44, height=2.59):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(location[0], location[1], location[2] + height / 2))
    c = bpy.context.active_object
    c.name = name
    c.scale = (length, width, height)
    bpy.ops.object.transform_apply(scale=True)
    bev = c.modifiers.new("bevel", "BEVEL")
    bev.width = 0.03
    c.data.materials.append(make_material(f"{name}_mat", color, 0.5, 0.2))
    return c


# --------------------------------------------------------------------------- caméras
def camera(name="Cam", ortho_scale=None, lens=None):
    data = bpy.data.cameras.new(name)
    if ortho_scale:
        data.type = "ORTHO"
        data.ortho_scale = ortho_scale
    else:
        data.lens = lens or 85
    data.clip_end = 2000
    cam = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(cam)
    bpy.context.scene.camera = cam
    return cam


def look(cam, position, target, up):
    """Oriente la caméra (−Z vers la cible, +Y vers `up`) sans singularité en vue du dessus."""
    f = (Vector(target) - Vector(position)).normalized()
    u = Vector(up).normalized()
    u = (u - f * f.dot(u)).normalized()
    z = -f
    x = u.cross(z).normalized()
    rot = Matrix((x, u, z)).transposed()
    cam.matrix_world = Matrix.Translation(position) @ rot.to_4x4()


def orbit_side_to_top(cam, phi, pivot_z, distance):
    """φ = 0 : vue de côté (caméra en −Y) ; φ = π/2 : vue du dessus, avant du camion vers la droite."""
    pos = Vector((0, -distance * math.cos(phi), pivot_z + distance * math.sin(phi)))
    up = Vector((0, math.sin(phi), math.cos(phi)))
    look(cam, pos, (0, 0, pivot_z), up)


def render_to(name, index):
    path = os.path.join(OUT, name, f"frame_{index:03d}.png")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    bpy.context.scene.render.filepath = path
    bpy.ops.render.render(write_still=True)
    print(f"  → {os.path.relpath(path, ROOT)}")


def seq(name):
    s = CONFIG["sequences"][name]
    return s["frames"], s["resolution"]


# --------------------------------------------------------------------------- scènes
def truck_scene(variant, livery):
    reset_scene()
    setup_world()
    shadow_catcher()
    cfg = BL["models"]["truck"]
    root, objs = import_glb("truck")
    recolor(objs, cfg.get("materials", {}), livery)
    d = cfg.get("decal")
    if d:
        targets = [o for o in meshes(objs) if re.search(d["target"], o.name)]
        if targets:
            lo, hi = bounds(targets)
            decal(targets[0], d["width"], (lo.x + (hi.x - lo.x) / 2 + d["offsetX"], lo.y, d["centerZ"]), lo.y)
            decal(targets[0], d["width"] * 0.85, ((lo.x + hi.x) / 2 + d["offsetX"], (lo.y + hi.y) / 2, hi.z + 0.005), lo.y, top=True)
    wheels = [o for o in meshes(objs) if re.search(cfg["wheelPattern"], o.name)]
    return root, objs, wheels


def render_truck(args, variant, livery, todo):
    root, objs, wheels = truck_scene(variant, livery)
    tv = BL["truckView"]
    cam = camera(ortho_scale=tv["orthoScale"])

    if "truck-side" in todo or "wheel" in todo:
        n, (w, h) = seq("truck-side")
        setup_render(w, h, args.samples, args.preview)
        orbit_side_to_top(cam, 0, tv["pivotZ"], tv["distance"])
        bpy.context.view_layer.update()
        sc = bpy.context.scene
        # Positions des roues côté caméra (Y < 0), en % du cadre.
        near = [o for o in wheels if (o.matrix_world @ Vector((0, 0, 0))).y <= 0.05] or wheels
        out = []
        for o in sorted(near, key=lambda o: o.matrix_world.translation.x):
            lo, hi = bounds([o])
            c = (lo + hi) / 2
            v = world_to_camera_view(sc, cam, c)
            out.append({"x": round(v.x * 100, 3), "y": round((1 - v.y) * 100, 3), "d": round((hi.z - lo.z) / tv["orthoScale"] * 100, 3)})
        if "truck-side" in todo:
            for o in wheels:
                o.hide_render = True
            render_to(f"truck-side-{variant}", 0)
            json.dump(out, open(os.path.join(OUT, f"truck-side-{variant}", "wheels.json"), "w"), indent=2)
            for o in wheels:
                o.hide_render = False
        if "wheel" in todo and near:
            # Une roue seule, cadrée serrée, vue de côté (tourne ensuite en CSS).
            ww, wh = CONFIG["sequences"]["wheel"]["resolution"]
            setup_render(ww, wh, args.samples, args.preview)
            hidden = [o for o in meshes(objs) if o not in near[:1]]
            for o in hidden:
                o.hide_render = True
            lo, hi = bounds(near[:1])
            c = (lo + hi) / 2
            cam.data.ortho_scale = (hi.z - lo.z) * 1.02
            look(cam, (c.x, c.y - tv["distance"], c.z), c, (0, 0, 1))
            bpy.data.objects["ShadowCatcher"].hide_render = True
            render_to("wheel", 0)
            for o in hidden:
                o.hide_render = False
            bpy.data.objects["ShadowCatcher"].hide_render = False
            cam.data.ortho_scale = tv["orthoScale"]

    if "truck-rotate" in todo:
        n, (w, h) = seq("truck-rotate")
        setup_render(w, h, args.samples, args.preview)
        for i in range(n):
            orbit_side_to_top(cam, (math.pi / 2) * ease_in_out(i / (n - 1)), tv["pivotZ"], tv["distance"])
            render_to(f"truck-rotate-{variant}", i)

    if "truck-top" in todo:
        n, (w, h) = seq("truck-top")
        setup_render(w, h, args.samples, args.preview)
        orbit_side_to_top(cam, math.pi / 2, tv["pivotZ"], tv["distance"])
        render_to(f"truck-top-{variant}", 0)


def render_reachstacker(args, variant, livery):
    """La grue soulève un conteneur LST et le pose sur la remorque (vue 3/4 en longue focale)."""
    root, objs, wheels = truck_scene(variant, livery)
    cfg = BL["models"]["reachstacker"]
    t_lo, t_hi = bounds(objs)
    # Le camion arrive vide : masquer le conteneur du modèle s'il en a un.
    for o in meshes(objs):
        if re.search(BL["models"]["truck"]["decal"]["target"], o.name) and re.search("(?i)container|box", o.name):
            o.hide_render = True
    bed_z = t_lo.z + 1.3  # hauteur du plateau (à ajuster selon le modèle)
    rs_root, rs_objs = import_glb("reachstacker")
    rs_lo, rs_hi = bounds(rs_objs)
    start_x = t_lo.x - (rs_hi.x - rs_lo.x) * 0.5 - 14
    rs_root.location.x += start_x
    rs_root.location.y += -9
    bpy.context.view_layer.update()

    box = container_box("LST_container", (0, 0, 0))
    decal(box, 4.8, (-2, -1.225, 1.3), -1.225)
    decal(box, 4.0, (-2, 0, 2.6), -1.225, top=True)

    lv = BL["loadView"]
    cam = camera(lens=lv["lens"])
    el, az = math.radians(lv["elevationDeg"]), math.radians(lv["azimuthDeg"])
    target = Vector(((t_lo.x + start_x) / 2, -4, lv["targetZ"]))
    pos = target + Vector((math.sin(az), -math.cos(az), 0)) * lv["distance"] * math.cos(el) + Vector((0, 0, lv["distance"] * math.sin(el)))
    look(cam, pos, target, (0, 0, 1))

    n, (w, h) = seq("reachstacker-load")
    setup_render(w, h, args.samples, args.preview)
    spreader = next((o for o in rs_objs if re.search(cfg["spreaderPattern"], o.name)), None)
    action = bpy.data.actions.get(cfg.get("action", ""))
    end = Vector(((t_lo.x + t_hi.x) / 2 - 2, 0, bed_z))
    start = Vector((start_x + (rs_hi.x - rs_lo.x) * 0.5 + 6.5, -9, 0))
    for i in range(n):
        t = i / (n - 1)
        if action and spreader:
            # Animation fournie par le modèle : le conteneur suit le spreader jusqu'à la dépose.
            f0, f1 = action.frame_range
            bpy.context.scene.frame_set(int(f0 + (f1 - f0) * t))
            if t < cfg.get("releaseAt", 0.9):
                sp = spreader.matrix_world.translation
                box.location = (sp.x, sp.y, sp.z - 2.59)
            else:
                box.location = end
        else:
            # Repli procédural : prise, levée, translation (la grue roule), dépose.
            lift = ease_in_out(min(1, max(0, (t - 0.12) / 0.26)))
            move = ease_in_out(min(1, max(0, (t - 0.36) / 0.36)))
            drop = ease_in_out(min(1, max(0, (t - 0.72) / 0.18)))
            p = start.lerp(end, move)
            box.location = (p.x, p.y, 5.4 * lift - (5.4 - end.z) * drop)
            rs_root.location.x = start_x + (end.x - start.x) * move
            rs_root.location.y = -9 + (end.y - start.y) * move * 0.55
        render_to(f"reachstacker-load-{variant}", i)


def top_camera(objs, margin=1.08, aspect=1.0):
    lo, hi = bounds(objs)
    size = max((hi.x - lo.x), (hi.y - lo.y) * aspect) * margin
    cam = camera(ortho_scale=size)
    c = (lo + hi) / 2
    look(cam, (c.x, c.y, hi.z + 200), (c.x, c.y, 0), (0, 1, 0))
    return cam


def render_ship(args):
    reset_scene()
    setup_world()
    root, objs = import_glb("ship")
    if BL["models"]["ship"].get("generateContainers"):
        lo, hi = bounds(objs)
        L, W = hi.x - lo.x, hi.y - lo.y
        rnd = random.Random(7)
        x = lo.x + L * 0.2
        while x < hi.x - L * 0.14:
            rows = int((W * 0.86) // 2.5)
            for r in range(rows):
                y = lo.y + W * 0.07 + r * 2.5 + 1.25
                for tier in range(rnd.randint(1, 3)):
                    col = rnd.choice(CONFIG["containerColors"])
                    container_box(f"c{x:.0f}_{r}_{tier}", (x + 3.05, y, hi.z * 0.62 + tier * 2.59), col, 6.06, 2.44, 2.59)
            x += 6.5
    n, (w, h) = seq("ship-top")
    setup_render(w, h, args.samples, args.preview)
    top_camera(objs, aspect=w / h)
    render_to("ship-top", 0)


def render_plane(args):
    reset_scene()
    setup_world()
    root, objs = import_glb("plane")
    n, (w, h) = seq("plane-top")
    setup_render(w, h, args.samples, args.preview)
    top_camera(objs, 1.04)
    render_to("plane-top", 0)


# --------------------------------------------------------------------------- main
def main():
    args = parse_args()
    todo = set(filter(None, args.only.split(","))) or set(CONFIG["sequences"].keys())
    variants = [args.variant] if args.variant else list(CONFIG["liveries"].keys())
    truck_seqs = {"truck-side", "truck-rotate", "truck-top", "wheel"} & todo
    for v in variants:
        livery = CONFIG["liveries"][v]
        if truck_seqs:
            render_truck(args, v, livery, truck_seqs if v == variants[0] else truck_seqs - {"wheel"})
        if "reachstacker-load" in todo:
            render_reachstacker(args, v, livery)
    if "ship-top" in todo:
        render_ship(args)
    if "plane-top" in todo:
        render_plane(args)
    print("Terminé. Étape suivante : npm run assets:encode")


if __name__ == "__main__":
    main()
