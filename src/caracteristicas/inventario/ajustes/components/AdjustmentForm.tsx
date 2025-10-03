import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Producto {
  id: string;
  nombre: string;
  codigo: string;
  stock: number;
}

export interface AdjustmentFormData {
  productoId: string;
  stockSistema: number;
  stockFisico: number;
  diferencia: number;
  motivo: string;
  observaciones: string;
}

interface AdjustmentFormProps {
  productos: Producto[];
  onSubmit: (data: AdjustmentFormData) => Promise<void>;
  onCancel: () => void;
}

export function AdjustmentForm({ productos, onSubmit, onCancel }: AdjustmentFormProps) {
  const [formData, setFormData] = useState<AdjustmentFormData>({
    productoId: "",
    stockSistema: 0,
    stockFisico: 0,
    diferencia: 0,
    motivo: "",
    observaciones: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-calcular diferencia cuando cambia el stock físico
  useEffect(() => {
    const diferencia = formData.stockFisico - formData.stockSistema;
    setFormData((prev) => ({ ...prev, diferencia }));
  }, [formData.stockFisico, formData.stockSistema]);

  // Actualizar stock del sistema cuando se selecciona un producto
  const handleProductChange = (productoId: string) => {
    const producto = productos.find((p) => p.id === productoId);
    if (producto) {
      setFormData({
        ...formData,
        productoId,
        stockSistema: producto.stock,
        stockFisico: producto.stock,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.productoId || !formData.motivo) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      // Resetear formulario
      setFormData({
        productoId: "",
        stockSistema: 0,
        stockFisico: 0,
        diferencia: 0,
        motivo: "",
        observaciones: "",
      });
    } catch (error) {
      console.error("Error al registrar ajuste:", error);
      alert(error instanceof Error ? error.message : "Error al registrar el ajuste");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="producto">Producto *</Label>
        <Select
          id="producto"
          value={formData.productoId}
          onChange={(e) => handleProductChange(e.target.value)}
          required
        >
          <option value="">Seleccionar producto...</option>
          {productos.map((producto) => (
            <option key={producto.id} value={producto.id}>
              {producto.codigo} - {producto.nombre} (Stock: {producto.stock})
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="stockSistema">Stock en Sistema</Label>
          <Input
            id="stockSistema"
            type="number"
            value={formData.stockSistema}
            readOnly
            className="bg-gray-50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="stockFisico">Stock Físico Real *</Label>
          <Input
            id="stockFisico"
            type="number"
            value={formData.stockFisico}
            onChange={(e) => setFormData({ ...formData, stockFisico: Number(e.target.value) })}
            min="0"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="diferencia">Diferencia</Label>
          <Input
            id="diferencia"
            type="number"
            value={formData.diferencia}
            readOnly
            className={`bg-gray-50 ${
              formData.diferencia > 0
                ? "text-green-600"
                : formData.diferencia < 0
                ? "text-red-600"
                : ""
            }`}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="motivo">Motivo del Ajuste *</Label>
        <Select
          id="motivo"
          value={formData.motivo}
          onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
          required
        >
          <option value="">Seleccionar motivo...</option>
          <option value="Conteo Físico">Conteo Físico</option>
          <option value="Merma">Merma/Daño</option>
          <option value="Vencimiento">Vencimiento</option>
          <option value="Corrección">Corrección de Error</option>
          <option value="Robo/Pérdida">Robo/Pérdida</option>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="observaciones">Observaciones</Label>
        <Textarea
          id="observaciones"
          value={formData.observaciones}
          onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
          rows={3}
          placeholder="Agregar observaciones adicionales..."
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Registrando..." : "Registrar Ajuste"}
        </Button>
      </div>
    </form>
  );
}
