import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Clock, Loader2, DollarSign } from "lucide-react";
import type { OrdenCompra } from "./PurchaseOrderTable";

interface PurchaseOrderStatsProps {
  ordenes: OrdenCompra[];
}

export function PurchaseOrderStats({ ordenes }: PurchaseOrderStatsProps) {
  const stats = useMemo(() => {
    const totalOrdenes = ordenes.length;
    const pendientes = ordenes.filter((o) => o.estado === "Pendiente").length;
    const enProceso = ordenes.filter(
      (o) => o.estado === "Aprobado" || o.estado === "En Tránsito"
    ).length;
    const valorTotal = ordenes.reduce((acc, orden) => acc + orden.total, 0);

    return [
      {
        label: "Total Órdenes",
        value: totalOrdenes.toString(),
        helper: "Este periodo",
        icon: FileText,
        accentClass: "text-[color:var(--primary)]",
      },
      {
        label: "Pendientes",
        value: pendientes.toString(),
        helper: "Requieren aprobación",
        icon: Clock,
        accentClass: "text-[#b8860b]",
      },
      {
        label: "En Proceso",
        value: enProceso.toString(),
        helper: "Aprobadas/En tránsito",
        icon: Loader2,
        accentClass: "text-[#0ea5e9]",
      },
      {
        label: "Valor Total",
        value: `€${valorTotal.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        helper: "Órdenes activas",
        icon: DollarSign,
        accentClass: "text-[#1f8f4d]",
      },
    ];
  }, [ordenes]);

  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
      {stats.map(({ label, value, helper, icon: Icon, accentClass }) => (
        <Card key={label} className="border-[color:var(--border)] bg-[color:var(--card)]/95">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 px-6 pt-6 pb-0">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium text-[color:var(--muted-foreground)] uppercase tracking-[0.14em]">
                {label}
              </CardTitle>
              <p className="text-xs text-[color:var(--muted-foreground)]/70">{helper}</p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[color:var(--border)] bg-[color:var(--secondary)] text-[color:var(--primary)]">
              <Icon className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <p className={`text-3xl font-semibold ${accentClass}`}>{value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
