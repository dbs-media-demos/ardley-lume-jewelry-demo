import { site, dayNames } from "@/content/site";

const fmt12 = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const hh = h % 12 || 12;
  return m ? `${hh}:${String(m).padStart(2, "0")} ${suffix}` : `${hh} ${suffix}`;
};

export const hoursRows = () =>
  [1, 2, 3, 4, 5, 6, 0].map((d) => {
    const h = site.hours.find((x) => x.day === d)!;
    return { day: dayNames[d], text: h.open ? `${fmt12(h.open)} – ${fmt12(h.close!)}` : "Closed (appointments only)" };
  });

/** Status in Dallas time: "Open now · until 7 pm" or "Closed · opens Tue 11 am". */
export function openStatus(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", weekday: "short", hour: "numeric", minute: "numeric", hourCycle: "h23" }).formatToParts(now);
  const wd = parts.find((p) => p.type === "weekday")!.value;
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(wd);
  const mins = Number(parts.find((p) => p.type === "hour")!.value) * 60 + Number(parts.find((p) => p.type === "minute")!.value);
  const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
  const today = site.hours.find((h) => h.day === day)!;
  if (today.open && mins >= toMin(today.open) && mins < toMin(today.close!)) {
    const left = toMin(today.close!) - mins;
    return { open: true, label: left <= 60 ? `Open now · closes soon (${fmt12(today.close!)})` : `Open now · until ${fmt12(today.close!)}` };
  }
  for (let i = 0; i < 8; i++) {
    const d = (day + i) % 7;
    const h = site.hours.find((x) => x.day === d)!;
    if (!h.open) continue;
    if (i === 0 && mins >= toMin(h.open)) continue;
    const when = i === 0 ? "today" : i === 1 ? "tomorrow" : dayNames[d].slice(0, 3);
    return { open: false, label: `Closed · opens ${when} ${fmt12(h.open)}` };
  }
  return { open: false, label: "Closed" };
}
