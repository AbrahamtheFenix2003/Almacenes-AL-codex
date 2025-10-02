# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a warehouse management system (WMS) built with React + TypeScript + Vite. The application provides comprehensive inventory control, product cataloging, sales management, and reporting functionality for warehouse operations.

## Development Commands
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (runs TypeScript check then Vite build)
- `npm run lint` - Run ESLint on the codebase
- `npm run preview` - Preview production build locally

## Tech Stack
- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4 with custom theme
- **Routing**: React Router DOM 7
- **Authentication**: Firebase Auth
- **Icons**: Lucide React
- **UI Components**: Custom components in `src/components/ui/`

## Project Architecture

### File Structure
The codebase follows a feature-based architecture organized by business domains:

```
src/
├── caracteristicas/           # Feature modules by business domain
│   ├── autenticacion/        # Authentication features
│   ├── dashboard/            # Dashboard and analytics
│   └── catalogos/           # Product catalogs and management
├── components/ui/           # Reusable UI components
├── layouts/                 # Layout components
├── lib/                     # Utilities and configurations
└── assets/                  # Static assets
```

### Key Architectural Patterns

**Feature-Based Organization**: Each business domain (authentication, catalogs, dashboard, etc.) is organized under `src/caracteristicas/` with its own pages, components, and business logic.

**Centralized Layout System**: `PanelLayout.tsx` provides the main application shell with:
- Fixed sidebar navigation with collapsible groups
- Dynamic breadcrumb and page header generation
- User authentication state display
- Comprehensive navigation menu covering all WMS modules

**Authentication Flow**:
- Firebase-based authentication with email/password and Google login
- `PrivateRoute` component handles auth state and redirects
- Automatic user creation for new email logins

**UI Component System**:
- Custom UI components in `src/components/ui/` following consistent design patterns
- Tailwind CSS with custom theme including "boston-blue" color palette
- CSS custom properties for theming support

### Navigation Structure
The application includes comprehensive WMS modules:
- **Dashboard**: Main overview and analytics
- **Catalogos**: Products, suppliers, customers management
- **Inventario**: Movement tracking and inventory adjustments
- **Compras**: Purchase order management
- **Ventas**: Point of sale, returns, customer management
- **Caja**: Daily cash management and payments
- **Reportes**: Inventory, purchase, and sales reports
- **Roles**: Permission management system

### Firebase Configuration
Firebase is configured for authentication with the project ID "almacenes-al". The configuration includes auth domain, storage bucket, and analytics setup.

### Import Aliases
The project uses `@/` as an alias for the `src/` directory, configured in `vite.config.ts`.

### Styling Approach
- Tailwind CSS 4 with PostCSS integration
- Custom theme extending default palette with business-specific colors
- CSS custom properties for dynamic theming
- Consistent component styling patterns using utility classes