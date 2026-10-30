import { Eyebrow } from "@/components/ui/Eyebrow";
import { method } from "@/data/home";
import { methodSteps } from "@/data/services";
import { Reveal } from "@/components/motion/Reveal";

/** Homepage §05-05 — the four-step method on a single hairline timeline. */
export function Method() {
  return (
    <section aria-labelledby="method-title" className="bg-white py-20 lg:py-28">
      <div className="container-site">
        <Reveal className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-12">
          <div className="lg:col-span-7">
            <Eyebrow className="text-muted">{method.eyebrow}</Eyebrow>
            <h2
              id="method-title"
              className="mt-5 text-[2rem] leading-[1.08] font-semibold tracking-[-0.03em] sm:text-[2.5rem] lg:text-5xl"
            >
              {method.title}
            </h2>
          </div>
          <p className="max-w-md text-lg leading-relaxed text-muted lg:col-span-5 lg:pb-1">
            {method.text}
          </p>
        </Reveal>

        {/* Mobile: horizontal swipe with snap points; tablet and up: grid */}
        <Reveal>
          <ol
            tabIndex={0}
            aria-label="Étapes de la méthode"
            className="-mx-5 mt-12 flex snap-x snap-mandatory scroll-px-5 gap-6 overflow-x-auto px-5 pt-1.5 pb-2 [scrollbar-width:none] focus-visible:outline-offset-0 sm:mx-0 sm:mt-14 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-x-10 sm:gap-y-12 sm:overflow-visible sm:px-0 lg:mt-20 lg:grid-cols-4 [&::-webkit-scrollbar]:hidden"
          >
            {methodSteps.map((step, i) => (
              <li
                key={step.title}
                className="group relative w-[78%] shrink-0 snap-start border-t border-line pt-8 sm:w-auto"
              >
                <span
                  aria-hidden
                  className="absolute -top-[5px] left-0 size-2.5 bg-ink transition-colors duration-300 group-hover:bg-brand-yellow"
                />
                <span className="text-5xl leading-none font-light text-ink/15 tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-6 text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{step.text}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
