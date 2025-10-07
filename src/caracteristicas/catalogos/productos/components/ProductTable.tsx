import { Eye, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import type { Producto } from "../pages/ProductosPage";

interface ProductTableProps {
  productos: Producto[];
  loading: boolean;
  error?: string | null;
  onEdit: (producto: Producto) => void;
  onDelete: (productId: string, productName: string) => void;
  onView: (producto: Producto) => void;
}

export function ProductTable({ productos, loading, error, onEdit, onDelete, onView }: ProductTableProps) {
  // Función auxiliar para obtener el variant del Badge según el estado
  const getStatusVariant = (estado: string): "success" | "warning" | "danger" => {
    if (estado === "Activo") return "success";
    if (estado === "Stock Bajo") return "warning";
    return "danger";
  };
  // Renderizado condicional: mostrar mensaje de error
  if (error) {
    return (
      <Card className="border-[color:var(--border)] bg-[color:var(--card)]/95">
        <CardContent className="px-6 py-12">
          <div className="flex flex-col items-center justify-center gap-2">
            <p className="text-lg font-semibold text-red-600">Error al cargar productos</p>
            <p className="text-sm text-[color:var(--muted-foreground)] text-center">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Renderizado condicional: mostrar mensaje de carga
  if (loading) {
    return (
      <Card className="border-[color:var(--border)] bg-[color:var(--card)]/95">
        <CardContent className="px-6 py-12">
          <div className="flex items-center justify-center">
            <p className="text-lg text-[color:var(--muted-foreground)]">
              Cargando productos...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[color:var(--border)] bg-[color:var(--card)]/95">
      <CardHeader className="px-6 pt-6 pb-4">
        <CardTitle className="text-lg font-semibold text-[color:var(--foreground)]">Lista de productos</CardTitle>
        <p className="text-sm text-[color:var(--muted-foreground)]">
          {productos.length} productos encontrados
        </p>
      </CardHeader>
      <CardContent className="px-0 pb-6">
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="bg-[color:var(--secondary)]">
                <TableHead>CODIGO</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productos.map((producto) => (
                <TableRow key={producto.id} className="hover:bg-[color:var(--secondary)]/60">
                  <TableCell className="font-medium text-[color:var(--foreground)]/85">{producto.codigo}</TableCell>
                  <TableCell className="font-semibold text-[color:var(--foreground)]">{producto.nombre}</TableCell>
                  <TableCell className="text-[color:var(--foreground)]/70">{producto.categoria}</TableCell>
                  <TableCell className="text-[color:var(--foreground)]">
                    {formatCurrency(producto.precio)}
                  </TableCell>
                  <TableCell className="text-[color:var(--foreground)]">
                    <span className="font-semibold text-[color:var(--foreground)]">{producto.stock}</span>
                    <span className="text-[color:var(--muted-foreground)]"> / {producto.stockMinimo}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(producto.estado)}>{producto.estado}</Badge>
                  </TableCell>
                  <TableCell className="text-[color:var(--foreground)]/80">{producto.proveedor}</TableCell>
                  <TableCell className="pr-6">
                    <div className="flex justify-end gap-2">
                      <button
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
                        aria-label={`Ver ${producto.nombre}`}
                        onClick={() => onView(producto)}
                      >
                        <Eye className="h-4 w-4 text-blue-600" />
                      </button>
                      <button
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
                        aria-label={`Editar ${producto.nombre}`}
                        onClick={() => onEdit(producto)}
                      >
                        <Pencil className="h-4 w-4 text-blue-600" />
                      </button>
                      <button
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-red-50 transition-colors"
                        aria-label={`Eliminar ${producto.nombre}`}
                        onClick={() => onDelete(producto.id, producto.nombre)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
