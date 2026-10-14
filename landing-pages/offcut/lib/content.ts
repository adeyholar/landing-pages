export const brand = {
  name: "offcut",
  mark: "✳︎",
  tagline: "Good wood. New moods.",
  description:
    "An imagined furniture atelier turning overlooked wood into objects with a little more character. Explore the collection and make a piece your own.",
  cta: "Find your piece",
  ctaUrl: "/#collection",
};
export const nav = [
  ["The pieces", "/#collection"],
  ["Our way", "/#our-way"],
  ["Make it yours", "/#make-it-yours"],
];
export const faq = [
  [
    "Can I buy these pieces?",
    "OFFCUT is a fictional design concept. Products, prices and lead times are illustrative. The project builder creates a local brief, not an order.",
  ],
  [
    "What materials are the pieces made from?",
    "The imagined collection explores ash, birch plywood and walnut, with natural, painted and stained finishes. The studio still life is AI-generated; the interactive products are original 3D studies, not manufacturing specifications.",
  ],
  [
    "Can I change the finish?",
    "Absolutely. Try the finish selector to see how the 3D stool changes. Your choice follows you into the project brief.",
  ],
  [
    "How does a commission work?",
    "Choose a piece, a finish and tell us what you have in mind. In this demo, the resulting brief stays in your browser and can be downloaded as text.",
  ],
  [
    "Do you deliver internationally?",
    "There is no real shipping or delivery service behind this concept. All delivery information in a sample brief is illustrative.",
  ],
  [
    "Why offcuts?",
    "Because a knot, a grain or an unexpected shape can be the best part of an object. This is our imagined studio philosophy, not a certified environmental claim.",
  ],
];
export const documents: Record<
  string,
  { title: string; sections: string[][] }
> = {
  privacy: {
    title: "Your space, respected.",
    sections: [
      [
        "A local demonstration",
        "Forms and interactive selections stay in this page’s memory. No backend receives them, and refreshing clears them. Please use sample information.",
      ],
      [
        "No tracking",
        "This project includes no analytics, advertising cookies or embedded third-party media. Fonts and images are served locally. Your hosting provider may keep ordinary access logs.",
      ],
      [
        "External links",
        "Links to LN, GitHub and the support page take you to other websites with their own privacy practices.",
      ],
    ],
  },
  terms: {
    title: "A note on this little world.",
    sections: [
      [
        "A fictional brand",
        "offcut is an independent web design demonstration. Names, experiences, prices, products and places are illustrative. There are no real sales, tickets, bookings or submissions.",
      ],
      [
        "Open source",
        "The source code is available under the MIT License in the ln-dev7/landing-pages repository. Bundled fonts retain their own OFL licenses.",
      ],
      [
        "Using the demo",
        "You can explore every feature without an account. Generated itineraries and briefs are examples and create no agreement or entitlement.",
      ],
    ],
  },
  accessibility: {
    title: "Room for everyone.",
    sections: [
      [
        "Keyboard first",
        "Use Tab to move through controls, Enter or Space to activate buttons, arrow keys within tabs and radio groups, and Escape to close panels. A skip link leads directly to the main content.",
      ],
      [
        "Motion is optional",
        "The interface respects prefers-reduced-motion. A footer control pauses movement. Content remains readable without animations or JavaScript.",
      ],
      [
        "Visual alternatives",
        "Decorative artwork is hidden from assistive technologies. Product illustrations have text descriptions. Controls have visible labels, sufficient target sizes and focus indicators.",
      ],
    ],
  },
  credits: {
    title: "Made of good ingredients.",
    sections: [
      [
        "Design & development",
        "Developed by LN (lndev.me) for the open-source landing-pages collection. Source: github.com/ln-dev7/landing-pages. Support: lndev.mychariow.shop/prd_3cu1s0.",
      ],
      [
        "Interface",
        "Next.js, React, Tailwind CSS and customized shadcn/ui primitives built on Base UI.",
      ],
      [
        "Typography",
        "Manrope and Fraunces from Google Fonts, bundled locally under the SIL Open Font License. The license texts are included beside the fonts.",
      ],
      [
        "Artwork",
        "The atelier still life was generated with OpenAI image generation. The interactive furniture uses original Three.js models and procedural wood grain, with SVG alternatives when WebGL is unavailable. All objects and settings are fictional.",
      ],
    ],
  },
};
