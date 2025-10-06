import { Timestamp } from 'firebase/firestore';

export interface SesionCaja {
  id?: string;
  fecha: string;
  estado: 'Abierta' | 'Cerrada';
  montoInicial: number;
  montoFinal?: number;
  totalCalculado?: number;
  diferencia?: number;
  horaApertura: Timestamp;
  horaCierre?: Timestamp;
  usuarioApertura: string;
  usuarioCierre?: string;
  totalVentas?: number;
  totalEfectivo?: number;
  totalTarjetas?: number;
  totalTransferencias?: number;
  totalGastos?: number;
  totalIngresosExtra?: number;
}

export interface Transaccion {
  id: string;
  tipo: 'Venta' | 'Gasto' | 'Cobro' | 'Pago';
  numero: string;
  descripcion: string;
  descripcionSecundaria?: string;
  metodo: 'Efectivo' | 'Tarjeta' | 'Transferencia';
  monto: number;
  usuario: string;
  fecha: Timestamp;
  sesionCajaId?: string;
}

export interface Venta extends Transaccion {
  tipo: 'Venta';
  clienteId?: string;
  clienteNombre?: string;
  productos?: VentaProducto[];
  total: number;
}

export interface VentaProducto {
  productoId: string;
  productoNombre: string;
  productoCodigo: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Gasto extends Transaccion {
  tipo: 'Gasto';
  categoria?: string;
  proveedor?: string;
  comprobante?: string;
}

export interface ResumenCaja {
  totalVentas: number;
  totalEfectivo: number;
  totalTarjetas: number;
  totalTransferencias: number;
  totalGastos: number;
  totalIngresosExtra: number;
}
