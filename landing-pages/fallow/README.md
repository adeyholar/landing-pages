# FALLOW

An imaginary seed library told as a four-chapter, full-screen botanical journey. Part of [LN's landing-page collection](https://github.com/ln-dev7/landing-pages).

## Art direction

Dusty rose, earth, warm silver, oversized Cormorant Garamond italics and Manrope annotations. A single original Three.js world carries the visitor from a closed seed to its roots, an open bloom, and a garden. Native scroll drives the camera and materials. This is an experiential site, with a quiet dock and field-notes drawer rather than a conventional stack of marketing cards.

The reference at https://why.zero.university/ informed the idea of a continuous, interactive narrative. No source code, typography artwork, models, textures or copy from Zero are included. Geometry, flower species and illustrations are original.

## Run

Node 20.9+ and pnpm:

From the repository root:

```sh
cd landing-pages/fallow
pnpm install
pnpm dev
pnpm typecheck
pnpm build
```

Deploy this project on Vercel with the Next.js preset and **Root Directory** set to `landing-pages/fallow`. Set `NEXT_PUBLIC_SITE_URL` to the actual deployment origin for canonical metadata and sitemap entries.

## Interactions

- A botanical loading curtain is present in the first HTML response. Its progress follows real scene preparation, local fonts, material compilation and the first completed GPU frame. Only then does it lift into the garden; no artificial timer claims that loading is finished. The loader respects reduced motion and offers the CSS-only garden on a slow connection. Missing WebGL or a failed scene import reveals the same fallback, while disabling JavaScript leaves the HTML story accessible.
- Wake the seed to stir the bud. Petals open as you reach the third chapter.
- Native scrolling reveals roots, opens the flower, then grows the meadow from the ground. One shared scroll clock makes the sequence reversible; camera framing keeps the main plant anchored during the seed, roots and bloom chapters.
- Select one of three imagined species; its color changes in the whole garden.
- Download a generated SVG botanical specimen. No server or image service involved.
- Open the field notes, navigate chapters or pause ambient animation with keyboard-accessible shadcn/ui controls.
- Respect live `prefers-reduced-motion` changes. Rendering pauses when the story is offscreen, the notes are open, or the tab is hidden. DPR is capped and mobile uses fewer flowers. The meadow batches flowers into four instanced meshes. WebGL failure leaves a chapter-aware CSS botanical fallback and usable content; a lost context releases the scene and keeps the CSS garden usable. Reloading starts a fresh 3D session.
- Closed, softly curled petals, veined leaves with attached petioles, and tapered grass tufts follow the actual stem and terrain. Ground contact is sampled from the stone surface, and the terrain fades in place to reveal the roots. Satin materials, welded normals and time-based camera damping keep surfaces and movement smooth.
- The header caption is geometrically centered. Mobile controls have 44-pixel minimum targets; the bottom dock accounts for the device safe area.

The story and controls are HTML, rendered by Next.js. WebGL is an enhancement and loads lazily. No scroll hijacking, sound, tracking, account, form submission or persistence.

## Stack and assets

Next.js 16 / React 19 / Tailwind CSS 4 / shadcn/ui base-maia (Base UI) / Three.js. The shadcn primitives are fully styled for FALLOW. Shared control mechanics only; original layout and artwork.

Local Cormorant Garamond and Manrope fonts retain the SIL Open Font License in `app/fonts/`. Procedural 3D geometry uses standard Three.js materials and the package's RoomEnvironment reflection setup. No external image assets.

FALLOW, its plants and the botanical descriptions are fictional, not horticultural advice or a real conservation program.

Developed by [LN](https://lndev.me). Source code: [MIT](../../LICENSE). [Support the project](https://lndev.mychariow.shop/prd_3cu1s0).
