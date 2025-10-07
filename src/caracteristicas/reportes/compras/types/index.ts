import type { Timestamp } from 'firebase/firestore';

export interface OrdenCompra {
  id?: string;
  numeroOrden: string;
  fecha: string;
  proveedorId: string;
  proveedorNombre: string;
  proveedorContacto: string;
  fechaEntrega: string;
  productosResumen: string;
  cantidadProductos: number;
  total: number;
  estado: 'Pendiente' | 'Recibido';
  usuario: string;
  creadoEn?: Timestamp;
}

export interface FiltrosCompras {
  searchTerm: string;
  selectedSupplier: string;
  selectedStatus: string;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface DatosGraficoCompras {
  fecha: string;
  compras: number;
}

export interface EstadisticasCompras {
  totalCompras: number;
  ordenesTotales: number;
  promedioPorOrden: number;
  ordenesPendientes: number;
}
