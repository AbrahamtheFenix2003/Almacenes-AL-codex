import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Search } from "lucide-react";

interface MovementFiltersProps {
  onSearchChange?: (value: string) => void;
  onTypeChange?: (value: string) => void;
  onPeriodChange?: (value: string) => void;
}

export function MovementFilters({
  onSearchChange,
  onTypeChange,
  onPeriodChange,
}: MovementFiltersProps) {
  return (
    <div className="rounded-[var(--radius-xl)] border border-[color:var(--border)] bg-[color:var(--card)] p-6">
      <h3 className="text-sm font-medium mb-4">Filtros de Búsqueda</h3>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted-foreground)]" />
          <Input
            placeholder="Buscar producto, documento, usuario..."
            className="pl-9"
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
        </div>

        <Select
          onChange={(e) => onTypeChange?.(e.target.value)}
          aria-label="Filtrar por tipo"
        >
          <option value="all">Todos los tipos</option>
          <option value="entrada">Entrada</option>
          <option value="salida">Salida</option>
        </Select>

        <Select
          onChange={(e) => onPeriodChange?.(e.target.value)}
          aria-label="Filtrar por periodo"
        >
          <option value="all">Todos los periodos</option>
          <option value="today">Hoy</option>
          <option value="week">Últimos 7 días</option>
          <option value="month">Último mes</option>
          <option value="quarter">Último trimestre</option>
          <option value="year">Último año</option>
        </Select>
      </div>
    </div>
  );
}
