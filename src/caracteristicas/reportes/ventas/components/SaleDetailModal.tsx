import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText, User, CreditCard, Package, Tag } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { VentaReporte } from './SalesTable';

interface Props {
  venta: VentaReporte | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SaleDetailModal({ venta, isOpen, onClose }: Props) {
  if (!venta) return null;

  const formatDate = (dateInput: Date | string) => {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    if (Number.isNaN(date.getTime())) {
      return 'Fecha no disponible';
    }
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const getMetodoPagoColor = (metodo: string) => {
    const colors = {
      'Efectivo': 'bg-green-50 text-green-700 border-green-200',
      'Yape': 'bg-purple-50 text-purple-700 border-purple-200',
      'Transferencia Bancaria': 'bg-blue-50 text-blue-700 border-blue-200'
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
              <p className="text-base font-medium">{formatDate(venta.fechaCompleta)}</p>
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
              Detalle de Productos
            </h4>
            <div className="space-y-3">
              {venta.items.map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h5 className="font-medium text-sm">{item.productoNombre}</h5>
                      <p className="text-xs text-muted-foreground">Código: {item.productoCodigo}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Cantidad: {item.cantidad}</p>
                      <p className="text-sm font-medium">
                        {formatCurrency(item.precioUnitario)} c/u
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Subtotal: </span>
                      <span className="font-bold">{formatCurrency(item.subtotal)}</span>
                    </div>
                    {item.descuentoManual && (
                      <div className="flex items-center gap-2">
                        <Badge variant="muted" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          Descuento aplicado
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          <p>Motivo: {item.descuentoManual.motivo}</p>
                          {item.descuentoManual.descripcionAdicional && (
                            <p>Detalle: {item.descuentoManual.descripcionAdicional}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  {item.precioUnitarioOriginal && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Precio original: {formatCurrency(item.precioUnitarioOriginal)} c/u
                    </div>
                  )}
                </div>
              ))}
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
