import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart as CartIcon, Trash2, Pencil } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { CartItem, DescuentoManual } from '../types';

interface ShoppingCartProps {
  items: CartItem[];
  metodoPago: string;
  onMetodoPagoChange: (value: string) => void;
  onUpdateQuantity: (id: string, cantidad: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onProcessSale: () => void;
  onApplyDiscount: (itemId: string, discount: DescuentoManual, newSubtotal: number) => void;
  processing?: boolean;
}

export default function ShoppingCart({
  items,
  metodoPago,
  onMetodoPagoChange,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProcessSale,
  onApplyDiscount,
  processing = false
}: ShoppingCartProps) {
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editableSubtotal, setEditableSubtotal] = useState<number>(0);
  const [showJustificationModal, setShowJustificationModal] = useState(false);
  const [justification, setJustification] = useState({ motivo: '', descripcionAdicional: '' });
  const [showOtherReason, setShowOtherReason] = useState(false);

  const handleEditSubtotal = (item: CartItem) => {
    setEditingItemId(item.id);
    setEditableSubtotal(item.subtotalModificado ?? item.precio * item.cantidad);
  };

  const handleSubtotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditableSubtotal(parseFloat(e.target.value) || 0);
  };

  const handleConfirmEdit = () => {
    if (editingItemId) {
      const item = items.find(i => i.id === editingItemId);
      if (item && editableSubtotal !== (item.precio * item.cantidad)) {
        setShowJustificationModal(true);
      } else {
        setEditingItemId(null);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
  };

  const handleConfirmJustification = () => {
    if (!justification.motivo || (justification.motivo === 'Otro' && !justification.descripcionAdicional)) {
      return;
    }

    if (editingItemId) {
      const item = items.find(i => i.id === editingItemId);
      if (item) {
        const originalSubtotal = item.precio * item.cantidad;
        const discountAmount = originalSubtotal - editableSubtotal;

        const discountData: DescuentoManual = {
          monto: discountAmount,
          motivo: justification.motivo,
          ...(justification.motivo === 'Otro' && { descripcionAdicional: justification.descripcionAdicional }),
        };
        
        onApplyDiscount(editingItemId, discountData, editableSubtotal);
      }
    }
    resetJustificationModal();
  };

  const resetJustificationModal = () => {
    setShowJustificationModal(false);
    setEditingItemId(null);
    setJustification({ motivo: '', descripcionAdicional: '' });
    setShowOtherReason(false);
  };

  const total = items.reduce((sum, item) => {
    const subtotal = item.subtotalModificado ?? item.precio * item.cantidad;
    return sum + subtotal;
  }, 0);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Carrito de Compras</CardTitle>
          <p className="text-sm text-muted-foreground">{items.length} producto(s)</p>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CartIcon className="h-16 w-16 text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground">No hay productos en el carrito</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-4 max-h-[calc(100vh-420px)] overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={item.id} className="border rounded-lg p-3 bg-card">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0 pr-2">
                        <h4 className="font-semibold text-sm leading-tight mb-1">{item.nombre}</h4>
                        <p className="text-xs text-blue-600">{item.codigo}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 flex-shrink-0"
                        onClick={() => onRemoveItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onUpdateQuantity(item.id, Math.max(1, item.cantidad - 1))}
                        >
                          -
                        </Button>
                        <Input
                          type="number"
                          min="1"
                          value={item.cantidad}
                          onChange={(e) => onUpdateQuantity(item.id, Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-16 h-8 text-center"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onUpdateQuantity(item.id, item.cantidad + 1)}
                        >
                          +
                        </Button>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        {editingItemId === item.id ? (
                          <Input
                            type="number"
                            value={editableSubtotal}
                            onChange={handleSubtotalChange}
                            onBlur={handleConfirmEdit}
                            onKeyDown={(e) => e.key === 'Enter' && handleConfirmEdit()}
                            className="w-24 h-8 text-right font-bold"
                            autoFocus
                          />
                        ) : (
                          <div>
                            <p className="text-xs text-muted-foreground">{`${formatCurrency(item.precio)} c/u`}</p>
                            <p className="text-base font-bold">
                              {formatCurrency(item.subtotalModificado ?? item.precio * item.cantidad)}
                            </p>
                          </div>
                        )}
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => editingItemId === item.id ? handleCancelEdit() : handleEditSubtotal(item)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {item.descuentoManual && (
                      <Badge variant="muted" className="mt-2">Descuento manual</Badge>
                    )}
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 mb-4 space-y-4">
                <div className="flex justify-between items-center">
                  <label htmlFor="metodo-pago" className="text-sm font-medium">Método de Pago</label>
                  <select
                    id="metodo-pago"
                    value={metodoPago}
                    onChange={(e) => onMetodoPagoChange(e.target.value)}
                    className="w-1/2 p-2 border rounded-md bg-background"
                    disabled={processing}
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Yape">Yape</option>
                    <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                  </select>
                </div>
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total:</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={onClearCart}
                  disabled={processing}
                >
                  Limpiar Carrito
                </Button>
                <Button
                  className="w-full"
                  onClick={onProcessSale}
                  disabled={processing}
                >
                  {processing ? 'Procesando...' : 'Procesar Venta'}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={showJustificationModal} onOpenChange={(isOpen) => !isOpen && resetJustificationModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Justificar Cambio de Precio</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label htmlFor="motivo-descuento" className="block text-sm font-medium mb-1">Motivo del descuento *</label>
              <select
                id="motivo-descuento"
                value={justification.motivo}
                onChange={(e) => {
                  const value = e.target.value;
                  setJustification(prev => ({ ...prev, motivo: value }));
                  setShowOtherReason(value === 'Otro');
                }}
                className="w-full p-2 border rounded-md bg-background"
              >
                <option value="">Seleccione un motivo</option>
                <option value="Venta por volumen (negociación)">Venta por volumen (negociación)</option>
                <option value="Cliente frecuente / VIP">Cliente frecuente / VIP</option>
                <option value="Producto con pequeño desperfecto">Producto con pequeño desperfecto</option>
                <option value="Igualar precio de la competencia">Igualar precio de la competencia</option>
                <option value="Promoción especial del día">Promoción especial del día</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            {showOtherReason && (
              <div>
                <label htmlFor="descripcion-adicional" className="block text-sm font-medium mb-1">Descripción adicional *</label>
                <Textarea
                  id="descripcion-adicional"
                  value={justification.descripcionAdicional}
                  onChange={(e) => setJustification(prev => ({ ...prev, descripcionAdicional: e.target.value }))}
                  placeholder="Especifique el motivo del descuento..."
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetJustificationModal}>Cancelar</Button>
            <Button
              onClick={handleConfirmJustification}
              disabled={!justification.motivo || (justification.motivo === 'Otro' && !justification.descripcionAdicional)}
            >
              Confirmar Descuento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
