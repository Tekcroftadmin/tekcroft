import { DEFAULT_STATS, type StatsItem } from "@/lib/stats-strip";

type StatsStripProps = {
  items?: StatsItem[];
};

/** Shared under-hero stats strip — identical markup/classes on every page. */
export default function StatsStrip({ items = DEFAULT_STATS }: StatsStripProps) {
  return (
    <section
      className="sec st"
      id="proof-v2"
      data-ground="tint"
      aria-label="Tekcroft results"
    >
      <div className="wrap">
        <div className="st-row rv">
          {items.map((it) => (
            <div className="st-c" key={`${it.num}${it.sign}${it.caption}`}>
              <b>
                <span>{it.num}</span>
                <em>{it.sign}</em>
              </b>
              <p>{it.caption}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
