# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Start dev server (Next.js)
pnpm build      # Production build
pnpm start      # Run production build
pnpm lint       # Run ESLint
```

No test suite is configured in this project.

## Architecture Overview

**EduManage** is a Next.js 16 (App Router) school management system with four user roles: `principal`, `teacher`, `student`, `parent`. All data is mocked — there is no backend or database.

### Auth & Role System

- [lib/auth-context.tsx](lib/auth-context.tsx) — React context providing `useAuth()`. Auth state is persisted in `localStorage`. Login validates against hardcoded credentials in `MOCK_CREDENTIALS`.
- Four roles gate which sidebar nav items appear and which actions each page exposes. The role comes from `useAuth().user.role`.
- Mock credentials: `principal@school.com / principal123`, `teacher1@school.com / teacher123`, `student1@student.com / student123`, `parent1@parent.com / parent123`.

### Page Structure

- `app/page.tsx` — Login page (unauthenticated entry point).
- `app/dashboard/page.tsx` — Redirects or renders role-specific dashboard. `app/dashboard/teacher.tsx` is a separate teacher dashboard component.
- All other routes under `app/` are protected pages (`attendance`, `complaints`, `fees`, `classes`, `salary`, `teachers`, `notices`, `students`, `homework`, `access-control`, `interviews`, `reports`, `messages`).

### Layout & Navigation

- [components/dashboard-layout.tsx](components/dashboard-layout.tsx) — Shell used by all protected pages. Wraps `Sidebar` + `Header` + `<main>`. Redirects to `/` if unauthenticated.
- [components/sidebar.tsx](components/sidebar.tsx) — Role-aware nav. `NAV_ITEMS` is a record keyed by `UserRole`, each containing links and dropdown groups. Active route is highlighted using `usePathname()`.
- [components/dropdown-nav.tsx](components/dropdown-nav.tsx) — Collapsible sidebar nav group for items like Classes, Teachers, Attendance.

### Data Layer

- [lib/mock-data.ts](lib/mock-data.ts) — All data used across the app (teachers, students, parents, attendance records, etc.).
- [lib/types.ts](lib/types.ts) — All shared TypeScript interfaces. The domain model covers: `User` / `Teacher` / `Student` / `Parent`, `AttendanceRecord`, `Complaint`, `FeeRecord`, `Homework`, `Notice`, `Message`, `SalaryRecord`, `InterviewCandidate`, `RolePermission` / `PermissionSet`, `ClassSection`, `Subject`, `ClassRoom`.

### UI Stack

- **shadcn/ui** (New York style) — components live in [components/ui/](components/ui/). Add new ones via `pnpm dlx shadcn@latest add <component>`.
- **Tailwind CSS v4** with CSS variables for theming. Base styles in [app/globals.css](app/globals.css).
- **lucide-react** for icons throughout.
- **recharts** for charts (used in reports/dashboard).
- **react-hook-form + zod** for forms.
- **Zustand** is available for state management but most state is local/context today.
- **next-themes** — theme provider wraps the app for dark mode support.

### Path Aliases

Configured in `tsconfig.json` and `components.json`:
- `@/components` → `components/`
- `@/lib` → `lib/`
- `@/hooks` → `hooks/`
- `@/components/ui` → `components/ui/`
