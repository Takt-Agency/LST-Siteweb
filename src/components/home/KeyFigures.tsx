import { Eyebrow } from "@/components/ui/Eyebrow";
import { keyFiguresSection } from "@/data/home";
import { keyFigures } from "@/data/site";

/**
 * Homepage §05-08 — key figures. Renders nothing until LST Express supplies
 * validated data in `keyFigures` (src/data/site.ts): no invented statistics.
 */
export function KeyFigures() {
  if (keyFigures.length === 0) return null;
  return (
    <section aria-labelledby="figures-title" className="border-t border-line bg-white py-20 lg:py-28">
      <div className="container-site">
        <Eyebrow className="text-muted">{keyFiguresSection.eyebrow}</Eyebrow>
        <h2 id="figures-title" className="mt-5 text-[2rem] leading-[1.08] font-semibold tracking-[-0.03em] sm:text-[2.5rem]">
          {keyFiguresSection.title}
        </h2>
        <dl className="mt-12 grid gap-y-10 border-t border-line pt-10 sm:grid-cols-2 lg:grid-cols-4">
          {keyFigures.map((figure) => (
            <div key={figure.label} className="lg:border-l lg:border-line lg:px-8 lg:first:border-l-0 lg:first:pl-0">
              <dt className="text-sm text-muted">{figure.label}</dt>
              <dd className="mt-2 text-5xl font-semibold tracking-[-0.03em] tabular-nums">{figure.value}</dd>
              {figure.detail && <dd className="mt-2 text-sm text-muted">{figure.detail}</dd>}
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
