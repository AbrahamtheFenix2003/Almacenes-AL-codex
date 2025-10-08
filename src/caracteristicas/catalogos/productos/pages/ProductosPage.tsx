import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, query, where, Timestamp } from "firebase/firestore";
import type { DocumentData, Query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { ProductStats } from "../components/ProductStats";
import { ProductFilters } from "../components/ProductFilters";
import { ProductTable } from "../components/ProductTable";
import { ProductForm, type ProductFormData } from "../components/ProductForm";
import { formatCurrency } from "@/lib/utils";

// Interface para definir la estructura de un producto
export interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  precio: number;
  stock: number;
  stockMinimo: number;
  proveedor: string;
  estado: 'Activo' | 'Stock Bajo' | 'Agotado';
  ubicacion?: string;
  descripcion?: string;
  fechaCreacion?: Timestamp | Date | string | null;
}

export function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [proveedores, setProveedores] = useState<Array<{ id: string; nombre: string }>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [productoAEditar, setProductoAEditar] = useState<Producto | null>(null);
  const [productoAEliminar, setProductoAEliminar] = useState<{ id: string; nombre: string } | null>(null);
  const [productoAVer, setProductoAVer] = useState<Producto | null>(null);

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  useEffect(() => {
    setLoading(true);

    // Construir la consulta con filtros
    const productosRef = collection(db, 'productos');
    let productosQuery: Query<DocumentData> = productosRef;

    // Si hay categoría seleccionada, agregar filtro de categoría
    if (selectedCategory) {
      productosQuery = query(
        productosRef,
        where('categoria', '==', selectedCategory)
      );
    }

    // Escuchar cambios en tiempo real con onSnapshot
    const unsubscribe = onSnapshot(
      productosQuery,
      (snapshot) => {
        const productosData: Producto[] = snapshot.docs.map((doc) => {
          const data = doc.data();

          // Calcular el estado basado en stock y stockMinimo
          let estado: 'Activo' | 'Stock Bajo' | 'Agotado';
          if (data.stock === 0) {
            estado = 'Agotado';
          } else if (data.stock < data.stockMinimo) {
            estado = 'Stock Bajo';
          } else {
            estado = 'Activo';
          }

          return {
            id: doc.id,
            codigo: data.codigo || '',
            nombre: data.nombre,
            categoria: data.categoria,
            precio: data.precio,
            stock: data.stock,
            stockMinimo: data.stockMinimo,
            proveedor: data.proveedor,
            estado,
            ubicacion: data.ubicacion || '',
            descripcion: data.descripcion || '',
            fechaCreacion: data.fechaCreacion || null,
          };
        });

        const resolveFechaCreacion = (fecha: Producto['fechaCreacion']): number => {
          if (!fecha) return 0;
          if (fecha instanceof Timestamp) return fecha.toMillis();
          if (fecha instanceof Date) return fecha.getTime();
          if (typeof fecha === 'string') {
            const parsed = Date.parse(fecha);
            return Number.isNaN(parsed) ? 0 : parsed;
          }
          return 0;
        };

        productosData.sort((a, b) => resolveFechaCreacion(b.fechaCreacion) - resolveFechaCreacion(a.fechaCreacion));

        setProductos(productosData);
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error('Error al obtener productos:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    // Cleanup: desuscribirse cuando el componente se desmonte
    return () => unsubscribe();
  }, [selectedCategory]);

  useEffect(() => {
    const proveedoresRef = collection(db, 'proveedores');
    const unsubscribe = onSnapshot(
      proveedoresRef,
      (snapshot) => {
        const proveedoresData = snapshot.docs
          .map((doc) => {
            const data = doc.data() as Record<string, unknown>;
            const nombre =
              (data.empresa as string | undefined)?.trim() ||
              (data.contactoNombre as string | undefined)?.trim() ||
              "";

            return {
              id: doc.id,
              nombre: nombre.length > 0 ? nombre : "Proveedor sin nombre",
            };
          })
          .sort((a, b) => a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" }));

        setProveedores(proveedoresData);
      },
      (snapshotError) => {
        console.error("Error al cargar proveedores:", snapshotError);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleCreateProduct = async (formData: ProductFormData): Promise<boolean> => {
    try {
      const productosRef = collection(db, 'productos');

      // Generar c�digo autom�tico si no se proporciona
      const codigo = formData.codigo || `PRD${String(productos.length + 1).padStart(3, '0')}`;

      await addDoc(productosRef, {
        nombre: formData.nombre,
        codigo,
        categoria: formData.categoria,
        proveedor: formData.proveedor || 'Sin proveedor',
        precio: formData.precio,
        stock: formData.stock,
        stockMinimo: formData.stockMinimo,
        ubicacion: formData.ubicacion || '',
        descripcion: formData.descripcion || '',
        fechaCreacion: Timestamp.fromDate(new Date()),
      });

      setIsModalOpen(false);
      return true;
    } catch (err) {
      console.error('Error al crear producto:', err);
      alert('Error al crear el producto. Por favor, intenta de nuevo.');
      return false;
    }
  };

  const handleUpdateProduct = async (formData: ProductFormData): Promise<boolean> => {
    try {
      if (!productoAEditar) return false;

      const productoRef = doc(db, 'productos', productoAEditar.id);

      await updateDoc(productoRef, {
        nombre: formData.nombre,
        codigo: formData.codigo || productoAEditar.codigo,
        categoria: formData.categoria,
        proveedor: formData.proveedor || 'Sin proveedor',
        precio: formData.precio,
        stock: formData.stock,
        stockMinimo: formData.stockMinimo,
        ubicacion: formData.ubicacion || '',
        descripcion: formData.descripcion || '',
        fechaModificacion: Timestamp.fromDate(new Date()),
      });

      setIsModalOpen(false);
      return true;
    } catch (err) {
      console.error('Error al actualizar producto:', err);
      alert('Error al actualizar el producto. Por favor, intenta de nuevo.');
      return false;
    }
  };

  const handleAbrirModalEdicion = (producto: Producto) => {
    setProductoAEditar(producto);
    setIsModalOpen(true);
  };

  const handleConfirmarEliminar = async () => {
    if (!productoAEliminar) return;

    try {
      const productoRef = doc(db, 'productos', productoAEliminar.id);
      await deleteDoc(productoRef);
      setProductoAEliminar(null);
    } catch (err) {
      console.error('Error al eliminar producto:', err);
      alert('Error al eliminar el producto. Por favor, intenta de nuevo.');
    }
  };

  const handleAbrirModalEliminar = (productId: string, productName: string) => {
    setProductoAEliminar({ id: productId, nombre: productName });
  };

  const handleAbrirModalVer = (producto: Producto) => {
    setProductoAVer(producto);
  };

  // Filtrar productos localmente por término de búsqueda
  const searchLower = searchTerm.toLowerCase();
  const productosFiltrados = productos.filter((producto) => {
    const matchesSearch =
      !searchTerm ||
      producto.nombre.toLowerCase().includes(searchLower) ||
      producto.codigo.toLowerCase().includes(searchLower) ||
      producto.categoria.toLowerCase().includes(searchLower) ||
      producto.proveedor.toLowerCase().includes(searchLower);

    if (!matchesSearch) return false;

    if (selectedStatus && producto.estado !== selectedStatus) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[color:var(--foreground)]">Productos</h1>
          <p className="text-sm text-[color:var(--muted-foreground)]">
            Gestiona el catálogo de productos de tu almacén
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-[calc(var(--radius)+4px)] bg-[color:var(--primary)] px-5 py-2 text-[color:var(--primary-foreground)] shadow-sm hover:bg-[color:var(--primary)]/90"
        >
          <Plus className="h-4 w-4" />
          Nuevo Producto
        </Button>
      </header>

      <ProductStats productos={productosFiltrados} />
      <ProductFilters
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
        selectedStatus={selectedStatus}
        onSearchChange={setSearchTerm}
        onCategoryChange={setSelectedCategory}
        onStatusChange={setSelectedStatus}
      />
      <ProductTable
        productos={productosFiltrados}
        loading={loading}
        error={error}
        onEdit={handleAbrirModalEdicion}
        onDelete={handleAbrirModalEliminar}
        onView={handleAbrirModalVer}
      />

      <Dialog open={isModalOpen} onOpenChange={(open) => {
        setIsModalOpen(open);
        if (!open) {
          setProductoAEditar(null);
        }
      }}>
        <DialogContent onClose={() => setIsModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>{productoAEditar ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
            <DialogDescription>
              {productoAEditar
                ? "Modifique los datos del producto. Los campos marcados con * son obligatorios."
                : "Agregue un nuevo producto al inventario. Los campos marcados con * son obligatorios."
              }
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            onSubmit={productoAEditar ? handleUpdateProduct : handleCreateProduct}
            onCancel={() => setIsModalOpen(false)}
            proveedores={proveedores}
            initialData={productoAEditar ? {
              nombre: productoAEditar.nombre,
              codigo: productoAEditar.codigo,
              categoria: productoAEditar.categoria,
              proveedor: productoAEditar.proveedor,
              precio: productoAEditar.precio,
              stock: productoAEditar.stock,
              stockMinimo: productoAEditar.stockMinimo,
              ubicacion: productoAEditar.ubicacion,
              descripcion: productoAEditar.descripcion,
            } : undefined}
          />
        </DialogContent>
      </Dialog>

      {/* AlertDialog para confirmación de eliminación */}
      <AlertDialog open={productoAEliminar !== null} onOpenChange={(open) => {
        if (!open) setProductoAEliminar(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar el producto "{productoAEliminar?.nombre}"?
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmarEliminar}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog para ver detalles del producto */}
      <Dialog open={productoAVer !== null} onOpenChange={(open) => {
        if (!open) setProductoAVer(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalles del Producto</DialogTitle>
            <DialogDescription>
              Información completa del producto seleccionado
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-[color:var(--muted-foreground)]">
                  Nombre
                </Label>
                <p className="text-[color:var(--foreground)] font-semibold">
                  {productoAVer?.nombre}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-[color:var(--muted-foreground)]">
                  Código
                </Label>
                <p className="text-[color:var(--foreground)]">
                  {productoAVer?.codigo}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-[color:var(--muted-foreground)]">
                  Categoría
                </Label>
                <p className="text-[color:var(--foreground)]">
                  {productoAVer?.categoria}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-[color:var(--muted-foreground)]">
                  Proveedor
                </Label>
                <p className="text-[color:var(--foreground)]">
                  {productoAVer?.proveedor}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-[color:var(--muted-foreground)]">
                  Precio
                </Label>
                <p className="text-[color:var(--foreground)] font-semibold">
                  {formatCurrency(productoAVer?.precio)}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-[color:var(--muted-foreground)]">
                  Stock Actual
                </Label>
                <p className="text-[color:var(--foreground)] font-semibold">
                  {productoAVer?.stock}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-[color:var(--muted-foreground)]">
                  Stock Mínimo
                </Label>
                <p className="text-[color:var(--foreground)]">
                  {productoAVer?.stockMinimo}
                </p>
              </div>
            </div>

            {productoAVer?.ubicacion && (
              <div className="space-y-1">
                <Label className="text-sm font-medium text-[color:var(--muted-foreground)]">
                  Ubicación en Almacén
                </Label>
                <p className="text-[color:var(--foreground)]">
                  {productoAVer.ubicacion}
                </p>
              </div>
            )}

            {productoAVer?.descripcion && (
              <div className="space-y-1">
                <Label className="text-sm font-medium text-[color:var(--muted-foreground)]">
                  Descripción
                </Label>
                <p className="text-[color:var(--foreground)]">
                  {productoAVer.descripcion}
                </p>
              </div>
            )}

            <div className="space-y-1">
              <Label className="text-sm font-medium text-[color:var(--muted-foreground)]">
                Estado
              </Label>
              <p className={`font-semibold ${
                productoAVer?.estado === 'Activo' ? 'text-green-600' :
                productoAVer?.estado === 'Stock Bajo' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {productoAVer?.estado}
              </p>
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => setProductoAVer(null)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
