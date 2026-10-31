# MAREVO redesign QA — 31 October 2026

final result: blocked

## Implementation
Ivory and forest-green editorial design across Home, Training, Food, Progress and Settings. Semantic light-theme colours replace dark literals. Persistent storage keys and user records are retained. Existing vector icons and installed-app icons remain; the header uses a typographic wordmark.

The selected concept was the first generated ivory/green direction. Its decorative photo section and extra slogans were intentionally omitted to keep the home screen focused. This is a product redesign, not an exact raster clone. System typography is used instead of the condensed display face in the concept.

## Observed browser checks before browser failure
- Mobile Home: new hierarchy, training CTA and summary columns rendered.
- Workout: opened selector, started an isolated local test session, entered 16 kg / 8 reps / 2 RIR and confirmed a saved series and running rest timer.
- Food: opened meal picker, selected three eggs and bread, saved it and confirmed 290 kcal / 23 g protein in the diary.
- Progress: rendered at 320 px. DOM width 305 px equalled scroll width 305 px. Graph label contrast was identified as needing improvement and corrected in CSS.
- Modal controls and five-tab navigation operated successfully.

## Visual fixes made after inspection
- Removed the inherited Home gradient pseudo-element.
- Corrected weekly metric wrapping.
- Changed nutrition totals to a compact two-column layout.
- Darkened chart labels and data strokes for the light surface.

## Remaining verification
The cloud browser stopped responding when resuming final QA; tab reconnection and runtime reset each timed out. The final CSS corrections, Settings screen, desktop layout, and the new swimming-only/weekend rules have not received final browser inspection. No final same-state side-by-side visual comparison was completed. iOS standalone safe area and keyboard behaviour require a real-device check. This result must not be represented as a fully verified production release.

## Automated checks
Seven relevant test files pass: quantities; double sessions; gym-friendly power; UI stability; usability; work menu; and new calendar behaviour. Calendar checks cover swimming-only Monday/Wednesday/Friday, optional weekend recovery, completed sessions excluded, no duplicate week sessions, all five screens and preservation of history.
Two other existing tests fail on both original commit 9743c6c and this branch: push-notifications.cjs has an outdated source-text assertion; ux-hierarchy.cjs assumes an optional afternoon meal is active. These were not changed by this redesign.

## Delivery
Published after explicit user instruction. The initial release was verified byte-for-byte on GitHub Pages. Visual QA remains incomplete as described above.

## Follow-up review
Added automatic device dark appearance, native dark form controls and matching browser theme colours. Added reduced-motion support. Text, secondary text, accent, warning and error semantic colours pass WCAG AA normal-text contrast against their primary surfaces in both palettes. The calendar and all-view rendering regression test still passes. A local Chromium installation was attempted as an alternative to the unavailable cloud browser, but its download failed. No full visual sign-off is claimed.
