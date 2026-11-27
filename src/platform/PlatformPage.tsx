import { useEffect } from "react";
import { ShowcaseNav } from "./components/ShowcaseNav";
import { CursorTrail } from "./components/CursorTrail";
import { PointerField } from "./components/PointerField";
import { Hero } from "./sections/Hero";
import { Everything } from "./sections/Everything";
import { Academic } from "./sections/Academic";
import { Community } from "./sections/Community";
import { Marketplace } from "./sections/Marketplace";
import { Utilities } from "./sections/Utilities";
import { Closing } from "./sections/Closing";
import { useRevealScope } from "./motion/reveal";
import { ROUTES } from "./data";

const TITLE = "Campus+ Platform — Timetables, clubs, marketplace & campus life for PCCOE students";

/** Route-scoped metadata: unique title + absolute canonical/og:url for /platform. */
function usePlatformMeta() {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = TITLE;
    const abs = `${window.location.origin}${ROUTES.platform}`;
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const ogUrl = document.querySelector<HTMLMetaElement>('meta[property="og:url"]');
    const prevCanonical = canonical?.href;
    const prevOg = ogUrl?.content;
    canonical?.setAttribute("href", abs);
    ogUrl?.setAttribute("content", abs);
    return () => {
      document.title = prevTitle;
      if (canonical && prevCanonical) canonical.setAttribute("href", prevCanonical);
      if (ogUrl && prevOg) ogUrl.setAttribute("content", prevOg);
    };
  }, []);
}

export default function PlatformPage() {
  usePlatformMeta();
  useRevealScope("[data-platform]");

  return (
    <div data-platform className="bg-ivory text-ink">
      <ShowcaseNav />
      <PointerField />
      <CursorTrail />
      <main id="main">
        <Hero />
        <Everything />
        <Academic />
        <Community />
        <Marketplace />
        <Utilities />
        <Closing />
      </main>
    </div>
  );
}
