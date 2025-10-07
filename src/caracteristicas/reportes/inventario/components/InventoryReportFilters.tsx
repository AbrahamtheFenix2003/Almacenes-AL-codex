import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Calendar, X } from 'lucide-react';
import type { FiltrosReporte } from '../pages/ReportesInventarioPage';

interface InventoryReportFiltersProps {
  filtros: FiltrosReporte;
  onFiltrosChange: (nuevosFiltros: Partial<FiltrosReporte>) => void;
  categorias: string[];
}

export function InventoryReportFilters({ 
  filtros, 
  onFiltrosChange, 
  categorias 
}: InventoryReportFiltersProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltrosChange({ searchTerm: e.target.value });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltrosChange({ selectedCategory: e.target.value });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltrosChange({ selectedStatus: e.target.value });
  };

  const handleClearFilters = () => {
    onFiltrosChange({
      searchTerm: '',
      selectedCategory: 'todas',
      selectedStatus: 'todos'
    });
  };

  const hasActiveFilters = filtros.searchTerm || 
                          filtros.selectedCategory !== 'todas' || 
                          filtros.selectedStatus !== 'todos';

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Filtros de inventario</CardTitle>
        {hasActiveFilters && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleClearFilters}
            className="h-8 px-3"
          >
            <X className="h-4 w-4 mr-1" />
            Limpiar filtros
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Filtro de búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar productos..."
              className="pl-10"
              value={filtros.searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          {/* Filtro de categorías */}
          <Select 
            value={filtros.selectedCategory} 
            onChange={handleCategoryChange}
          >
            <option value="todas">Todas las categorías</option>
            {categorias.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </Select>

          {/* Filtro de estados */}
          <Select 
            value={filtros.selectedStatus} 
            onChange={handleStatusChange}
          >
            <option value="todos">Todos los estados</option>
            <option value="normal">Normal</option>
            <option value="crítico">Crítico</option>
            <option value="bajo">Bajo</option>
            <option value="agotado">Agotado</option>
          </Select>

          {/* Selector de rango de fechas */}
          <div className="flex items-center space-x-2">
            <Button variant="outline" className="w-full justify-start text-left font-normal">
              <Calendar className="mr-2 h-4 w-4" />
              {filtros.dateRange.start} - {filtros.dateRange.end}
            </Button>
          </div>
        </div>

        {/* Indicadores de filtros activos */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
            {filtros.searchTerm && (
              <div className="flex items-center bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm">
                <Search className="h-3 w-3 mr-1" />
                Búsqueda: "{filtros.searchTerm}"
              </div>
            )}
            {filtros.selectedCategory !== 'todas' && (
              <div className="flex items-center bg-green-50 text-green-700 px-2 py-1 rounded text-sm">
                Categoría: {filtros.selectedCategory}
              </div>
            )}
            {filtros.selectedStatus !== 'todos' && (
              <div className="flex items-center bg-orange-50 text-orange-700 px-2 py-1 rounded text-sm">
                Estado: {filtros.selectedStatus}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}