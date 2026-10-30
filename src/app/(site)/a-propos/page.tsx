import type { Metadata } from "next";
import { FinalCta } from "@/components/home/FinalCta";
import { ServicesTicker } from "@/components/home/ServicesTicker";
import { CroppedImage } from "@/components/ui/CroppedImage";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageHeader } from "@/components/ui/PageHeader";
import { aboutPage as a } from "@/data/about";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "À propos",
  description: a.intro,
};

function SectionTitle({ id, eyebrow, title, dark }: { id: string; eyebrow: string; title: string; dark?: boolean }) {
  return (
    <>
      <Eyebrow className={dark ? "text-white/70" : "text-muted"}>{eyebrow}</Eyebrow>
      <h2 id={id} className="mt-5 text-[2rem] leading-[1.08] font-semibold tracking-[-0.03em] sm:text-[2.5rem] lg:text-5xl">
        {title}
      </h2>
    </>
  );
}

export default function AboutPage() {
  return (
    <>
      <PageHeader crumbs={[{ label: "Accueil", href: "/" }, { label: "À propos" }]} eyebrow={a.eyebrow} title={a.title}>
        <p>{a.intro}</p>
      </PageHeader>

      {/* Banner — full image from tablet up (keeps the logo and all three modes in frame), centre crop on phones */}
      <div className="bg-white pt-10 lg:pt-14">
        <div className="container-site">
          <div className="relative aspect-[16/10] animate-rise overflow-hidden rounded-xl bg-paper sm:aspect-[1983/793]">
            <CroppedImage image={a.banner} sizes="(min-width: 1344px) 1280px, 100vw" decorative={false} preload />
          </div>
        </div>
      </div>

      {/* Presentation */}
      <section aria-labelledby="presentation-title" className="bg-white py-20 lg:py-28">
        <div className="container-site grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <Eyebrow className="text-muted">{a.presentation.eyebrow}</Eyebrow>
          </div>
          <Reveal className="lg:col-span-8">
            <h2 id="presentation-title" className="text-[1.75rem] leading-[1.2] font-semibold tracking-[-0.025em] sm:text-4xl lg:text-[2.75rem]">
              {a.presentation.statement}
            </h2>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted">{a.presentation.text}</p>
          </Reveal>
        </div>

        {/* L · S · T */}
        <div className="container-site mt-16 lg:mt-24">
          <ul className="grid border-t border-l border-line md:grid-cols-3">
            {a.letters.map((l, i) => (
              <Reveal as="li" delay={i * 0.1} key={l.letter} className="group border-r border-b border-line p-8 lg:p-10">
                <span className="block text-7xl leading-none font-semibold tracking-[-0.04em] transition-colors group-hover:text-brand-yellow lg:text-8xl">
                  {l.letter}
                  <span className="text-brand-yellow">.</span>
                </span>
                <h3 className="mt-8 text-xl font-semibold">{l.word}</h3>
                <p className="mt-2 leading-relaxed text-muted">{l.text}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <ServicesTicker />

      {/* Mission & vision */}
      <section aria-label="Mission et vision" className="bg-white py-20 lg:py-28">
        <div className="container-site grid gap-5 md:grid-cols-2">
          {[a.mission, a.vision].map((item, i) => (
            <div
              key={item.label}
              className={`flex min-h-72 flex-col rounded-2xl p-8 lg:p-12 ${i === 0 ? "bg-ink text-white" : "border border-line"}`}
            >
              <Eyebrow className={i === 0 ? "text-white/70" : "text-muted"}>{item.label}</Eyebrow>
              <p className="mt-auto pt-12 text-2xl leading-snug font-semibold tracking-[-0.02em] lg:text-3xl">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section aria-labelledby="values-title" className="border-t border-line bg-paper py-20 lg:py-28">
        <div className="container-site grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <SectionTitle id="values-title" eyebrow={a.values.eyebrow} title={a.values.title} />
            </div>
          </Reveal>
          <ol className="border-t border-line lg:col-span-8">
            {a.values.items.map((v, i) => (
              <Reveal as="li" key={v.title} className="flex gap-5 border-b border-line py-7 sm:gap-8">
                <span className="w-8 shrink-0 pt-1 text-sm text-muted tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <div className="grid flex-1 gap-2 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:gap-8">
                  <h3 className="text-xl font-semibold sm:text-2xl">{v.title}</h3>
                  <p className="leading-relaxed text-muted sm:pt-1">{v.text}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* History — shown once LST supplies milestones */}
      {a.history.items.length > 0 && (
        <section aria-labelledby="history-title" className="bg-white py-20 lg:py-28">
          <div className="container-site">
            <SectionTitle id="history-title" eyebrow={a.history.eyebrow} title={a.history.title} />
            <ol className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {a.history.items.map((h) => (
                <li key={h.year + h.title} className="relative border-t border-line pt-8">
                  <span aria-hidden className="absolute -top-[5px] left-0 size-2.5 bg-ink" />
                  <span className="text-3xl font-semibold tabular-nums">{h.year}</span>
                  <h3 className="mt-4 text-lg font-semibold">{h.title}</h3>
                  <p className="mt-2 leading-relaxed text-muted">{h.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* Commitments — shown once supplied */}
      {a.commitments.items.length > 0 && (
        <section aria-labelledby="commitments-title" className="bg-ink py-20 text-white lg:py-28">
          <div className="container-site">
            <SectionTitle id="commitments-title" eyebrow={a.commitments.eyebrow} title={a.commitments.title} dark />
            <ul className="mt-12 grid gap-px overflow-hidden rounded-xl bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
              {a.commitments.items.map((c) => (
                <li key={c.title} className="bg-ink p-8">
                  <h3 className="text-lg font-semibold">{c.title}</h3>
                  <p className="mt-2 leading-relaxed text-white/70">{c.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Team — only if applicable */}
      {a.team.members.length > 0 && (
        <section aria-labelledby="team-title" className="bg-white py-20 lg:py-28">
          <div className="container-site">
            <SectionTitle id="team-title" eyebrow={a.team.eyebrow} title={a.team.title} />
            <ul className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {a.team.members.map((m) => (
                <li key={m.name} className="border-t border-line pt-6">
                  <p className="text-lg font-semibold">{m.name}</p>
                  <p className="mt-1 text-muted">{m.role}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <FinalCta />
    </>
  );
}
