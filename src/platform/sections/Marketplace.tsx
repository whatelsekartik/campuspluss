import { useRef } from "react";
import { EditorialCarousel } from "../components/EditorialCarousel";
import { useNearViewport } from "../motion/reveal";
import { MARKET } from "../data";

export function Marketplace() {
  const ref = useRef<HTMLElement>(null);
  const near = useNearViewport(ref, "800px");

  return (
    <section
      id="marketplace"
      ref={ref}
      aria-labelledby="market-title"
      className="relative overflow-clip rounded-t-[28px] bg-sand pb-32 pt-28 outline-none lg:rounded-t-[56px] lg:pb-44 lg:pt-36"
    >
      <div className="mx-auto max-w-[1680px] px-5 sm:px-6 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-12">
          <p className="eyebrow text-stone lg:col-span-3" data-reveal>
            <span className="text-ink">(05)</span> Marketplace
          </p>
          <h2 id="market-title" className="display text-[15vw] lg:col-span-9 lg:text-[8.6vw]" data-reveal-group>
            <span className="line-mask"><span>Buy, sell,</span></span>
            <span className="line-mask">
              <span style={{ ["--rd" as string]: "100ms" }}>
                <span className="serif-accent">pass it</span> on.
              </span>
            </span>
          </h2>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          <p className="text-[15px] leading-[1.6] text-stone lg:col-span-4 lg:col-start-4" data-reveal>
            A marketplace for students on campus. List something you no longer need, or find what you're looking for from
            people nearby.
          </p>
          <p className="caption text-stone lg:col-span-3 lg:col-start-9" data-reveal style={{ ["--rd" as string]: "100ms" }}>
            Swipe, drag or use the arrow keys. Categories are shown with sample photography. They are not live student
            listings.
          </p>
        </div>

        <div className="mt-16 min-h-[640px] lg:mt-24">{near && <EditorialCarousel slides={MARKET} />}</div>
      </div>
    </section>
  );
}
