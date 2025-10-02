import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import type { Cliente } from '../pages/ClientesPage';

interface ClientFormProps {
  initialData?: Cliente | null;
  onSubmit: (data: Omit<Cliente, 'id' | 'comprasTotales' | 'montoTotalComprado' | 'ultimaCompra' | 'creditoDisponible' | 'fechaCreacion' | 'estado'>) => void;
  onCancel: () => void;
}

export function ClientForm({ initialData, onSubmit, onCancel }: ClientFormProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    empresa: '',
    ubicacion: '',
    telefono: '',
    email: '',
    tipo: 'Individual' as 'Empresa' | 'Individual',
    limiteCredito: 0
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: initialData.nombre,
        empresa: initialData.empresa || '',
        ubicacion: initialData.ubicacion,
        telefono: initialData.telefono,
        email: initialData.email,
        tipo: initialData.tipo,
        limiteCredito: initialData.limiteCredito
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      empresa: formData.empresa || undefined
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre *</Label>
          <Input
            id="nombre"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            required
            placeholder="Nombre del cliente"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="empresa">Empresa (opcional)</Label>
          <Input
            id="empresa"
            value={formData.empresa}
            onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
            placeholder="Nombre de la empresa"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ubicacion">Ubicación *</Label>
        <Input
          id="ubicacion"
          value={formData.ubicacion}
          onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
          required
          placeholder="Ciudad, País"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="telefono">Teléfono *</Label>
          <Input
            id="telefono"
            type="tel"
            value={formData.telefono}
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
            required
            placeholder="+506-1234-5678"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            placeholder="cliente@ejemplo.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tipo">Tipo de Cliente *</Label>
          <Select
            id="tipo"
            value={formData.tipo}
            onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'Empresa' | 'Individual' })}
            required
          >
            <option value="Individual">Individual</option>
            <option value="Empresa">Empresa</option>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="limiteCredito">Límite de Crédito *</Label>
          <Input
            id="limiteCredito"
            type="number"
            min="0"
            step="0.01"
            value={formData.limiteCredito}
            onChange={(e) => setFormData({ ...formData, limiteCredito: parseFloat(e.target.value) || 0 })}
            required
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {initialData ? 'Guardar Cambios' : 'Crear Cliente'}
        </Button>
      </div>
    </form>
  );
}
