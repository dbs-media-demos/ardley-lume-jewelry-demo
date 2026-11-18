import { site } from "@/content/site";
import { type Biz } from "./biz-core";

export type { Biz } from "./biz-core";

/** The fictional store as a Biz: what the concept site shows (previews swap in a real one from the CRM). */
export const defaultBiz: Biz = {
  lang: "en",
  name: site.name,
  shortName: site.name,
  tagline: null,
  area: site.address.locality,
  phone: site.phoneHref.replace(/^tel:/, ""),
  phoneDisplay: site.phone,
  address: {
    street: site.address.street,
    city: site.address.locality,
    region: site.address.region,
    postal: site.address.postalCode,
    full: `${site.address.street}, ${site.address.locality}, ${site.address.region} ${site.address.postalCode}`,
  },
  timezone: "America/Chicago",
  hours: site.hours.map((h) => ({ ...h })),
  hoursSummary: "Tue–Fri 11–7 · Sat 10–6 · Sun 12–5",
  rating: { ...site.rating },
  preview: false,
  logo: null,
  areas: site.serviceArea.filter((a) => !a.startsWith("Nationwide")),
};
