import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/utils/cn";
import { Wordmark } from "./BrandMark";
import { Icon } from "./Icon";
import { NAV, ROUTES, SECTION_TO_NAV } from "../data";
import { usePrefersReducedMotion } from "../motion/reveal";

const SECTION_IDS = Object.keys(SECTION_TO_NAV);

/** Which section occupies the viewport's middle band. */
function useActiveSection() {
  const [active, setActive] = useState("top");
  useEffect(() => {
    const io = new IntersectionObserver(
      (records) => {
        for (const r of records) if (r.isIntersecting) setActive(r.target.id);
      },
      { rootMargin: "-45% 0px -54% 0px" },
    );
    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);
  return active;
}

/** True while a `[data-nav-dark]` surface sits beneath the bar. */
function useDarkUnderNav() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const hits = new Set<Element>();
    const io = new IntersectionObserver(
      (records) => {
        for (const r of records) (r.isIntersecting ? hits.add(r.target) : hits.delete(r.target));
        setDark(hits.size > 0);
      },
      { rootMargin: "0px 0px -90% 0px" },
    );
    const observe = () => document.querySelectorAll("[data-nav-dark]").forEach((el) => io.observe(el));
    observe();
    const t = window.setTimeout(observe, 1500); // pick up lazily-mounted sections
    return () => {
      window.clearTimeout(t);
      io.disconnect();
    };
  }, []);
  return dark;
}

export function useSmoothNav() {
  const reduced = usePrefersReducedMotion();
  return useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
      history.replaceState(null, "", `#${id}`);
      // move focus for keyboard / screen-reader users without a second jump
      el.setAttribute("tabindex", "-1");
      el.focus({ preventScroll: true });
    },
    [reduced],
  );
}

export function ShowcaseNav() {
  const active = useActiveSection();
  const dark = useDarkUnderNav();
  const go = useSmoothNav();
  const [open, setOpen] = useState(false);
  const activeNav = SECTION_TO_NAV[active] ?? "";

  // sliding indicator
  const listRef = useRef<HTMLUListElement>(null);
  const [bar, setBar] = useState<{ x: number; w: number } | null>(null);
  const measure = useCallback(() => {
    const list = listRef.current;
    const link = list?.querySelector<HTMLElement>(`[data-nav="${activeNav}"]`);
    setBar(link ? { x: link.offsetLeft, w: link.offsetWidth } : null);
  }, [activeNav]);
  useLayoutEffect(measure, [measure]);
  useEffect(() => {
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  // menu: escape + scroll lock + focus
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    menuRef.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "Tab" && menuRef.current) {
        const f = menuRef.current.querySelectorAll<HTMLElement>("a,button");
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      toggleRef.current?.focus();
    };
  }, [open]);

  const tone = dark && !open ? "light" : "dark";

  return (
    <>
      <a
        href="#main"
        className="fixed left-4 top-3 z-[70] -translate-y-20 rounded-full bg-ink px-4 py-2 text-xs text-ivory focus:translate-y-0"
      >
        Skip to content
      </a>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b transition-colors duration-500",
          tone === "light" ? "border-white/10 bg-ink/70 text-ivory" : "border-ink/10 bg-ivory/75 text-ink",
          "backdrop-blur-md backdrop-saturate-150",
        )}
      >
        <nav aria-label="Platform" className="mx-auto flex h-14 max-w-[1680px] items-center px-4 sm:px-6 lg:px-10">
          <a href="#top" onClick={(e) => go(e, "top")} data-magnet="18" className="shrink-0" aria-label="Campus+ platform, back to top">
            <Wordmark tone={tone === "light" ? "light" : "dark"} />
          </a>

          <ul ref={listRef} className="relative mx-auto hidden items-center gap-1 lg:flex">
            {NAV.map((n) => (
              <li key={n.id}>
                <a
                  href={`#${n.id}`}
                  data-nav={n.id}
                  onClick={(e) => go(e, n.id)}
                  aria-current={activeNav === n.id ? "true" : undefined}
                  className={cn(
                    "ink-link eyebrow block whitespace-nowrap px-4 py-2 transition-opacity duration-300",
                    activeNav === n.id ? "opacity-100" : "opacity-55 hover:opacity-100",
                  )}
                >
                  {n.label}
                </a>
              </li>
            ))}
            <span
              aria-hidden="true"
              className="absolute bottom-0.5 left-0 h-px w-px origin-left bg-current transition-[transform,opacity] duration-500 ease-[var(--ease-editorial)]"
              style={{
                opacity: bar ? 1 : 0,
                transform: bar ? `translateX(${bar.x + 16}px) scaleX(${bar.w - 32})` : undefined,
              }}
            />
          </ul>

          <div className="ml-auto flex items-center gap-2 whitespace-nowrap lg:ml-0">
            <a
              href={ROUTES.login}
              data-magnet="26"
              className={cn(
                "pressable hidden rounded-full px-4 py-2 text-[13px] font-medium transition-colors sm:inline-flex",
                tone === "light" ? "bg-ivory text-ink hover:bg-white" : "bg-ink text-ivory hover:bg-charcoal",
              )}
            >
              Get started
            </a>
            <span className={cn("mx-1 hidden h-5 w-px sm:block", tone === "light" ? "bg-white/20" : "bg-ink/15")} aria-hidden="true" />
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="platform-menu"
              className="flex items-center gap-2 rounded-full px-2.5 py-2 text-[13px] font-medium"
            >
              <span className="eyebrow hidden sm:inline">{open ? "Close" : "Menu"}</span>
              <Icon name={open ? "close" : "menu"} size={20} />
              <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            </button>
          </div>
        </nav>
      </header>

      {/* Menu overlay */}
      <div
        id="platform-menu"
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        hidden={!open}
        className="fixed inset-0 z-40 overflow-y-auto bg-ivory pt-14"
      >
        <div className="mx-auto flex min-h-full max-w-[1680px] flex-col px-5 pb-10 sm:px-6 lg:px-10">
          <ol className="mt-8 flex-1 space-y-1">
            {[{ id: "top", label: "Campus+" }, ...NAV, { id: "utilities", label: "Utilities" }, { id: "start", label: "Get started" }].map((n, i) => (
              <li key={n.id} className="soft-in border-b border-ink/10" style={{ ["--d" as string]: `${i * 50}ms` }}>
                <a
                  href={`#${n.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setOpen(false);
                    // wait for the scroll lock to be released before scrolling
                    window.setTimeout(() => go(e, n.id), 60);
                  }}
                  className="group flex items-baseline gap-4 py-3"
                >
                  <span className="caption w-8 text-stone">{String(i + 1).padStart(2, "0")}</span>
                  <span className="display text-[clamp(2.4rem,8vw,5.5rem)] transition-transform duration-500 group-hover:translate-x-2">{n.label}</span>
                </a>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <a href={ROUTES.login} className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-ivory">Sign in</a>
            <a href={ROUTES.timetable} className="rounded-full border border-ink/20 px-5 py-3 text-sm font-medium">Public timetable</a>
            <p className="caption ml-auto max-w-xs text-stone">Campus+ is independent and is not an official PCCOE service.</p>
          </div>
        </div>
      </div>
    </>
  );
}
