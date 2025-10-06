import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ResumenCaja } from '../types/index';

interface CerrarCajaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (montoFinal: number) => Promise<void>;
  userName: string;
  resumen: ResumenCaja;
  montoInicial: number;
}

export default function CerrarCajaModal({
  isOpen,
  onClose,
  onConfirm,
  userName,
  resumen,
  montoInicial
}: CerrarCajaModalProps) {
  const [montoFinal, setMontoFinal] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const totalCalculado = montoInicial + resumen.totalEfectivo - resumen.totalGastos;
  const diferencia = montoFinal ? parseFloat(montoFinal) - totalCalculado : 0;

  const handleConfirm = async () => {
    const monto = parseFloat(montoFinal);
    if (isNaN(monto) || monto < 0) {
      alert('Por favor ingresa un monto válido');
      return;
    }

    setLoading(true);
    try {
      await onConfirm(monto);
      setMontoFinal('');
      onClose();
    } catch (error) {
      console.error('Error al cerrar caja:', error);
      alert('Error al cerrar la caja. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Cerrar Caja</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha</Label>
              <Input
                id="fecha"
                value={new Date().toLocaleDateString('es-ES')}
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="usuario">Usuario</Label>
              <Input
                id="usuario"
                value={userName}
                disabled
              />
            </div>
          </div>

          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold mb-3">Resumen del Día</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Apertura:</span>
                <span className="font-semibold">€{montoInicial.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Ventas:</span>
                <span className="font-semibold text-green-600">+€{resumen.totalVentas.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Efectivo:</span>
                <span className="font-semibold">€{resumen.totalEfectivo.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tarjetas:</span>
                <span className="font-semibold">€{resumen.totalTarjetas.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Transferencias:</span>
                <span className="font-semibold">€{resumen.totalTransferencias.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Gastos:</span>
                <span className="font-semibold text-red-600">-€{resumen.totalGastos.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalCalculado">Total Calculado en Efectivo</Label>
            <Input
              id="totalCalculado"
              value={`€${totalCalculado.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`}
              disabled
              className="font-semibold text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="montoFinal">Monto Final Contado *</Label>
            <Input
              id="montoFinal"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={montoFinal}
              onChange={(e) => setMontoFinal(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-gray-500">
              Ingresa el monto total en efectivo que hay en la caja
            </p>
          </div>

          {montoFinal && (
            <div className={`p-4 rounded-lg ${diferencia === 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Diferencia:</span>
                <span className={`text-xl font-bold ${diferencia === 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {diferencia === 0 ? 'Sin diferencia' : `€${diferencia.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`}
                </span>
              </div>
              {diferencia !== 0 && (
                <p className="text-xs text-red-600 mt-1">
                  {diferencia > 0 ? 'Hay un sobrante en caja' : 'Falta dinero en caja'}
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={loading || !montoFinal}>
            {loading ? 'Cerrando...' : 'Cerrar Caja'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
