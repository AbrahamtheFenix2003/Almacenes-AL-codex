import { useState, useMemo } from "react";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  AlertTriangle,
  Archive,
  Boxes,
  Briefcase,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Coins,
  CreditCard,
  FileBarChart,
  FileText,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Package,
  RotateCcw,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Store,
  Truck,
  UserRound,
  Users,
  Wallet,
  Warehouse,
  type LucideIcon,
} from "lucide-react";

export type PanelLayoutProps = {
  children: ReactNode;
  onSignOut?: () => void;
  userName?: string;
  userEmail?: string;
};

type NavChild = {
  label: string;
  icon: LucideIcon;
  href: string;
};

type NavItem = {
  label: string;
  icon: LucideIcon;
  href?: string;
  children?: NavChild[];
};

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    label: "Catalogos",
    icon: Archive,
    children: [
      { label: "Productos", icon: Package, href: "/catalogos/productos" },
      { label: "Proveedores", icon: Truck, href: "/catalogos/proveedores" },
      { label: "Clientes", icon: Users, href: "/catalogos/clientes" },
    ],
  },
  {
    label: "Inventario",
    icon: Boxes,
    children: [
      { label: "Movimientos", icon: ListChecks, href: "/inventario/movimientos" },
      { label: "Ajustes de inventario", icon: ClipboardCheck, href: "/inventario/ajustes" },
    ],
  },
  {
    label: "Compras",
    icon: ShoppingCart,
    children: [{ label: "Ordenes de compra", icon: FileText, href: "/compras/ordenes" }],
  },
  {
    label: "Ventas",
    icon: Store,
    children: [
      { label: "Punto de venta", icon: ShoppingCart, href: "/ventas/pdv" },
      { label: "Devolucion", icon: RotateCcw, href: "/ventas/devoluciones" },
      { label: "Clientes", icon: Users, href: "/ventas/clientes" },
    ],
  },
  {
    label: "Caja",
    icon: Coins,
    children: [
      { label: "Caja diaria", icon: Wallet, href: "/caja/diaria" },
      { label: "Pagos y cobros", icon: CreditCard, href: "/caja/pagos" },
    ],
  },
  {
    label: "Reportes",
    icon: FileBarChart,
    children: [
      { label: "Inventario", icon: Warehouse, href: "/reportes/inventario" },
      { label: "Compras", icon: FileText, href: "/reportes/compras" },
      { label: "Ventas", icon: FileBarChart, href: "/reportes/ventas" },
    ],
  },
  {
    label: "Roles",
    icon: Briefcase,
    children: [{ label: "Permisos", icon: ShieldCheck, href: "/roles/permisos" }],
  },
  {
    label: "Configuracion",
    icon: Settings,
    href: "/configuracion",
  },
];

const navBase = "flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-sm font-medium transition-colors";
const activeNav = "border-[color:var(--sidebar-border)] bg-white text-[color:var(--sidebar-primary)] shadow-sm";
const inactiveNav = "text-[color:var(--sidebar-foreground)]/70 hover:border-[color:var(--sidebar-border)] hover:bg-white hover:text-[color:var(--sidebar-foreground)]";
const childBase = "flex items-center gap-3 rounded-lg border border-transparent px-9 py-2 text-sm font-medium transition-colors";
const childActive = "border-[color:var(--sidebar-border)] bg-[color:var(--secondary)] text-[color:var(--sidebar-primary)]";
const childInactive = "text-[color:var(--sidebar-foreground)]/60 hover:border-[color:var(--sidebar-border)] hover:bg-white hover:text-[color:var(--sidebar-foreground)]";

