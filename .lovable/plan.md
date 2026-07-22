# Five Minute Forecast — Layout & Navigation

Build the app shell: sidebar navigation, header with role switcher, and five placeholder pages.

## Routes (TanStack file-based)
Replace the placeholder `src/routes/index.tsx` and add siblings:
- `/` → Pipeline board (index)
- `/analytics` → Analytics dashboard
- `/contacts` → Contacts table
- `/import` → CSV import
- `/settings` → Manager settings

Each route gets its own `head()` with unique title + description + og tags. Each page is a clean placeholder: page title, one-line description, empty-state card.

## Layout
Edit `src/routes/__root.tsx` so `RootComponent` wraps `<Outlet />` in:
- `SidebarProvider` + `AppSidebar` + `SidebarInset`
- Header bar (sticky, `h-14`, border-b) containing:
  - `SidebarTrigger` (left)
  - Spacer
  - Role switcher (right): shows current user name + role badge, `DropdownMenu` toggles between "Sales Rep" and "Sales Manager"

## New files
- `src/components/app-sidebar.tsx` — Sidebar using shadcn `Sidebar` primitives, `collapsible="icon"`, brand mark ("Five Minute Forecast") in `SidebarHeader`, single group "Workspace" with the 5 items. Uses `Link` + `useRouterState` for active highlighting via `isActive` on `SidebarMenuButton`.
- `src/components/role-switcher.tsx` — reads/writes role from `useCurrentUser` hook, renders avatar + name + role, `DropdownMenu` with the two roles.
- `src/hooks/use-current-user.tsx` — React context + provider holding `{ name: "Alex Morgan", role: "rep" | "manager" }`, `setRole`. Persist to `localStorage` (read inside `useEffect` to avoid hydration mismatch; default "rep" on first render).
- `src/routes/analytics.tsx`, `src/routes/contacts.tsx`, `src/routes/import.tsx`, `src/routes/settings.tsx` — placeholder pages.
- Rewrite `src/routes/index.tsx` → Pipeline placeholder (removes the blank-app template).

The `CurrentUserProvider` wraps `<Outlet />` inside `RootComponent` (alongside `QueryClientProvider`).

## Design tokens (`src/styles.css`)
Update semantic tokens for a professional sales palette (both `:root` and `.dark`):
- Primary: deep indigo/slate blue (trust)
- Accent: subtle teal for active nav / success cues
- Neutral surfaces slightly warmer than default
- Refresh matching `--sidebar-*` tokens so the sidebar reads as one cohesive surface

No hardcoded colors in components — Tailwind semantic classes only.

## Shadcn components used
Sidebar, DropdownMenu, Avatar, Badge, Button, Separator. Install any that aren't already present via the shadcn add command during build.

## Verification
- Click each sidebar item → route changes, active item highlighted.
- Header role dropdown toggles between Sales Rep / Sales Manager, badge updates, persists on reload.
- Sidebar collapses via trigger; icons remain visible.
