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

const products = [
  {
    id: "PRD001",
    name: "Laptop Dell XPS 13",
    category: "Electrónicos",
    price: "$1,299.99",
    stock: { current: 15, min: 5 },
    status: { label: "Activo", variant: "success" as const },
    supplier: "Dell Inc.",
  },
  {
    id: "PRD002",
    name: "Mouse Inalámbrico Logitech MX",
    category: "Accesorios",
    price: "$89.99",
    stock: { current: 3, min: 10 },
    status: { label: "Stock bajo", variant: "warning" as const },
    supplier: "Logitech",
  },
  {
    id: "PRD003",
    name: "Monitor 4K Samsung 27\"",
    category: "Electrónicos",
    price: "$349.99",
    stock: { current: 8, min: 3 },
    status: { label: "Activo", variant: "success" as const },
    supplier: "Samsung",
  },
  {
    id: "PRD004",
    name: "Teclado Mecánico RGB",
    category: "Accesorios",
    price: "$129.90",
    stock: { current: 0, min: 5 },
    status: { label: "Agotado", variant: "danger" as const },
    supplier: "Corsair",
  },
  {
    id: "PRD005",
    name: "Tablet iPad Air",
    category: "Electrónicos",
    price: "$599.99",
    stock: { current: 12, min: 8 },
    status: { label: "Activo", variant: "success" as const },
    supplier: "Apple",
  },
  {
    id: "PRD006",
    name: "Impresora HP LaserJet",
    category: "Oficina",
    price: "$249.00",
    stock: { current: 2, min: 6 },
    status: { label: "Stock bajo", variant: "warning" as const },
    supplier: "HP",
  },
];


export function ProductTable() {
  return (
    <Card className="border-[color:var(--border)] bg-[color:var(--card)]/95">
      <CardHeader className="px-6 pt-6 pb-4">
        <CardTitle className="text-lg font-semibold text-[color:var(--foreground)]">Lista de productos</CardTitle>
        <p className="text-sm text-[color:var(--muted-foreground)]">
          {products.length} productos encontrados
        </p>
      </CardHeader>
      <CardContent className="px-0 pb-6">
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="bg-[color:var(--secondary)]">
                <TableHead>ID</TableHead>
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
              {products.map((product) => (
                <TableRow key={product.id} className="hover:bg-[color:var(--secondary)]/60">
                  <TableCell className="font-medium text-[color:var(--foreground)]/85">{product.id}</TableCell>
                  <TableCell className="font-semibold text-[color:var(--foreground)]">{product.name}</TableCell>
                  <TableCell className="text-[color:var(--foreground)]/70">{product.category}</TableCell>
                  <TableCell className="text-[color:var(--foreground)]">{product.price}</TableCell>
                  <TableCell className="text-[color:var(--foreground)]">
                    <span className="font-semibold text-[color:var(--foreground)]">{product.stock.current}</span>
                    <span className="text-[color:var(--muted-foreground)]"> / {product.stock.min}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.status.variant}>{product.status.label}</Badge>
                  </TableCell>
                  <TableCell className="text-[color:var(--foreground)]/80">{product.supplier}</TableCell>
                  <TableCell className="pr-6">
                    <div className="flex justify-end gap-2">
                      <button
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
                        aria-label={`Ver ${product.name}`}
                      >
                        <Eye className="h-4 w-4 text-blue-600" />
                      </button>
                      <button
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
                        aria-label={`Editar ${product.name}`}
                      >
                        <Pencil className="h-4 w-4 text-blue-600" />
                      </button>
                      <button
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-red-50 transition-colors"
                        aria-label={`Eliminar ${product.name}`}
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
