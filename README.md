# Landing pages

Six standalone landing pages and marketing sites built with Next.js, Tailwind
CSS and fully customized shadcn/ui components. Each project has its own visual
identity, typography, voice, animations and interactions, and can be installed,
built and deployed independently.

Browse the whole collection at **[lp.lndev.me](https://lp.lndev.me)**.

## Projects

| Preview | Project | What it is | Stack |
| --- | --- | --- | --- |
| [![Ficelle](www/showcase/ficelle.jpg)](https://ficelle-lndev.vercel.app) | **[Ficelle](ficelle)**<br>[live site](https://ficelle-lndev.vercel.app) | Gift-delivery app, "gift parcel" direction: kraft paper, shipping labels, stamps and receipts | Next.js 16, Tailwind CSS v4, shadcn/ui |
| [![Passeline](www/showcase/passeline.jpg)](https://passeline-lndev.vercel.app) | **[Passeline](passeline)**<br>[live site](https://passeline-lndev.vercel.app) | Gift-delivery app, illustrated direction: hand-drawn SVG town, from morning to night | Next.js 16, Tailwind CSS v4, shadcn/ui |
| [![Aparté](www/showcase/aparte.jpg)](https://aparte-lndev.vercel.app) | **[Aparté](aparte)**<br>[live site](https://aparte-lndev.vercel.app) | Gift-delivery app, editorial direction: magazine layout, Bodoni, photos | Next.js 16, Tailwind CSS v4, shadcn/ui |
| [![Écrin](www/showcase/ecrin.jpg)](https://ecrin-lndev.vercel.app) | **[Écrin](ecrin)**<br>[live site](https://ecrin-lndev.vercel.app) | Gift-delivery app, immersive direction: dark, CSS 3D gift box, springy motion | Next.js 16, Tailwind CSS v4, shadcn/ui, Motion |
| [![CRUX](www/showcase/crux.jpg)](https://crux-lndev.vercel.app) | **[CRUX](crux)**<br>[live site](https://crux-lndev.vercel.app) | Independent bouldering club: condensed italic typography, acid lime, chalk, an interactive circuit board and a filterable session calendar | Next.js 16, React 19, Tailwind CSS 4, shadcn/ui (Base UI) |
| [![Marée](www/showcase/maree.jpg)](https://maree-lndev.vercel.app) | **[Marée](maree)**<br>[live site](https://maree-lndev.vercel.app) | Coastal bath house: sea green, linen, ocean photography, warm/cool/rest exploration and an optional breathing pause | Next.js 16, React 19, Tailwind CSS 4, shadcn/ui (Base UI) |

Click a preview to open its demo URL. Source folders are linked beside each preview.

### One foundation, six identities

These are fully customized shadcn/ui projects. Shared primitives provide the
accessible controls; the layout, visual language and motion belong to each
project. The collection explores a consistent product brief through four
gift-delivery brands, then extends to climbing and coastal wellness.

### CRUX and Marée

The two newest projects use the same `base-maia` shadcn foundation as the original collection,
with fully customized components, fonts, motion and art direction. Each has
a full homepage, a three-step sample visit planner, a group enquiry page,
a searchable FAQ, information pages and a custom 404. Forms are interactive
local demonstrations; they do not make real reservations or send data.

Calendar and popover date pickers, grouped form fields, textareas, tabs,
accordions and mobile navigation all use customized shadcn/ui components.
Scroll animations and micro-interactions respect reduced-motion preferences.
Photos and fonts are bundled locally, with credits and licenses in each project.

### About the gift-delivery series

Ficelle, Passeline, Aparté and Écrin answer the same brief: four art directions
for fictional gift-delivery apps set in made-up US towns. They share a color
palette (teal, deep teal, gold, ink and cream) and the same set of pages:

- home;
- a merchant page with a 5-step application form;
- a searchable FAQ;
- six sample legal pages;
- app link fallbacks and a 404.

Everything in them is invented: brands, places, people, prices and legal
texts. External links (app stores, partner portals, QR codes) lead to each
project's own source folder on GitHub. Each project's
README covers its product rules, art direction and files.

## Repository layout

```
landing-pages/
├── <project>/    one standalone project per landing page (own package.json and README)
├── www/          the showcase site presenting the collection (static HTML, CSS, JS)
│   ├── projects.js   the list of projects shown on the site
│   ├── showcase/     framed 1600 × 900 preview images (.jpg)
│   ├── analytics.js  Vercel Web Analytics for the static site
│   └── media/        logos and favicon
├── .github/FUNDING.yml
├── LICENSE
└── README.md
```

Projects share nothing at the root: each folder installs, builds and deploys
on its own, with whatever stack it needs.

## Run a project

Each project's README lists its requirements, commands and environment
variables. For the current projects (Next.js, pnpm, Node 20+):

```bash
cd ficelle        # or any project folder
pnpm install
pnpm dev
```

## Deploy

Deploy each folder as its own site. On Vercel, import this repository once per
project and set **Root Directory** to the project's folder. Use the Next.js
preset for the six landing pages and the Other preset for the buildless `www/`
showcase. For CRUX and Marée, set `NEXT_PUBLIC_SITE_URL` to the deployment
URL to enable canonical metadata and the sitemap; see their `.env.example`.

## Add a landing page

1. Create a folder named after the project (lowercase, no spaces, for example
   `my-product/`). It must be self-contained, with its own dependencies, its
   own lockfile and its own `.gitignore`.
2. Write its `README.md`: what it is, art direction, stack, how to run it,
   environment variables, and anything fictional or placeholder.
3. Deploy it (for example on Vercel, with the project's folder as **Root
   Directory**) and add its preview image to `www/showcase/`:
   `my-product.jpg`, 1600 × 900. Match the existing previews: a real homepage
   capture in a rounded browser window, on a neutral background with a soft shadow.
4. Add a row to the **Projects** table above, with the preview linking to the
   live site.
5. Add an entry to `www/projects.js` (and, optionally, its logo to
   `www/media/`). The showcase site's cards, index and counts follow.
6. Keep the JSON-LD project list, `<noscript>` fallback and initial counters in
   `www/index.html` in sync. Add the preview image to `www/sitemap.xml`.

## Showcase site

`www/` is a static site that presents the collection: no build step, no
dependencies. Preview it locally with:

```bash
cd www && python3 -m http.server
```

It is live at [lp.lndev.me](https://lp.lndev.me). To deploy it on Vercel,
import the repository once more with **Root Directory** set to `www`.

Vercel Web Analytics is initialized by `www/analytics.js` on the homepage
and 404 page using the plain HTML tracking script. Enable **Web Analytics**
in the Vercel project dashboard and redeploy `www/`; Vercel then serves
`/_vercel/insights/script.js`. Localhost and file previews skip the tracking
script. No React component, npm package, or build step is required for this
static integration. See the [Vercel quickstart](https://vercel.com/docs/analytics/quickstart).

The site's public URL, `https://lp.lndev.me`, is written in `www/index.html` (canonical, Open Graph, structured data),
`www/robots.txt` and `www/sitemap.xml`: update all three if it changes. When
you add a project, also add it to the structured data and the `<noscript>`
list in `www/index.html`, and its preview to `www/sitemap.xml`.

## Showcase videos

Showcase videos are not versioned and the showcase site does not use them.
Keep them next to the preview images in `www/showcase/` (for example
`www/showcase/my-product.mp4`, or `www/showcase/2k/` for higher-resolution
masters): git and Vercel ignore every `.mp4` in that folder.

## Support the project

Developed by **[LN](https://lndev.me)**. The source is free to read, fork and
reuse under MIT. If you would like to support this collection and my other
open-source work, you can [make a contribution](https://lndev.mychariow.shop/prd_3cu1s0).
The same link is available through GitHub’s Sponsor button, the showcase
header and the project footers.

## License

The code is released under the [MIT License](LICENSE).

The MIT License does not cover:

- **Fonts**: bundled fonts keep their own licenses, mostly the SIL Open Font
  License. The license text sits next to the font files, in each project's
  `app/fonts/` folder.
- **Third-party images used as placeholders**: in the current projects, these
  are the JPEG photos in `public/images/`.
