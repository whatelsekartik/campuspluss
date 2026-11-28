import { useScrollProgress } from "../motion/scroll";
import { CinematicPhoto } from "../components/CinematicPhoto";
import { usePrefersReducedMotion } from "../motion/reveal";
import { Icon, type IconName } from "../components/Icon";
import { IMG } from "../data";
import { ScrubText } from "../components/ScrubText";

/* Small UI fragments that echo Campus+ cards (demonstration content). */
function Fragment({ icon, kicker, title, meta }: { icon: IconName; kicker: string; title: string; meta: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-app p-3 pr-5 text-white shadow-[0_30px_50px_-25px_rgba(20,18,15,.6)]">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-app-accent text-app">
        <Icon name={icon} size={18} />
      </span>
      <span className="min-w-0">
        <span className="block text-[10px] uppercase tracking-[0.14em] text-app-mute">{kicker}</span>
        <span className="block truncate text-[14px] font-medium">{title}</span>
        <span className="block truncate text-[11.5px] text-app-mute">{meta}</span>
      </span>
    </div>
  );
}

function Index({ n, label }: { n: string; label: string }) {
  return (
    <p className="eyebrow flex items-center gap-3 text-stone">
      <span className="text-ink">{n}</span>
      <span className="h-px w-10 bg-ink/25" />
      {label}
    </p>
  );
}

/* ── Housing: vertical reveal, slow tilt inside the frame, listing card floating in front ── */
function Housing() {
  const reduced = usePrefersReducedMotion();
  const ref = useScrollProgress<HTMLDivElement>("pass", undefined, !reduced);
  return (
    <div ref={ref} className="scene relative grid gap-10 lg:grid-cols-12 lg:items-end">
      <div className="relative lg:col-span-5">
        <CinematicPhoto
          data-hover-media
          data-sheen
          img={IMG.bedroom}
          preset={["wipe", "vertical-pan", "float"]}
          params={{ from: "up", drift: [0, 70], pan: [0, -22], zoom: [1.3, 1.22], revealZoom: 0.16, window: [0.04, 0.34] }}
          ratio="4/5"
          crop={[4, 5]}
          sizes="(min-width:1024px) 40vw, 100vw"
          widths={[480, 800, 1200]}
          frameClassName="rounded-[4px]"
        />
        <div className="px absolute -bottom-8 right-4 w-[min(78%,300px)] lg:-right-[18%]" style={{ ["--sy" as string]: "-120px" }}>
          <div data-reveal style={{ ["--rd" as string]: "350ms", ["--rx" as string]: "40px", ["--rr" as string]: "4deg" }}>
            <div data-tilt>
              <Fragment icon="home" kicker="Housing · listing" title="Room near campus" meta="Shared · walking distance" />
            </div>
          </div>
        </div>
      </div>
      <div className="relative lg:col-span-7 lg:pb-10">
        <Index n="06.1" label="Housing" />
        {/* the word slides across the photograph's edge as the image travels the other way */}
        <div className="px relative mt-6" style={{ ["--sx" as string]: "-90px" }}>
          <h3 className="display text-[20vw] lg:-ml-[22%] lg:text-[12vw]" data-reveal-group>
            <span className="line-mask"><span>Housing</span></span>
          </h3>
        </div>
        <p className="mt-6 max-w-md text-[15px] leading-[1.6] text-stone" data-reveal>
          Rooms and flatmates near campus, posted by other students. Read the details before you go and see it.
        </p>
      </div>
    </div>
  );
}

/* ── Rides: a letterbox that widens to full width while the camera pans sideways ── */
function Rides() {
  const reduced = usePrefersReducedMotion();
  const ref = useScrollProgress<HTMLDivElement>("pass", undefined, !reduced);
  return (
    <div ref={ref} className="scene relative">
      <div className="flex items-end justify-between">
        <Index n="06.2" label="Rides" />
        <p className="caption hidden max-w-[16rem] text-right text-stone sm:block">Share the trip, and the cost, with people heading the same way.</p>
      </div>
      <div
        className="relative mt-6 overflow-hidden rounded-[6px]"
        style={{
          ["--r" as string]: "clamp(0, calc((var(--p) - 0.05) / 0.3), 1)",
          clipPath: "inset(calc((1 - var(--r)) * 16%) calc((1 - var(--r)) * 11%) round 6px)",
        }}
      >
        <div data-sheen className="relative">
        <CinematicPhoto
          img={IMG.bicycle}
          scene="inherit"
          preset="horizontal-pan"
          params={{ pan: [-18, 0], zoom: [1.3, 1.2] }}
          ratio="21/10"
          crop={[21, 10]}
          sizes="100vw"
          widths={[800, 1280, 1800]}
          frameClassName="max-sm:!aspect-[4/3]"
        />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(21,19,15,.55),transparent_60%)]" />
        {/* type rides against the pan, so word and photograph cross each other */}
        <p className="display px absolute bottom-[6%] left-[4%] whitespace-nowrap text-[22vw] text-ivory lg:text-[14vw]" style={{ ["--sx" as string]: "14vw" }}>
          Rides          <span className="serif-accent text-[0.45em]"> home</span>
        </p>
      </div>
      <div className="px relative z-10 -mt-10 flex justify-end pr-4 lg:-mt-16 lg:pr-[6%]" style={{ ["--sy" as string]: "-70px" }}>
        <div className="w-[min(88%,340px)]" data-reveal style={{ ["--rd" as string]: "200ms", ["--rx" as string]: "60px", ["--ry" as string]: "0px" }}>
          <div data-tilt>
            <Fragment icon="car" kicker="Ride · offering" title="Campus to railway station" meta="Friday evening · 2 seats" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Lost & found: a collage — prints arrive from opposite sides and rotate into place ── */
