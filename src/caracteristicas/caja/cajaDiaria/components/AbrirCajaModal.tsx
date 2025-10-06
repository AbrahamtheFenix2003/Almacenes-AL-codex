import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AbrirCajaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (montoInicial: number) => Promise<void>;
  userName: string;
}

export default function AbrirCajaModal({ isOpen, onClose, onConfirm, userName }: AbrirCajaModalProps) {
  const [montoInicial, setMontoInicial] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    const monto = parseFloat(montoInicial);
    if (isNaN(monto) || monto < 0) {
      alert('Por favor ingresa un monto válido');
      return;
    }

    setLoading(true);
    try {
      await onConfirm(monto);
      setMontoInicial('');
      onClose();
    } catch (error) {
      console.error('Error al abrir caja:', error);
      alert('Error al abrir la caja. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Abrir Caja</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
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

          <div className="space-y-2">
            <Label htmlFor="montoInicial">Monto Inicial *</Label>
            <Input
              id="montoInicial"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={montoInicial}
              onChange={(e) => setMontoInicial(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-gray-500">
              Ingresa el monto en efectivo con el que inicias la caja
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading ? 'Abriendo...' : 'Abrir Caja'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
