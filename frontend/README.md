# PEzy Admin Portal Frontend

Admin portal frontend built with React, Vite, and TypeScript.

## Stack

- React 19
- Vite 8
- TypeScript 5
- React Router
- Axios

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
