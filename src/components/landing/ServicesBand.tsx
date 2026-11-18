import { bandItems } from "@/data/landing";

/** Bandeau jaune défilant avec les services (la liste est doublée pour boucler sans saut). */
export function ServicesBand() {
  return (
    <div className="band" aria-hidden="true">
      <div className="tr">
        {[...bandItems, ...bandItems].map((item, i) => (
          <span key={i}>{item}</span>
        ))}
      </div>
    </div>
  );
}
