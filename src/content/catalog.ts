import type { Category, Collection } from "@/lib/commerce/types";

export const categories: Category[] = [
  {
    slug: "engagement",
    name: "Engagement",
    plural: "Engagement rings",
    blurb: "Solitaires, halos, three-stones and bezels, set by hand in Dallas with lab-grown or natural diamonds you can see before you choose.",
    image: "ardley-solitaire-2",
  },
  {
    slug: "wedding-bands",
    name: "Wedding bands",
    plural: "Wedding bands",
    blurb: "Comfort-fit, knife-edge, hammered and eternity bands, made to sit flush against the ring they'll live beside.",
    image: "classic-band-2",
  },
  {
    slug: "rings",
    name: "Rings",
    plural: "Rings",
    blurb: "Signets, domes and slim stackers in recycled gold: the rings you put on every morning and forget you're wearing.",
    image: "lume-signet-2",
  },
  {
    slug: "earrings",
    name: "Earrings",
    plural: "Earrings",
    blurb: "Studs, huggies, hoops and pearls, weighted to sit right and finished with secure hinged or screw backs.",
    image: "halo-hoops-2",
  },
  {
    slug: "necklaces",
    name: "Necklaces",
    plural: "Necklaces & pendants",
    blurb: "Fine chains, pendants and pearls, each with an extra jump ring so you can wear it at two lengths.",
    image: "lume-pendant-2",
  },
  {
    slug: "bracelets",
    name: "Bracelets",
    plural: "Bracelets",
    blurb: "Tennis lines, cuffs and chains built for wrists that work: tested clasps, soldered links, no snagging.",
    image: "tennis-bracelet-2",
  },
];

export const collections: Collection[] = [
  {
    slug: "new-in",
    name: "New in",
    blurb: "Fresh off the bench this season: the pieces we've been wearing around the studio for months before letting them go.",
    image: "macro-gem",
  },
  {
    slug: "bestsellers",
    name: "Bestsellers",
    blurb: "The pieces Dallas keeps coming back for. Most are made to order within a week.",
    image: "model-1",
  },
  {
    slug: "gift-edit",
    name: "The Gift Edit",
    blurb: "Everything under $500, gift-boxed with a handwritten note at no charge. Free resizing for 60 days if you guessed the size.",
    image: "gift-box",
  },
  {
    slug: "on-sale",
    name: "On sale now",
    blurb: "A short list of studio samples and last-of-the-run pieces, quietly reduced. Same warranty, same box, same care.",
    image: "still-stone",
  },
  {
    slug: "everyday-gold",
    name: "Everyday gold",
    blurb: "Solid recycled gold you can shower, swim and sleep in. Built to be worn, not saved for later.",
    image: "model-2",
  },
  {
    slug: "bridal",
    name: "Bridal",
    blurb: "Engagement rings, matching bands and the earrings for the day itself, all fitted together at the bench.",
    image: "couple-hands",
  },
];

export const categoryBySlug = Object.fromEntries(categories.map((c) => [c.slug, c]));
export const collectionBySlug = Object.fromEntries(collections.map((c) => [c.slug, c]));
