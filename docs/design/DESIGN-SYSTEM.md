# DESIGN-SYSTEM

Status: Implemented baseline (FPM-004) in `@fpm/ui`.  
Owner: Frontend.  
Goal: **Existing FPM identity + consistency + usability + accessibility + reusable components** (not generic purple SaaS).

Evidence: Screenshots 1–4, 6–27 + Spec §6 tokens.

## Implementation (FPM-004)

* Package: `packages/ui` (`@fpm/ui`)
* Tokens: `tokens.css` / `tokens.ts` (Spec §6 colors, radii, type scale)
* Styles: `styles.css` component classes (imported by `apps/web`)
* Shell: `AppShell` + `Sidebar` with ADR-008 / Spec §5 IA
* Primitives: Button, Input, Select, Textarea, FormField, SearchInput, Card, MetricCard, Badge, Table, Pagination, Alert, EmptyState, ErrorState, LoadingSkeleton, Dialog, ConfirmationDialog, PageHeader, Breadcrumbs
* Font: Plus Jakarta Sans (Spec: Inter/Geist/equivalent)
* Responsive: sticky sidebar desktop; drawer < 860px

## Identity summary (CONFIRMED)

* Product: **FPM Portfolio Manager** with blue square “F” mark
* Light theme, white/gray surfaces, soft pastel metric cards
* Primary actions: teal/dark green buttons (`+ Add…`, Record Withdrawal, Create…)
* Active nav: light blue tint + blue text/icon
* Dense financial dashboard with rounded cards and generous whitespace

## Colors (observed — approximate; exact tokens UNRESOLVED)

| Role | Observation |
| --- | --- |
| Background | White / light gray content canvas |
| Sidebar | White/light gray |
| Text primary | Near-black / charcoal |
| Text muted | Medium gray |
| Brand / active | Blue |
| Primary CTA | Teal / dark green |
| Success / Paid | Green badges |
| Metric pastels | Yellow, orange, green, teal, purple, pink cards |
| Danger | Delete often muted gray (weak affordance) |
| Warning | Yellow alert on restore |

**RECOMMENDED:** Extract CSS variables from chosen reference screens; keep pastel KPI language.

## Typography

* Sans-serif throughout (**CONFIRMED**)
* Large bold numerals for KPIs
* Smaller muted subtitles under page titles
* Monospace used for Account ID (**CONFIRMED** settings)

**RECOMMENDED:** Define type scale (page title, section, label, KPI, helper) in implementation task; avoid Inter-as-default if brand fonts are chosen later — **UNRESOLVED** font files.

## Spacing / layout

* Fixed left sidebar ~240–280px (**INFERRED**)
* Content padding generous
* Card grids: 2–6 columns for metrics
* Form max-width card centered in content

## Cards

* White surface, light border, rounded corners (~8–16px)
* Soft shadow on dashboard cards
* Pastel-tinted metric cards with icon + label + value + helper

## Borders / radius

* Inputs and buttons rounded
* Pill badges for status/phase
* Dashed border for upload dropzones

## Buttons

| Type | Look |
| --- | --- |
| Primary | Solid teal/green, white label, `+` prefix common |
| Secondary | White + gray border (Cancel, Add Broker sometimes) |
| Text links | Edit / Delete / View all → |

## Inputs

* Labeled fields; required `*`
* Text, textarea, select, date with calendar icon
* Search inputs with magnifying glass
* Placeholder examples (`e.g. FTMO`)

## Tables

* Light header row; horizontal dividers; sortable columns
* Row actions as text links
* Count label near filters (`32 withdrawals`)

## Metric cards

* Color-coded by period/category
* Icon top-left; value dominant
* Optional chevrons on quarter/year cards

## Charts

* Area/line: Lifetime Income Growth
* Bar: Payout Trend
* Horizontal progress bars: Income by Firm/Account, Profit by Broker

**RECOMMENDED:** Recharts for rebuild (stack decision).

## Badges

* Phase `Active` green pill
* Withdrawal `Paid` green pill
* Audit `Create` green / `Update` blue
* Backup `COMPLETE` green
* Login `Success` green

## Sidebar

* Brand + collapse
* Section headers (FUNDED, REAL ACCOUNTS)
* Icons + labels
* Collapsible Settings
* Footer email + Sign out

## Dialogs

* Full-page forms dominate creates (**CONFIRMED**)
* Modal confirms for delete/restore — **NOT VISIBLE** (gap)

## Empty states

* Scale Events empty with icon, message, CTA (**CONFIRMED**)
* **RECOMMENDED:** Reuse pattern for empty Firms/Accounts/etc.

## Loading / error states

* **Not observed** in screenshots → REQUIRED BUT NOT EXISTING for rebuild quality

## Responsive

* Desktop only in screenshots
* **RECOMMENDED:** Drawer nav < md; stack metric grids; preserve KPI readability

## Component reuse direction (RECOMMENDED)

Map to `packages/ui` + shadcn/ui primitives: Button, Input, Select, Textarea, Card, Badge, Table, Dialog, Alert, Dropdown, Tabs, Sheet — styled to FPM tokens above.
