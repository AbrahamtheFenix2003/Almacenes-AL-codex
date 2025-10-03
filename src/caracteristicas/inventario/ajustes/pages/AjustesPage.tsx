import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, ClipboardList, CheckCircle, AlertCircle, DollarSign } from "lucide-react";
import { AdjustmentTable } from "../components/AdjustmentTable";

export function AjustesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Ajustes de Inventario
          </h1>
          <p className="text-muted-foreground">
            Gestión de diferencias, mermas y correcciones de inventario
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Ajuste
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ajustes</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">Este periodo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprobados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">3</div>
            <p className="text-xs text-muted-foreground">50.0% del total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">2</div>
            <p className="text-xs text-muted-foreground">Requieren aprobación</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Ajustado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€3 969,93</div>
            <p className="text-xs text-muted-foreground">Diferencia -1 unidades</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="rounded-[var(--radius-xl)] border border-[color:var(--border)] bg-[color:var(--card)] p-6">
        <h3 className="text-sm font-medium mb-4">Filtros de Búsqueda</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar producto, documento, motivo..."
              className="flex h-11 w-full rounded-[calc(var(--radius)+4px)] border border-[color:var(--border)] bg-[color:var(--input-background)] px-4 text-sm"
            />
          </div>
          <select className="flex h-11 w-full appearance-none items-center rounded-[calc(var(--radius)+4px)] border border-[color:var(--border)] bg-[color:var(--card)] px-4 text-sm">
            <option>Todos los tipos</option>
            <option>Conteo Físico</option>
            <option>Merma</option>
            <option>Corrección</option>
            <option>Vencimiento</option>
            <option>Robo/Pérdida</option>
          </select>
          <select className="flex h-11 w-full appearance-none items-center rounded-[calc(var(--radius)+4px)] border border-[color:var(--border)] bg-[color:var(--card)] px-4 text-sm">
            <option>Todos los estados</option>
            <option>Aprobado</option>
            <option>Pendiente</option>
            <option>Rechazado</option>
          </select>
        </div>
      </div>

      {/* Adjustments Table */}
      <AdjustmentTable />
    </div>
  );
}
