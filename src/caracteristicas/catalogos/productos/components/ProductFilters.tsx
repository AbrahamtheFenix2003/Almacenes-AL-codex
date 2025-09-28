import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function ProductFilters() {
  return (
    <div className="rounded-[var(--radius-xl)] border border-[color:var(--border)] bg-[color:var(--card)]/95 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex w-full items-center gap-3 lg:max-w-xl">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted-foreground)]" />
            <Input
              placeholder="Buscar productos..."
              className="h-11 w-full rounded-[calc(var(--radius)+4px)] border-[color:var(--border)] bg-[color:var(--input-background)] pl-10 text-sm"
            />
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row lg:items-center">
          <Select aria-label="Filtrar por categoria" defaultValue="all" className="min-w-[200px]">
            <option value="all">Todas las categorias</option>
            <option value="electronics">Electrónicos</option>
            <option value="accessories">Accesorios</option>
            <option value="office">Oficina</option>
          </Select>

          <Button
            variant="outline"
            className="flex items-center gap-2 rounded-[calc(var(--radius)+4px)] border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--foreground)] hover:bg-[color:var(--secondary)]"
          >
            <SlidersHorizontal className="h-4 w-4 text-[color:var(--primary)]" />
            Más filtros
          </Button>
        </div>
      </div>
    </div>
  );
}
