# Landing pages

A collection of landing pages and marketing sites. Each one is a standalone
project in its own folder, with its own art direction, stack and README, and a
short showcase video.

## Projects

| Preview | Project | What it is | Stack |
| --- | --- | --- | --- |
| [![Ficelle](showcase/ficelle.jpg)](showcase/ficelle.mp4) | **[Ficelle](ficelle)**<br>[video](showcase/ficelle.mp4) | Gift-delivery app, "gift parcel" direction: kraft paper, shipping labels, stamps and receipts | Next.js 16, Tailwind CSS v4, shadcn/ui |
| [![Passeline](showcase/passeline.jpg)](showcase/passeline.mp4) | **[Passeline](passeline)**<br>[video](showcase/passeline.mp4) | Gift-delivery app, illustrated direction: hand-drawn SVG town, from morning to night | Next.js 16, Tailwind CSS v4, shadcn/ui |
| [![Aparté](showcase/aparte.jpg)](showcase/aparte.mp4) | **[Aparté](aparte)**<br>[video](showcase/aparte.mp4) | Gift-delivery app, editorial direction: magazine layout, Bodoni, photos | Next.js 16, Tailwind CSS v4, shadcn/ui |
| [![Écrin](showcase/ecrin.jpg)](showcase/ecrin.mp4) | **[Écrin](ecrin)**<br>[video](showcase/ecrin.mp4) | Gift-delivery app, immersive direction: dark, CSS 3D gift box, springy motion | Next.js 16, Tailwind CSS v4, shadcn/ui, Motion |

Click a preview to watch its showcase video.

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
texts. External links point to [lndev.me](http://lndev.me/). Each project's
README covers its product rules, art direction and files.

## Repository layout

```
landing-pages/
├── <project>/    one standalone project per landing page (own package.json and README)
├── showcase/     one showcase video (.mp4) and poster (.jpg) per project
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
project and set **Root Directory** to the project's folder.

## Add a landing page

1. Create a folder named after the project (lowercase, no spaces, for example
   `my-product/`). It must be self-contained, with its own dependencies, its
   own lockfile and its own `.gitignore`.
2. Write its `README.md`: what it is, art direction, stack, how to run it,
   environment variables, and anything fictional or placeholder.
3. Add its showcase files to `showcase/`:
   - `my-product.mp4`, Full HD, kept small enough for GitHub;
   - `my-product.jpg`, the poster, about 1600 px wide.
4. Add a row to the **Projects** table above.

## Showcase videos

The `showcase/` folder holds Full HD versions (1920×1080, 60 fps, H.264), which
are small enough for the repository. Higher-resolution masters, such as 2K
(2560×1440), are kept out of version control: put them in `showcase/2k/`,
which is ignored.

## License

The code is released under the [MIT License](LICENSE).

The MIT License does not cover:

- **Fonts**: bundled fonts keep their own licenses, mostly the SIL Open Font
  License. The license text sits next to the font files, in each project's
  `app/fonts/` folder.
- **Third-party images used as placeholders**: in the current projects, these
  are the JPEG photos in `public/images/`.
