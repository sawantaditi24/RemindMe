# ReminderMe - A simple website to remember you to monitor anything every X mins.

A simple web app that reminds you every 10 minutes to check the portal for any bookings or your CI/CD. Keeps you disciplined so you don’t get logged out (and use up limited daily logins).

- Click **Start** once and allow notifications. Keep this tab open.
- Reminders fire every 10 minutes via desktop notification and a short beep, even when you’re on another tab.
- If you close the tab, the timer stops. Open the app again and click **Start** when you’re ready.

## Run locally

```bash
git clone https://github.com/sawantaditi24/RemindMe
npm install
npm run dev
```

Open the URL shown (e.g. `http://localhost:5173`) in your browser. Use a local URL so notification permission works reliably.

## Build

```bash
npm run build
npm run preview
```
