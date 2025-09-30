import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { ProductStats } from "../components/ProductStats";
import { ProductFilters } from "../components/ProductFilters";
import { ProductTable } from "../components/ProductTable";

// Interface para definir la estructura de un producto
export interface Producto {
  id: string;
  nombre: string;
  categoria: string;
  precio: number;
  stock: number;
  stockMinimo: number;
  proveedor: string;
  estado: 'Activo' | 'Stock Bajo' | 'Agotado';
}

export function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const productosRef = collection(db, 'productos');

    // Escuchar cambios en tiempo real con onSnapshot
    const unsubscribe = onSnapshot(
      productosRef,
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
            nombre: data.nombre,
            categoria: data.categoria,
            precio: data.precio,
            stock: data.stock,
            stockMinimo: data.stockMinimo,
            proveedor: data.proveedor,
            estado,
          };
        });

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
  }, []);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[color:var(--foreground)]">Productos</h1>
          <p className="text-sm text-[color:var(--muted-foreground)]">
            Gestiona el catálogo de productos de tu almacén
          </p>
        </div>
        <Button className="flex items-center gap-2 rounded-[calc(var(--radius)+4px)] bg-[color:var(--primary)] px-5 py-2 text-[color:var(--primary-foreground)] shadow-sm hover:bg-[color:var(--primary)]/90">
          <Plus className="h-4 w-4" />
          Nuevo producto
        </Button>
      </header>

      <ProductStats />
      <ProductFilters />
      <ProductTable productos={productos} loading={loading} error={error} />
    </div>
  );
}
