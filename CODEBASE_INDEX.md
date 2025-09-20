# Eco Dash Buddy — Codebase Index

This index summarizes the main directories, purpose, and notable files to help you navigate quickly.

## Root
- **Build/Config**: `package.json`, `vite.config.ts`, `tsconfig*.json`, `postcss.config.js`, `eslint.config.js`, `tailwind.config.ts`
- **Hosting/Infra**: `firebase.json`, `firestore.rules`, `firestore.indexes.json`, `netlify.toml`, `public/`, `dist/`
- **Docs**: Multiple `*.md` guides (setup, fixes, features)
- **Data Samples**: `sample_drivers.json`, `sample_reports.json`, `optimized_routes*.json`
- **Scripts**: `start_route_optimization.sh`

## Web App (Vite + React + TS) — `src/`
- **Entrypoints**: `main.tsx`, `App.tsx`, `index.css`, `App.css`
- **Pages**: `pages/` — `LandingPage.tsx`, `AdminPortal.tsx`, `CitizenDashboard.tsx`, `DriverDashboard.tsx`, `NotFound.tsx`
- **Components**: `components/`
  - `layout/` — `Navbar.tsx`
  - `auth/` — `CitizenAuth.tsx`, `DriverAuth.tsx`, `NavbarSignIn.tsx`, `ProtectedRoute.tsx`
  - `admin/` — `AdminDashboard.tsx`, `AdminLogin.tsx`
  - `driver/` — driver-related UI (see `DriverReportsList.tsx` under `reports/`)
  - `maps/` — `BaseMap.tsx`, `LocationPicker.tsx`, `ReportsMap.tsx`, `RouteMap.tsx`, `MapInterface.tsx`
  - `reports/` — `CitizenReportForm.tsx`, `CitizenRecentReports.tsx`, `CitizenApprovalSystem.tsx`, `DriverReportsList.tsx`
  - `route/` — `OptimizedRouteDisplay.tsx`
  - `ui/` — Reusable primitives (buttons, inputs, dialogs, toasts, etc.)
  - `images/` — `ImageViewer.tsx`
  - `PointsSystem.tsx`
- **State/Context**: `contexts/AuthContext.tsx`
- **Config**: `config/` — `firebase.ts`, `maptiler.ts`
- **Hooks**: `hooks/` — `use-toast.ts`, `use-mobile.tsx`
- **Lib/Utils**: `lib/utils.ts`, `utils/` — `geoUtils.ts`, `imageUtils.ts`, `imageStorage.ts`, `driverHelpers.ts`, `createTestData.ts`, `setupDrivers.ts`
- **Services**: `services/` — `routeOptimization.js`, `driverLocationService.js`
- **Assets**: `assets/` — app images

## Route Optimization (Python) — `route_optimization/`
- **Core Modules**: `optimizer.py`, `route_solver.py`, `simple_route_solver.py`, `fallback_solver.py`
- **Supporting**: `clustering.py`, `distance_calculator.py`, `models.py`, `firestore_integration.py`
- **Examples/Docs**: `example_usage.py`, `README.md`, `requirements.txt`
- **Server**: `route_optimization_server.py` (FastAPI/Flask style server for optimization)
- **Tests**: `test_route_optimization.py`

## Public/Build
- `public/` — static assets, `_redirects`, icons
- `dist/` — production build output

## Deployment
- **Firebase**: `firebase.json`, `firestore.rules`, `storage.rules`, `firestore.indexes.json`
- **Netlify**: `netlify.toml`, `public/_redirects`

## Quick Start
1. Install: `npm i`
2. Dev server: `npm run dev`
3. Python optimizer (optional): `pip install -r route_optimization/requirements.txt` and run `python route_optimization_server.py`
