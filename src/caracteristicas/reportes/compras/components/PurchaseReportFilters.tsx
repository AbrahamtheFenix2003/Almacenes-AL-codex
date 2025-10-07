import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Calendar } from 'lucide-react';
import type { FiltrosCompras } from '../types';

interface Props {
  filtros: FiltrosCompras;
  onFiltrosChange: (filtros: Partial<FiltrosCompras>) => void;
  proveedores: string[];
}

export function PurchaseReportFilters({ filtros, onFiltrosChange, proveedores }: Props) {
  const handleInputChange = (field: keyof FiltrosCompras, value: string | { start: string; end: string }) => {
    onFiltrosChange({ [field]: value });
  };

  const handleLimpiarFiltros = () => {
    onFiltrosChange({
      searchTerm: '',
      selectedSupplier: 'todos',
      selectedStatus: 'todos',
      dateRange: {
        start: '',
        end: ''
      }
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Filtros de Búsqueda</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Campo de búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar órdenes..."
            value={filtros.searchTerm}
            onChange={(e) => handleInputChange('searchTerm', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Selector de proveedor */}
        <Select
          value={filtros.selectedSupplier}
          onChange={(e) => handleInputChange('selectedSupplier', e.target.value)}
        >
          <option value="todos">Todos los proveedores</option>
          {proveedores.map((proveedor) => (
            <option key={proveedor} value={proveedor}>
              {proveedor}
            </option>
          ))}
        </Select>

        {/* Selector de estado */}
        <Select
          value={filtros.selectedStatus}
          onChange={(e) => handleInputChange('selectedStatus', e.target.value)}
        >
          <option value="todos">Todos los estados</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Recibido">Recibido</option>
        </Select>

        {/* Fecha inicio */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="date"
            value={filtros.dateRange.start}
            onChange={(e) => handleInputChange('dateRange', { ...filtros.dateRange, start: e.target.value })}
            className="pl-10"
          />
        </div>

        {/* Fecha fin */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="date"
            value={filtros.dateRange.end}
            onChange={(e) => handleInputChange('dateRange', { ...filtros.dateRange, end: e.target.value })}
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <Button variant="outline" className="mr-2" onClick={handleLimpiarFiltros}>
          Limpiar Filtros
        </Button>
        <Button>
          Aplicar Filtros
        </Button>
      </div>
    </div>
  );
}