import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export interface VentaReporte {
  numero: string;
  fecha: string;
  cliente: string;
  tipo: 'Individual' | 'Empresa';
  productos: number;
  total: number;
  metodoPago: 'Efectivo' | 'Tarjeta' | 'Transferencia' | 'SINPE';
  vendedor: string;
  margen: number;
}

interface Props { 
  ventas: VentaReporte[]; 
  onView?: (venta: VentaReporte) => void;
}

export function SalesTable({ ventas, onView }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Registro de Ventas
          <span className="text-sm font-normal text-gray-500 ml-2">
            {ventas.length} ventas encontradas
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Método Pago</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead className="text-right">Margen</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ventas.map((venta) => (
                <TableRow key={venta.numero}>
                  <TableCell className="font-medium">{venta.numero}</TableCell>
                  <TableCell>{venta.fecha}</TableCell>
                  <TableCell>{venta.cliente}</TableCell>
                  <TableCell>
                    <Badge variant={venta.tipo === 'Empresa' ? 'muted' : 'success'}>
                      {venta.tipo}
                    </Badge>
                  </TableCell>
                  <TableCell>{venta.productos} items</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(venta.total)}</TableCell>
                  <TableCell>{venta.metodoPago}</TableCell>
                  <TableCell>{venta.vendedor}</TableCell>
                  <TableCell className="text-right">
                    <span className="font-semibold text-blue-700">{venta.margen}%</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onView?.(venta)}
                      className="h-8 w-8"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
