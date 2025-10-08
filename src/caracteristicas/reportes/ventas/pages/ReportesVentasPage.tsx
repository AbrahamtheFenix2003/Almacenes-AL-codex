import { useEffect, useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FileText, Download, RefreshCw } from 'lucide-react';
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SalesSummaryStats } from '../components/SalesSummaryStats';
import { SalesFilters } from '../components/SalesFilters';
import { SalesTable, type VentaReporte } from '../components/SalesTable';
import type { DescuentoManual } from '@/caracteristicas/ventas/puntoDeVenta/types';
import { SalesByDayChart } from '../components/SalesByDayChart';
import { SalesByPaymentMethodChart } from '../components/SalesByPaymentMethodChart';
import { SaleDetailModal } from '../components/SaleDetailModal';
import { exportToExcel } from '@/lib/export-excel';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';

// Tipos base de Firestore (estructura real de la BD)
interface ItemVenta {
  productoId: string;
  productoNombre: string;
  productoCodigo: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  precioUnitarioOriginal?: number;
  descuentoManual?: DescuentoManual;
}

interface VentaFirestore {
  numeroVenta: string;
  clienteId: string;
  clienteNombre: string;
  items: ItemVenta[];
  subtotal: number;
  total: number;
  usuario: string;
  fecha: Timestamp | { toDate: () => Date } | Date | string;
  creadoEn?: Timestamp;
  // Campos opcionales que pueden no existir en todos los documentos
  tipo?: 'Individual' | 'Empresa';
  metodoPago?: 'Efectivo' | 'Tarjeta' | 'Transferencia' | 'SINPE';
}

interface FiltrosVentas {
  searchTerm: string;
  tipo: 'todos' | 'individual' | 'empresa';
  metodo: 'todos' | 'efectivo' | 'tarjeta' | 'transferencia' | 'sinpe';
  dateRange: { start: string; end: string };
}

interface DatosDia { fecha: string; ventas: number; total: number; }
interface DatosMetodo { [key: string]: string | number | undefined; metodo: string; valor: number; color?: string; }

const metodoColors: Record<string,string> = {
  Transferencia: '#38bdf8',
  Tarjeta: '#a78bfa',
  Efectivo: '#f87171',
  SINPE: '#34d399'
};

