import { Boxes, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  {
    label: "Total productos",
    value: "125",
    helper: "Inventario total registrado",
    icon: Boxes,
    accentClass: "text-[color:var(--primary)]",
  },
  {
    label: "Productos activos",
    value: "108",
    helper: "Disponibles para venta",
    icon: CheckCircle2,
    accentClass: "text-[#1f8f4d]",
  },
  {
    label: "Stock bajo",
    value: "9",
    helper: "Requieren reposición",
    icon: AlertTriangle,
    accentClass: "text-[#b8860b]",
  },
  {
    label: "Agotados",
    value: "4",
    helper: "Sin unidades disponibles",
    icon: XCircle,
    accentClass: "text-[#d43852]",
  },
];

export function ProductStats() {
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
