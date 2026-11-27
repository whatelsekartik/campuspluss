import { useScrollProgress } from "../motion/scroll";
import { CinematicPhoto } from "../components/CinematicPhoto";
import { Kinetic } from "../components/Kinetic";
import { Icon, type IconName } from "../components/Icon";
import { IMG } from "../data";

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

/* ── Housing: vertical reveal + slow internal drift, floating listing ── */
function Housing() {
  const ref = useScrollProgress<HTMLDivElement>("pass");
  return (
    <div ref={ref} className="scene relative grid gap-10 lg:grid-cols-12 lg:items-end">
      <div className="relative lg:col-span-5">
        <div className="px" style={{ ["--sy" as string]: "60px" }}>
          <CinematicPhoto img={IMG.bedroom} ratio="4/5" crop={[4, 5]} sizes="(min-width:1024px) 40vw, 100vw" widths={[480, 800, 1200]} preset="vertical-pan" reveal="clip-up" parallaxY="50px" zoom={1.2} className="rounded-[4px]" />
        </div>
        <div className="px absolute -bottom-8 right-4 w-[min(78%,300px)] lg:-right-[18%]" style={{ ["--sy" as string]: "-80px", ["--pr" as string]: "1.5deg" }}>
          <div data-reveal style={{ ["--rd" as string]: "300ms", ["--ry" as string]: "28px", ["--rr" as string]: "1.5deg" }}>
          <div data-tilt>
            <Fragment icon="home" kicker="Housing · listing" title="Room near campus" meta="Shared · walking distance" />
          </div>
          </div>
        </div>
      </div>
      <div className="relative lg:col-span-7 lg:pb-10">
        <Index n="06.1" label="Housing" />
        <h3 className="display relative mt-6 text-[20vw] lg:-ml-[22%] lg:text-[12vw]" data-reveal-group>
          <span className="line-mask"><span>Housing</span></span>
        </h3>
        <p className="mt-6 max-w-md text-[15px] leading-[1.6] text-stone" data-reveal>
          Rooms and flatmates near campus, posted by other students. Read the details before you go and see it.
        </p>
      </div>
    </div>
  );
}

/* ── Rides: wide cinematic strip, slow horizontal pan, type inside ── */
function Rides() {
  const ref = useScrollProgress<HTMLDivElement>("pass");
  return (
    <div ref={ref} className="scene relative">
      <div className="flex items-end justify-between">
        <Index n="06.2" label="Rides" />
        <p className="caption hidden max-w-[16rem] text-right text-stone sm:block">Share the trip, and the cost, with people heading the same way.</p>
      </div>
      <div className="relative mt-6 overflow-hidden rounded-[6px]" data-reveal style={{ ["--ry" as string]: "0px", ["--rs" as string]: "0.94" }}>
        <div className="px" style={{ ["--sy" as string]: "-40px" }}>
          <div data-hover-media data-sheen className="relative overflow-hidden rounded-[6px]">
          <CinematicPhoto
            img={IMG.bicycle}
            ratio="21/10"
            crop={[21, 10]}
            sizes="100vw"
            widths={[800, 1280, 1800]}
            preset="horizontal-pan"
            reveal="none"
            parallaxX="70px"
            zoom={1.28}
            className="max-sm:!aspect-[4/3]"
          />
          </div>
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(21,19,15,.55),transparent_60%)]" />
        <p
          className="display absolute bottom-[6%] left-[4%] text-[22vw] text-ivory lg:text-[14vw] will-change-transform"
          style={{ transform: "translate3d(calc((var(--p) - 0.5) * -30px), 0, 0)" }}
        >
          <span data-magnet="60" className="inline-block">
            <Kinetic text="Rides" />
          </span>
          <span className="serif-accent text-[0.45em]"> home</span>
        </p>
      </div>
      <div className="relative z-10 -mt-10 flex justify-end pr-4 lg:-mt-16 lg:pr-[6%]" data-reveal style={{ ["--rd" as string]: "150ms" }}>
        <div className="w-[min(88%,340px)]">
          <div data-tilt>
            <Fragment icon="car" kicker="Ride · offering" title="Campus to railway station" meta="Friday evening · 2 seats" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Lost & found: layered collage, entries from different directions ── */