export function ReportesVentasPage() {
  const [ventas, setVentas] = useState<VentaReporte[]>([]);
  const [loading, setLoading] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<VentaReporte | null>(null);
  const [filtros, setFiltros] = useState<FiltrosVentas>({
    searchTerm: '',
    tipo: 'todos',
    metodo: 'todos',
    dateRange: {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    }
  });

  const procesarFecha = (f: VentaFirestore['fecha']): string => {
    if (!f) return '';
    if (typeof f === 'string') return f.split('T')[0];
    if (f instanceof Date) return f.toISOString().split('T')[0];
    if (typeof f === 'object' && 'toDate' in f) return f.toDate().toISOString().split('T')[0];
    return '';
  };

  const resolverNumeroOrden = (numero: string): number => {
    if (!numero) return 0;
    const matches = numero.match(/\d+/g);
    if (!matches) return 0;
    // Unir todos los grupos numéricos para evitar resultados inconsistentes (ej: VNT-001-2025)
    return parseInt(matches.join(''), 10) || 0;
  };

  const cargarVentas = useCallback(async () => {
    try {
      setLoading(true);
      const ref = collection(db, 'ventas');
      const snap = await getDocs(ref);
      const data: VentaReporte[] = [];
      snap.forEach(doc => {
        const d = doc.data() as Partial<VentaFirestore>;
        if (!d.numeroVenta) return;
        
        // Calcular cantidad total de productos
        const cantidadProductos = d.items?.reduce((sum, item) => sum + item.cantidad, 0) || 0;
        
        // Determinar tipo de cliente correctamente
        let tipoCliente: 'Individual' | 'Empresa';
        if (d.tipo) {
          // Si existe el campo tipo en la venta, usarlo directamente
          tipoCliente = d.tipo;
        } else if (d.clienteId === 'general') {
          // Cliente general es siempre Individual
          tipoCliente = 'Individual';
        } else {
          // Para ventas antiguas sin campo tipo, asumir Individual por defecto
          // (esto es más conservador que asumir Empresa)
          tipoCliente = 'Individual';
        }
        
        // Estimar margen promedio (25% por defecto si no existe)
        const margenEstimado = 25;
        
        data.push({
          numero: d.numeroVenta,
          fecha: procesarFecha(d.fecha ?? d.creadoEn ?? new Date()),
          cliente: d.clienteNombre ?? 'Cliente',
          tipo: tipoCliente as 'Individual' | 'Empresa',
          productos: cantidadProductos,
          items: d.items ?? [],
          total: d.total ?? 0,
          metodoPago: (d.metodoPago ?? 'Efectivo') as VentaReporte['metodoPago'],
          vendedor: d.usuario ?? 'Sistema',
          margen: margenEstimado
        });
      });
      data.sort((a, b) => resolverNumeroOrden(b.numero) - resolverNumeroOrden(a.numero));
      setVentas(data);
    } catch (e) {
      console.error('Error cargando ventas', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargarVentas(); }, [cargarVentas]);

  const actualizarFiltros = (f: Partial<FiltrosVentas>) => setFiltros(prev => ({ ...prev, ...f }));

  const ventasFiltradas = useMemo(() => {
    return ventas.filter(v => {
      // filtro por fecha
      const fechaOk = (!filtros.dateRange.start || v.fecha >= filtros.dateRange.start) && (!filtros.dateRange.end || v.fecha <= filtros.dateRange.end);
      if (!fechaOk) return false;
      // filtro por tipo
      if (filtros.tipo !== 'todos') {
        if (filtros.tipo === 'individual' && v.tipo !== 'Individual') return false;
        if (filtros.tipo === 'empresa' && v.tipo !== 'Empresa') return false;
      }
      // filtro por método
      if (filtros.metodo !== 'todos') {
        const mapMetodo: Record<string,string> = {
          efectivo: 'Efectivo',
          tarjeta: 'Tarjeta',
          transferencia: 'Transferencia',
          sinpe: 'SINPE'
        };
        if (v.metodoPago !== mapMetodo[filtros.metodo]) return false;
      }
      // filtro búsqueda
      if (filtros.searchTerm) {
        const t = filtros.searchTerm.toLowerCase();
        const hay = [v.numero, v.cliente, v.vendedor, v.metodoPago].some(fv => fv.toLowerCase().includes(t));
        if (!hay) return false;
      }
      return true;
    });
  }, [ventas, filtros]);

  const datosDia: DatosDia[] = useMemo(() => {
    const agrupado: Record<string,{ total: number; ventas: number }> = {};
    ventasFiltradas.forEach(v => {
      if (!agrupado[v.fecha]) agrupado[v.fecha] = { total: 0, ventas: 0 };
      agrupado[v.fecha].total += v.total;
      agrupado[v.fecha].ventas += 1;
    });
    return Object.entries(agrupado)
      .sort((a,b)=> a[0].localeCompare(b[0]))
      .map(([fecha, val]) => ({ fecha: fecha.slice(5), ventas: val.total, total: val.total }));
  }, [ventasFiltradas]);

  const datosMetodo: DatosMetodo[] = useMemo(() => {
    const agrupado: Record<string, number> = {};
    ventasFiltradas.forEach(v => { agrupado[v.metodoPago] = (agrupado[v.metodoPago] ?? 0) + v.total; });
    const total = Object.values(agrupado).reduce((s, v) => s + v, 0) || 1;
    return Object.entries(agrupado).map(([metodo, valor]) => ({
      metodo,
      valor: Number(((valor / total) * 100).toFixed(1)),
      color: metodoColors[metodo] || '#3b82f6'
    }));
  }, [ventasFiltradas]);

  const { toast } = useToast();

  const handleExportar = useCallback(() => {
    if (ventasFiltradas.length === 0) {
      toast({
        title: 'Sin datos para exportar',
        description: 'Genera o filtra ventas antes de intentar exportar.'
      });
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    exportToExcel<VentaReporte>({
      data: ventasFiltradas,
      columns: [
        { header: 'Número', accessor: (venta) => venta.numero },
        { header: 'Fecha', accessor: (venta) => venta.fecha },
        { header: 'Cliente', accessor: (venta) => venta.cliente },
        { header: 'Tipo', accessor: (venta) => venta.tipo },
        { header: 'Productos', accessor: (venta) => venta.productos },
        { header: 'Total', accessor: (venta) => formatCurrency(venta.total) },
        { header: 'Método de Pago', accessor: (venta) => venta.metodoPago },
        { header: 'Vendedor', accessor: (venta) => venta.vendedor },
        { header: 'Margen (%)', accessor: (venta) => `${venta.margen}%` }
      ],
      fileName: `reporte-ventas-${today}`,
      sheetName: 'Ventas'
    });

    toast({
      title: 'Exportación completada',
      description: `Se exportaron ${ventasFiltradas.length} ventas.`
    });
  }, [ventasFiltradas, toast]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes de Ventas</h1>
          <p className="mt-1 text-sm text-gray-600">Análisis detallado de ventas, clientes y rendimiento comercial</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button variant="outline" className="flex items-center space-x-2" onClick={cargarVentas} disabled={loading}>
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            <span>Generar Reporte</span>
          </Button>
          <Button className="flex items-center space-x-2" onClick={handleExportar}>
            <Download className="h-4 w-4" />
            <span>Exportar</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="ventas">
        <TabsList className="mb-4">
          <TabsTrigger value="ventas">Registro de Ventas</TabsTrigger>
          <TabsTrigger value="productos">Productos</TabsTrigger>
          <TabsTrigger value="vendedores">Vendedores</TabsTrigger>
          <TabsTrigger value="tendencias">Tendencias</TabsTrigger>
        </TabsList>
        <TabsContent value="ventas">
          <SalesSummaryStats ventas={ventasFiltradas} />
          <SalesFilters filtros={filtros} onFiltrosChange={actualizarFiltros} />
          <SalesTable ventas={ventasFiltradas} onView={setVentaSeleccionada} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <SalesByDayChart data={datosDia} />
            <SalesByPaymentMethodChart data={datosMetodo} />
          </div>
        </TabsContent>
        <TabsContent value="productos">
          <div className="text-center text-gray-400 py-12">(Vista de productos próximamente...)</div>
        </TabsContent>
        <TabsContent value="vendedores">
          <div className="text-center text-gray-400 py-12">(Vista de vendedores próximamente...)</div>
        </TabsContent>
        <TabsContent value="tendencias">
          <div className="text-center text-gray-400 py-12">(Vista de tendencias próximamente...)</div>
        </TabsContent>
      </Tabs>

      {/* Modal de detalle de venta */}
      <SaleDetailModal 
        venta={ventaSeleccionada}
        isOpen={!!ventaSeleccionada}
        onClose={() => setVentaSeleccionada(null)}
      />
    </div>
  );
}
