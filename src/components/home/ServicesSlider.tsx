"use client";

import { useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide, type SwiperClass } from "swiper/react";
import { A11y, Keyboard } from "swiper/modules";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { CroppedImage } from "@/components/ui/CroppedImage";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import type { IconName, MediaRef } from "@/types";
import "swiper/css";

export interface ServiceSlide {
  key: string;
  href: string;
  icon: IconName;
  title: string;
  summary: string;
  image: MediaRef;
  featured: boolean;
}

/** Single-row, swipeable list of service cards with progress bar and prev/next controls. */
export function ServicesSlider({ items }: { items: ServiceSlide[] }) {
  const [swiper, setSwiper] = useState<SwiperClass | null>(null);
  const [state, setState] = useState({ start: true, end: false, fill: 0 });

  const sync = (s: SwiperClass) => {
    // Visible share of the slides + scrolled progress → width of the progress bar.
    const perView = typeof s.params.slidesPerView === "number" ? s.params.slidesPerView : 1;
    const view = s.slides.length > 0 ? Math.min(1, perView / s.slides.length) : 1;
    setState({ start: s.isBeginning, end: s.isEnd, fill: view + (1 - view) * s.progress });
  };

  return (
    <div>
      <Swiper
        modules={[A11y, Keyboard]}
        onSwiper={(s) => {
          setSwiper(s);
          sync(s);
        }}
        onAfterInit={sync}
        onBreakpoint={sync}
        onProgress={sync}
        onResize={sync}
        slidesPerView={1.12}
        spaceBetween={16}
        breakpoints={{
          640: { slidesPerView: 2.15, spaceBetween: 20 },
          1024: { slidesPerView: 3.2, spaceBetween: 20 },
          1280: { slidesPerView: 3.35, spaceBetween: 24 },
        }}
        grabCursor
        keyboard={{ enabled: true, onlyInViewport: true }}
        a11y={{
          containerRoleDescriptionMessage: "carrousel",
          itemRoleDescriptionMessage: "service",
          slideLabelMessage: "{{index}} sur {{slidesLength}}",
        }}
        className="overflow-visible!"
      >
        {items.map((item, i) => (
          <SwiperSlide key={item.key} className="h-auto!">
            <ServiceCard item={item} index={i} />
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="mt-10 flex items-center gap-6">
        <div aria-hidden className="h-px flex-1 overflow-hidden bg-line">
          <div
            className="h-full origin-left bg-ink transition-transform duration-300"
            style={{ transform: `scaleX(${state.fill})` }}
          />
        </div>
        <div className="flex gap-3">
          <NavButton label="Service précédent" icon={faArrowLeft} disabled={state.start} onClick={() => swiper?.slidePrev()} />
          <NavButton label="Service suivant" icon={faArrowRight} disabled={state.end} onClick={() => swiper?.slideNext()} />
        </div>
      </div>
    </div>
  );
}

/**
 * Static row shown while the slider is deferred (Swiper reads the current time,
 * so it renders at request time behind Suspense — see cache components docs).
 */
export function ServicesSliderFallback({ items }: { items: ServiceSlide[] }) {
  return (
    <div className="flex gap-4 overflow-hidden sm:gap-5 xl:gap-6">
      {items.map((item, i) => (
        <div key={item.key} className="w-[89%] shrink-0 sm:w-[45%] lg:w-[30%] xl:w-[29%]">
          <ServiceCard item={item} index={i} />
        </div>
      ))}
    </div>
  );
}

/** Service card: photo on top (number + icon badge over it), then title, summary and link. */
function ServiceCard({ item, index }: { item: ServiceSlide; index: number }) {
  const { featured } = item;
  return (
    <Link
      href={item.href}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-xl border transition-colors duration-300 select-none",
        featured ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink",
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-paper">
        <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
          <CroppedImage image={item.image} sizes="(min-width: 1280px) 28vw, (min-width: 1024px) 31vw, (min-width: 640px) 46vw, 89vw" />
        </div>
        <span aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/35 to-transparent" />
        <span aria-hidden className="absolute top-4 left-4 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-ink tabular-nums backdrop-blur">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span
          className={cn(
            "absolute bottom-4 left-4 grid size-11 place-items-center rounded-full transition-colors",
            featured ? "bg-brand-yellow text-ink" : "bg-white text-ink group-hover:bg-brand-yellow",
          )}
        >
          <Icon name={item.icon} className="text-base" />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <h3 className="text-xl leading-tight font-semibold">{item.title}</h3>
        <p className={cn("mt-2 mb-6 text-sm leading-relaxed", featured ? "text-white/70" : "text-muted")}>{item.summary}</p>
        <span className="mt-auto inline-flex items-center gap-2 text-sm font-medium">
          Voir le service
          <FontAwesomeIcon icon={faArrowRight} aria-hidden className="text-xs transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

function NavButton({
  label,
  icon,
  disabled,
  onClick,
}: {
  label: string;
  icon: typeof faArrowLeft;
  disabled: boolean;
  onClick: () => void;
}) {
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
