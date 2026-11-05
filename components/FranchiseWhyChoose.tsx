"use client";

import {
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

const TABS = [
  "Clear Structure",
  "Full Visibility",
  "Built to Scale",
  "Local Relevance",
  "Clear Priorities",
] as const;

type Bar = { label: string; badge: string; w: string };

type Pane = {
  mark: ReactNode;
  title: string;
  body: string;
  figTitle: string;
  chip: string;
  bars: Bar[];
};

const PANES: Pane[] = [
  {
    mark: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M8.4 4.4h7.2v3.2H8.4z" />
        <path d="M5.2 7.6h13.6v12H5.2z" />
        <path d="M9.2 12.2h5.6M9.2 15.4h5.6M9.2 18.6h3.6" />
      </svg>
    ),
    title: "Clear Structure Across Brand and Locations",
    body: "Franchise SEO becomes messy when corporate teams, franchisees and agencies all have different ideas. We give your SEO programme a clear structure, with responsibilities agreed between the brand and individual locations before work gets held up by approvals.",
    figTitle: "Who does what",
    chip: "Agreed upfront",
    bars: [
      { label: "Brand sets the direction", badge: "Lead", w: "100%" },
      { label: "Locations add local input", badge: "Local", w: "72%" },
      { label: "Approvals agreed up front", badge: "Set", w: "88%" },
    ],
  },
  {
    mark: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3.8 20.2h16.4" />
        <path d="M6.6 20.2v-5M11 20.2V9.6M15.4 20.2v-7.6M19.8 20.2V6" />
        <path d="m6.6 11.4 4.4-4.6 3 2.2 4.4-4.6" />
      </svg>
    ),
    title: "Network and Location Visibility Together",
    body: "Tekcroft keeps the wider franchise picture and individual location performance visible together, so a brand can see where its SEO is working and where a particular market needs attention.",
    figTitle: "In one view",
    chip: "Side by side",
    bars: [
      { label: "Whole franchise performance", badge: "Network", w: "86%" },
      { label: "Each location’s results", badge: "Local", w: "64%" },
      { label: "Markets that need attention", badge: "Focus", w: "42%" },
    ],
  },
  {
    mark: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 21s-6.5-6.2-6.5-11A6.5 6.5 0 0 1 18.5 10c0 4.8-6.5 11-6.5 11z" />
        <circle cx="12" cy="10" r="2.4" />
      </svg>
    ),
    title: "Built to Scale Without Rebuilding",
    body: "Opening another franchise should not mean rebuilding the SEO framework from the ground up. Tekcroft creates a structure that can extend to new locations while keeping the same standards across the network.",
    figTitle: "A new location opens",
    chip: "No rebuild",
    bars: [
      { label: "Same framework extended", badge: "100%", w: "100%" },
      { label: "Same standards network-wide", badge: "100%", w: "100%" },
      { label: "Rebuild from scratch", badge: "0%", w: "6%" },
    ],
  },
  {
    mark: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4.4 7.2h15.2v11.2H4.4z" />
        <path d="M8 7.2V5.4h8v1.8" />
        <path d="M8.6 12.2h6.8M8.6 15.4h4.4" />
      </svg>
    ),
    title: "Brand Alignment with Local Relevance",
    body: "You cannot give every location identical content for consistency. We keep the core SEO direction aligned across the brand while allowing each location to reflect its own market, services, or search demand.",
    figTitle: "Each location page",
    chip: "On brand",
    bars: [
      { label: "Core SEO direction shared", badge: "Brand", w: "92%" },
      { label: "Own market & services", badge: "Local", w: "74%" },
      { label: "Own search demand", badge: "Local", w: "68%" },
    ],
  },
  {
    mark: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 3.2 4.8 6v6.2c0 4.4 3 8.4 7.2 9.4 4.2-1 7.2-5 7.2-9.4V6Z" />
        <path d="m9 12.2 2.2 2.2 4-4.4" />
      </svg>
    ),
    title: "Priorities Without Day-to-Day SEO Management",
    body: "We keep the programme tied to defined responsibilities and location-level priorities, so corporate teams can see what needs attention without having to manage the SEO process themselves.",
    figTitle: "For corporate teams",
    chip: "Hands-off",
    bars: [
      { label: "Defined responsibilities", badge: "Set", w: "96%" },
      { label: "Location-level priorities", badge: "Clear", w: "82%" },
      { label: "Day-to-day SEO management", badge: "0%", w: "6%" },
    ],
  },
];

