# Marée

A standalone fictional coastal bath-house marketing site, created from scratch for the LN landing-page collection.

## Art direction

A slow coastal ritual: sea green, linen, soft sage, rounded windows and ocean photography. DM Sans with Instrument Serif Italic accents. An explorable warm/cool/rest ritual, a visit selector, and an optional breathing animation.

## Component foundation

Next.js 16, React 19, Tailwind CSS 4, and **shadcn/ui with Base UI** (`base-maia`), matching the original collection. Components were added with the shadcn CLI and fully restyled in `components/ui/` and `app/globals.css`. Button, Input, Textarea, Label, Checkbox, RadioGroup, Accordion, Sheet, Tabs, ToggleGroup, Toggle, Card, Calendar, Popover, Field, and InputGroup power the actual pages. Keyboard behavior and state management come from Base UI and React DayPicker; all typography, shapes, colours and motion are custom.

## Run

Node 20.9+ and pnpm.

```sh
pnpm install
pnpm dev
```

```sh
pnpm format
pnpm typecheck
pnpm build
pnpm start
```

No runtime service, account, API key, or database is required.

## Pages

- `/`: full marketing homepage.
- `/book`: three-step sample visit planner, pricing, date/time, local contact details, final summary and text download.
- `/groups`: group landing page and local enquiry preview.
- `/faq`: searchable, category-filtered FAQ.
- `/privacy`, `/terms`, `/accessibility`, `/credits`: transparent information pages.
- Custom 404, app icon, generated Open Graph image, robots and optional sitemap.

## Demonstration boundaries

The brand, location, schedules, offers and prices are fictional. Photography is reference imagery and implies no endorsement. Forms do not send or persist personal data, reserve availability, charge money, or send email. The completion screens explicitly explain this. No fake webhook success or inactive download button is used. The source contains no trackers or external font requests.

## Deployment

Deploy this folder as a separate Next.js application. Set `NEXT_PUBLIC_SITE_URL` to its real public origin to enable a sitemap. No made-up canonical or deployment URL is emitted. The demo is `noindex, follow` by default. For a real launch, replace the fictional information, integrate a secure booking system, and review all notices.

## Motion and accessibility

shadcn Sheet menu, visible focus, semantic forms, labelled controls, reduced-motion support, and progressive reveal animations. Content stays readable before JavaScript. Prices and search results use polite announcements. Decorative motion is finite; the optional breathing loop only starts on user request and has a stop control.


Dates use the shadcn Calendar in a Base UI Popover, with keyboard navigation, disabled past dates, focus restoration and required-field feedback. The group message is a shadcn Field + InputGroup + Textarea composition, with help text and a live character count.

The motion layer uses IntersectionObserver for staggered entrances and a single requestAnimationFrame per scroll update. Only visible scenes receive scroll values. Fine-pointer tilt is separate from touch input. Reduced-motion changes are respected live; observers/listeners are cleaned up on navigation. No Canvas UI runtime or experimental html-in-canvas API is required.

Marée details: slow text reveals, an unfolding ritual photo, ocean and sauna parallax, scroll-linked sun and waves, amenity-icon hover responses, and a keyboard-accessible ripple button.

## Image credits

- Ocean texture: [Christoffer Engström](https://unsplash.com/photos/photo-of-ocean-waves-at-daytime-wc9avd2RaN0), [Unsplash License](https://unsplash.com/license).
- Cedar sauna: [Auroom Wellness](https://unsplash.com/photos/interior-of-a-wooden-sauna-with-a-round-window-pp7xb62ADUs), [Unsplash License](https://unsplash.com/license).

Fonts retain SIL OFL licences in `app/fonts/`. Application code follows the parent repository’s MIT License.
