import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FileText, Download, RefreshCw } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PurchaseReportStats } from '../components/PurchaseReportStats';
import { PurchaseReportFilters } from '../components/PurchaseReportFilters';
import { PurchaseReportTable } from '../components/PurchaseReportTable';
import { PurchasesByDayChart } from '../components/PurchasesByDayChart';
import type { OrdenCompra, FiltrosCompras, DatosGraficoCompras } from '../types';
import { exportToExcel } from '@/lib/export-excel';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';

export function ReportesComprasPage() {
  const [ordenes, setOrdenes] = useState<OrdenCompra[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosCompras>({
    searchTerm: '',
    selectedSupplier: 'todos',
    selectedStatus: 'todos',
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 días atrás
      end: new Date().toISOString().split('T')[0] // Hoy
    }
  });

  // Función para cargar las órdenes de compra desde Firebase
  const cargarOrdenesCompra = useCallback(async () => {
    try {
      setLoading(true);
      const ordenesRef = collection(db, 'ordenesCompra');
      const snapshot = await getDocs(ordenesRef);
      
      const ordenesData: OrdenCompra[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        ordenesData.push({
          id: doc.id,
          numeroOrden: data.numeroOrden || '',
          fecha: data.fecha || '',
          proveedorId: data.proveedorId || '',
          proveedorNombre: data.proveedorNombre || '',
          proveedorContacto: data.proveedorContacto || '',
          fechaEntrega: data.fechaEntrega || '',
          productosResumen: data.productosResumen || '',
          cantidadProductos: data.cantidadProductos || 0,
          total: data.total || 0,
          estado: data.estado || 'Pendiente',
          usuario: data.usuario || '',
          creadoEn: data.creadoEn
        });
      });

      setOrdenes(ordenesData);
    } catch (error) {
      console.error('Error al cargar órdenes de compra:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarOrdenesCompra();
  }, [cargarOrdenesCompra]);

  // Función para actualizar filtros
  const actualizarFiltros = (nuevosFiltros: Partial<FiltrosCompras>) => {
    setFiltros(prev => ({ ...prev, ...nuevosFiltros }));
  };

  // Obtener lista única de proveedores
  const proveedores = useMemo(() => {
    const proveedoresUnicos = [...new Set(ordenes.map(orden => orden.proveedorNombre))];
    return proveedoresUnicos.filter(Boolean).sort();
  }, [ordenes]);

  // Filtrar órdenes según los filtros aplicados
  const ordenesFiltradas = useMemo(() => {
    return ordenes.filter(orden => {
      // Filtro por término de búsqueda
      if (filtros.searchTerm) {
        const termino = filtros.searchTerm.toLowerCase();
        const coincide = [
          orden.numeroOrden,
          orden.proveedorNombre,
          orden.estado,
          orden.usuario
        ].some(campo => campo.toLowerCase().includes(termino));
        
        if (!coincide) return false;
      }

      // Filtro por proveedor
      if (filtros.selectedSupplier !== 'todos') {
        if (orden.proveedorNombre !== filtros.selectedSupplier) return false;
      }

      // Filtro por estado
      if (filtros.selectedStatus !== 'todos') {
        if (orden.estado !== filtros.selectedStatus) return false;
      }

      // Filtro por rango de fechas
      if (filtros.dateRange.start) {
        if (orden.fecha < filtros.dateRange.start) return false;
      }
      if (filtros.dateRange.end) {
        if (orden.fecha > filtros.dateRange.end) return false;
      }

      return true;
    });
  }, [ordenes, filtros]);

  // Datos agregados para el gráfico por día
  const datosGrafico = useMemo((): DatosGraficoCompras[] => {
    const agrupado: Record<string, number> = {};
    
    ordenesFiltradas.forEach(orden => {
      const fecha = orden.fecha;
      if (!agrupado[fecha]) {
        agrupado[fecha] = 0;
      }
      agrupado[fecha] += orden.total;
    });

    // Convertir a array y ordenar por fecha
    return Object.entries(agrupado)
      .map(([fecha, compras]) => ({
        fecha: fecha.split('-').slice(1).join('/'), // Convertir 2025-10-03 a 10/03
        compras
      }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha));
  }, [ordenesFiltradas]);

  const handleGenerarReporte = () => {
    cargarOrdenesCompra();
  };

  const { toast } = useToast();

  const handleExportar = useCallback(() => {
    if (ordenesFiltradas.length === 0) {
      toast({
        title: 'Sin datos para exportar',
        description: 'Ajusta los filtros o genera un nuevo reporte antes de exportar.'
      });
      return;
    }

    const formatProductos = (cantidad: number) => `${cantidad} items`;
    const today = new Date().toISOString().split('T')[0];

    exportToExcel<OrdenCompra>({
      data: ordenesFiltradas,
      columns: [
        { header: 'Número', accessor: (orden) => orden.numeroOrden },
        { header: 'Fecha', accessor: (orden) => orden.fecha },
        { header: 'Proveedor', accessor: (orden) => orden.proveedorNombre },
        { header: 'Productos', accessor: (orden) => formatProductos(orden.cantidadProductos) },
        { header: 'Total', accessor: (orden) => formatCurrency(orden.total) },
        { header: 'Estado', accessor: (orden) => orden.estado },
        { header: 'Entrega', accessor: (orden) => orden.fechaEntrega }
      ],
      fileName: `reporte-compras-${today}`,
      sheetName: 'Compras'
    });

    toast({
      title: 'Exportación completada',
      description: `Se exportaron ${ordenesFiltradas.length} órdenes de compra.`
    });
  }, [ordenesFiltradas, toast]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes de Compras</h1>
          <p className="mt-1 text-sm text-gray-600">
            Análisis detallado de órdenes de compra y proveedores
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button 
            variant="outline" 
            className="flex items-center space-x-2" 
            onClick={handleGenerarReporte}
            disabled={loading}
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            <span>Generar Reporte</span>
          </Button>
          <Button 
            className="flex items-center space-x-2"
            onClick={handleExportar}
          >
            <Download className="h-4 w-4" />
            <span>Exportar</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="ordenes">
        <TabsList className="mb-4">
          <TabsTrigger value="ordenes">Órdenes de Compra</TabsTrigger>
          <TabsTrigger value="proveedores">Análisis Proveedores</TabsTrigger>
          <TabsTrigger value="tendencias">Tendencias</TabsTrigger>
        </TabsList>

        {/* Tab: Órdenes de Compra */}
        <TabsContent value="ordenes">
          <div className="space-y-6">
            <PurchaseReportStats ordenes={ordenesFiltradas} />
            <PurchaseReportFilters 
              filtros={filtros}
              onFiltrosChange={actualizarFiltros}
              proveedores={proveedores}
            />
            <PurchaseReportTable ordenes={ordenesFiltradas} />
            <PurchasesByDayChart data={datosGrafico} />
          </div>
        </TabsContent>

        {/* Tab: Análisis Proveedores */}
        <TabsContent value="proveedores">
          <div className="text-center text-gray-400 py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Análisis de Proveedores</h3>
            <p className="text-sm">
              Vista de análisis de proveedores próximamente...
            </p>
          </div>
        </TabsContent>

        {/* Tab: Tendencias */}
        <TabsContent value="tendencias">
          <div className="text-center text-gray-400 py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Tendencias de Compras</h3>
            <p className="text-sm">
              Vista de tendencias próximamente...
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
