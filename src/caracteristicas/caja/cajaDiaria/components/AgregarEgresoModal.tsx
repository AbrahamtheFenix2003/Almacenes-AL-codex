import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MinusCircle } from 'lucide-react';

interface AgregarEgresoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (datos: {
    monto: number;
    motivo: string;
    metodo: 'Efectivo' | 'Yape' | 'Transferencia Bancaria';
  }) => Promise<void>;
  userName: string;
}

export default function AgregarEgresoModal({
  isOpen,
  onClose,
  onConfirm,
  userName
}: AgregarEgresoModalProps) {
  const [monto, setMonto] = useState('');
  const [motivo, setMotivo] = useState('');
  const [metodo, setMetodo] = useState<'Efectivo' | 'Yape' | 'Transferencia Bancaria'>('Efectivo');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!monto || !motivo.trim()) {
      alert('Por favor complete todos los campos');
      return;
    }

    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      alert('El monto debe ser un número válido mayor a 0');
      return;
    }

    try {
      setLoading(true);
      await onConfirm({
        monto: montoNum,
        motivo: motivo.trim(),
        metodo
      });
      
      // Limpiar formulario
      setMonto('');
      setMotivo('');
      setMetodo('Efectivo');
      onClose();
    } catch (error) {
      console.error('Error al agregar egreso:', error);
      alert('Error al registrar el egreso. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setMonto('');
      setMotivo('');
      setMetodo('Efectivo');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MinusCircle className="h-5 w-5 text-red-600" />
            Agregar Egreso Manual
          </DialogTitle>
          <DialogDescription>
            Registre un egreso o gasto adicional de la caja. Este monto se restará del total de efectivo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="monto">Monto del Egreso</Label>
            <Input
              id="monto"
              type="number"
              placeholder="0.00"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              step="0.01"
              min="0.01"
              disabled={loading}
              className="text-right"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="metodo">Método de Pago</Label>
            <Select 
              value={metodo} 
              onChange={(e) => setMetodo(e.target.value as 'Efectivo' | 'Yape' | 'Transferencia Bancaria')}
              disabled={loading}
            >
              <option value="Efectivo">Efectivo</option>
              <option value="Yape">Yape</option>
              <option value="Transferencia Bancaria">Transferencia Bancaria</option>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="motivo">Motivo del Egreso</Label>
            <Textarea
              id="motivo"
              placeholder="Describa el motivo del egreso..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="text-sm text-gray-500">
            <p><strong>Usuario:</strong> {userName}</p>
            <p><strong>Fecha:</strong> {new Date().toLocaleString('es-PE')}</p>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Guardando...' : 'Agregar Egreso'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}