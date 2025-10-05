import { useState, useEffect } from 'react';
import { collection, getDocs, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import ProductSearch from '../components/ProductSearch';
import ProductGrid from '../components/ProductGrid';
import ShoppingCart from '../components/ShoppingCart';
import type { Product, CartItem, Client, Sale, SaleItem, Movement } from '../types';

export default function PuntoDeVentaPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedClient, setSelectedClient] = useState('general');
  const [productos, setProductos] = useState<Product[]>([]);
  const [clientes, setClientes] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { toast } = useToast();

  // Cargar productos desde Firestore
  useEffect(() => {
    const loadProductos = async () => {
      try {
        const productosSnapshot = await getDocs(collection(db, 'productos'));
        const productosData: Product[] = productosSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];
        setProductos(productosData);
      } catch (error) {
        console.error('Error al cargar productos:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los productos',
          variant: 'destructive',
        });
      }
    };

    loadProductos();
  }, [toast]);

  // Cargar clientes desde Firestore
  useEffect(() => {
    const loadClientes = async () => {
      try {
        const clientesSnapshot = await getDocs(collection(db, 'clientes'));
        const clientesData: Client[] = [
          { id: 'general', nombre: 'Cliente general' },
          ...clientesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Client[],
        ];
        setClientes(clientesData);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar clientes:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los clientes',
          variant: 'destructive',
        });
        setLoading(false);
      }
    };

    loadClientes();
  }, [toast]);

  const handleAddToCart = (product: Product) => {
    // Verificar stock antes de agregar
    const existingItem = cartItems.find((item) => item.id === product.id);

    if (existingItem) {
      // Verificar que no exceda el stock
      if (existingItem.cantidad >= product.stock) {
        toast({
          title: 'Stock insuficiente',
          description: `Solo hay ${product.stock} unidades disponibles`,
          variant: 'destructive',
        });
        return;
      }

      // Incrementar cantidad del producto existente
      setCartItems(cartItems.map((item) =>
        item.id === product.id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ));
    } else {
      // Agregar nuevo producto al carrito
      setCartItems([
        ...cartItems,
        {
          id: product.id,
          nombre: product.nombre,
          codigo: product.codigo,
          precio: product.precio,
          cantidad: 1,
          stockDisponible: product.stock,
        },
      ]);
    }
  };

  const handleUpdateQuantity = (id: string, cantidad: number) => {
    const product = productos.find((p) => p.id === id);
    if (product && cantidad > product.stock) {
      toast({
        title: 'Stock insuficiente',
        description: `Solo hay ${product.stock} unidades disponibles`,
        variant: 'destructive',
      });
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, cantidad } : item
      )
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleRequestProcessSale = () => {
    if (cartItems.length === 0) {
      toast({
        title: 'Carrito vacío',
        description: 'Agrega productos al carrito antes de procesar la venta',
        variant: 'destructive',
      });
      return;
    }
    setShowConfirmDialog(true);
  };

  const handleProcessSale = async () => {
    setShowConfirmDialog(false);
    setProcessing(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const clienteSeleccionado = clientes.find((c) => c.id === selectedClient);
      if (!clienteSeleccionado) {
        throw new Error('Cliente no encontrado');
      }

      // Generar número de venta
      const ventasSnapshot = await getDocs(collection(db, 'ventas'));
      const numeroVenta = `VTA-${new Date().getFullYear()}-${String(ventasSnapshot.size + 1).padStart(4, '0')}`;

      // Ejecutar transacción
      await runTransaction(db, async (transaction) => {
        // 1. Validar stock y leer productos
        const productUpdates: Array<{ ref: any; newStock: number }> = [];

        for (const item of cartItems) {
          const productRef = doc(db, 'productos', item.id);
          const productDoc = await transaction.get(productRef);

          if (!productDoc.exists()) {
            throw new Error(`Producto ${item.nombre} no encontrado`);
          }

          const productData = productDoc.data() as Product;

          if (productData.stock < item.cantidad) {
            throw new Error(
              `Stock insuficiente para ${item.nombre}. Disponible: ${productData.stock}, Solicitado: ${item.cantidad}`
            );
          }

          const newStock = productData.stock - item.cantidad;
          productUpdates.push({ ref: productRef, newStock });
        }

        // 2. Actualizar stock de productos
        for (const update of productUpdates) {
          transaction.update(update.ref, { stock: update.newStock });
        }

        // 3. Crear documento de venta
        const saleItems: SaleItem[] = cartItems.map((item) => ({
          productoId: item.id,
          productoNombre: item.nombre,
          productoCodigo: item.codigo,
          cantidad: item.cantidad,
          precioUnitario: item.precio,
          subtotal: item.precio * item.cantidad,
        }));

        const subtotal = saleItems.reduce((sum, item) => sum + item.subtotal, 0);
        const total = subtotal;

        const saleData: Omit<Sale, 'fecha' | 'creadoEn'> & { fecha: any; creadoEn: any } = {
          numeroVenta,
          fecha: serverTimestamp(),
          clienteId: clienteSeleccionado.id,
          clienteNombre: clienteSeleccionado.nombre,
          items: saleItems,
          subtotal,
          total,
          usuario: user.email || 'Usuario',
          creadoEn: serverTimestamp(),
        };

        const ventaRef = doc(collection(db, 'ventas'));
        transaction.set(ventaRef, saleData);

        // 4. Crear movimientos de inventario (uno por cada producto)
        for (const item of saleItems) {
          const movementData: Omit<Movement, 'fecha' | 'creadoEn'> & {
            fecha: any;
            creadoEn: any;
            productoCodigo: string;
            precioUnitario: number;
            total: number;
            documento: string;
          } = {
            fecha: serverTimestamp(),
            concepto: 'Venta',
            tipo: 'salida',
            cantidad: item.cantidad,
            productoId: item.productoId,
            productoNombre: item.productoNombre,
            productoCodigo: item.productoCodigo,
            precioUnitario: item.precioUnitario,
            total: item.subtotal,
            documento: numeroVenta,
            ventaId: ventaRef.id,
            clienteNombre: clienteSeleccionado.nombre,
            usuario: user.email || 'Usuario',
            observaciones: `Venta ${numeroVenta} - Cliente: ${clienteSeleccionado.nombre}`,
            creadoEn: serverTimestamp(),
          };

          const movementRef = doc(collection(db, 'movimientos'));
          transaction.set(movementRef, movementData);
        }
      });

      // Éxito
      toast({
        title: '¡Venta procesada!',
        description: `Venta ${numeroVenta} registrada exitosamente`,
      });

      // Limpiar carrito y recargar productos
      setCartItems([]);

      // Recargar productos para actualizar stock
      const productosSnapshot = await getDocs(collection(db, 'productos'));
      const productosData: Product[] = productosSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      setProductos(productosData);

    } catch (error) {
      console.error('Error al procesar venta:', error);
      toast({
        title: 'Error al procesar venta',
        description: error instanceof Error ? error.message : 'Ocurrió un error inesperado',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Punto de Venta</h1>
        <p className="text-muted-foreground">Sistema de ventas en tiempo real</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
        {/* Columna principal - Productos */}
        <div className="lg:col-span-2 space-y-4 overflow-hidden">
          <ProductSearch value={searchQuery} onChange={setSearchQuery} />
          <ProductGrid
            productos={productos}
            searchQuery={searchQuery}
            onAddToCart={handleAddToCart}
          />
        </div>

        {/* Barra lateral - Cliente y Carrito */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-3">Cliente</h2>
            <Select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
            >
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombre}
                </option>
              ))}
            </Select>
          </div>

          <ShoppingCart
            items={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onProcessSale={handleRequestProcessSale}
            processing={processing}
          />
        </div>
      </div>

      {/* Diálogo de confirmación */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Venta</DialogTitle>
            <DialogDescription>
              ¿Está seguro de procesar esta venta? Esta acción realizará los siguientes cambios:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Se registrará la venta en el sistema</li>
              <li>Se reducirá el stock de los productos</li>
              <li>Se generarán movimientos de inventario</li>
              <li>Total de la venta: <strong>€{cartItems.reduce((sum, item) => sum + item.precio * item.cantidad, 0).toFixed(2)}</strong></li>
            </ul>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={processing}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleProcessSale}
              disabled={processing}
            >
              {processing ? 'Procesando...' : 'Confirmar Venta'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
