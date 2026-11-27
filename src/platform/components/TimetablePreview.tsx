import { useId, useMemo, useRef, useState } from "react";
import { cn } from "@/utils/cn";
import { DAYS, DIVISIONS, ROUTES, demoSchedule, type Day } from "../data";
import { Icon } from "./Icon";

const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

function todayInfo() {
  const d = new Date();
  const idx = d.getDay(); // 0 = Sunday
  return { day: (idx === 0 ? null : DAYS[idx - 1]) as Day | null, now: d.getHours() * 60 + d.getMinutes() };
}

/**
 * Interactive timetable preview. Uses the deterministic DEMONSTRATION schedule
 * in data.ts — wire `demoSchedule` to the public timetable utility to show live data.
 */
export function TimetablePreview({ onDivision }: { onDivision?: (label: string) => void }) {
  const today = useMemo(todayInfo, []);
  const [division, setDivision] = useState<string>(DIVISIONS[0].id);
  const [day, setDay] = useState<Day>(today.day ?? "Mon");
  const [open, setOpen] = useState<number | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const uid = useId();

  const slots = useMemo(() => demoSchedule(division, day), [division, day]);
  const isToday = today.day === day;
  const status = (s: { start: string; end: string }, i: number) => {
    if (!isToday) return "later";
    const a = toMin(s.start);
    const b = toMin(s.end);
    if (today.now >= b) return "done";
    if (today.now >= a) return "now";
    const firstUpcoming = slots.findIndex((x) => toMin(x.start) > today.now);
    return firstUpcoming === i ? "next" : "later";
  };

  const onTabKey = (e: React.KeyboardEvent) => {
    const i = DAYS.indexOf(day);
    let n = i;
    if (e.key === "ArrowRight") n = (i + 1) % DAYS.length;
    else if (e.key === "ArrowLeft") n = (i - 1 + DAYS.length) % DAYS.length;
    else if (e.key === "Home") n = 0;
    else if (e.key === "End") n = DAYS.length - 1;
    else return;
    e.preventDefault();
    setDay(DAYS[n]);
    setOpen(null);
    tabsRef.current?.querySelectorAll<HTMLButtonElement>("[role=tab]")[n]?.focus();
  };

  const div = DIVISIONS.find((d) => d.id === division)!;

  return (
    <div className="text-white">
      {/* toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-app-line px-4 py-3 sm:px-5">
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-app-mute">Timetable</p>
          <p className="text-[15px] font-semibold tracking-[-0.01em]">{div.long}</p>
        </div>
        <div role="group" aria-label="Division" className="flex gap-1 rounded-full bg-app-card p-1">
          {DIVISIONS.map((d) => (
            <button
              key={d.id}
              type="button"
              aria-pressed={division === d.id}
              onClick={() => {
                setDivision(d.id);
                setOpen(null);
                onDivision?.(d.label);
              }}
              className={cn(
                "rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors",
                division === d.id ? "bg-app-accent text-app" : "text-white/70 hover:text-white",
              )}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* day tabs */}
      <div ref={tabsRef} role="tablist" aria-label="Day" className="no-scrollbar flex gap-1 overflow-x-auto border-b border-app-line px-3 py-2 sm:px-4" onKeyDown={onTabKey}>
        {DAYS.map((d) => (
          <button
            key={d}
            role="tab"
            id={`${uid}-tab-${d}`}
            aria-selected={day === d}
            aria-controls={`${uid}-panel`}
            tabIndex={day === d ? 0 : -1}
            type="button"
            onClick={() => {
              setDay(d);
              setOpen(null);
            }}
            className={cn(
              "relative shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors",
              day === d ? "bg-white text-app" : "text-white/60 hover:bg-white/5 hover:text-white",
            )}
          >
            {d}
            {today.day === d && <span className="absolute right-1 top-1 size-1.5 rounded-full bg-app-accent" aria-label="today" />}
          </button>
        ))}
      </div>

      {/* slots */}
      <div id={`${uid}-panel`} role="tabpanel" aria-labelledby={`${uid}-tab-${day}`} className="min-h-[352px] px-3 py-3 sm:px-4">
        <ul key={division + day} className="space-y-1.5">
          {slots.map((s, i) => {
            const st = status(s, i);
            const expanded = open === i;
            return (
              <li key={s.start} className="soft-in" style={{ ["--d" as string]: `${i * 45}ms` }}>
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => setOpen(expanded ? null : i)}
                  className={cn(
                    "group grid w-full grid-cols-[64px_1fr_auto] items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                    st === "now" || st === "next" ? "bg-app-accent text-app" : "bg-app-card hover:bg-[#222227]",
                    st === "done" && "opacity-45",
                  )}
                >
                  <span className="text-[12px] tabular-nums leading-tight">
                    <span className="block font-semibold">{s.start}</span>
                    <span className="opacity-60">{s.end}</span>
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[14px] font-medium">{s.subject}</span>
                    <span className={cn("block text-[11.5px]", st === "now" || st === "next" ? "opacity-70" : "text-app-mute")}>
                      {s.kind} · {s.room}
                      {s.batch ? ` · Batch ${s.batch}` : ""}
                    </span>
                  </span>
                  <span className="flex items-center gap-2">
                    {(st === "now" || st === "next") && (
                      <span className="rounded-full bg-app/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]">{st === "now" ? "Now" : "Next"}</span>
                    )}
                    <Icon name="plus" size={14} className={cn("transition-transform duration-300", expanded && "rotate-45")} />
                  </span>
                </button>
                {expanded && (
                  <div className="soft-in mx-3 grid grid-cols-3 gap-2 border-x border-b border-app-line px-3 py-3 text-[11.5px]">
                    <span>
                      <span className="block text-app-mute">Code</span>
                      {s.code}
                    </span>
                    <span>
                      <span className="block text-app-mute">Faculty</span>
                      {s.faculty}
                    </span>
                    <span>
                      <span className="block text-app-mute">Duration</span>
                      {toMin(s.end) - toMin(s.start)} min
                    </span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-app-line px-4 py-3 text-[11px] text-app-mute sm:px-5">
        <span>Preview · demonstration data</span>
        <a href={ROUTES.timetable} className="inline-flex items-center gap-1.5 font-medium text-app-accent hover:underline">
          Open the public timetable <Icon name="arrowUpRight" size={13} />
        </a>
      </div>
    </div>
  );
}
