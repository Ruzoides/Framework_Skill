# Design system

Added by `scripts/postinstall/setup-design.sh`, called automatically (and
unconditionally) from `init-site.sh`, before any page content is copied in.
Everything else in the generated frontend builds on top of this.

## Why "Ledger"

The generated copy and layout are written against a concrete placeholder
subject — **Ledger**, a small SaaS tool for freelancers/small teams tracking
clients, invoices, and time — instead of generic Lorem-ipsum placeholders.
This gives the design real specificity to be built against (the hero mockup,
the feature list, the stats) rather than reading as templated filler. It is
a *default*, not a permanent identity: replace the Ledger-specific copy,
name, and the placeholder logos/testimonials in
`components/marketing/logo-strip.tsx` and `proof-section.tsx` before
shipping a real product.

## Token system

Every color is a CSS custom property in `app/globals.css`, mapped to
Tailwind utilities via `@theme inline`. shadcn/ui's vendored components
(`components/ui/*`) all read these same variables, so changing a value here
re-themes the entire app at once — no per-component edits needed.

| Variable | Light | Dark | Used for |
|---|---|---|---|
| `--background` / `--foreground` | `#F7F7F5` / `#1B2333` | `#1B2333` / `#F7F7F5` | page background / body text |
| `--card`, `--popover` | `#FFFFFF` | `#232C40` | card and popover surfaces |
| `--primary` | `#1B2333` | `#F7F7F5` | primary button background |
| `--secondary`, `--muted`, `--accent` | `#ECE9E2` | `#2A3346` | secondary buttons, muted backgrounds, hover states |
| `--muted-foreground` | `#5B6472` | `#9AA3B2` | secondary/caption text |
| `--destructive` | `#B3261E` | `#E5484D` | errors, destructive actions |
| `--border`, `--input` | `#E4E1DA` | `#2E3850` | hairline dividers, input borders |
| `--ring` | `#C08A2E` | `#C08A2E` | focus rings |
| `--gold` / `--gold-foreground` | `#C08A2E` / `#1B2333` | same | **the signature accent** — see below |

**`--gold` is deliberately separate from shadcn's own `--accent`.** shadcn
uses `--accent`/`--accent-foreground` pervasively for hover/highlight states
(menu items, subtle backgrounds) — mapping that to gold would make the
accent color flash on every hover, which defeats the point of having a
signature color. `--gold` is used explicitly, in only a few places: the
primary hero/CTA buttons, the "Most popular" pricing badge, and the closing
CTA band. Keep it rare; that's what makes it read as a signal rather than
decoration.

## Typography

Three type roles, wired via `next/font/google` in `app/layout.tsx` (both the
Clerk and Auth.js variants) and mapped to Tailwind utilities in
`app/globals.css`:

| Role | Font | Utility | Used for |
|---|---|---|---|
| Display | Roboto Slab | `font-display` | headlines, section titles |
| Body | Public Sans | `font-sans` (default) | paragraph text, UI labels |
| Numeric | JetBrains Mono | `font-mono` (via `<NumericText>`) | every number |

`next/font/google` self-hosts the font files at build time — there is no
runtime request to Google's font CDN, so this doesn't affect the CSP in
`middleware.ts`/`security-headers` snippet, and works offline once built.

### The numeric signature

Every number that appears in the product — stats, prices, table figures —
renders through `components/numeric-text.tsx`, which applies
`font-mono tabular-figures`. This is deliberate, not decorative: the product
is about structured data (time, money), so numbers get a typographically
distinct treatment from prose, and `tabular-figures` keeps columns of
numbers aligned in tables and stat cards. Use `<NumericText>` for any new
number you add — don't reach for a bare `<span>`.

## The "ledger line" motif

The recurring hairline rule you see between sections and inside cards
(under section headings, between invoice line items, above stat card
figures) is the shadcn `Separator` component, styled with the `--border`
token. It's used structurally — to mark a real boundary between distinct
content — never as pure decoration. If you add a new section, ask whether a
`Separator` is marking something true about the content before reaching for
one out of habit.

## shadcn/ui setup

`components/ui/*.tsx` and `lib/utils.ts` are vendored directly from
shadcn's registry (new-york-v4 style) as template files in this skill,
copied into new projects rather than fetched live from `ui.shadcn.com` at
scaffold time. This matches shadcn's own philosophy — "you own this code" —
and means scaffolding works even if the live registry is unreachable.

To add more shadcn components later, once a project is scaffolded, use the
CLI directly as you would in any shadcn project:

```
npx shadcn@latest add <component>
```

This is a normal project-level operation at that point, not something this
skill needs to manage.

## Reskinning for a real brand

Two files control the entire visual identity:

1. **`app/globals.css`** — every color token. Change the hex values under
   `:root` and `.dark` to your brand's palette; every shadcn component and
   every custom component (marketing sections, admin shell) picks it up
   automatically.
2. **The three `next/font/google` calls in `app/layout.tsx`** — swap
   `Roboto_Slab` / `Public_Sans` / `JetBrains_Mono` for your own typefaces.
   Keep the three `--font-*` CSS variable names the same so you don't have
   to touch `globals.css` or any component.

`components/marketing/*` and `components/admin/*` are yours to edit or
delete freely — they're generated application code, not a library.
`components/ui/*` is safer to leave alone and re-run `npx shadcn add
<component> --overwrite` if you need to update one, since those files mirror
the upstream shadcn registry.

## Common pitfalls

- Adding a new third-party embed/script without checking `middleware.ts`'s
  CSP — the default policy is intentionally strict (`'self'` plus the
  specific Stripe origins already in use); a silently-blocked script is a
  CSP problem, not a bug in the script.
- Using `--accent` for a "make it pop" color instead of `--gold` — this
  overrides shadcn's hover-state color everywhere, not just where you meant.
- Skipping `<NumericText>` for a "quick" number — it breaks the one
  typographic rule that makes the numeric treatment read as a system rather
  than an inconsistency.
