<div align="center">

# <a href="https://fiveminforecast.lovable.app"><span style="color:#22c55e">5Min Forecast</span></a>

**Sales CRM & monthly forecasting for small teams**

Reps keep deals current. Managers get a clear forecast — in minutes, not spreadsheets.

[Live app](https://fiveminforecast.lovable.app) ·
[Repository](https://github.com/MNSBaanu/5Min_Forecast) ·
[Issues](https://github.com/MNSBaanu/5Min_Forecast/issues) ·
[Discussions](https://github.com/MNSBaanu/5Min_Forecast/discussions)

<br />

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TanStack Start](https://img.shields.io/badge/TanStack-Start-FF4154?logo=reactquery&logoColor=white)](https://tanstack.com/start)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-22c55e?logo=github&logoColor=white)](https://github.com/MNSBaanu/5Min_Forecast/pulls)

</div>

---

## Features

- Pipeline board with stage tracking
- Forecast analytics and team performance
- Contacts management
- CSV import for existing deals
- Role-based views (Sales Rep / Sales Manager)
- Supabase auth with row-level security

## Stack

TanStack Start · React 19 · TypeScript · Tailwind CSS · shadcn/ui · Supabase · Vite

## Setup

**Requirements:** Node.js 22+ and [Bun](https://bun.sh) (preferred) or npm.

1. Clone and install

```sh
git clone https://github.com/MNSBaanu/5Min_Forecast.git
cd 5Min_Forecast
bun install
```

2. Configure environment — create a `.env` in the project root:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_SUPABASE_PROJECT_ID=
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Never commit `.env`. Use the service role key only on the server.

3. Apply database migrations from `supabase/` (Supabase CLI or dashboard).

4. Start the app

```sh
bun run dev
```

App runs at [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Development server |
| `bun run build` | Production build |
| `bun run preview` | Preview production build |
| `bun run lint` | ESLint |
| `bun run format` | Prettier |
| `bun run test:e2e` | Playwright e2e tests |

## Structure

```
src/           App code (routes, components, integrations)
supabase/      Schema migrations and config
tests/         Playwright e2e tests
public/        Static assets
```

## Contributing

Open source contributions are welcome.

1. Fork the repo and create a branch (`feat/...` or `fix/...`)
2. Install with `bun install` and run `bun run dev`
3. Keep PRs focused; match existing TypeScript and UI patterns
4. Run `bun run lint` (and `bun run test:e2e` when UI flows change)
5. Open a PR with a clear summary and test notes

Ideas welcome via [Issues](https://github.com/MNSBaanu/5Min_Forecast/issues). For larger changes, open an issue first.

## Security

- Keep secrets in `.env` (gitignored)
- Rotate keys if they were ever exposed in git history
- Prefer publishable keys on the client; service role server-side only
- Do not commit credentials, dumps, or personal customer data

## License

Source is available on GitHub. Add a `LICENSE` file when you choose an open-source license (e.g. MIT).
