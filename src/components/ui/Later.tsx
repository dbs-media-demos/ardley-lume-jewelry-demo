import { Suspense, type CSSProperties, type ReactNode } from "react";

/**
 * Phones and tablets: the browser skips laying out and painting this section until
 * it nears the screen (content-visibility), holding the height it will really have
 * so the page never jumps. Measured with scripts/section-heights.mjs: phones 360–430 px get a
 * fitted a + b·vw (within ~2%), 320 px and tablets their measured heights. Re-measure after
 * changing a section's phone layout. Desktop: no effect. The HTML is all there either way.
 *
 * Each section is also its own Suspense boundary, so React hydrates them one by one in
 * separate short tasks (yielding to the browser in between) instead of in one long task.
 */
const H: Record<string, [phone: string, small: number, tablet: number]> = {
  facets: ["749px", 804, 628],
  worlds: ["660px", 660, 740],
  reviews: ["calc(1264px - 93.1vw)", 933, 873],
  ring: ["calc(1415px - 141.3vw)", 926, 823],
  builder: ["calc(829px + 80.2vw)", 1186, 1454],
  morph: ["calc(829px + 79.6vw)", 1129, 1089],
  best: ["calc(636px + 125.4vw)", 1122, 1516],
  workshop: ["calc(516px + 68.6vw)", 773, 791],
  gifts: ["calc(782px + 32.9vw)", 927, 963],
  visit: ["calc(1073px + 21.7vw)", 1145, 1339],
};

export function Later({ id, children }: { id: keyof typeof H; children: ReactNode }) {
  const [phone, small, tablet] = H[id];
  return (
    <div data-cv={id} style={{ "--cv": phone, "--cv-s": `${small}px`, "--cv-t": `${tablet}px` } as CSSProperties}>
      <Suspense>{children}</Suspense>
    </div>
  );
}
