import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatCurrency } from '@/lib/utils';
import type { SesionCaja, Transaccion } from '../types/index';

interface DetalleCajaModalProps {
  isOpen: boolean;
  onClose: () => void;
  sesion: SesionCaja;
}

export default function DetalleCajaModal({ isOpen, onClose, sesion }: DetalleCajaModalProps) {
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !sesion) return;

    const cargarTransacciones = async () => {
      setLoading(true);
      try {
        // Cargar ventas del rango de tiempo de la sesión
        const ventasQuery = query(
          collection(db, 'ventas'),
          where('fecha', '>=', sesion.horaApertura),
          where('fecha', '<=', sesion.horaCierre),
          orderBy('fecha', 'desc')
        );

        const ventasSnapshot = await getDocs(ventasQuery);
        const ventas = ventasSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            tipo: 'Venta' as const,
            numero: data.numeroVenta || '',
            descripcion: `Venta - ${data.clienteNombre || 'Cliente'}`,
            descripcionSecundaria: data.clienteNombre,
            metodo: (data.metodoPago || 'Efectivo') as 'Efectivo' | 'Tarjeta' | 'Transferencia',
            monto: Number(data.total) || 0,
            usuario: data.usuario || '',
            fecha: data.fecha
          } as Transaccion;
        });

        // Cargar gastos del rango de tiempo de la sesión
        const gastosQuery = query(
          collection(db, 'gastos'),
          where('fecha', '>=', sesion.horaApertura),
          where('fecha', '<=', sesion.horaCierre),
          orderBy('fecha', 'desc')
        );

        const gastosSnapshot = await getDocs(gastosQuery);
        const gastos = gastosSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            tipo: 'Gasto' as const,
            ...data
          } as Transaccion;
        });

        // Cargar movimientos manuales de esta sesión
        const movimientosQuery = query(
          collection(db, 'movimientosManuales'),
          where('sesionCajaId', '==', sesion.id),
          orderBy('fecha', 'desc')
        );

        const movimientosSnapshot = await getDocs(movimientosQuery);
        const movimientos = movimientosSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            tipo: data.tipo as 'Ingreso Manual' | 'Egreso Manual',
            numero: data.numero || '',
            descripcion: data.descripcion || '',
            descripcionSecundaria: data.motivo,
            metodo: data.metodo as 'Efectivo' | 'Tarjeta' | 'Transferencia',
            monto: Number(data.monto) || 0,
            usuario: data.usuario || '',
            fecha: data.fecha,
            motivo: data.motivo
          } as Transaccion;
        });

        // Combinar y ordenar
        const todasTransacciones = [...ventas, ...gastos, ...movimientos].sort(
          (a, b) => b.fecha.toMillis() - a.fecha.toMillis()
        );

        setTransacciones(todasTransacciones);
      } catch (error) {
        console.error('Error al cargar transacciones:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarTransacciones();
  }, [isOpen, sesion]);

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTipoBadgeColor = (tipo: Transaccion['tipo']) => {
    switch (tipo) {
      case 'Venta':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'Gasto':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-100';
      case 'Cobro':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'Pago':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'Ingreso Manual':
        return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100';
      case 'Egreso Manual':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const getMetodoIcon = (metodo: Transaccion['metodo']) => {
    switch (metodo) {
      case 'Efectivo':
        return '💵';
      case 'Tarjeta':
        return '💳';
      case 'Transferencia':
        return '🏦';
      default:
        return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalle de Caja - {sesion.fecha}</DialogTitle>
        </DialogHeader>

        {/* Resumen de la sesión */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-sm text-gray-500 mb-1">Apertura</div>
            <div className="text-xl font-bold text-gray-900">
              {formatCurrency(sesion.montoInicial)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {formatTime(sesion.horaApertura)}
            </div>
            <div className="text-xs text-gray-500">{sesion.usuarioApertura}</div>
          </Card>

          <Card className="p-4">
            <div className="text-sm text-gray-500 mb-1">Cierre</div>
            <div className="text-xl font-bold text-gray-900">
              {formatCurrency(sesion.montoFinal)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {formatTime(sesion.horaCierre)}
            </div>
            <div className="text-xs text-gray-500">{sesion.usuarioCierre}</div>
          </Card>

          <Card className="p-4">
            <div className="text-sm text-gray-500 mb-1">Total Calculado</div>
            <div className="text-xl font-bold text-gray-900">
              {formatCurrency(sesion.totalCalculado)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Ventas: {formatCurrency(sesion.totalVentas || 0)}
            </div>
            {(sesion.totalIngresosExtra || 0) > 0 && (
              <div className="text-xs text-gray-500">
                + Ingresos: {formatCurrency(sesion.totalIngresosExtra || 0)}
              </div>
            )}
          </Card>

          <Card className="p-4">
            <div className="text-sm text-gray-500 mb-1">Diferencia</div>
            <div className={`text-xl font-bold ${sesion.diferencia === 0 ? 'text-green-600' : 'text-red-600'}`}>
              {sesion.diferencia === 0 ? 'Sin diferencia' : formatCurrency(Math.abs(sesion.diferencia || 0))}
            </div>
            {sesion.diferencia !== 0 && (
              <div className="text-xs text-red-500 mt-1">
                {(sesion.diferencia || 0) > 0 ? 'Sobrante' : 'Faltante'}
              </div>
            )}
          </Card>
        </div>

        {/* Resumen por método de pago */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card className="p-3">
            <div className="text-xs text-gray-500 mb-1">Efectivo</div>
            <div className="text-lg font-semibold text-green-600">
              {formatCurrency(sesion.totalEfectivo)}
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-xs text-gray-500 mb-1">Tarjetas</div>
            <div className="text-lg font-semibold text-purple-600">
              {formatCurrency(sesion.totalTarjetas)}
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-xs text-gray-500 mb-1">Transferencias</div>
            <div className="text-lg font-semibold text-indigo-600">
              {formatCurrency(sesion.totalTransferencias)}
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-xs text-gray-500 mb-1">Ingresos Extra</div>
            <div className="text-lg font-semibold text-emerald-600">
              {formatCurrency(sesion.totalIngresosExtra || 0)}
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-xs text-gray-500 mb-1">Gastos</div>
            <div className="text-lg font-semibold text-red-600">
              {formatCurrency(sesion.totalGastos)}
            </div>
          </Card>
        </div>

        {/* Tabla de transacciones */}
        <div>
          <h3 className="text-lg font-semibold mb-3">
            Transacciones ({transacciones.length})
          </h3>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Cargando transacciones...</div>
          ) : transacciones.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No hay transacciones registradas</div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hora</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Número</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead>Usuario</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transacciones.map((transaccion) => (
                    <TableRow key={transaccion.id}>
                      <TableCell className="text-sm">
                        {formatTime(transaccion.fecha)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getTipoBadgeColor(transaccion.tipo)}>
                          {transaccion.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm font-mono">
                        {transaccion.numero}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm">{transaccion.descripcion}</span>
                          {transaccion.descripcionSecundaria && (
                            <span className="text-xs text-gray-500">
                              {transaccion.motivo ? `Motivo: ${transaccion.motivo}` : transaccion.descripcionSecundaria}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <span>{getMetodoIcon(transaccion.metodo)}</span>
                          {transaccion.metodo}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-semibold ${
                          transaccion.tipo === 'Gasto' || transaccion.tipo === 'Pago' || transaccion.tipo === 'Egreso Manual'
                            ? 'text-red-600'
                            : 'text-green-600'
                        }`}>
                          {transaccion.tipo === 'Gasto' || transaccion.tipo === 'Pago' || transaccion.tipo === 'Egreso Manual' ? '-' : '+'}
                          {formatCurrency(transaccion.monto)}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {transaccion.usuario}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
