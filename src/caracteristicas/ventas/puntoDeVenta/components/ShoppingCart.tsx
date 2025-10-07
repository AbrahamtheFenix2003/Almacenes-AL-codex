import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart as CartIcon, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { CartItem } from '../types';

interface ShoppingCartProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, cantidad: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onProcessSale: () => void;
  processing?: boolean;
}

function ShoppingCart({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProcessSale,
  processing = false
}: ShoppingCartProps) {
  const total = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

  return (
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
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{`${formatCurrency(item.precio)} c/u`}</p>
                      <p className="text-base font-bold">
                        {formatCurrency(item.precio * item.cantidad)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 mb-4">
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
  );
}

export default ShoppingCart;
