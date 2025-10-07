import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import type { Transaccion } from '../types/index';
import { Timestamp } from 'firebase/firestore';

interface TransactionsTableProps {
  transacciones: Transaccion[];
}

export default function TransactionsTable({ transacciones }: TransactionsTableProps) {
  const formatTime = (timestamp: Timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate();
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const getTipoBadgeColor = (tipo: Transaccion['tipo']) => {
    switch (tipo) {
      case 'Venta':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'Gasto':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-100';
      case 'Cobro':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'Pago':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const getMetodoIcon = (metodo: Transaccion['metodo']) => {
    switch (metodo) {
      case 'Efectivo':
        return '💵';
      case 'Tarjeta':
        return '💳';
      case 'Transferencia':
        return '🏦';
      default:
        return '';
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Transacciones del Día</h3>
        <p className="text-sm text-gray-500">{transacciones.length} transacciones registradas</p>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Hora</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Número</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Método</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead className="text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transacciones.map((transaccion) => (
              <TableRow key={transaccion.id}>
                <TableCell className="text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">🕐</span>
                    {formatTime(transaccion.fecha)}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getTipoBadgeColor(transaccion.tipo)}>
                    {transaccion.tipo}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm font-mono">{transaccion.numero}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm">{transaccion.descripcion}</span>
                    {transaccion.descripcionSecundaria && (
                      <span className="text-xs text-gray-500">{transaccion.descripcionSecundaria}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    <span>{getMetodoIcon(transaccion.metodo)}</span>
                    {transaccion.metodo}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className={`font-semibold ${transaccion.tipo === 'Gasto' || transaccion.tipo === 'Pago' ? 'text-red-600' : 'text-green-600'}`}>
                    {`${transaccion.tipo === 'Gasto' || transaccion.tipo === 'Pago' ? '-' : '+'}${formatCurrency(Math.abs(transaccion.monto ?? 0))}`}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-gray-600">{transaccion.usuario}</TableCell>
                <TableCell className="text-center">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
