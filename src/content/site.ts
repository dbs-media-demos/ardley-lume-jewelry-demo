/** One place for everything about the (fictional) business. */
export const site = {
  name: "Ardley & Lume",
  legalName: "Ardley & Lume Fine Jewelry LLC",
  tagline: "Fine jewelry, made in the light.",
  description:
    "Ardley & Lume is an independent fine-jewelry atelier in Knox-Henderson, Dallas. Engagement rings, wedding bands and everyday gold, made at our own bench in recycled gold with lab-grown and natural stones, shipped insured nationwide.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://ardley-lume-jewelry-demo.vercel.app",
  founded: 2014,
  founder: "Margot Ardley",
  phone: "(214) 555-0163",
  phoneHref: "tel:+12145550163",
  email: "hello@ardleyandlume.com",
  address: {
    street: "2930 N Henderson Ave, Suite 110",
    locality: "Dallas",
    region: "TX",
    postalCode: "75206",
    country: "US",
    neighborhood: "Knox-Henderson",
  },
  geo: { lat: 32.8189, lng: -96.7849 },
  instagram: "https://www.instagram.com/",
  /** 0 = Sunday. Times are 24h strings in America/Chicago. */
  hours: [
    { day: 0, open: "12:00", close: "17:00" },
    { day: 1, open: null, close: null },
    { day: 2, open: "11:00", close: "19:00" },
    { day: 3, open: "11:00", close: "19:00" },
    { day: 4, open: "11:00", close: "19:00" },
    { day: 5, open: "11:00", close: "19:00" },
    { day: 6, open: "10:00", close: "18:00" },
  ] as { day: number; open: string | null; close: string | null }[],
  serviceArea: ["Dallas", "Highland Park", "University Park", "Uptown", "Preston Hollow", "Lakewood", "Plano", "Fort Worth", "Nationwide (insured shipping)"],
  rating: { value: 4.9, count: 312 },
  freeShippingOver: 250,
  returnDays: 30,
  resizeDays: 60,
  engravingPrice: 45,
  promo: { code: "WELCOME10", percent: 10 },
} as const;

/** The agency that built this concept site. */
export const agency = { name: "Scale by Noon" };
export const agencyUrl = "https://www.scalebynoon.com";

export const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const fullAddress = `${site.address.street}, ${site.address.locality}, ${site.address.region} ${site.address.postalCode}`;

export const siteUrl = site.url;
/** Concept site: noindex unless NEXT_PUBLIC_NOINDEX is explicitly "false". */
export const noindex = process.env.NEXT_PUBLIC_NOINDEX !== "false";
