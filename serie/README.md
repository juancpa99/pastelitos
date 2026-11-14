# SERIE · Entrenamiento

Public, standalone four-day strength tracker at `/pastelitos/serie/`.

- Four-day programme; default Monday, Tuesday, Thursday and Saturday. Each person can move the days, occupied weekdays swap automatically, and training cards, numbering, schedule summary and today highlights follow Monday–Sunday order. Historical sessions are unchanged.
- No personal records, dietary modules or three-day programme. The private app's files are unchanged.
- 146 catalogue entries in 12 muscle groups; equipment/search filters and custom movements.
- Exercises, sets and supersets remain editable after completion. Editing keeps the original session date, updates a revision timestamp and never creates a duplicate session.
- The final Add exercise button also supports completed sessions. Supersets merge existing groups or add a new exercise, remain explicit in the session, and delay rest until the effective round is complete. Warmups rest independently.
- Save as my routine copies the current structure, with empty set logs for future sessions; past sessions are unchanged.
- Touch/keyboard order changes follow stable exercise IDs.
- Double progression reuses the existing pure recommendation engine, restricted to its exercise-history functions. Different equipment, repetition ranges, and straight/superset conditions remain separate. Load increases require a configured increment and sufficient records.
- Data is local to `serie.public.v1`; no account, server, analytics or automatic cross-device synchronisation. JSON export/import provides portability. Local backup retains the previous successful state.
- Bayesian cable curl and incline-bench dumbbell curl behind the torso are separate catalogue entries.
- In-progress workouts can be discarded after confirmation without deleting completed history; a discarded day can be started again.
- A mobile-first installation guide appears on first mobile visit, remains available in Settings, and supports native PWA installation prompts.
- SERIE's three identical green wave strokes on white are shared by the interface, SVG favicon, and 192 px / 512 px installed-app icons.
- Automatic PWA updates check on launch, foreground, reconnect and periodically (5 minutes). New versions reload automatically when the user is not editing or inside a workout; active sessions get a discreet notification and update after leaving the workout or via explicit confirmation. The current view/date is restored on version reload.
- Network-first same-origin asset loading prevents stale code from remaining pinned in the installed app, with offline cache fallback. SERIE only touches its own caches and keeps the existing local workout data keys unchanged.

## Checks

Install the existing repository test dependency with `npm ci --ignore-scripts` in `training-lab/`, then run:

```
NODE_PATH="$PWD/training-lab/node_modules" node serie/tests/public.cjs
node --test serie/tests/offline.cjs
```

Browser QA covers loading the public app, registering a set, creating a superset, closing a session with unfinished sets, and adding an exercise to the closed session. No real user training data is seeded or published.
