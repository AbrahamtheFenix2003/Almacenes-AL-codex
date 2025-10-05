import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export interface Proveedor {
  id: string;
  nombre: string;
}

interface PurchaseOrderFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  selectedSupplier: string;
  onSupplierChange: (value: string) => void;
  proveedores: Proveedor[];
}

export function PurchaseOrderFilters({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedSupplier,
  onSupplierChange,
  proveedores,
}: PurchaseOrderFiltersProps) {
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
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Estado Filter */}
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Aprobado">Aprobado</option>
          <option value="En Tránsito">En Tránsito</option>
          <option value="Recibido">Recibido</option>
          <option value="Cancelado">Cancelado</option>
        </select>

        {/* Proveedor Filter */}
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={selectedSupplier}
          onChange={(e) => onSupplierChange(e.target.value)}
        >
          <option value="">Todos los proveedores</option>
          {proveedores.map((proveedor) => (
            <option key={proveedor.id} value={proveedor.id}>
              {proveedor.nombre}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
