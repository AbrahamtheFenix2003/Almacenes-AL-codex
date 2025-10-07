import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, AlertTriangle, AlertCircle, RotateCcw } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { ReporteProducto } from '../pages/ReportesInventarioPage';

interface InventoryReportStatsProps {
  productos: ReporteProducto[];
}

export function InventoryReportStats({ productos }: InventoryReportStatsProps) {
  // Calcular métricas dinámicamente
  const metricas = useMemo(() => {
    const valorTotal = productos.reduce((sum, producto) => sum + producto.valorTotal, 0);
    const productosAgotados = productos.filter(p => p.estado === 'Agotado').length;
    const stockBajo = productos.filter(p => p.estado === 'Bajo' || p.estado === 'Crítico').length;
    
    // Cálculo básico de rotación promedio (simulado)
    const rotacionPromedio = productos.length > 0 ? 
      productos.reduce((sum, producto) => {
        // Simulamos rotación basada en stock vs stock mínimo
        const [minimo] = producto.stockMinMax.split(' / ').map(Number);
        const rotacion = producto.stockActual > 0 ? minimo / (producto.stockActual || 1) * 2.5 : 0;
        return sum + rotacion;
      }, 0) / productos.length : 0;

    return {
      valorTotal,
      productosAgotados,
      stockBajo,
      rotacionPromedio: Number(rotacionPromedio.toFixed(1)),
      totalProductos: productos.length
    };
  }, [productos]);

  const formatCurrencyNoDecimals = (value: number) =>
    formatCurrency(value, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const stats = [
    {
      title: 'Valor Total Inventario',
      value: formatCurrencyNoDecimals(metricas.valorTotal),
      subtitle: `${metricas.totalProductos} productos almacenados`,
      icon: TrendingUp,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Productos Agotados',
      value: metricas.productosAgotados.toString(),
      subtitle: 'Requieren reposición inmediata',
      icon: AlertTriangle,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Stock Bajo',
      value: metricas.stockBajo.toString(),
      subtitle: 'Debajo del mínimo',
      icon: AlertCircle,
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Rotación Promedio',
      value: metricas.rotacionPromedio.toString(),
      subtitle: 'veces por mes',
      icon: RotateCcw,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="relative overflow-hidden">
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
              <p className="text-xs text-gray-500">
                {stat.subtitle}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
