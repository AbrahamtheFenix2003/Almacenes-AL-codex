import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { ReactNode } from 'react';

export interface PuntoMetodo { [key: string]: string | number | undefined; metodo: string; valor: number; color?: string }
interface Props { data: PuntoMetodo[] }

interface LabelPayload { metodo?: string; name?: string; percent?: number }

export function SalesByPaymentMethodChart({ data }: Props) {
  const renderLabel = (d: LabelPayload): ReactNode => {
    const name = d.metodo || d.name || '';
    const percent = typeof d.percent === 'number' ? d.percent : 0;
    return `${name}: ${(percent * 100).toFixed(1)}%`;
  };
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Ventas por Método de Pago</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="valor"
                nameKey="metodo"
                cx="50%"
                cy="50%"
                outerRadius={70}
                label={renderLabel}
              >
                {data.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.color || '#3b82f6'} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => `${(v as number).toFixed(1)}%`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
