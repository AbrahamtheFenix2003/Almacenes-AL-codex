import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import type { ReporteProducto } from '../pages/ReportesInventarioPage';

interface InventoryReportTableProps {
  productos: ReporteProducto[];
}

export function InventoryReportTable({ productos }: InventoryReportTableProps) {
  const getEstadoBadgeVariant = (estado: ReporteProducto['estado']) => {
    switch (estado) {
      case 'Normal':
        return 'success';
      case 'Crítico':
        return 'danger';
      case 'Bajo':
        return 'warning';
      case 'Agotado':
        return 'danger';
      default:
        return 'default';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Inventario Actual
          <span className="text-sm font-normal text-gray-500 ml-2">
            {productos.length} productos encontrados
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {productos.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <p className="text-gray-500 text-sm">No se encontraron productos que coincidan con los filtros.</p>
            </div>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-center">Stock Actual</TableHead>
                  <TableHead className="text-center">Stock Mín/Máx</TableHead>
                  <TableHead className="text-right">Valor Unitario</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="text-center">Último Movimiento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productos.map((producto) => (
                  <TableRow key={producto.id}>
                    <TableCell className="font-medium">{producto.codigo}</TableCell>
                    <TableCell>{producto.producto}</TableCell>
                    <TableCell>{producto.categoria}</TableCell>
                    <TableCell className="text-center">{producto.stockActual}</TableCell>
                    <TableCell className="text-center">
                      <span className={producto.estado === 'Crítico' || producto.estado === 'Bajo' ? 'text-red-600 font-medium' : ''}>
                        {producto.stockMinMax}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(producto.valorUnitario)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(producto.valorTotal)}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={getEstadoBadgeVariant(producto.estado)}>
                        {producto.estado}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{producto.ultimoMovimiento}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
