export type Guide = {
  slug: string;
  title: string;
  dek: string;
  image: string;
  read: string;
  sections: { h: string; p: string[]; facts?: [string, string][] }[];
};

export const guides: Guide[] = [
  {
    slug: "diamond-4cs",
    title: "The 4Cs, without the jargon",
    dek: "Cut, colour, clarity and carat: what each one means, which one matters most, and where you can quietly save.",
    image: "macro-facets",
    read: "6 min read",
    sections: [
      {
        h: "Cut: the one that matters most",
        p: [
          "Cut isn't the shape (round, oval, pear); it's how well the facets are angled and proportioned to return light to your eye. A beautifully cut diamond looks bigger, brighter and livelier than a poorly cut one of the same weight.",
          "For round brilliants we only set Excellent cut. For fancy shapes, where there's no official cut grade, we judge by eye under daylight and spot lights, and reject stones with a dark 'bow-tie' across the middle.",
        ],
        facts: [
          ["Our minimum", "Excellent (round) · hand-selected (fancy shapes)"],
          ["Why", "Cut drives sparkle more than any other C"],
        ],
      },
      {
        h: "Colour: icy to warm",
        p: [
          "Diamonds are graded from D (colourless) down the alphabet as they pick up a faint yellow tint. Set in yellow or rose gold, a G–H stone looks perfectly white; in platinum, you may prefer E–F.",
          "This is the easiest place to save: most people can't tell F from H once the ring is on a hand.",
        ],
        facts: [["Sweet spot", "F–H"]],
      },
      {
        h: "Clarity: tiny birthmarks",
        p: [
          "Almost every diamond has inclusions: tiny crystals or feathers from its formation. What matters is whether you can see them without magnification ('eye-clean').",
          "Step cuts like emerald and Asscher show everything, so we go VS1 or better there. Brilliant cuts hide inclusions well, so a clean SI1 can be a smart buy.",
        ],
        facts: [["Sweet spot", "VS2–SI1 (brilliants) · VS1+ (step cuts)"]],
      },
      {
        h: "Carat: weight, not size",
        p: [
          "Carat is weight (0.2 grams). Prices jump at 'magic numbers' like 1.00 and 1.50 ct, so a 0.92 ct stone can look the same as a 1.00 ct while costing noticeably less.",
          "Spread matters too: an oval or pear looks larger face-up than a round of the same weight.",
        ],
      },
    ],
  },
  {
    slug: "lab-vs-natural",
    title: "Lab-grown or natural? An honest guide",
    dek: "They're both real diamonds. Here's how they differ in price, value, story and sustainability, and how to choose.",
    image: "macro-gem",
    read: "5 min read",
    sections: [
      {
        h: "Same crystal, different origin",
        p: [
          "A lab-grown diamond is carbon crystallised in a cubic lattice, exactly like a mined one. Same hardness, same fire, same brilliance. Even gemologists need lab equipment to tell them apart.",
          "Natural diamonds formed a billion years or more ago, deep in the earth. Lab diamonds are grown in a few weeks from a diamond seed.",
        ],
      },
      {
        h: "Price and value",
        p: [
          "Lab-grown diamonds cost roughly 70–85% less than natural stones of the same grade, so you can choose a larger or better-cut stone for the same budget.",
          "The trade-off is resale: lab-grown prices keep falling as production grows, while natural diamonds hold more of their value. If heirloom value matters, natural is the safer choice.",
        ],
        facts: [
          ["1 ct lab, F/VS1, excellent", "≈ $1,400 (stone only)"],
          ["1 ct natural, G/VS1, excellent", "≈ $6,200 (stone only)"],
        ],
      },
      {
        h: "Sustainability",
        p: [
          "Lab diamonds avoid mining but use a lot of energy; we only buy from growers powered predominantly by renewables. Our natural diamonds come from conflict-free, traceable sources.",
          "Whichever you choose, the gold around it is 100% recycled.",
        ],
      },
      {
        h: "How to choose",
        p: ["If you want the most diamond for your budget, choose lab-grown. If you want rarity, the long story and better resale, choose natural. Come and see both side by side: most people decide in about a minute."],
      },
    ],
  },
  {
    slug: "metals-guide",
    title: "Gold, platinum, silver: a metals guide",
    dek: "14k or 18k? White gold or platinum? Which metal suits your skin, your budget and your life.",
    image: "texture-gold",
    read: "4 min read",
    sections: [
      {
        h: "14k vs 18k gold",
        p: [
          "14k gold is 58.5% pure gold, alloyed with copper and silver for strength. It's tougher, scratches less and costs less. 18k is 75% gold: richer in colour, softer and about 20% more expensive.",
          "For rings worn every day we usually recommend 14k; for earrings and pendants, 18k's colour is lovely.",
        ],
        facts: [
          ["14k", "58.5% gold · hallmark 585"],
          ["18k", "75% gold · hallmark 750"],
        ],
      },
      {
        h: "Yellow, white or rose",
        p: [
          "Every colour is solid gold; the alloy changes the tone. White gold is alloyed with palladium or nickel-free metals and finished with rhodium for a bright white, which we re-plate free every year or two. Rose gold gets its blush from copper and never needs plating.",
        ],
      },
      {
        h: "Platinum",
        p: [
          "Platinum is naturally white, dense and hypoallergenic. It doesn't wear away: scratches move the metal rather than removing it, so a platinum ring keeps its weight for generations. It costs about 30% more than 14k gold.",
        ],
        facts: [["Platinum", "95% pure · hallmark PT950"]],
      },
      {
        h: "Sterling silver",
        p: ["A few entry pieces come in solid sterling silver (92.5%). It's beautiful and affordable but softer, and it darkens a little over time; the polishing cloth in your box brings it right back."],
      },
    ],
  },
];

export const guideBySlug = Object.fromEntries(guides.map((g) => [g.slug, g]));
