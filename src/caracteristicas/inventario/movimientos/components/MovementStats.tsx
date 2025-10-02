import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, TrendingUp, TrendingDown, Scale } from "lucide-react";

interface StatsData {
  totalMovimientos: number;
  entradas: {
    cantidad: number;
    valor: number;
  };
  salidas: {
    cantidad: number;
    valor: number;
  };
  balance: number;
}

interface MovementStatsProps {
  data?: StatsData;
}

export function MovementStats({ data }: MovementStatsProps) {
  const stats = data || {
    totalMovimientos: 6,
    entradas: {
      cantidad: 3,
      valor: 13439.86,
    },
    salidas: {
      cantidad: 3,
      valor: 829.81,
    },
    balance: 12609.95,
  };

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
            Valor: €{stats.entradas.valor.toFixed(2)}
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
            Valor: €{stats.salidas.valor.toFixed(2)}
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
            €{stats.balance.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">Diferencia neta</p>
        </CardContent>
      </Card>
    </div>
  );
}
