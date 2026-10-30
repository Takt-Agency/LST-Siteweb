"use client";

import { useRef, useState, type ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";

/**
 * Native horizontal scroller with snap points and prev/next buttons.
 * `children` are the <li> items (each should set its own width + `snap-start`).
 */
export function HorizontalScroller({ label, children }: { label: string; children: ReactNode }) {
  const ref = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const update = () => {
    const el = ref.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  };
  const scroll = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: "smooth" });

  return (
    <div>
      <ul
        ref={ref}
        tabIndex={0}
        aria-label={label}
        onScroll={update}
        className="-mx-5 flex snap-x snap-mandatory scroll-px-5 gap-6 overflow-x-auto px-5 pb-2 [scrollbar-width:none] focus-visible:outline-offset-0 md:-mx-8 md:scroll-px-8 md:px-8 lg:gap-8 [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </ul>
      <div className="mt-8 flex justify-end gap-3">
        <ScrollButton label="Précédent" icon={faArrowLeft} disabled={edges.start} onClick={() => scroll(-1)} />
        <ScrollButton label="Suivant" icon={faArrowRight} disabled={edges.end} onClick={() => scroll(1)} />
      </div>
    </div>
  );
}

function ScrollButton({ label, icon, disabled, onClick }: { label: string; icon: typeof faArrowLeft; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-11 place-items-center rounded-full border border-line text-ink transition-colors hover:border-ink hover:bg-ink hover:text-white disabled:pointer-events-none disabled:opacity-30"
    >
      <FontAwesomeIcon icon={icon} aria-hidden className="text-xs" />
    </button>
  );
}
