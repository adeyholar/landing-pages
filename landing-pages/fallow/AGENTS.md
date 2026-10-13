# Project conventions

- Standalone Next.js project. Keep the brand, copy, and art direction distinct from the other landing pages.
- All UI primitives must come from `components/ui/`: shadcn/ui `base-maia` with Base UI and Tailwind 4. Fully customize the components; do not replace them with raw interactive HTML in feature components.
- Preserve semantic HTML for layout, links, headings and forms. Use Button render composition for call-to-action links.
- Keep fonts and photographs local; retain their licences and image credits.
- This is an explicit fictional demo. Do not imply real bookings, submissions, availability, prices or testimonials.
- No tracking, persistence or external submission of form values without an explicitly requested backend.
- Support keyboard navigation, mobile layouts, visible focus and reduced motion.
- Before delivery: `pnpm typecheck`, `pnpm build`, and verify the changed interactions in the browser.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
