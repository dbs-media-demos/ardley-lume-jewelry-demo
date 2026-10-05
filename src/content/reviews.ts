/** Store reviews (fictional, Google-style). */
export type StoreReview = { name: string; area: string; rating: number; when: string; text: string; tag: string };

export const storeReviews: StoreReview[] = [
  { name: "Daniel K.", area: "Highland Park", rating: 5, when: "2 weeks ago", tag: "Engagement", text: "Margot and Theo let me compare four lab and natural stones under daylight and candlelight. Zero pressure. I proposed at Klyde Warren Park and the ring looked like it was glowing." },
  { name: "Priya S.", area: "Plano", rating: 5, when: "1 month ago", tag: "Everyday gold", text: "Bought three Thread rings online, one in each gold. Arrived in two days, insured, in the prettiest box with a handwritten note. Already planning my next order." },
  { name: "Marcus T.", area: "Lakewood", rating: 5, when: "1 month ago", tag: "Signet", text: "Had my grandfather's initials hand-engraved on a Lume signet for my 40th. It looks like an heirloom already. The engraver showed me the sketch before cutting." },
  { name: "Ashley N.", area: "Preston Hollow", rating: 5, when: "2 months ago", tag: "Bridal", text: "They fitted my wedding band to an engagement ring I bought elsewhere and it sits perfectly flush. Free resizing too. This is my jeweler now." },
  { name: "Grace L.", area: "Houston", rating: 5, when: "2 months ago", tag: "Video consult", text: "I'm in Houston, so we did everything on video: stone videos, a sketch, progress photos. The ring arrived overnight and it's even better in person." },
  { name: "Diego M.", area: "East Dallas", rating: 5, when: "3 months ago", tag: "Men's band", text: "I'm a mechanic and wear my band every day. Six months in, still sharp. When I chipped the edge on an engine they re-polished it for free." },
  { name: "Olivia C.", area: "Lakewood", rating: 5, when: "3 months ago", tag: "Repair", text: "Brought in my mom's old ring with a loose stone. They re-tipped the prongs while I had coffee next door and didn't charge me a cent because I'd bought from them before." },
  { name: "Rachel G.", area: "Chicago", rating: 5, when: "4 months ago", tag: "Online", text: "Ordered from Illinois after seeing them on Instagram. Communication was incredible and the free sizer they mailed meant it fit the first time." },
  { name: "Ben O.", area: "Frisco", rating: 4, when: "4 months ago", tag: "Anniversary", text: "Gorgeous Meridian ring for our anniversary. Took a week longer than I hoped because of the engraving, but they told me upfront and it was worth it." },
  { name: "Natalie B.", area: "Highland Park", rating: 5, when: "5 months ago", tag: "Eternity band", text: "My eternity band was made to my exact size so the stones meet perfectly. The showroom feels like a gallery, not a store." },
  { name: "Sam & Leo", area: "Oak Lawn", rating: 5, when: "6 months ago", tag: "Wedding bands", text: "They traced our handwriting from our vows and engraved it inside each other's bands. We both cried in the showroom. Ten out of ten." },
  { name: "Monica F.", area: "Preston Hollow", rating: 5, when: "6 months ago", tag: "Tennis bracelet", text: "Treated myself to a tennis bracelet after a big work win. They walked me through lab versus natural honestly and I saved thousands." },
];

export const ratingBreakdown: [number, number][] = [
  [5, 287],
  [4, 19],
  [3, 4],
  [2, 1],
  [1, 1],
];
