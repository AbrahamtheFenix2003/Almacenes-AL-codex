import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { MovementStats } from "../components/MovementStats";
import { MovementFilters } from "../components/MovementFilters";
import { MovementTable } from "../components/MovementTable";

export function MovimientosPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Movimientos de Inventario
          </h1>
          <p className="text-muted-foreground">
            Registro completo de entradas y salidas de inventario
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Movimiento
        </Button>
      </div>

      {/* Stats Cards */}
      <MovementStats />

      {/* Filters */}
      <MovementFilters />

      {/* Movements Table */}
      <MovementTable />
    </div>
  );
}
