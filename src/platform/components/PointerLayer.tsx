/**
 * PointerLayer — mounts the shared pointer engine exactly once and draws the
 * pencil trail. Kept as its own component so the engine's lifetime is the page's
 * lifetime and not tied to any section that might unmount.
 *
 * The engine (motion/pointer.ts) is what makes every hover reaction on the page
 * work: tilt, sheen, magnets, the cursor-riding underlines and the trail's own
 * pressure. Without this mount those attributes are inert.
 */
import { usePointerEngine } from "../motion/pointer";

export function PointerLayer() {
  usePointerEngine();
  return null;
}
