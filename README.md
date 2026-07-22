# 5Min Forecast

A lightweight CRM for small sales teams. Reps keep their own deals current each day, while the sales manager gets a clear monthly forecast in minutes — no more scattered spreadsheets.

## Features

- **Pipeline board** — track deals through every stage at a glance.
- **Analytics dashboard** — see forecasted revenue and team performance quickly.
- **Contacts table** — keep company and contact details in one place.
- **CSV import** — bring existing spreadsheet deals into the CRM in a few clicks.
- **Manager settings** — configure forecast periods, stages, and team defaults.
- **Role switcher** — toggle between Sales Rep and Sales Manager views for testing and demos.

## Tech Stack

- [TanStack Start](https://tanstack.com/start) — full-stack React framework
- [React](https://react.dev) — UI library
- [TypeScript](https://www.typescriptlang.org) — type-safe development
- [Tailwind CSS](https://tailwindcss.com) — styling
- [shadcn/ui](https://ui.shadcn.com) — accessible UI components

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- npm, yarn, pnpm, or bun

### Install

```sh
git clone <this-repository-url>
cd <repository-name>
npm install
```

### Run locally

```sh
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
  components/     # Reusable UI components
  hooks/          # Custom React hooks and providers
  lib/            # Utilities and helpers
  routes/         # TanStack Start file-based routes
  styles.css      # Global styles and theme tokens
```

## Scripts

| Command         | Description                  |
|-----------------|------------------------------|
| `npm run dev`   | Start the development server |
| `npm run build` | Build for production         |
| `npm run start` | Start the production server  |

## License

[MIT](LICENSE)
