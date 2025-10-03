import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface Producto {
  id: string;
  nombre: string;
  precio: number;
  codigo: string;
}

interface MovementFormData {
  tipo: "Entrada" | "Salida" | "";
  concepto: string;
  productoId: string;
  cantidad: number;
  precioUnitario: number;
  numeroDocumento: string;
  almacen: string;
  observaciones: string;
}

interface MovementFormProps {
  productos: Producto[];
  onSubmit: (formData: MovementFormData) => Promise<void>;
  onCancel: () => void;
}

export function MovementForm({ productos, onSubmit, onCancel }: MovementFormProps) {
  const [formData, setFormData] = useState<MovementFormData>({
    tipo: "",
    concepto: "",
    productoId: "",
    cantidad: 1,
    precioUnitario: 0,
    numeroDocumento: "",
    almacen: "",
    observaciones: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-calculate total
  const total = formData.cantidad * formData.precioUnitario;

  // Handle product selection
  useEffect(() => {
    if (formData.productoId) {
      const producto = productos.find((p) => p.id === formData.productoId);
      if (producto && formData.tipo === "Salida") {
        setFormData((prev) => ({ ...prev, precioUnitario: producto.precio }));
      }
    }
  }, [formData.productoId, formData.tipo, productos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.tipo || !formData.concepto || !formData.productoId || !formData.almacen) {
      alert("Por favor, completa todos los campos obligatorios");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Error al registrar movimiento:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const conceptosPorTipo = {
    Entrada: ["Compra", "Devolución Cliente", "Ajuste", "Transferencia"],
    Salida: ["Venta", "Devolución Proveedor", "Ajuste", "Transferencia"],
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>Nuevo Movimiento de Inventario</DialogTitle>
        <DialogDescription>
          Registra un nuevo movimiento de entrada o salida de inventario. Los campos marcados con * son obligatorios.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 mt-6">
        {/* Row 1: Tipo de Movimiento y Concepto */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Tipo de Movimiento <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.tipo}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  tipo: e.target.value as "Entrada" | "Salida",
                  concepto: "",
                })
              }
              required
            >
              <option value="">Seleccione tipo</option>
              <option value="Entrada">Entrada</option>
              <option value="Salida">Salida</option>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Concepto <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.concepto}
              onChange={(e) => setFormData({ ...formData, concepto: e.target.value })}
              disabled={!formData.tipo}
              required
            >
              <option value="">Seleccione concepto</option>
              {formData.tipo &&
                conceptosPorTipo[formData.tipo].map((concepto) => (
                  <option key={concepto} value={concepto}>
                    {concepto}
                  </option>
                ))}
            </Select>
          </div>
        </div>

        {/* Row 2: Producto */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Producto <span className="text-red-500">*</span>
          </label>
          <Select
            value={formData.productoId}
            onChange={(e) => setFormData({ ...formData, productoId: e.target.value })}
            required
          >
            <option value="">Seleccione un producto</option>
            {productos.map((producto) => (
              <option key={producto.id} value={producto.id}>
                {producto.nombre} - {producto.codigo}
              </option>
            ))}
          </Select>
        </div>

        {/* Row 3: Cantidad, Precio Unitario, Total */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Cantidad <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              min="1"
              value={formData.cantidad}
              onChange={(e) =>
                setFormData({ ...formData, cantidad: Number(e.target.value) })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Precio Unitario (€)</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={formData.precioUnitario}
              onChange={(e) =>
                setFormData({ ...formData, precioUnitario: Number(e.target.value) })
              }
              readOnly={formData.tipo === "Salida"}
              className={formData.tipo === "Salida" ? "bg-muted" : ""}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Total</label>
            <Input
              type="text"
              value={`€${total.toFixed(2)}`}
              readOnly
              className="bg-blue-50 font-semibold"
            />
          </div>
        </div>

        {/* Row 4: Número de Documento y Almacén */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Número de Documento</label>
            <Input
              type="text"
              placeholder="Ej: COMP-2024-001"
              value={formData.numeroDocumento}
              onChange={(e) =>
                setFormData({ ...formData, numeroDocumento: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Almacén <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.almacen}
              onChange={(e) => setFormData({ ...formData, almacen: e.target.value })}
              required
            >
              <option value="">Seleccione almacén</option>
              <option value="Principal">Almacén Principal</option>
              <option value="Secundario">Almacén Secundario</option>
              <option value="Sucursal A">Sucursal A</option>
              <option value="Sucursal B">Sucursal B</option>
            </Select>
          </div>
        </div>

        {/* Row 5: Observaciones */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Observaciones</label>
          <Textarea
            placeholder="Información adicional sobre el movimiento..."
            value={formData.observaciones}
            onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
            rows={3}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-8">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Registrando..." : "Registrar Movimiento"}
        </Button>
      </div>
    </form>
  );
}
