# UMBRA

A fictional observatory at the edge of light. An original, interactive eclipse told through a continuous Three.js world, monumental Space Grotesk type, scientific annotations, deep blue-black, ivory and copper. Part of [LN’s landing-page collection](https://github.com/ln-dev7/landing-pages).

## Run

Node.js 20.9+ and pnpm. From this project directory:

```sh
pnpm install
pnpm dev
pnpm typecheck
pnpm build
```

Deploy with the Next.js preset and `landing-pages/umbra` as the root directory. Set `NEXT_PUBLIC_SITE_URL` to the deployment origin; it defaults to `https://umbra-lndev.vercel.app`.

## Experience and accessibility

Native scrolling carries the observation. Semantic HTML keeps the story readable independently of the WebGL canvas; the scene is a progressive enhancement with a CSS fallback when a GPU is unavailable. The loading curtain also leaves the content accessible with JavaScript disabled. Keyboard controls, visible focus, reduced-motion support and touch targets of at least 44 pixels are part of the experience.

The final instrument has three alignment presets and a keyboard-accessible lunar-offset slider. Export creates a personal SVG observation card locally, reflecting the selected alignment.

This is a creative demonstration, with imagined observations and no live astronomical data, bookings, accounts or external form submissions.

## Stack and assets

Next.js 16.4, React 19.3, Three.js 0.185, Tailwind CSS 4 and shadcn/ui `base-maia` using Base UI. The visual world uses original procedural geometry; it requires no downloaded models, remote textures or external image services. Space Grotesk and Geist Mono are hosted locally with their SIL Open Font License files in `app/fonts/`.

Developed by [LN](https://lndev.me). [Source code](https://github.com/ln-dev7/landing-pages/tree/master/landing-pages/umbra) · [MIT license](https://github.com/ln-dev7/landing-pages/blob/master/LICENSE) · [Support the project](https://lndev.mychariow.shop/prd_3cu1s0).
