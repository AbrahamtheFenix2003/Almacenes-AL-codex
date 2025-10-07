import { Timestamp } from "firebase/firestore";

export interface Producto {
  id: string;
  nombre: string;
  codigo: string;
  categoria: string;
  precio: number;
  stock: number;
  stockMinimo: number;
  proveedor: string;
  ubicacion: string;
  descripcion: string;
  fechaCreacion: Timestamp;
}

export interface OrdenCompra {
  id: string;
  numeroOrden: string;
  fecha: string;
  proveedorId: string;
  proveedorNombre: string;
  proveedorContacto: string;
  fechaEntrega: string;
  productosResumen: string;
  cantidadProductos: number;
  total: number;
  estado: "Pendiente" | "Recibido";
  usuario: string;
  creadoEn: Timestamp;
}

export interface Venta {
  id: string;
  numeroVenta: string;
  fecha: Timestamp;
  clienteId?: string;
  clienteNombre?: string;
  total: number;
  metodoPago: string;
  estado: string;
  usuario: string;
  creadoEn: Timestamp;
}

export interface Movimiento {
  id: string;
  tipo: "Entrada" | "Salida" | "Ajuste" | "Transferencia";
  productoId: string;
  productoNombre: string;
  cantidad: number;
  fecha: Timestamp;
  usuario: string;
  referencia?: string;
  observaciones?: string;
}

export interface DashboardMetrics {
  totalProductos: number;
  pedidosPendientes: number;
  personalActivo: number;
  alertasCriticas: number;
  productosStockBajo: Producto[];
  ventasTotales: number;
  comprasTotales: number;
}