const AUTO_MS = 4500;
const PAUSE_MS = 10000;
const N = TABS.length;

export default function FranchiseWhyChoose() {
  const [active, setActive] = useState(0);
  const pauseUntil = useRef(0);
  const hovering = useRef(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const go = useCallback((i: number, opts?: { pause?: boolean; focus?: boolean }) => {
    const next = ((i % N) + N) % N;
    setActive(next);
    if (opts?.pause) pauseUntil.current = Date.now() + PAUSE_MS;
    if (opts?.focus) tabRefs.current[next]?.focus();
  }, []);

  const onAutoTick = useEffectEvent(() => {
    if (hovering.current) return;
    if (Date.now() < pauseUntil.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setActive((cur) => (cur + 1) % N);
  });

  useEffect(() => {
    const id = window.setInterval(onAutoTick, AUTO_MS);
    return () => window.clearInterval(id);
  }, [onAutoTick]);

  const onTabKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    let next: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = i + 1;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = i - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = N - 1;
    else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      go(i, { pause: true });
      return;
    }
    if (next === null) return;
    e.preventDefault();
    go(next, { pause: true, focus: true });
  };

  return (
    <section className="sec wy" id="why" data-ground="tint">
      <div className="wrap wy-in">
        <div className="wy-say rv in">
          <span className="smark">
            <b>Why choose us</b>
          </span>
          <h2>
            Why Choose Tekcroft for <em>Franchise SEO</em>
          </h2>
        </div>

        <div
          className="wy-box rv in"
          style={{ ["--d" as string]: "120ms" }}
          data-tabs
          onMouseEnter={() => {
            hovering.current = true;
          }}
          onMouseLeave={() => {
            hovering.current = false;
          }}
        >
          <div
            className="wy-rail"
            role="tablist"
            aria-label="Why choose Tekcroft for franchise SEO"
          >
            {TABS.map((label, i) => {
              const on = active === i;
              return (
                <button
                  key={label}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  className={on ? "wy-tab on" : "wy-tab"}
                  type="button"
                  role="tab"
                  id={`fseo-wy-tab-${i}`}
                  data-p={i}
                  aria-selected={on}
                  aria-controls={`fseo-wy-pane-${i}`}
                  tabIndex={on ? 0 : -1}
                  onClick={() => go(i, { pause: true })}
                  onKeyDown={(e) => onTabKeyDown(e, i)}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="wy-panes">
            {PANES.map((pane, i) => {
              const on = active === i;
              return (
                <div
                  key={pane.title}
                  className={on ? "wy-pane on" : "wy-pane"}
                  role="tabpanel"
                  id={`fseo-wy-pane-${i}`}
                  aria-labelledby={`fseo-wy-tab-${i}`}
                  aria-hidden={!on}
                >
                  <div className="wy-txt">
                    <span className="wy-mark">{pane.mark}</span>
                    <h3>{pane.title}</h3>
                    <p>{pane.body}</p>
                  </div>
                  <figure className="wy-fig">
                    <figcaption>
                      <b>{pane.figTitle}</b>
                      <span className="wy-chip">{pane.chip}</span>
                    </figcaption>
                    <ul className="br">
                      {pane.bars.map((bar) => (
                        <li key={bar.label}>
                          <span className="br-top">
                            <span>{bar.label}</span>
                            <b>{bar.badge}</b>
                          </span>
                          <span className="br-rail">
                            <i style={{ ["--w" as string]: bar.w }} />
                          </span>
                        </li>
                      ))}
                    </ul>
                  </figure>
                </div>
              );
            })}
          </div>
        </div>

        <div className="wy-cta rv in" style={{ ["--d" as string]: "200ms" }}>
          <a className="btn btn-primary btn-lg" href="/book-a-free-evaluation">
            Request Your Free Franchise SEO Proposal{" "}
            <span className="arw">↑</span>
          </a>
        </div>
      </div>
    </section>
  );
}
