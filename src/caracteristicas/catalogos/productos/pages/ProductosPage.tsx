import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductStats } from "../components/ProductStats";
import { ProductFilters } from "../components/ProductFilters";
import { ProductTable } from "../components/ProductTable";

export function ProductosPage() {
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
      <ProductTable />
    </div>
  );
}
