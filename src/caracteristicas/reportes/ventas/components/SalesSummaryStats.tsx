import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, ListChecks, Receipt, Percent } from 'lucide-react';
import type { VentaReporte } from './SalesTable';
import { useMemo } from 'react';
import { formatCurrency } from '@/lib/utils';

interface Props {
  ventas: VentaReporte[];
}

export function SalesSummaryStats({ ventas }: Props) {
  const { totalVentas, transacciones, ticketPromedio, margenPromedio } = useMemo(() => {
    const transacciones = ventas.length;
    const totalVentas = ventas.reduce((s, v) => s + v.total, 0);
    const ticketPromedio = transacciones ? totalVentas / transacciones : 0;
    const margenPromedio = transacciones ? (ventas.reduce((s, v) => s + v.margen, 0) / transacciones) : 0;
    return { totalVentas, transacciones, ticketPromedio, margenPromedio };
  }, [ventas]);

  const stats = [
    {
      title: 'Total Ventas',
      value: formatCurrency(totalVentas),
      subtitle: 'Este período',
      icon: TrendingUp,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Transacciones',
      value: transacciones.toString(),
      subtitle: 'Ventas realizadas',
      icon: ListChecks,
      iconColor: 'text-gray-600',
      bgColor: 'bg-gray-50',
    },
    {
      title: 'Ticket Promedio',
      value: formatCurrency(ticketPromedio),
      subtitle: 'Por transacción',
      icon: Receipt,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Margen Promedio',
      value: `${margenPromedio.toFixed(1)}%`,
      subtitle: 'Rentabilidad promedio',
      icon: Percent,
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <p className="text-xs text-gray-500">{stat.subtitle}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
