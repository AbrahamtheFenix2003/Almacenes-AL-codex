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
│   │   ├── components/       # Auth-specific components
│   │   └── pages/            # Login, register pages
│   ├── dashboard/            # Dashboard and analytics
│   │   ├── components/       # Dashboard widgets and charts
│   │   └── pages/            # Main dashboard page
│   ├── catalogos/            # Product catalogs and management
│   │   ├── productos/        # Products module
│   │   │   ├── components/
│   │   │   └── pages/
│   │   ├── proveedores/      # Suppliers module
│   │   │   ├── components/
│   │   │   └── pages/
│   │   └── clientes/         # Customers module
│   │       ├── components/
│   │       └── pages/
│   ├── inventario/           # Inventory management
│   │   ├── movimientos/      # Inventory movements
│   │   │   ├── components/
│   │   │   └── pages/
│   │   └── ajustes/          # Inventory adjustments
│   │       ├── components/
│   │       └── pages/
│   ├── compras/              # Purchase management
│   │   └── ordenesDeCompra/  # Purchase orders
│   │       ├── components/
│   │       └── pages/
│   ├── ventas/               # Sales management
│   │   ├── puntoDeVenta/     # Point of sale
│   │   └── devoluciones/     # Returns
│   ├── caja/                 # Cash management
│   │   ├── cajaDiaria/       # Daily cash register
│   │   └── pagosCobros/      # Payments and collections
│   ├── reportes/             # Reports module
│   └── administracion/       # Administration
│       ├── roles/            # Role management
│       ├── permisos/         # Permissions
│       └── configuracion/    # Configuration
├── components/ui/            # Reusable UI components (shadcn/ui)
├── layouts/                  # Layout components (PanelLayout)
├── lib/                      # Utilities and configurations (firebase)
├── hooks/                    # Custom React hooks
└── assets/                   # Static assets
```

**IMPORTANT**: When creating new features, ALWAYS check if a folder already exists for that module. Use the existing folder structure and naming conventions (camelCase for module names).

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

## Firestore Data Schema

### Collections Structure

**proveedores**:
- `empresa` (string): Company name (used as display name)
- `contactoNombre` (string): Contact person name
- `contactoEmail` (string): Contact email
- `contactoTelefono` (string): Contact phone
- `codigo` (string): Provider code (e.g., "PROV001")
- `estado` (string): Status ("Activo", etc.)
- `calificacion` (number): Rating
- `ubicacion` (string): Location
- `fechaCreacion` (Timestamp): Creation date
- `fechaModificacion` (Timestamp): Last modification date

**productos**:
- `nombre` (string): Product name
- `codigo` (string): Product code (e.g., "TEC001")
- `categoria` (string): Category
- `precio` (number): Price
- `stock` (number): Current stock
- `stockMinimo` (number): Minimum stock threshold
- `proveedor` (string): Supplier name
- `ubicacion` (string): Warehouse location
- `descripcion` (string): Description
- `fechaCreacion` (Timestamp): Creation date

**ordenesCompra**:
- `numeroOrden` (string): Order number (e.g., "COMP-2025-001")
- `fecha` (string): Order date
- `proveedorId` (string): Reference to provider
- `proveedorNombre` (string): Provider name
- `proveedorContacto` (string): Provider contact
- `fechaEntrega` (string): Delivery date
- `productosResumen` (string): Products summary text
- `cantidadProductos` (number): Number of products
- `total` (number): Total amount (no taxes)
- `estado` (string): Status ("Pendiente", "Aprobado", "En Tránsito", "Recibido", "Cancelado")
- `usuario` (string): User who created the order
- `creadoEn` (Timestamp): Creation timestamp
- **Sub-collection**: `items/`
  - `productoId` (string): Product reference
  - `productoNombre` (string): Product name
  - `productoCodigo` (string): Product code
  - `cantidad` (number): Quantity
  - `costoUnitario` (number): Unit cost
  - `subtotal` (number): Item subtotal
  - `creadoEn` (Timestamp): Creation timestamp

**ajustes**:
- Inventory adjustments with approval workflow
- Contains adjustment data and references to products

**movimientos**:
- Inventory movement records
- Linked to adjustments when approved

**clientes**:
- Customer information

## Important Implementation Notes

1. **Provider Data**: Always use `empresa` field for provider name, not `nombre`
2. **Purchase Orders**: No tax calculations - only total amounts
3. **Batch Operations**: Use `writeBatch()` for orders with items sub-collection
4. **Real-time Updates**: Use `onSnapshot()` for live data in tables
5. **Form Validation**: Required fields must be validated before submission