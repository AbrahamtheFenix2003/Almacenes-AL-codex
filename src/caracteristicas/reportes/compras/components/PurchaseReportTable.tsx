import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import type { OrdenCompra } from '../types';

interface Props {
  ordenes: OrdenCompra[];
}

export function PurchaseReportTable({ ordenes }: Props) {
  const getEstadoColor = (estado: OrdenCompra['estado']) => {
    const colors = {
      'Pendiente': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'Recibido': 'bg-green-50 text-green-700 border-green-200'
    } as const;
    return colors[estado] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const formatProductos = (cantidad: number) => {
    return `${cantidad} items`;
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Órdenes de Compra
          <span className="text-sm font-normal text-gray-500 ml-2">
            {ordenes.length} órdenes encontradas
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold">Número</TableHead>
                <TableHead className="font-semibold">Fecha</TableHead>
                <TableHead className="font-semibold">Proveedor</TableHead>
                <TableHead className="font-semibold">Productos</TableHead>
                <TableHead className="font-semibold text-right">Total</TableHead>
                <TableHead className="font-semibold">Estado</TableHead>
                <TableHead className="font-semibold">Entrega</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordenes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No se encontraron órdenes de compra que coincidan con los filtros
                  </TableCell>
                </TableRow>
              ) : (
                ordenes.map((orden) => (
                  <TableRow key={orden.id || orden.numeroOrden} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-blue-600">
                      {orden.numeroOrden}
                    </TableCell>
                    <TableCell>{orden.fecha}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {orden.proveedorNombre}
                    </TableCell>
                    <TableCell className="text-center">
                      {formatProductos(orden.cantidadProductos)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-gray-900">
                      {formatCurrency(orden.total)}
                    </TableCell>
                    <TableCell>
                      <Badge className={`border ${getEstadoColor(orden.estado)}`}>
                        {orden.estado}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {orden.fechaEntrega}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
