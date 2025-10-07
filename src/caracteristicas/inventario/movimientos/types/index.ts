export interface Movimiento {
  id: string;
  fechaHora: string;
  tipo: "Entrada" | "Salida";
  concepto: string;
  producto?: {
    nombre: string;
    codigo: string;
  };
  cantidad: number;
  precioUnitario?: number;
  total: number; // Siempre requerido para cálculos
  documento?: string;
  usuario: string;
  clienteNombre?: string;
  ventaId?: string;
}