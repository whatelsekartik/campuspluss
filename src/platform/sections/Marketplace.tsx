import { useRef } from "react";
import { useScrollProgress } from "../motion/scroll";
import { usePrefersReducedMotion } from "../motion/reveal";
import { ScrubText } from "../components/ScrubText";
import { EditorialCarousel } from "../components/EditorialCarousel";
import { useNearViewport } from "../motion/reveal";
import { MARKET } from "../data";

export function Marketplace() {
  const ref = useRef<HTMLElement>(null);
  const near = useNearViewport(ref, "800px");
  const reduced = usePrefersReducedMotion();
  // the section now has its own progress: the headline scrubs in, the copy
  // drifts against it, and the stage settles as it arrives
  const sceneRef = useScrollProgress<HTMLElement>("pass", undefined, !reduced);

  return (
    <section
      id="marketplace"
      ref={(node) => {
        ref.current = node;
        sceneRef.current = node;
      }}
      aria-labelledby="market-title"
      className="scene relative rounded-t-[28px] bg-sand pb-32 pt-28 outline-none lg:rounded-t-[56px] lg:pb-44 lg:pt-36"
    >
      <div className="mx-auto max-w-[1680px] px-5 sm:px-6 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-12">
          <p className="eyebrow text-stone lg:col-span-3">
            <span className="numeral text-ink" style={{ ["--ns" as string]: "0.04" }}>(05)</span> Marketplace
            <span className="rule mt-3 block h-px w-10 bg-ink/30" />
          </p>
          <h2 id="market-title" className="display text-[15vw] lg:col-span-9 lg:text-[8.6vw]" data-reveal-group>
            <span className="line-mask"><span><ScrubText>Buy, sell,</ScrubText></span></span>
            <span className="line-mask">
              <span>
                <span className="serif-accent"><ScrubText start={0.16}>{"\u00a0pass it"}</ScrubText></span>
                <ScrubText start={0.2}>{"\u00a0on."}</ScrubText>
              </span>
            </span>
          </h2>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          <p className="drift text-[15px] leading-[1.6] text-stone lg:col-span-4 lg:col-start-4" style={{ ["--dy" as string]: "-46px" }} data-reveal>
            A marketplace for students on campus. List something you no longer need, or find what you're looking for from
            people nearby.
          </p>
          <p className="caption drift text-stone lg:col-span-3 lg:col-start-9" data-reveal style={{ ["--rd" as string]: "100ms", ["--dy" as string]: "28px" }}>
            Swipe, drag or use the arrow keys. Categories are shown with sample photography. They are not live student
            listings.
          </p>
        </div>

        {/* no .creep here: a transform on the wrapper would scale the carousel
            while it is pinned, and `overflow-clip` on the section would stop it
            sticking at all */}
        <div className="mt-16 lg:mt-24">{near && <EditorialCarousel slides={MARKET} />}</div>
      </div>
    </section>
  );
}
