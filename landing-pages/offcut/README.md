# offcut

Good wood. New moods.

A standalone fictional furniture atelier built for the [LN landing-page collection](https://github.com/ln-dev7/landing-pages).

## Art direction

Butter, plum and burnt orange. Manrope paired with expressive Fraunces, a sunlit studio still life, smooth original Three.js furniture and procedural wood grain. The collection filters by type and the stool changes finish in real time.

## Run

Node 20.9+ and pnpm are required.

From the repository root:

```sh
cd landing-pages/offcut
pnpm install
pnpm dev
pnpm typecheck
pnpm build
pnpm start
```

Deploy this project on Vercel with the Next.js preset and **Root Directory** set to `landing-pages/offcut`. Set `NEXT_PUBLIC_SITE_URL` to the actual deployed origin to generate sitemap URLs and absolute metadata. No other environment variables or services are required.

## Foundation

- Next.js 16, React 19, TypeScript and Tailwind CSS 4.
- shadcn/ui `base-maia`, built on Base UI. Source lives in `components/ui/`; all visual styles are customized for this brand.
- Buttons, tabs, radios, text fields, accordion and mobile sheet use shadcn primitives. The project brief uses Field and InputGroupTextarea composition.
- Locally bundled OFL fonts; no runtime font requests or remote image dependencies.
- No analytics, payment integration, API submission or persistent personal data.

## Pages & interactions

- `/`: complete homepage with collection filters, interactive 3D objects, studio story, finish configurator and FAQ.
- `/commission`: piece and finish selection, a local project brief, validation, editable confirmation and text-file download.
- `/faq`: searchable answers.
- `/privacy`, `/terms`, `/accessibility`, `/credits`: clearly identified demo information.
- Custom 404, icon, Open Graph image, robots and optional sitemap.

## Motion & accessibility

Content renders on the server and remains visible without JavaScript. Scroll entrances use IntersectionObserver. Motion honors `prefers-reduced-motion`, with a manual pause in the footer. There is no scroll hijacking. Mobile navigation uses a focus-trapped Base UI Sheet. All controls support keyboard focus.

The original 3D furniture uses bevelled edges, turned profiles, satin wood, studio reflections and contact shadows. Scrolling and pointer movement subtly change perspective; the configurator rotates the real model and crossfades its material. Renderers mount only near the viewport, stop once the image settles, and are disposed when far from view. Pixel ratio and shadow-map resolution are capped on mobile; a server-rendered SVG is always available without WebGL. Changing a finish updates the model and carries the selection into the brief URL. Personal form content is never placed in the URL or stored. All pieces and prices are examples, not actual merchandise.

## Assets

Manrope and Fraunces from Google Fonts, each with its OFL file in `app/fonts/`. `public/images/atelier.jpg` is an AI-generated editorial still life, created with the built-in OpenAI image-generation tool. Prompt: sculptural ash stool, oxblood wood side table and folded birch chair, cobalt vase, butter-yellow studio, strong warm sunlight, visible wood grain, premium editorial photograph, no text or logos. The image depicts fictional objects; product models are interpretive, not engineering drawings.

## Credits & license

Developed by [LN](https://lndev.me). Source code is under the repository’s MIT License. Third-party fonts retain their OFL licenses. [Support the project](https://lndev.mychariow.shop/prd_3cu1s0).

This is a design demo. It does not accept orders, send briefs or provide real quotes.