function LostFound() {
  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
      <div className="lg:col-span-6 lg:col-start-1">
        <Index n="06.3" label="Lost & found" />
        <h3 className="mt-6 text-[17vw] leading-[0.86] tracking-[-0.03em] lg:text-[9vw]" data-reveal-group>
          <span className="line-mask"><span className="serif-accent">Lost something?</span></span>
          <span className="line-mask"><span className="display" style={{ ["--rd" as string]: "100ms" }}>Found it.</span></span>
        </h3>
        <p className="mt-6 max-w-md text-[15px] leading-[1.6] text-stone" data-reveal>
          Post what you lost or found, add where and when, and help it get back to its owner.
        </p>
      </div>
      <div className="relative h-[110vw] sm:h-[70vw] lg:col-span-5 lg:col-start-8 lg:h-[40vw]">
        <CinematicPhoto
          data-hover-media
          data-sheen
          img={IMG.keys}
          preset={["stacked-reveal", "parallax", "float"]}
          params={{ enter: [-180, 60], settle: -11, rotate: -2, drift: [0, -80], pan: [0, 10], window: [0.03, 0.34] }}
          ratio="1/1"
          crop={[1, 1]}
          sizes="(min-width:1024px) 24vw, 58vw"
          widths={[400, 700]}
          className="absolute left-0 top-0 w-[58%]"
          frameClassName="rounded-[4px] shadow-[0_30px_50px_-28px_rgba(52,38,22,.55)]"
        />
        <CinematicPhoto
          data-hover-media
          data-sheen
          img={IMG.wallet}
          preset={["stacked-reveal", "parallax", "float"]}
          params={{ enter: [200, 90], settle: 12, rotate: 3, drift: [0, 100], pan: [8, -8], window: [0.08, 0.4] }}
          ratio="4/5"
          crop={[4, 5]}
          sizes="(min-width:1024px) 20vw, 52vw"
          widths={[400, 700]}
          className="absolute bottom-[6%] right-0 w-[52%]"
          frameClassName="rounded-[4px] shadow-[0_30px_50px_-28px_rgba(52,38,22,.55)]"
        />
        <div
          className="absolute bottom-0 left-[4%] w-[min(80%,300px)]"
          data-reveal
          style={{ ["--rd" as string]: "450ms", ["--rx" as string]: "-30px", ["--ry" as string]: "40px", ["--rr" as string]: "-6deg" }}
        >
          <Fragment icon="search" kicker="Found · near library" title="Set of keys, blue tag" meta="Posted today" />
        </div>
      </div>
    </div>
  );
}

