import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText, User, CreditCard, Package, ShoppingCart } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { VentaReporte } from './SalesTable';

interface Props {
  venta: VentaReporte | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SaleDetailModal({ venta, isOpen, onClose }: Props) {
  if (!venta) return null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getMetodoPagoColor = (metodo: string) => {
    const colors = {
      'Efectivo': 'bg-green-50 text-green-700 border-green-200',
      'Tarjeta': 'bg-blue-50 text-blue-700 border-blue-200',
      'Transferencia': 'bg-purple-50 text-purple-700 border-purple-200',
      'SINPE': 'bg-orange-50 text-orange-700 border-orange-200'
    };
    return colors[metodo as keyof typeof colors] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getTipoClienteColor = (tipo: string) => {
    return tipo === 'Empresa' 
      ? 'bg-blue-50 text-blue-700 border-blue-200'
      : 'bg-green-50 text-green-700 border-green-200';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Detalle de Venta - {venta.numero}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Información básica */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Fecha de Venta</span>
              </div>
              <p className="text-base font-medium">{formatDate(venta.fecha)}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>Número de Venta</span>
              </div>
              <p className="text-base font-mono bg-gray-50 px-2 py-1 rounded">
                {venta.numero}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Cliente</span>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-base font-medium">{venta.cliente}</p>
                <Badge className={`${getTipoClienteColor(venta.tipo)} border`}>
                  {venta.tipo}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CreditCard className="h-4 w-4" />
                <span>Método de Pago</span>
              </div>
              <Badge className={`${getMetodoPagoColor(venta.metodoPago)} border w-fit`}>
                {venta.metodoPago}
              </Badge>
            </div>
          </div>

          {/* Información de productos */}
          <div className="border-t pt-6">
            <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Resumen de Productos
            </h4>
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-gray-600" />
                    <span className="font-medium">Total de productos</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">
                    {venta.productos} items
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Información financiera */}
          <div className="border-t pt-6">
            <h4 className="text-sm font-semibold mb-4">Información Financiera</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2 bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600 font-medium">Total de Venta</p>
                <p className="text-2xl font-bold text-blue-700">
                  {formatCurrency(venta.total)}
                </p>
              </div>
              <div className="space-y-2 bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-600 font-medium">Margen Estimado</p>
                <p className="text-2xl font-bold text-green-700">
                  {venta.margen.toFixed(1)}%
                </p>
              </div>
              <div className="space-y-2 bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 font-medium">Ganancia Estimada</p>
                <p className="text-2xl font-bold text-gray-700">
                  {formatCurrency(venta.total * venta.margen / 100)}
                </p>
              </div>
            </div>
          </div>

          {/* Información del sistema */}
          <div className="border-t pt-6">
            <h4 className="text-sm font-semibold mb-4">Información del Sistema</h4>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>Vendedor</span>
                </div>
                <p className="text-base font-medium bg-gray-50 px-3 py-2 rounded">
                  {venta.vendedor}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
