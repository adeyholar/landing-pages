# AÉRO

A fictional bureau of paper flights. A continuous, original 3D paper plane unfolds, folds and travels through a sculptural air course as you scroll. Pick a livery, adjust the updraft, launch it and keep an illustrated flight card.

## Run

Node 20.9+ and pnpm. From this directory:

```sh
pnpm install
pnpm dev
pnpm typecheck
pnpm build
pnpm start
```

Deploy on Vercel with the Next.js preset and this project as Root Directory. `NEXT_PUBLIC_SITE_URL` optionally overrides `https://aero-lndev.vercel.app` for metadata and sitemap.

Next.js 16, React 19, Tailwind 4, customized shadcn/ui Base UI primitives and Three.js. All 3D geometry, paper textures and the SVG flight card are made in code. Space Grotesk and Manrope are bundled with their OFL licences. The native-scroll story has keyboard controls, reduced motion, an ambient pause, a CSS/SVG fallback and a loading screen linked to fonts and the first rendered 3D frame. There is no audio, tracking, persistence or backend. Names and flight instruments are fictional, not aviation guidance.

Developed by [LN](https://lndev.me). [Source code · MIT](https://github.com/ln-dev7/landing-pages). [Support the project](https://lndev.mychariow.shop/prd_3cu1s0). Fonts retain their own licences.
