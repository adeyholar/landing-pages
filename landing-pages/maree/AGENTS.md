# Project conventions

- Standalone Next.js project. Keep the brand, copy, and art direction distinct from the other landing pages.
- All UI primitives must come from `components/ui/`: shadcn/ui `base-maia` with Base UI and Tailwind 4. Fully customize the components; do not replace them with raw interactive HTML in feature components.
- Preserve semantic HTML for layout, links, headings and forms. Use Button render composition for call-to-action links.
- Keep fonts and photographs local; retain their licences and image credits.
- This is an explicit fictional demo. Do not imply real bookings, submissions, availability, prices or testimonials.
- No tracking, persistence or external submission of form values without an explicitly requested backend.
- Support keyboard navigation, mobile layouts, visible focus and reduced motion.
- Before delivery: `pnpm typecheck`, `pnpm build`, and verify the changed interactions in the browser.
