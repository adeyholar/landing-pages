# Project conventions

- Standalone Next.js project. Keep UMBRA's fictional observatory, monumental typography, dark ivory/copper palette and original procedural art distinct from the other landing pages.
- UI primitives live in `components/ui/`: shadcn/ui `base-maia` with Base UI and Tailwind CSS 4. Style these primitives for the brand; do not replace their controls with raw interactive HTML in feature components.
- Preserve semantic headings, landmarks and links. Use Button render composition for call-to-action links.
- Keep fonts local and preserve their licences in `app/fonts/`. Do not introduce remote fonts, models or textures.
- This is an explicit fictional demo. Do not imply live observation data, real bookings, availability, transactions or testimonials.
- No tracking, persistence or external submission without an explicitly requested backend.
- Support keyboard navigation, visible focus, live reduced-motion preferences, accessible names and touch targets of at least 44 pixels.
- Treat Three.js as progressive enhancement. Preserve the CSS fallback, no-JavaScript content access, resource disposal and loading/error recovery.
- Before delivery, run `pnpm typecheck`, `pnpm build`, and verify the changed interactions in the browser.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
