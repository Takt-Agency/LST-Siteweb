import { Eyebrow } from "@/components/ui/Eyebrow";
import { sectors } from "@/data/home";

/**
 * Homepage §05-06 — sectors served. Renders nothing until LST Express provides
 * a validated list in `src/data/home.ts` (the spec forbids unvalidated sectors).
 */
export function Sectors() {
  if (sectors.items.length === 0) return null;
  return (
    <section aria-labelledby="sectors-title" className="border-t border-line bg-white py-20 lg:py-28">
      <div className="container-site grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4">
          <Eyebrow className="text-muted">{sectors.eyebrow}</Eyebrow>
          <h2 id="sectors-title" className="mt-5 text-[2rem] leading-[1.08] font-semibold tracking-[-0.03em] sm:text-[2.5rem]">
            {sectors.title}
          </h2>
        </div>
        <ul className="border-t border-line lg:col-span-8">
          {sectors.items.map((sector, i) => (
            <li key={sector.name} className="flex items-baseline gap-6 border-b border-line py-5">
              <span className="w-8 shrink-0 text-sm text-muted tabular-nums">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-xl font-medium">{sector.name}</span>
              {sector.text && <span className="ml-auto hidden text-sm text-muted sm:block">{sector.text}</span>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