/* ── Gigs + Projects: dark band; each photograph opens from its own edge, titles float a layer above ── */
function GigsProjects() {
  const items = [
    { n: "06.4", t: "Gigs", s: "Small paid tasks", d: "Find short jobs and freelance work from other students, or post one yourself.", img: IMG.sketch, icon: "briefcase" as IconName, f: ["Gig · design", "Poster for a club event", "Short task · open"], from: "right" as const, pan: [-10, 8] as [number, number] },
    { n: "06.5", t: "Projects", s: "& teams", d: "Describe a project, list the skills you need, and find people who want to build it with you.", img: IMG.stickyNotes, icon: "layers" as IconName, f: ["Team · looking for", "Frontend + ML for a project", "2 roles open"], from: "up" as const, pan: [0, 16] as [number, number] },
  ];
  return (
    <div data-nav-dark className="relative -mx-5 overflow-hidden rounded-[28px] bg-charcoal px-5 py-20 text-ivory sm:-mx-6 sm:px-6 lg:-mx-10 lg:rounded-[48px] lg:px-10 lg:py-28">
      <div className="grid gap-16 lg:grid-cols-2 lg:gap-10">
        {items.map((it, i) => (
          <article key={it.t} className={i === 1 ? "lg:mt-40" : ""}>
            <p className="eyebrow flex items-center gap-3 text-ivory/50" data-reveal>
              <span className="text-ivory">{it.n}</span>
              <span className="h-px w-10 bg-ivory/25" />
              {it.t}
            </p>
            <CinematicPhoto
              data-hover-media
              data-sheen
              img={it.img}
              preset={["wipe", "parallax"]}
              params={{ from: it.from, pan: it.pan, zoom: [1.32, 1.18], revealZoom: 0.2, window: [0.05, 0.36] }}
              ratio={i === 0 ? "5/4" : "4/5"}
              crop={i === 0 ? [5, 4] : [4, 5]}
              sizes="(min-width:1024px) 40vw, 100vw"
              widths={[480, 800, 1100]}
              className="mt-8"
              frameClassName="w-[88%] rounded-[4px] bg-ink"
            >
              {/* the title lives on the photograph's own scroll progress, one depth layer in front;
                  difference blend (as in the hero) keeps it legible where it crosses the image */}
              <h3
                className="display px absolute -bottom-[0.18em] right-0 text-[22vw] text-ivory mix-blend-difference lg:text-[9vw]"
                style={{ ["--sy" as string]: "-90px", ["--sx" as string]: i === 0 ? "40px" : "-40px" }}
              >
                {it.t}
              </h3>
            </CinematicPhoto>
            <div data-reveal style={{ ["--rd" as string]: "120ms" }}>
              <p className="serif-accent mt-10 text-3xl text-ivory/60">{it.s}</p>
              <p className="mt-3 max-w-sm text-[15px] leading-[1.6] text-ivory/70">{it.d}</p>
            </div>
            <div className="mt-6 max-w-[320px]" data-reveal style={{ ["--rd" as string]: "260ms", ["--rx" as string]: i === 0 ? "-30px" : "30px", ["--rr" as string]: i === 0 ? "-4deg" : "4deg" }}>
              <div data-tilt>
                <Fragment icon={it.icon} kicker={it.f[0]} title={it.f[1]} meta={it.f[2]} />
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

/* ── Notices: pinned paper slips that drift up and settle into their resting angle with scroll ── */
function Notices() {
  const reduced = usePrefersReducedMotion();
  const ref = useScrollProgress<HTMLUListElement>("pass", undefined, !reduced);
  const slips = [
    { t: "Library hours", d: "Extended during exam weeks", r: "-3deg", er: "-9deg", ox: "-50px", c: "bg-paper" },
    { t: "Club recruitment", d: "Applications open this week", r: "2deg", er: "10deg", ox: "60px", c: "bg-beige" },
    { t: "Workshop", d: "Seats limited — register early", r: "-1deg", er: "7deg", ox: "-30px", c: "bg-paper" },
    { t: "Exam form", d: "Last date reminder", r: "3deg", er: "-8deg", ox: "40px", c: "bg-dune/60" },
  ];
  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
      <div className="lg:col-span-4">
        <Index n="06.6" label="Events & notices" />
        <h3 className="display mt-6 text-[18vw] lg:text-[7vw]" data-reveal-group>
          <span className="line-mask"><span>Notices,</span></span>
          <span className="line-mask"><span className="serif-accent" style={{ ["--rd" as string]: "100ms" }}>noticed.</span></span>
        </h3>
        <p className="mt-6 max-w-sm text-[15px] leading-[1.6] text-stone" data-reveal>
          Announcements and reminders together in one place, so they don't get lost in group chats.
        </p>
        <p className="caption mt-4 text-stone">Example notices for illustration.</p>
      </div>
      <ul ref={ref} className="scene grid grid-cols-2 gap-4 sm:gap-6 lg:col-span-7 lg:col-start-6">
        {slips.map((s, i) => (
          <li
            key={s.t}
            className={`paper-lift paper ${s.c} relative rounded-[3px] p-5 shadow-[0_18px_30px_-20px_rgba(52,38,22,.45)] sm:p-7 ${i % 2 ? "mt-10" : ""}`}
            style={{
              ["--rot" as string]: s.r,
              ["--er" as string]: s.er,
              ["--ox" as string]: s.ox,
              ["--s0" as string]: (0.06 + i * 0.045).toFixed(3),
            }}
          >
            <span className="absolute left-1/2 top-3 size-2.5 -translate-x-1/2 rounded-full bg-clay shadow-sm" aria-hidden="true" />
            <Icon name="megaphone" size={18} className="mt-3 text-stone" />
            <p className="mt-6 text-lg font-semibold tracking-[-0.02em] sm:text-2xl">{s.t}</p>
            <p className="caption mt-1 text-stone">{s.d}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Utilities() {
  return (
    <section id="utilities" aria-labelledby="utilities-title" className="relative overflow-clip bg-ivory pb-24 pt-28 outline-none lg:pt-40">
      <div className="mx-auto max-w-[1680px] px-5 sm:px-6 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-12">
          <p className="eyebrow text-stone lg:col-span-3">
            <span className="numeral text-ink" style={{ ["--ns" as string]: "0.02" }}>(06)</span> Campus utilities
            <span className="rule mt-3 block h-px w-10 bg-ink/30" />
          </p>
          <h2 id="utilities-title" className="display text-[17vw] lg:col-span-9 lg:text-[10vw]">
            <span className="line-mask"><span><ScrubText start={0.04} turn={5}>More happens</ScrubText></span></span>
            <span className="line-mask">
              <span><span className="serif-accent"><ScrubText start={0.14} turn={-6}>here.</ScrubText></span></span>
            </span>
          </h2>
        </div>

        <div className="mt-24 space-y-32 lg:mt-36 lg:space-y-52">
          <Housing />
          <Rides />
          <LostFound />
          <GigsProjects />
          <Notices />
        </div>
      </div>
    </section>
  );
}
