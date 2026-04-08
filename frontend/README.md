# PEzy Admin Portal Frontend

Admin portal frontend built with React, Vite, and TypeScript.

## Stack

- React 19
- Vite 8
- TypeScript 5
- React Router
- Axios
- Tailwind CSS 4

## Prerequisites

- Node.js 20+
- npm 10+
- Backend API running on `http://localhost:8000`

## Environment Setup

1. Copy `.env.example` to `.env`.
2. Set `VITE_API_BASE_URL` to your backend API URL.

Default local value:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

## Install

```bash
npm install
```

## Run (Development)

```bash
npm run dev
```

Vite default URL:

- `http://localhost:5173`

Admin routes:

- `/admin`
- `/admin/dashboard`
- `/admin/fines`
- `/admin/criminal-records`
- `/admin/news`

## Build

```bash
npm run build
```

## Preview Production Build

```bash
npm run preview
```

## Folder Overview

- `src/pages` — route pages, including admin pages
- `src/components` — reusable UI components
- `src/layouts` — shared app and admin layouts
- `src/api` — axios instance and API wrappers
- `src/config` — route and app config
- `src/types` — TypeScript interfaces

## Tailwind CSS (Admin Portal)

Tailwind is installed and configured with PostCSS.

Configuration files:

- `tailwind.config.js`
- `postcss.config.js`
- `src/index.css`
- `src/styles/admin-tailwind.css`

Admin Tailwind layer:

- `src/styles/admin-tailwind.css` defines admin-specific Tailwind component classes.
- It is imported in `src/layouts/AdminLayout.tsx` and applied to the admin shell/sidebar/content.

If you add a new admin page, prefer Tailwind utility classes or the reusable classes in `src/styles/admin-tailwind.css`.