export default function PanelLayout({ children, onSignOut, userName, userEmail }: PanelLayoutProps) {
  const location = useLocation();

  const initialOpen = useMemo(() => {
    const groups: Record<string, boolean> = {};
    navItems.forEach((it) => {
      if (it.children) {
        groups[it.label] = it.children.some((c) => location.pathname.startsWith(c.href));
      }
    });
    return groups;
  }, [location.pathname]);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(initialOpen);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isItemActive = (item: NavItem) =>
    item.href ? location.pathname.startsWith(item.href) : item.children?.some((c) => location.pathname.startsWith(c.href));

  return (
    <div className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)]">
      <aside className="fixed inset-y-0 left-0 z-20 flex w-72 flex-col border-r border-[color:var(--sidebar-border)] bg-[color:var(--sidebar)]/90 backdrop-blur">
        <div className="flex h-16 items-center gap-3 border-b border-[color:var(--sidebar-border)] px-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-lg font-semibold text-[color:var(--sidebar-primary)] shadow-sm">
            WMS
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-[color:var(--sidebar-foreground)]">Gestion de Almacen</p>
            <p className="text-xs text-[color:var(--sidebar-foreground)]/60">Control total del inventario</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-4 py-4">
          <ul className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const hasChildren = Boolean(item.children?.length);
              const isOpen = hasChildren ? Boolean(openGroups[item.label]) : false;
              const active = isItemActive(item);

              return (
                <li key={item.label}>
                  {hasChildren ? (
                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => toggleGroup(item.label)}
                        className={`${navBase} ${active || isOpen ? activeNav : inactiveNav}`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="flex-1 text-left">{item.label}</span>
                        <ChevronRight
                          className={`h-4 w-4 text-[color:var(--muted-foreground)] transition-transform ${
                            isOpen ? "rotate-90" : ""
                          }`}
                        />
                      </button>
                      {isOpen ? (
                        <ul className="space-y-0.5 pl-2">
                          {item.children?.map((child) => {
                            const ChildIcon = child.icon;
                            const isChildActive = location.pathname.startsWith(child.href);
                            return (
                              <li key={`${item.label}-${child.label}`}>
                                <Link
                                  to={child.href}
                                  className={`${childBase} ${isChildActive ? childActive : childInactive}`}
                                >
                                  <ChildIcon className="h-4 w-4" />
                                  <span>{child.label}</span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      ) : null}
                    </div>
                  ) : (
                    <Link
                      to={item.href ?? "#"}
                      className={`${navBase} ${active ? activeNav : inactiveNav}`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="flex-1 text-left">{item.label}</span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t border-[color:var(--sidebar-border)] p-4">
          <div className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-[color:var(--sidebar-foreground)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[color:var(--sidebar-primary)] shadow-sm">
              <UserRound className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-[color:var(--sidebar-foreground)]">{userName ?? "Usuario Demo"}</p>
              <p className="text-xs text-[color:var(--sidebar-foreground)]/60">{userEmail ?? "Cuenta corporativa"}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onSignOut}
            className="mt-3 flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-sm font-semibold text-[color:var(--sidebar-primary)] transition hover:border-[color:var(--sidebar-border)] hover:bg-white hover:text-[color:var(--sidebar-foreground)]"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesion
          </button>
        </div>
      </aside>

      <div className="pl-72">
        <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-[color:var(--border)] bg-[color:var(--card)]/90 px-10 backdrop-blur">
          <div>
            <nav className="flex items-center gap-2 text-sm text-[color:var(--muted-foreground)]">
              <span>Inicio</span>
              <span className="text-[color:var(--muted-foreground)]/40">&gt;</span>
              <span className="text-[color:var(--primary)]">Dashboard</span>
            </nav>
            <div className="mt-2">
              <h1 className="text-[28px] font-semibold text-[color:var(--foreground)]">Dashboard</h1>
              <p className="text-sm text-[color:var(--muted-foreground)]">Resumen general del estado del almacen</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--secondary)] px-5 py-2 text-sm text-[color:var(--muted-foreground)]">
              <AlertTriangle className="h-4 w-4 text-[#d18f22]" />
              <span>7 alertas criticas</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--secondary)] px-5 py-2 text-sm text-[color:var(--muted-foreground)]">
              <ClipboardList className="h-4 w-4 text-[color:var(--primary)]" />
              <span>Tareas pendientes</span>
            </div>
          </div>
        </header>
        <main className="px-10 py-10">{children}</main>
      </div>
    </div>
  );
}
