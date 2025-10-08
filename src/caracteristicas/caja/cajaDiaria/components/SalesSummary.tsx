import { Card } from '@/components/ui/card';
import { TrendingUp, Banknote, Smartphone, ArrowLeftRight, TrendingDown, Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { ResumenCaja } from '../types/index';

interface SalesSummaryProps {
  resumen: ResumenCaja;
}

export default function SalesSummary({ resumen }: SalesSummaryProps) {
  const summaryData = [
    {
      title: 'Total Ventas',
      amount: resumen.totalVentas,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Efectivo',
      amount: resumen.totalEfectivo,
      icon: Banknote,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Yape',
      amount: resumen.totalYape,
      icon: Smartphone,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Transferencias',
      amount: resumen.totalTransferencias,
      icon: ArrowLeftRight,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'Gastos',
      amount: resumen.totalGastos,
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      isNegative: true
    },
    {
      title: 'Ingresos Extra',
      amount: resumen.totalIngresosExtra,
      icon: Plus,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {summaryData.map((item, index) => {
        const Icon = item.icon;
        return (
          <Card key={index} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg ${item.bgColor}`}>
                <Icon className={`h-5 w-5 ${item.color}`} />
              </div>
            </div>
            <div className="text-xs text-gray-500 mb-1">{item.title}</div>
            <div className={`text-xl font-bold ${item.isNegative ? 'text-red-600' : 'text-gray-900'}`}>
              {item.isNegative ? `-${formatCurrency(Math.abs(item.amount))}` : formatCurrency(item.amount)}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
