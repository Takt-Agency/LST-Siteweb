import { services } from "@/data/services";

/**
 * Continuous ticker of service names under the hero ("Transport terrestre ■ Fret
 * maritime ■ …"). The list is rendered twice so the CSS marquee (translateX -50%)
 * loops seamlessly; the copy is hidden from assistive technologies.
 */
export function ServicesTicker() {
  const names = services.map((s) => s.title);

  return (
    <section aria-label="Nos services" className="bg-white">
      <div className="container-site">
        {/* Kept within the site container; text fades out at both edges */}
        <div className="border-y border-line py-6 lg:py-8">
          <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]">
            <div className="flex w-max animate-marquee [animation-duration:45s]">
              {[false, true].map((copy) => (
                <ul key={String(copy)} aria-hidden={copy || undefined} className="flex shrink-0 items-center">
                  {names.map((name) => (
                    <li key={name} className="flex items-center text-2xl font-semibold tracking-[-0.02em] whitespace-nowrap lg:text-4xl">
                      {name}
                      <span aria-hidden className="mx-8 size-2 shrink-0 bg-brand-yellow lg:mx-12 lg:size-2.5" />
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
