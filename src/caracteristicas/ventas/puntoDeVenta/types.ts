import type { Timestamp } from 'firebase/firestore';

// Producto desde Firestore
export interface Product {
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

// Cliente desde Firestore
export interface Client {
  id: string;
  nombre: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  fechaCreacion?: Timestamp;
}

// Objeto para el descuento
export interface DescuentoManual {
  monto: number;
  motivo: string;
  descripcionAdicional?: string; // Opcional
}

// Item del carrito (interfaz de UI)
export interface CartItem {
  id: string;
  nombre: string;
  codigo: string;
  precio: number; // Representa el precioUnitarioOriginal
  cantidad: number;
  stockDisponible: number;

  // --- NUEVOS CAMPOS ---
  subtotalModificado?: number; // Para guardar temporalmente el nuevo subtotal
  descuentoManual?: DescuentoManual;
}

// Venta para guardar en Firestore
export interface Sale {
  numeroVenta: string;
  fecha: Timestamp;
  clienteId: string;
  clienteNombre: string;
  items: SaleItem[];
  subtotal: number;
  total: number;
  metodoPago: string;
  usuario: string;
  creadoEn: Timestamp;
}

// Item de venta
export interface SaleItem {
  productoId: string;
  productoNombre: string;
  productoCodigo: string;
  cantidad: number;
  precioUnitario: number; // Este será el precio final efectivo
  subtotal: number;

  // --- NUEVOS CAMPOS ---
  precioUnitarioOriginal?: number;
  descuentoManual?: DescuentoManual;
}

// Movimiento de inventario
export interface Movement {
  fecha: Timestamp;
  concepto: string;
  tipo: 'entrada' | 'salida';
  cantidad: number;
  productoId?: string;
  productoNombre?: string;
  productoCodigo?: string;
  precioUnitario?: number;
  total?: number;
  documento?: string;
  ventaId?: string;
  usuario: string;
  observaciones?: string;
  creadoEn: Timestamp;
}
