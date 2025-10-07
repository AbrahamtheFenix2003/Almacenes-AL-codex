import { Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { Product } from '../types';

interface ProductGridProps {
  productos: Product[];
  searchQuery: string;
  onAddToCart: (product: Product) => void;
}

export default function ProductGrid({ productos, searchQuery, onAddToCart }: ProductGridProps) {
  const filteredProducts = productos.filter(product => {
    const query = searchQuery.toLowerCase();
    return product.nombre.toLowerCase().includes(query) ||
           product.codigo.toLowerCase().includes(query);
  });

  if (filteredProducts.length === 0) {
    return (
      <div>
        <h2 className="text-lg font-semibold mb-4">Productos Disponibles</h2>
        <div className="flex items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">
            {searchQuery ? 'No se encontraron productos' : 'No hay productos disponibles'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-lg font-semibold mb-4">Productos Disponibles ({filteredProducts.length})</h2>
      <div className="border rounded-lg overflow-hidden flex-1">
        <div className="overflow-auto max-h-[calc(100vh-280px)]">
          <table className="w-full">
            <thead className="bg-muted sticky top-0">
              <tr>
                <th className="text-left p-3 font-semibold text-sm">Código</th>
                <th className="text-left p-3 font-semibold text-sm">Producto</th>
                <th className="text-right p-3 font-semibold text-sm">Precio</th>
                <th className="text-center p-3 font-semibold text-sm">Stock</th>
                <th className="text-center p-3 font-semibold text-sm w-24">Acción</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr
                  key={product.id}
                  className="border-t hover:bg-muted/50 transition-colors"
                >
                  <td className="p-3">
                    <span className="text-sm text-blue-600 font-medium">{product.codigo}</span>
                  </td>
                  <td className="p-3">
                    <span className="text-sm font-medium">{product.nombre}</span>
                  </td>
                  <td className="p-3 text-right">
                    <span className="text-sm font-bold">{formatCurrency(product.precio)}</span>
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        product.stock === 0
                          ? 'bg-red-100 text-red-800'
                          : product.stock <= product.stockMinimo
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => onAddToCart(product)}
                      disabled={product.stock === 0}
                      className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-[color:var(--primary)] text-[color:var(--primary-foreground)] hover:bg-[color:var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Agregar al carrito"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
