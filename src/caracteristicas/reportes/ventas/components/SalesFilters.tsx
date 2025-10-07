import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Calendar, X } from 'lucide-react';

export interface FiltrosVentas {
  searchTerm: string;
  tipo: 'todos' | 'individual' | 'empresa';
  metodo: 'todos' | 'efectivo' | 'tarjeta' | 'transferencia' | 'sinpe';
  dateRange: { start: string; end: string };
}

interface Props {
  filtros: FiltrosVentas;
  onFiltrosChange: (f: Partial<FiltrosVentas>) => void;
}

export function SalesFilters({ filtros, onFiltrosChange }: Props) {
  function handleChange<K extends keyof FiltrosVentas>(key: K, value: FiltrosVentas[K]) {
    onFiltrosChange({ [key]: value } as Partial<FiltrosVentas>);
  }

  function clear() {
    onFiltrosChange({
      searchTerm: '',
      tipo: 'todos',
      metodo: 'todos',
      dateRange: {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      }
    });
  }

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Filtros de Búsqueda</CardTitle>
        <Button variant="ghost" size="sm" onClick={clear} className="text-xs flex items-center space-x-1">
          <X className="h-3 w-3" /> <span>Limpiar</span>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar ventas..."
              className="pl-10"
              value={filtros.searchTerm}
              onChange={e => handleChange('searchTerm', e.target.value)}
            />
          </div>
          <Select value={filtros.tipo} onChange={e => handleChange('tipo', e.target.value as FiltrosVentas['tipo'])}>
            <option value="todos">Todos los tipos</option>
            <option value="individual">Individual</option>
            <option value="empresa">Empresa</option>
          </Select>
          <Select value={filtros.metodo} onChange={e => handleChange('metodo', e.target.value as FiltrosVentas['metodo'])}>
            <option value="todos">Todos los métodos</option>
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="transferencia">Transferencia</option>
            <option value="sinpe">SINPE</option>
          </Select>
          <Input type="date" value={filtros.dateRange.start} onChange={e => handleChange('dateRange', { ...filtros.dateRange, start: e.target.value })} />
          <Input type="date" value={filtros.dateRange.end} onChange={e => handleChange('dateRange', { ...filtros.dateRange, end: e.target.value })} />
        </div>
        <div className="mt-2 text-xs text-gray-500 flex items-center"><Calendar className="h-3 w-3 mr-1" /> Rango: {filtros.dateRange.start} a {filtros.dateRange.end}</div>
      </CardContent>
    </Card>
  );
}
