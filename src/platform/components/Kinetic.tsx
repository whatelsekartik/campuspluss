import type { CSSProperties } from "react";

/**
 * Kinetic — type that reacts to the cursor per character.
 *
 * Each letter is its own hover target, so the pointer pulls a single glyph
 * out of the line and the two neighbours follow it, like a hand dragging a
 * pencil across a word. Pure CSS reaction to :hover — no listeners, no state,
 * no per-frame React work.
 *
 * Accessibility: the animated glyphs are aria-hidden and the real text is
 * exposed once to assistive tech, so nothing is read letter by letter.
 */
type Props = {
  text: string;
  className?: string;
  style?: CSSProperties;
  /** render the word as <span> (default) or <em> for a serif accent */
  as?: "span" | "em";
  /** how many neighbour letters lean with the hovered one (1–3) */
  range?: 1 | 2 | 3;
};

export function Kinetic({ text, className, style, as = "span", range = 2 }: Props) {
  const Tag = as;
  const words = text.split(" ");
  return (
    <Tag className={className} style={style}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className={`kinetic-run range-${range}`}>
        {words.map((word, wi) => (
          <span key={`${word}-${wi}`}>
            <span className="kw">
              {Array.from(word).map((ch, ci) => (
                <span key={`${ch}-${ci}`} className="ch">
                  {ch}
                </span>
              ))}
            </span>
            {wi < words.length - 1 ? " " : null}
          </span>
        ))}
      </span>
    </Tag>
  );
}
