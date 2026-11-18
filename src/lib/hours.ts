import { site, dayNames } from "@/content/site";
import { dayRange, weekFromMonday, type Biz } from "./biz-core";

const fmt12 = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const hh = h % 12 || 12;
  return m ? `${hh}:${String(m).padStart(2, "0")} ${suffix}` : `${hh} ${suffix}`;
};

/** Monday-first rows; a preview passes its business (their hours, plain "Closed"; none when unknown). */
export const hoursRows = (biz?: Biz) => {
  if (biz?.preview) return biz.hours ? weekFromMonday(biz.hours).map((h) => ({ day: dayNames[h.day], text: dayRange(h, "en") })) : [];
  return [1, 2, 3, 4, 5, 6, 0].map((d) => {
    const h = site.hours.find((x) => x.day === d)!;
    return { day: dayNames[d], text: h.open ? `${fmt12(h.open)} – ${fmt12(h.close!)}` : "Closed (appointments only)" };
  });
};
