import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, ShoppingCart, Calculator, Clock } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { OrdenCompra } from '../types';

interface Props {
  ordenes: OrdenCompra[];
}

export function PurchaseReportStats({ ordenes }: Props) {
  const estadisticas = useMemo(() => {
    const totalCompras = ordenes.reduce((sum, orden) => sum + orden.total, 0);
    const ordenesTotales = ordenes.length;
    const promedioPorOrden = ordenesTotales > 0 ? totalCompras / ordenesTotales : 0;
    const ordenesPendientes = ordenes.filter(orden => orden.estado === 'Pendiente').length;

    return {
      totalCompras,
      ordenesTotales,
      promedioPorOrden,
      ordenesPendientes
    };
  }, [ordenes]);

  const formatCurrencyNoDecimals = (value: number) =>
    formatCurrency(value, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const statCards = [
    {
      title: 'Total Compras',
      value: formatCurrencyNoDecimals(estadisticas.totalCompras),
      subtitle: 'Este período',
      icon: TrendingUp,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Órdenes Totales',
      value: estadisticas.ordenesTotales.toString(),
      subtitle: 'Órdenes procesadas',
      icon: ShoppingCart,
      iconColor: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    },
    {
      title: 'Promedio por Orden',
      value: formatCurrencyNoDecimals(estadisticas.promedioPorOrden),
      subtitle: 'Por transacción',
      icon: Calculator,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'Órdenes Pendientes',
      value: estadisticas.ordenesPendientes.toString(),
      subtitle: 'Requieren seguimiento',
      icon: Clock,
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className={`relative overflow-hidden border ${stat.borderColor}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <p className="text-xs text-gray-500">{stat.subtitle}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
