/**
 * Representations of Campus+ application screens, rendered as live HTML inside
 * device frames. They use demonstration content only — no real student data.
 * Sizes are in `em` so the whole screen scales with the frame.
 */
import { cn } from "@/utils/cn";
import { Icon, type IconName } from "./Icon";
import { StatusBar } from "./DeviceFrames";
import type { CommunityStep } from "../data";

function AppHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="flex items-start justify-between px-[1.4em] pt-[1.4em]">
      <div>
        {sub && <p className="text-[0.72em] text-app-mute">{sub}</p>}
        <p className="text-[1.45em] font-semibold leading-[1.1] tracking-[-0.03em]">{title}</p>
      </div>
      <span className="grid size-[2.3em] place-items-center rounded-full bg-app-card text-app-mute">
        <Icon name="bell" size="1.1em" />
      </span>
    </div>
  );
}

function TabBar({ active }: { active: number }) {
  const tabs: IconName[] = ["home", "calendar", "users", "bag", "user"];
  return (
    <div className="absolute inset-x-0 bottom-0 z-10 border-t border-app-line bg-app/95 px-[1.4em] pb-[1.6em] pt-[0.8em]">
      <div className="flex justify-between">
        {tabs.map((t, i) => (
          <span key={t} className={cn("grid size-[2.2em] place-items-center rounded-full", i === active ? "bg-app-accent text-app" : "text-app-mute")}>
            <Icon name={t} size="1.15em" />
          </span>
        ))}
      </div>
      <span className="mx-auto mt-[0.9em] block h-[0.25em] w-[35%] rounded-full bg-white/60" />
    </div>
  );
}

/* ───────────────────────── Home dashboard ───────────────────────── */
export function HomeScreen() {
  const quick: Array<[IconName, string]> = [
    ["calendar", "Timetable"],
    ["users", "Clubs"],
    ["spark", "Events"],
    ["bag", "Market"],
    ["car", "Rides"],
    ["home", "Housing"],
    ["search", "Lost & found"],
    ["briefcase", "Gigs"],
  ];
  return (
    <div className="relative size-full">
      <StatusBar />
      <AppHeader sub="Good morning" title="Your day" />

      {/* Up next */}
      <div className="mx-[1.1em] mt-[1.1em] rounded-[1.3em] bg-app-accent p-[1.1em] text-app">
        <div className="flex items-center justify-between text-[0.68em] font-semibold uppercase tracking-[0.12em]">
          <span>Up next</span>
          <span className="rounded-full bg-app/10 px-[0.7em] py-[0.25em]">in 25 min</span>
        </div>
        <p className="mt-[0.6em] text-[1.3em] font-semibold leading-[1.1] tracking-[-0.02em]">Data Structures</p>
        <p className="mt-[0.25em] text-[0.78em] opacity-75">10:00 – 11:00 · Room A-204 · Lecture</p>
        <div className="mt-[0.8em] h-[0.3em] overflow-hidden rounded-full bg-app/15">
          <i className="block h-full w-[62%] rounded-full bg-app" />
        </div>
      </div>

      {/* Quick grid */}
      <div className="mx-[1.1em] mt-[1.1em] grid grid-cols-4 gap-[0.55em]">
        {quick.map(([icon, label]) => (
          <div key={label} className="flex flex-col items-center gap-[0.35em] rounded-[1em] bg-app-card py-[0.75em]">
            <Icon name={icon} size="1.15em" className="text-app-accent" />
            <span className="w-full truncate px-[0.2em] text-center text-[0.58em] text-white/80">{label}</span>
          </div>
        ))}
      </div>

      {/* Today */}
      <div className="mx-[1.1em] mt-[1.1em]">
        <p className="mb-[0.5em] text-[0.68em] uppercase tracking-[0.12em] text-app-mute">Today on campus</p>
        {[
          ["spark", "Design workshop", "16:30 · Seminar hall"],
          ["megaphone", "Notice: library hours", "Updated this morning"],
        ].map(([icon, t, s]) => (
          <div key={t} className="mb-[0.45em] flex items-center gap-[0.7em] rounded-[1em] bg-app-card p-[0.7em]">
            <span className="grid size-[2em] place-items-center rounded-[0.7em] bg-white/5 text-app-accent">
              <Icon name={icon as IconName} size="1em" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[0.8em] font-medium">{t}</span>
              <span className="block truncate text-[0.66em] text-app-mute">{s}</span>
            </span>
          </div>
        ))}
      </div>
      <TabBar active={0} />
    </div>
  );
}

/* ───────────────────────── Community screens ───────────────────────── */
const Avatar = ({ c, t }: { c: string; t: string }) => (
  <span className="grid size-[2.1em] shrink-0 place-items-center rounded-full text-[0.8em] font-semibold text-app" style={{ background: c }}>
    {t}
  </span>
);

function ClubsBody() {
  const clubs = [
    ["#e7c27d", "MU", "Music circle", "Jams, open mics"],
    ["#a7c4a0", "RB", "Robotics", "Builds & competitions"],
    ["#d9a38b", "PH", "Photography", "Walks & critiques"],
    ["#b7b2e0", "CH", "Chess", "Weekly blitz"],
    ["#e6d5b8", "LT", "Literary", "Debates & writing"],
  ];
  return (
    <div className="space-y-[0.5em] px-[1.1em]">
      {clubs.map(([c, t, n, s], i) => (
        <div key={n} className="flex items-center gap-[0.75em] rounded-[1em] bg-app-card p-[0.75em]">
          <Avatar c={c} t={t} />
          <span className="min-w-0 flex-1">
            <span className="block text-[0.85em] font-medium">{n}</span>
            <span className="block text-[0.66em] text-app-mute">{s}</span>
          </span>
          <span className={cn("rounded-full px-[0.8em] py-[0.3em] text-[0.62em] font-semibold", i < 2 ? "bg-white/10 text-white/80" : "bg-app-accent text-app")}>
            {i < 2 ? "Following" : "Follow"}
          </span>
        </div>
      ))}
    </div>
  );
}