function LostFound() {
  const ref = useScrollProgress<HTMLDivElement>("pass");
  return (
    <div ref={ref} className="scene grid gap-10 lg:grid-cols-12 lg:items-center">
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
        <div className="px absolute left-0 top-0 w-[58%]" style={{ ["--sy" as string]: "-70px", ["--sx" as string]: "-30px", ["--pr" as string]: "-3deg" }}>
          <div data-hover-media data-sheen className="relative overflow-hidden rounded-[4px]">
            <CinematicPhoto img={IMG.keys} ratio="1/1" crop={[1, 1]} sizes="(min-width:1024px) 24vw, 58vw" widths={[400, 700]} preset="stacked-reveal" reveal="scale" rotate={-3} delay={0} className="rounded-[4px]" />
          </div>
        </div>
        <div className="px absolute bottom-[6%] right-0 w-[52%]" style={{ ["--sy" as string]: "90px", ["--sx" as string]: "30px", ["--pr" as string]: "2.5deg" }}>
          <div data-hover-media data-sheen className="relative overflow-hidden rounded-[4px]">
            <CinematicPhoto img={IMG.wallet} ratio="4/5" crop={[4, 5]} sizes="(min-width:1024px) 20vw, 52vw" widths={[400, 700]} preset="stacked-reveal" reveal="scale" rotate={2.5} delay={140} className="rounded-[4px]" />
          </div>
        </div>
        <div className="absolute bottom-0 left-[4%] w-[min(80%,300px)]" data-reveal style={{ ["--rd" as string]: "200ms" }}>
          <Fragment icon="search" kicker="Found · near library" title="Set of keys, blue tag" meta="Posted today" />
        </div>
      </div>
    </div>
  );
}

/* ── Gigs + Projects: independent reveals, layered depth ── */
function GigsProjects() {
  const items = [
    { n: "06.4", t: "Gigs", s: "Small paid tasks", d: "Find short jobs and freelance work from other students, or post one yourself.", img: IMG.sketch, icon: "briefcase" as IconName, f: ["Gig · design", "Poster for a club event", "Short task · open"], preset: "zoom-reveal" as const, reveal: "clip-up" as const },
    { n: "06.5", t: "Projects", s: "& teams", d: "Describe a project, list the skills you need, and find people who want to build it with you.", img: IMG.stickyNotes, icon: "layers" as IconName, f: ["Team · looking for", "Frontend + ML for a project", "2 roles open"], preset: "parallax" as const, reveal: "wipe-left" as const },
  ];
  return (
    <div data-nav-dark className="relative -mx-5 overflow-hidden rounded-[28px] bg-charcoal px-5 py-20 text-ivory sm:-mx-6 sm:px-6 lg:-mx-10 lg:rounded-[48px] lg:px-10 lg:py-28">
      <div className="grid gap-16 lg:grid-cols-2 lg:gap-10">
        {items.map((it, i) => (
          <article key={it.t} data-cursor="media" className={i === 1 ? "lg:mt-40" : ""} data-reveal style={{ ["--rd" as string]: `${i * 120}ms` }}>
            <p className="eyebrow flex items-center gap-3 text-ivory/50">
              <span className="text-ivory">{it.n}</span>
              <span className="h-px w-10 bg-ivory/25" />
              {it.t}
            </p>
            <div className="relative mt-8">
              <CinematicPhoto img={it.img} ratio={i === 0 ? "5/4" : "4/5"} crop={i === 0 ? [5, 4] : [4, 5]} sizes="(min-width:1024px) 40vw, 100vw" widths={[480, 800, 1100]} preset={it.preset} reveal={it.reveal} delay={i * 140} parallaxY="40px" className="w-[88%] rounded-[4px]" />
              <h3 className="display absolute -bottom-[0.18em] right-0 text-[22vw] text-ivory lg:text-[9vw]">{it.t}</h3>
            </div>
            <p className="serif-accent mt-10 text-3xl text-ivory/60">{it.s}</p>
            <p className="mt-3 max-w-sm text-[15px] leading-[1.6] text-ivory/70">{it.d}</p>
            <div className="mt-6 max-w-[320px]">
              <Fragment icon={it.icon} kicker={it.f[0]} title={it.f[1]} meta={it.f[2]} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

/* ── Notices: paper-like movement, gentle rotation and settling ── */
function Notices() {
  const slips = [
    { t: "Library hours", d: "Extended during exam weeks", r: "-3deg", c: "bg-paper" },
    { t: "Club recruitment", d: "Applications open this week", r: "2deg", c: "bg-beige" },
    { t: "Workshop", d: "Seats limited — register early", r: "-1deg", c: "bg-paper" },
    { t: "Exam form", d: "Last date reminder", r: "3deg", c: "bg-dune/60" },
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
      <ul className="grid grid-cols-2 gap-4 sm:gap-6 lg:col-span-7 lg:col-start-6">
        {slips.map((s, i) => (
          <li
            key={s.t}
            className={`paper-lift ${s.c} relative rounded-[3px] p-5 shadow-[0_18px_30px_-20px_rgba(52,38,22,.45)] sm:p-7 ${i % 2 ? "mt-10" : ""}`}
            style={{ rotate: s.r, ["--rd" as string]: `${i * 110}ms`, ["--ry" as string]: "30px", ["--rr" as string]: s.r }}
            data-reveal
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
          <p className="eyebrow text-stone lg:col-span-3" data-reveal>
            <span className="text-ink">(06)</span> Campus utilities
          </p>
          <h2 id="utilities-title" className="display text-[17vw] lg:col-span-9 lg:text-[10vw]" data-reveal-group>
            <span className="line-mask"><span><Kinetic text="More happens" /></span></span>
            <span className="line-mask"><span className="serif-accent" style={{ ["--rd" as string]: "100ms" }}><Kinetic text="here." /></span></span>
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
