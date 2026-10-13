/*
 * The collection. One entry per landing page, newest last.
 * To add a project: drop its preview in showcase/ (16:9, about 1600 px
 * wide) and, optionally, its logo in media/, then add an entry below.
 * Only slug, name, url and image are required; the cards, the table and
 * the counts all follow. The "Source" button points to the repository
 * folder named after the slug; set `source` to override it.
 */
window.PROJECTS = [
  {
    slug: "ficelle",
    image: "showcase/ficelle.jpg",
    logo: "media/ficelle-logo.svg",
    name: "Ficelle",
    url: "https://ficelle-lndev.vercel.app",
    category: "Gift-delivery app",
    direction: "Gift parcel",
    description:
      "The whole site is a parcel being packed and opened: kraft paper with generated fibers, shipping labels, teal ink stamps, a gold ribbon and receipts. The delivery picker prints a live receipt as you choose.",
    type: "Archivo Condensed, IBM Plex Mono",
    signature: "Delivery picker with a live receipt",
    colors: ["#C39C68", "#1A7971", "#0F2324", "#FFFDF7"],
    stack: ["Next.js 16", "Tailwind CSS v4", "shadcn/ui"],
  },
  {
    slug: "passeline",
    image: "showcase/passeline.jpg",
    logo: "media/passeline-logo.svg",
    name: "Passeline",
    url: "https://passeline-lndev.vercel.app",
    category: "Gift-delivery app",
    direction: "Illustrated",
    description:
      "One gift crosses a hand-drawn SVG town: the quay, the streetcar, the town hall, the Ferris wheel. A gold dotted line links the scenes, and the page turns from morning to night as you scroll.",
    type: "Bricolage Grotesque",
    signature: "Morning to night along a dotted line",
    colors: ["#CFE4DD", "#1A7971", "#C59940", "#123F3B"],
    stack: ["Next.js 16", "Tailwind CSS v4", "shadcn/ui"],
  },
  {
    slug: "aparte",
    image: "showcase/aparte.jpg",
    logo: "media/aparte-logo.svg",
    name: "Aparté",
    url: "https://aparte-lndev.vercel.app",
    category: "Gift-delivery app",
    direction: "Editorial",
    description:
      "A magazine on the web: Bodoni headlines, running heads and folios, a drop cap, pull quotes and an address book with dot leaders. One warm, grainy treatment for every photo.",
    type: "Bodoni Moda, Hanken Grotesk",
    signature: "Magazine layout with drop cap and folios",
    colors: ["#FCFCFA", "#0F2324", "#C59940", "#1A7971"],
    stack: ["Next.js 16", "Tailwind CSS v4", "shadcn/ui"],
  },
  {
    slug: "ecrin",
    image: "showcase/ecrin.jpg",
    logo: "media/ecrin-logo.svg",
    name: "Écrin",
    url: "https://ecrin-lndev.vercel.app",
    category: "Gift-delivery app",
    direction: "Immersive",
    description:
      "A dark, cinematic launch site lit in gold. A CSS 3D box spins and lifts its lid as you scroll, with springy micro-interactions on top: magnetic buttons, rolling totals, a light that follows the cursor.",
    type: "Unbounded, Geist",
    signature: "CSS 3D box that opens on scroll",
    colors: ["#0F2324", "#123F3B", "#C59940", "#E3BE6B"],
    stack: ["Next.js 16", "Tailwind CSS v4", "shadcn/ui", "Motion"],
  },
];
