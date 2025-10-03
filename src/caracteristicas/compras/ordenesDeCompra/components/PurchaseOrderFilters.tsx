import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function PurchaseOrderFilters() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Filtros de Búsqueda</h3>
      <div className="grid gap-4 md:grid-cols-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar orden, proveedor, usuario..."
            className="pl-10"
          />
        </div>

        {/* Estado Filter */}
        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
          <option>Todos los estados</option>
          <option>Pendiente</option>
          <option>Aprobado</option>
          <option>En Tránsito</option>
          <option>Recibido</option>
          <option>Cancelado</option>
        </select>

        {/* Proveedor Filter */}
        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
          <option>Todos los proveedores</option>
          <option>Dell Technologies</option>
          <option>Logitech International</option>
          <option>Samsung Electronics</option>
          <option>Apple Inc.</option>
          <option>Corsair Gaming</option>
        </select>
      </div>
    </div>
  );
}
