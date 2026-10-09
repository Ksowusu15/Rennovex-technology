# Phase B: Production UX and Quality

## Implemented

- Client Portal: responsive cards, project target dates, recent support history,
  readable invoice details, wrapped filenames and a dedicated retry screen.
- Forms: bounded 20-second requests, recovery after offline/invalid responses,
  disabled submit states and status announcements. Includes client and admin
  authentication, password recovery, profile, support, newsletter, contact,
  consultations, reference lookup and assistant requests.
- Form feedback: public enquiry, booking, newsletter and support endpoints
  distinguish invalid input from a temporarily unavailable service.
- Accessibility: skip links on public pages and the Client Portal, keyboard
  focus outlines, mobile navigation keyboard containment, named newsletter
  controls, autofill hints, mobile input sizing and reduced-motion support.
- Loading: one visible general navigation overlay, no artificial loader on
  initial render, shorter minimum display and no overlay for same-page anchors.
- Performance: reuse the public settings request across logo components,
  correct article image sizing and preserve Next.js image optimisation.
- SEO: individual public-page canonical URLs, service/article metadata,
  published blog and case-study URLs in the dynamic sitemap, and noindex on
  both the Client Portal and admin pages. Added a useful 404 page.
- Edited source uses short semantic classes, wrapped class lists and consistent
  formatting with an 85-character formatter target.

## Verified in this environment

| Check | Result |
| --- | --- |
| Prisma Client generation | Passed |
| TypeScript | Passed |
| Production compilation | Passed |
| Form request: successful response | Passed |
| Form request: validation response | Passed |
| Form request: offline failure | Passed |
| Form request: non-JSON gateway response | Passed |
| Form request: stalled response body | Passed; times out and clears timer |
| Full production build | Blocked: DATABASE_URL absent during contact page generation |
| Visual browser QA | Pending: test browser unavailable in this environment |
| Live database, login and email delivery | Pending: environment configuration required |
| Lighthouse/Web Vitals measurements | Pending: configured running site required |

Run `node tests/form-request-check.cjs` after installing dependencies to repeat
form transport checks. Run `npm run typecheck` and `npm run build` with your
existing environment configuration. These changes require no new migration.

## Remaining review before Phase C sign-off

Check these viewport widths on the configured app: 320, 375, 640, 768, 1024 and
1440 pixels. Confirm navigation, long project names and filenames, large invoice
amounts, empty accounts, profile changes and support history. Use keyboard-only
navigation to check the menu, skip link, forms, focus visibility and error retry.
Check reduced-motion preferences, 200% zoom and screen-reader announcements.

Submit contact, newsletter and consultation forms; confirm records in admin.
Verify invited client activation, login, recovery, reset, profile update, support
submission, logout and Return to website. Repeat submissions offline and with
invalid input. Verify real email delivery and provider error handling during
Phase C. Measure performance after the production environment is configured.

Phase B implementation is delivered; visual and connected-system QA remain
open. This report does not certify launch readiness.
