# Rebuild the four approved CRM layouts

## Scope
Rebuild only the Dashboard, Jobs, Workshop Board, and Clients page layouts to match the supplied Marvellous mockups. Preserve the locked navy, champagne-gold, typography, glass material, navigation, routes, and existing CRM records.

## Changes
- **Dashboard:** restore the mockup’s welcome/date header, five compact workflow totals, large Work Queue and Outlook panels, then the Overdue, Locate a Piece, and Social Health panels in the same desktop grid.
- **Jobs:** match the five-column status board, compact image-led job cards, column-specific add controls, and the single-row workflow overview beneath the first four columns.
- **Workshop Board:** use four spacious unframed columns with compact image-led job cards and the mockup’s exact heading/action placement.
- **Clients:** reproduce the two-by-two glass table layout with matching section headers, counts, descriptions, column spacing, and row dividers.
- Add a small cohesive set of jewellery item thumbnails for the dashboard and job cards; no CRM records or business rules will change.
- Keep layouts usable at narrower widths by stacking or horizontally scrolling only where the desktop composition cannot fit.

## Technical details
- Update only the four route files plus reusable presentation helpers/styles required by those layouts.
- Reuse semantic design tokens and existing shared controls; no backend, data, navigation, or route changes.
- Verify all four routes in the running preview at desktop and narrow viewport sizes, checking for overflow and overlap.
