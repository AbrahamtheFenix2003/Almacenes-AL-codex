import {
  AlertCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  BadgeAlert,
  Boxes,
  PackageSearch,
  PackageX,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "../components/StatCard";

const statHighlights = [
  {
    title: "Productos en stock",
    value: "2,847",
    helper: "+12% vs mes pasado",
    trend: "+12%",
    trendType: "positive" as const,
    icon: Boxes,
  },
  {
    title: "Pedidos pendientes",
    value: "143",
    helper: "23 requieren atencion urgente",
    trend: "23 urgentes",
    trendType: "negative" as const,
    icon: TrendingUp,
  },
  {
    title: "Personal activo",
    value: "28",
    helper: "4 en turno nocturno",
    trend: "4 nocturno",
    trendType: "neutral" as const,
    icon: Users,
  },
  {
    title: "Alertas criticas",
    value: "7",
    helper: "Stock bajo en 7 productos",
    trend: "7 alertas",
    trendType: "negative" as const,
    icon: AlertCircle,
  },
];

const quickActions = [
  { label: "Registrar entrada", icon: ArrowDownCircle },
  { label: "Registrar salida", icon: ArrowUpCircle },
  { label: "Nuevo producto", icon: PackageSearch },
  { label: "Ver alertas", icon: BadgeAlert },
];

const recentActivity = [
  { action: "Entrada de mercancia", time: "10:30" },
  { action: "Salida pedido #1234", time: "09:15" },
  { action: "Actualizacion de stock", time: "08:45" },
  { action: "Nuevo proveedor registrado", time: "08:20" },
  { action: "Factura #5678 generada", time: "08:00" },
];

const lowStock = [
  { name: "Laptop Dell XPS", stock: 3, minimum: 10, status: "critico" as const },
  { name: "Mouse inalambrico", stock: 8, minimum: 15, status: "advertencia" as const },
  { name: "Teclado mecanico", stock: 5, minimum: 12, status: "advertencia" as const },
  { name: "Monitor 24\"", stock: 2, minimum: 8, status: "critico" as const },
];

const systemStatus = [
  { label: "Base de datos", level: "ok" as const },
  { label: "Conexion de red", level: "ok" as const },
  { label: "Lectores RFID", level: "warning" as const },
  { label: "Backup automatico", level: "ok" as const },
];

const statusStyles = {
  critico: "bg-[#fde6ea] text-[#d43852]",
  advertencia: "bg-[#fff3d1] text-[#b8860b]",
};

const systemStyles = {
  ok: "bg-[#e5f7ed] text-[#1f8f4d]",
  warning: "bg-[#fff6da] text-[#b8860b]",
};

export function DashboardPage() {
  return (
    <div className="space-y-8 text-[color:var(--foreground)]">
      <section className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
        {statHighlights.map((item) => (
          <StatCard key={item.title} {...item} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[2fr_1.2fr_1.5fr]">
        <Card>
          <CardHeader className="px-7 pt-7 pb-4">
            <CardTitle className="text-xl">Acciones rapidas</CardTitle>
            <p className="text-sm text-[color:var(--muted-foreground)]">
              Accede rapidamente a las operaciones mas frecuentes
            </p>
          </CardHeader>
          <CardContent className="px-7 pb-7">
            <ul className="space-y-3">
              {quickActions.map(({ label, icon: Icon }) => (
                <li key={label}>
                  <Button
                    variant="outline"
                    className="flex w-full items-center justify-between rounded-[16px] border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--foreground)] hover:bg-[color:var(--secondary)]"
                  >
                    <span className="flex items-center gap-3 text-sm font-semibold">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--secondary)] text-[color:var(--primary)]">
                        <Icon className="h-4 w-4" />
                      </span>
                      {label}
                    </span>
                    <span className="text-lg text-[color:var(--muted-foreground)]">&#8250;</span>
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="px-7 pt-7 pb-4">
            <CardTitle className="text-xl">Actividad reciente</CardTitle>
            <p className="text-sm text-[color:var(--muted-foreground)]">
              Resumen de los ultimos movimientos en la plataforma
            </p>
          </CardHeader>
          <CardContent className="px-7 pb-7">
            <ul className="space-y-4 text-sm text-[color:var(--foreground)]/80">
              {recentActivity.map((item) => (
                <li key={item.action} className="flex items-center justify-between">
                  <span>{item.action}</span>
                  <span className="text-xs font-semibold text-[color:var(--muted-foreground)]">{item.time} AM</span>
                </li>
              ))}
            </ul>
            <button className="mt-6 flex items-center gap-2 text-sm font-semibold text-[color:var(--primary)]">
              <ShieldCheck className="h-4 w-4" />
              Ver todo
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="px-7 pt-7 pb-4">
            <CardTitle className="text-xl">Stock bajo</CardTitle>
            <p className="text-sm text-[color:var(--muted-foreground)]">
              Productos que requieren atencion inmediata
            </p>
          </CardHeader>
          <CardContent className="px-7 pb-7">
            <ul className="space-y-4 text-sm text-[color:var(--foreground)]/80">
              {lowStock.map((item) => (
                <li key={item.name} className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[color:var(--foreground)]">{item.name}</p>
                    <p className="text-xs text-[color:var(--muted-foreground)]">
                      Stock {item.stock} - Minimo {item.minimum}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[item.status]}`}>
                    {item.status === "critico" ? "Critico" : "Advertencia"}
                  </span>
                </li>
              ))}
            </ul>
            <button className="mt-6 flex items-center gap-2 text-sm font-semibold text-[color:var(--primary)]">
              <PackageX className="h-4 w-4" />
              Gestionar stock
            </button>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader className="px-7 pt-7 pb-4">
          <CardTitle className="text-xl">Estado del sistema</CardTitle>
          <p className="text-sm text-[color:var(--muted-foreground)]">Monitoreo en tiempo real de los servicios clave</p>
        </CardHeader>
        <CardContent className="px-7 pb-7">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {systemStatus.map((item) => (
              <div
                key={item.label}
                className={`flex items-center justify-between rounded-[18px] px-4 py-3 text-sm font-semibold ${systemStyles[item.level]}`}
              >
                <span>{item.label}</span>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-current opacity-60 animate-ping" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-current" />
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
