import { useState, useEffect, useMemo, useCallback } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { FileText, Download, RefreshCw } from 'lucide-react';
import { InventoryReportStats } from '../components/InventoryReportStats';
import { InventoryReportFilters } from '../components/InventoryReportFilters';
import { InventoryReportTable } from '../components/InventoryReportTable';
import { exportToExcel } from '@/lib/export-excel';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';

// Interfaz para los productos de Firestore
interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  precio: number;
  stock: number;
  stockMinimo: number;
  proveedor: string;
  ubicacion: string;
  descripcion: string;
  fechaCreacion: { toDate?: () => Date } | Date | string;
}

// Interfaz para el reporte calculado
export interface ReporteProducto {
  id: string;
  codigo: string;
  producto: string;
  categoria: string;
  stockActual: number;
  stockMinMax: string;
  valorUnitario: number;
  valorTotal: number;
  estado: 'Normal' | 'Crítico' | 'Bajo' | 'Agotado';
  ultimoMovimiento: string;
}

// Interfaz para los filtros
export interface FiltrosReporte {
  searchTerm: string;
  selectedCategory: string;
  selectedStatus: string;
  dateRange: {
    start: string;
    end: string;
  };
}

export function ReportesInventarioPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState<FiltrosReporte>({
    searchTerm: '',
    selectedCategory: 'todas',
    selectedStatus: 'todos',
    dateRange: {
      start: '2025-09-06',
      end: '2025-10-06'
    }
  });

  // Función para cargar datos de Firestore
  const cargarProductos = async () => {
    try {
      setLoading(true);
      const productosRef = collection(db, 'productos');
      const snapshot = await getDocs(productosRef);
      
      const productosData: Producto[] = [];
      snapshot.forEach((doc) => {
        productosData.push({
          id: doc.id,
          ...doc.data()
        } as Producto);
      });
      
      setProductos(productosData);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarProductos();
  }, []);

  // Función para determinar el estado del producto
  const determinarEstado = (stock: number, stockMinimo: number): ReporteProducto['estado'] => {
    if (stock === 0) return 'Agotado';
    if (stock < stockMinimo) return 'Crítico';
    if (stock <= stockMinimo * 1.2) return 'Bajo';
    return 'Normal';
  };

  // Función para procesar la fecha
  const procesarFecha = (fechaCreacion: Producto['fechaCreacion']): string => {
    if (!fechaCreacion) return '2024-01-15';
    
    if (typeof fechaCreacion === 'string') return fechaCreacion;
    if (fechaCreacion instanceof Date) return fechaCreacion.toISOString().split('T')[0];
    if (typeof fechaCreacion === 'object' && fechaCreacion.toDate) {
      return fechaCreacion.toDate().toISOString().split('T')[0];
    }
    
    return '2024-01-15';
  };

  // Calcular productos filtrados y con métricas
  const productosFiltrados = useMemo(() => {
    let resultado = productos.map((producto): ReporteProducto => ({
      id: producto.id,
      codigo: producto.codigo,
      producto: producto.nombre,
      categoria: producto.categoria,
      stockActual: producto.stock,
      stockMinMax: `${producto.stockMinimo} / ${producto.stockMinimo * 3}`, // Asumimos que máx = 3x mínimo
      valorUnitario: producto.precio,
      valorTotal: producto.stock * producto.precio,
      estado: determinarEstado(producto.stock, producto.stockMinimo),
      ultimoMovimiento: procesarFecha(producto.fechaCreacion)
    }));

    // Aplicar filtros
    if (filtros.searchTerm) {
      const searchLower = filtros.searchTerm.toLowerCase();
      resultado = resultado.filter(p => 
        p.producto.toLowerCase().includes(searchLower) ||
        p.codigo.toLowerCase().includes(searchLower) ||
        p.categoria.toLowerCase().includes(searchLower)
      );
    }

    if (filtros.selectedCategory !== 'todas') {
      resultado = resultado.filter(p => p.categoria === filtros.selectedCategory);
    }

    if (filtros.selectedStatus !== 'todos') {
      resultado = resultado.filter(p => p.estado.toLowerCase() === filtros.selectedStatus.toLowerCase());
    }

    return resultado;
  }, [productos, filtros]);

  // Funciones para actualizar filtros
  const actualizarFiltros = (nuevosFiltros: Partial<FiltrosReporte>) => {
    setFiltros(prev => ({ ...prev, ...nuevosFiltros }));
  };

  const { toast } = useToast();

  const handleExportar = useCallback(() => {
    if (productosFiltrados.length === 0) {
      toast({
        title: 'Sin datos para exportar',
        description: 'Ajusta los filtros para obtener resultados y vuelve a intentarlo.'
      });
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    exportToExcel<ReporteProducto>({
      data: productosFiltrados,
      columns: [
        { header: 'Código', accessor: (producto) => producto.codigo },
        { header: 'Producto', accessor: (producto) => producto.producto },
        { header: 'Categoría', accessor: (producto) => producto.categoria },
        { header: 'Stock Actual', accessor: (producto) => producto.stockActual },
        { header: 'Stock Mín/Máx', accessor: (producto) => producto.stockMinMax },
        { header: 'Valor Unitario', accessor: (producto) => formatCurrency(producto.valorUnitario) },
        { header: 'Valor Total', accessor: (producto) => formatCurrency(producto.valorTotal) },
        { header: 'Estado', accessor: (producto) => producto.estado },
        { header: 'Último Movimiento', accessor: (producto) => producto.ultimoMovimiento }
      ],
      fileName: `reporte-inventario-${today}`,
      sheetName: 'Inventario'
    });

    toast({
      title: 'Exportación completada',
      description: `Se exportaron ${productosFiltrados.length} productos.`
    });
  }, [productosFiltrados, toast]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Cargando datos del inventario...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes de Inventario</h1>
          <p className="mt-1 text-sm text-gray-600">
            Análisis detallado del estado y movimientos del inventario
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button 
            variant="outline" 
            className="flex items-center space-x-2"
            onClick={cargarProductos}
            disabled={loading}
          >
            <FileText className="h-4 w-4" />
            <span>Generar Reporte</span>
          </Button>
          <Button className="flex items-center space-x-2" onClick={handleExportar}>
            <Download className="h-4 w-4" />
            <span>Exportar</span>
          </Button>
        </div>
      </div>

      {/* Estadísticas del inventario */}
      <InventoryReportStats productos={productosFiltrados} />

      {/* Pestañas de navegación */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button className="border-b-2 border-blue-500 py-2 px-1 text-sm font-medium text-blue-600">
            Inventario Actual
          </button>
          <button className="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
            Movimientos
          </button>
          <button className="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
            Análisis
          </button>
        </nav>
      </div>

      {/* Filtros */}
      <InventoryReportFilters 
        filtros={filtros}
        onFiltrosChange={actualizarFiltros}
        categorias={[...new Set(productos.map(p => p.categoria))]}
      />

      {/* Tabla de inventario */}
      <InventoryReportTable productos={productosFiltrados} />
    </div>
  );
}
