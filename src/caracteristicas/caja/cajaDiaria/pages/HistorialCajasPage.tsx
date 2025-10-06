import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import type { SesionCaja } from '../types/index';
import DetalleCajaModal from '../components/DetalleCajaModal';

export default function HistorialCajasPage() {
  const [sesiones, setSesiones] = useState<SesionCaja[]>([]);
  const [loading, setLoading] = useState(true);
  const [sesionSeleccionada, setSesionSeleccionada] = useState<SesionCaja | null>(null);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);

  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        const q = query(
          collection(db, 'sesionesCaja'),
          where('estado', '==', 'Cerrada'),
          orderBy('horaCierre', 'desc')
        );

        const snapshot = await getDocs(q);
        const sesionesCerradas = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as SesionCaja));

        setSesiones(sesionesCerradas);
      } catch (error) {
        console.error('Error al cargar historial:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarHistorial();
  }, []);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatCurrency = (amount: number | undefined) => {
    return `€${(amount || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleVerDetalle = (sesion: SesionCaja) => {
    setSesionSeleccionada(sesion);
    setMostrarDetalle(true);
  };

  if (loading) {
    return (
      <div className="p-6">
        <p>Cargando historial...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Historial de Cajas</h1>
        <p className="text-gray-500 mt-1">Consulta de cajas cerradas y sus detalles</p>
      </div>

      {/* Tabla de historial */}
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Cajas Cerradas</h3>
          <p className="text-sm text-gray-500">{sesiones.length} registros encontrados</p>
        </div>

        {sesiones.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No hay cajas cerradas registradas
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Apertura</TableHead>
                  <TableHead>Cierre</TableHead>
                  <TableHead>Usuario Apertura</TableHead>
                  <TableHead>Usuario Cierre</TableHead>
                  <TableHead className="text-right">Monto Inicial</TableHead>
                  <TableHead className="text-right">Total Ventas</TableHead>
                  <TableHead className="text-right">Total Calculado</TableHead>
                  <TableHead className="text-right">Monto Final</TableHead>
                  <TableHead className="text-right">Diferencia</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sesiones.map((sesion) => (
                  <TableRow key={sesion.id}>
                    <TableCell className="font-medium">{sesion.fecha}</TableCell>
                    <TableCell className="text-sm">{formatTime(sesion.horaApertura)}</TableCell>
                    <TableCell className="text-sm">{formatTime(sesion.horaCierre)}</TableCell>
                    <TableCell className="text-sm">{sesion.usuarioApertura}</TableCell>
                    <TableCell className="text-sm">{sesion.usuarioCierre || '-'}</TableCell>
                    <TableCell className="text-right">{formatCurrency(sesion.montoInicial)}</TableCell>
                    <TableCell className="text-right font-semibold text-blue-600">
                      {formatCurrency(sesion.totalVentas)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(sesion.totalCalculado)}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(sesion.montoFinal)}</TableCell>
                    <TableCell className="text-right">
                      {sesion.diferencia === 0 ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          Sin diferencia
                        </Badge>
                      ) : (
                        <span className="font-semibold text-red-600">
                          {formatCurrency(Math.abs(sesion.diferencia || 0))}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVerDetalle(sesion)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Modal de detalle */}
      {sesionSeleccionada && (
        <DetalleCajaModal
          isOpen={mostrarDetalle}
          onClose={() => {
            setMostrarDetalle(false);
            setSesionSeleccionada(null);
          }}
          sesion={sesionSeleccionada}
        />
      )}
    </div>
  );
}
