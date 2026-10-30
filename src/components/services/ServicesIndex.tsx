"use client";

import { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import type { IconName, ServiceCategory } from "@/types";
import { Reveal } from "@/components/motion/Reveal";

export interface ServiceRow {
  slug: string;
  href: string;
  icon: IconName;
  title: string;
  summary: string;
  category: ServiceCategory;
}

/** Editorial index of services with category filter tabs (local filtering only). */
export function ServicesIndex({
  items,
  categories,
}: {
  items: ServiceRow[];
  categories: readonly { id: string; label: string }[];
}) {
  const [active, setActive] = useState("tous");
  const visible = active === "tous" ? items : items.filter((s) => s.category === active);

  return (
    <div>
      <div role="tablist" aria-label="Filtrer par catégorie" className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={active === c.id}
            onClick={() => setActive(c.id)}
            className={cn(
              "h-10 rounded-full border px-5 text-sm font-medium transition-colors",
              active === c.id ? "border-ink bg-ink text-white" : "border-line text-ink/70 hover:border-ink hover:text-ink",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <ul role="tabpanel" aria-live="polite" className="mt-10 border-t border-line">
        {visible.map((s) => (
          <Reveal as="li" key={s.slug} className="border-b border-line">
            <Link
              href={s.href}
              className="group grid grid-cols-[auto_1fr_auto] items-center gap-x-5 gap-y-1 py-7 transition-colors sm:gap-x-8 lg:grid-cols-[3rem_minmax(0,5fr)_minmax(0,6fr)_auto] lg:py-9"
            >
              <span className="grid size-12 place-items-center rounded-full border border-line transition-colors group-hover:border-brand-yellow group-hover:bg-brand-yellow">
                <Icon name={s.icon} className="text-base" />
              </span>
              <h2 className="text-xl font-semibold tracking-[-0.02em] sm:text-2xl lg:text-3xl">{s.title}</h2>
              <p className="col-start-2 text-muted lg:col-start-3 lg:row-start-1">{s.summary}</p>
              <span className="col-start-3 row-span-2 row-start-1 grid size-11 place-items-center rounded-full border border-line transition-colors group-hover:border-ink group-hover:bg-ink group-hover:text-white lg:col-start-4 lg:row-span-1">
                <FontAwesomeIcon icon={faArrowRight} aria-hidden className="text-xs" />
              </span>
            </Link>
          </Reveal>
        ))}
      </ul>
    </div>
  );
}
