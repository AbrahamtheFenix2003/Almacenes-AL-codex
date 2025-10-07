import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, TrendingUp, TrendingDown, Scale } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Movimiento } from "../types";

interface MovementStatsProps {
  movimientos: Movimiento[];
}

export function MovementStats({ movimientos }: MovementStatsProps) {
  const stats = useMemo(() => {
    const entradas = movimientos.filter((m) => m.tipo === "Entrada");
    const salidas = movimientos.filter((m) => m.tipo === "Salida");

    const valorEntradas = entradas.reduce((sum, m) => sum + m.total, 0);
    const valorSalidas = salidas.reduce((sum, m) => sum + m.total, 0);

    return {
      totalMovimientos: movimientos.length,
      entradas: {
        cantidad: entradas.length,
        valor: valorEntradas,
      },
      salidas: {
        cantidad: salidas.length,
        valor: valorSalidas,
      },
      balance: valorEntradas - valorSalidas,
    };
  }, [movimientos]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Movimientos
          </CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalMovimientos}</div>
          <p className="text-xs text-muted-foreground">Este periodo</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Entradas</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {stats.entradas.cantidad}
          </div>
          <p className="text-xs text-muted-foreground">
            Valor: {formatCurrency(stats.entradas.valor)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Salidas</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {stats.salidas.cantidad}
          </div>
          <p className="text-xs text-muted-foreground">
            Valor: {formatCurrency(stats.salidas.valor)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Balance</CardTitle>
          <Scale className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(stats.balance)}
          </div>
          <p className="text-xs text-muted-foreground">Diferencia neta</p>
        </CardContent>
      </Card>
    </div>
  );
}
