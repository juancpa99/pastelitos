# MAREVO Push Server

This folder contains the small serverless backend used by the MAREVO PWA for notifications while the app is closed or in the background.

The PWA remains hosted on GitHub Pages. The backend only schedules and delivers Web Push messages.

## Deployment

Deploy this folder as a Vercel project with `push-server` as the project root.

Create these environment variables in Vercel:

- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT` (for example `mailto:your-email@example.com`)
- `QSTASH_TOKEN`
- `MAREVO_DELIVERY_KEY` (a long random value)
- `MAREVO_ALLOWED_ORIGIN=https://juancpa99.github.io`
- `QSTASH_URL=https://qstash.upstash.io` (optional; this is already the default)

Generate the VAPID pair once with:

```bash
npx web-push generate-vapid-keys --json
```

Use an Upstash QStash token for delayed delivery. QStash stores each reminder until its target time and then calls `/api/deliver`.

After Vercel deploys the backend, put its HTTPS origin in `training-lab/push-config.js`:

```js
window.MAREVO_PUSH_BACKEND = "https://your-project.vercel.app";
```

## Behaviour

`/api/config` exposes only the VAPID public key.

`/api/sync` receives the browser PushSubscription plus the next reminders. It cancels previous QStash message IDs supplied by the client and schedules the new set. Reminder times are limited to the next nine days and each sync is capped.

`/api/deliver` accepts only calls carrying the private delivery key forwarded by QStash. It sends the encrypted Web Push payload using VAPID.

MAREVO uses stable notification categories such as `marevo-rest`, `marevo-workout`, `marevo-checkin` and `marevo-body`. The Web Push `Topic` and the Notification API `tag` both use those stable categories, so a newer notification of the same type replaces the previous one instead of accumulating. Different categories remain visible together.