function CommunitiesBody() {
  return (
    <div className="px-[1.1em]">
      <div className="no-scrollbar mb-[0.8em] flex gap-[0.4em] overflow-hidden">
        {["Computer", "IT", "Design", "First years", "Hackers"].map((t, i) => (
          <span key={t} className={cn("shrink-0 rounded-full px-[0.85em] py-[0.35em] text-[0.66em]", i === 0 ? "bg-white text-app" : "bg-app-card text-white/75")}>
            {t}
          </span>
        ))}
      </div>
      {[
        ["#a7c4a0", "Shared a resource", "A clean set of DS revision notes — feel free to add yours.", 24, 8],
        ["#e7c27d", "Looking for", "Anyone up for a weekend hack on campus tools?", 11, 15],
      ].map(([c, kind, body, likes, replies]) => (
        <div key={String(kind)} className="mb-[0.6em] rounded-[1.1em] bg-app-card p-[0.9em]">
          <div className="mb-[0.5em] flex items-center gap-[0.6em]">
            <Avatar c={String(c)} t="··" />
            <span>
              <span className="block text-[0.72em] font-medium">Community member</span>
              <span className="block text-[0.6em] text-app-mute">{kind} · 2h</span>
            </span>
          </div>
          <p className="text-[0.8em] leading-[1.4] text-white/90">{body}</p>
          <div className="mt-[0.7em] flex gap-[1.2em] text-[0.64em] text-app-mute">
            <span className="flex items-center gap-[0.3em]"><Icon name="heart" size="1.1em" />{likes}</span>
            <span className="flex items-center gap-[0.3em]"><Icon name="chat" size="1.1em" />{replies}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function DiscussionsBody() {
  return (
    <div className="px-[1.1em]">
      <div className="rounded-[1.1em] bg-app-card p-[0.9em]">
        <p className="text-[0.62em] uppercase tracking-[0.12em] text-app-accent">Question</p>
        <p className="mt-[0.3em] text-[0.95em] font-medium leading-[1.25]">Best way to prepare for the mini-project review?</p>
        <p className="mt-[0.4em] text-[0.66em] text-app-mute">12 replies · active now</p>
      </div>
      <div className="ml-[1em] mt-[0.6em] space-y-[0.5em] border-l border-app-line pl-[0.8em]">
        {[
          ["#d9a38b", "Keep a one-page summary of your design decisions."],
          ["#b7b2e0", "Demo first, slides second. Practice the demo twice."],
          ["#a7c4a0", "Ask your guide for the rubric early — it helps."],
        ].map(([c, t]) => (
          <div key={t} className="flex gap-[0.6em] rounded-[1em] bg-white/[0.04] p-[0.7em]">
            <Avatar c={c} t="··" />
            <p className="text-[0.74em] leading-[1.4] text-white/85">{t}</p>
          </div>
        ))}
      </div>
      <div className="mt-[0.8em] flex items-center gap-[0.5em] rounded-full bg-app-card px-[1em] py-[0.6em] text-[0.7em] text-app-mute">
        Write a reply… <Icon name="arrowUpRight" size="1.1em" className="ml-auto text-app-accent" />
      </div>
    </div>
  );
}

function EventsBody() {
  return (
    <div className="space-y-[0.55em] px-[1.1em]">
      {[
        ["14", "Mar", "Intro to open source", "Seminar hall · 15:00", true],
        ["16", "Mar", "Photo walk", "Main gate · 07:00", false],
        ["19", "Mar", "Robotics demo day", "Workshop · 11:00", false],
        ["22", "Mar", "Open mic night", "Amphitheatre · 18:00", false],
      ].map(([d, m, t, s, hot]) => (
        <div key={String(t)} className={cn("flex items-center gap-[0.8em] rounded-[1em] p-[0.75em]", hot ? "bg-app-accent text-app" : "bg-app-card")}>
          <span className={cn("grid w-[2.6em] shrink-0 place-items-center rounded-[0.8em] py-[0.35em]", hot ? "bg-app/10" : "bg-white/5")}>
            <span className="text-[1.05em] font-semibold leading-none">{d}</span>
            <span className="text-[0.56em] uppercase tracking-[0.1em] opacity-70">{m}</span>
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[0.82em] font-medium">{t}</span>
            <span className={cn("block truncate text-[0.64em]", hot ? "opacity-70" : "text-app-mute")}>{s}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

export function CommunityScreen({ step }: { step: CommunityStep["key"] }) {
  const titles: Record<CommunityStep["key"], [string, string]> = {
    clubs: ["Clubs", "Explore"],
    communities: ["Communities", "Your spaces"],
    discussions: ["Discussion", "Thread"],
    events: ["Events", "This month"],
  };
  const [title, sub] = titles[step];
  return (
    <div className="relative size-full">
      <StatusBar />
      <AppHeader sub={sub} title={title} />
      <div key={step} className="soft-in mt-[1.1em]">
        {step === "clubs" && <ClubsBody />}
        {step === "communities" && <CommunitiesBody />}
        {step === "discussions" && <DiscussionsBody />}
        {step === "events" && <EventsBody />}
      </div>
      <TabBar active={2} />
    </div>
  );
}
