import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export interface SupplierFormData {
  empresa: string;
  ubicacion: string;
  contactoNombre: string;
  contactoTelefono: string;
  contactoEmail: string;
  informacionTelefono: string;
  informacionEmail: string;
  productosSuministrados?: number;
  calificacion?: number;
}

interface SupplierFormProps {
  onSubmit: (data: SupplierFormData) => Promise<boolean> | boolean;
  onCancel: () => void;
  initialData?: Partial<SupplierFormData>;
}

const createInitialFormState = (): SupplierFormData => ({
  empresa: "",
  ubicacion: "",
  contactoNombre: "",
  contactoTelefono: "",
  contactoEmail: "",
  informacionTelefono: "",
  informacionEmail: "",
  productosSuministrados: 0,
  calificacion: 0,
});

export function SupplierForm({ onSubmit, onCancel, initialData }: SupplierFormProps) {
  const [formData, setFormData] = React.useState<SupplierFormData>(createInitialFormState());

  React.useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
      }));
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const wasCreated = await onSubmit(formData);

    if (wasCreated) {
      setFormData(createInitialFormState());
      onCancel();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "productosSuministrados" || name === "calificacion"
        ? parseFloat(value) || 0
        : value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Empresa y Ubicación */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="empresa">
            Nombre de la Empresa <span className="text-red-500">*</span>
          </Label>
          <Input
            id="empresa"
            name="empresa"
            value={formData.empresa}
            onChange={handleChange}
            placeholder="Ej: Dell Technologies"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ubicacion">
            Ubicación <span className="text-red-500">*</span>
          </Label>
          <Input
            id="ubicacion"
            name="ubicacion"
            value={formData.ubicacion}
            onChange={handleChange}
            placeholder="Ej: Round Rock, Texas, USA"
            required
          />
        </div>
      </div>

      {/* Contacto Principal */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">Contacto Principal</h3>
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <Label htmlFor="contactoNombre">
              Nombre del Contacto <span className="text-red-500">*</span>
            </Label>
            <Input
              id="contactoNombre"
              name="contactoNombre"
              value={formData.contactoNombre}
              onChange={handleChange}
              placeholder="Ej: Carlos Mendoza"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contactoTelefono">
                Teléfono <span className="text-red-500">*</span>
              </Label>
              <Input
                id="contactoTelefono"
                name="contactoTelefono"
                value={formData.contactoTelefono}
                onChange={handleChange}
                placeholder="Ej: +1-800-DELL-000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactoEmail">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="contactoEmail"
                name="contactoEmail"
                type="email"
                value={formData.contactoEmail}
                onChange={handleChange}
                placeholder="Ej: carlos@dell.com"
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Información de la Empresa */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">Información de la Empresa</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="informacionTelefono">
              Teléfono de la Empresa <span className="text-red-500">*</span>
            </Label>
            <Input
              id="informacionTelefono"
              name="informacionTelefono"
              value={formData.informacionTelefono}
              onChange={handleChange}
              placeholder="Ej: +1-800-DELL-000"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="informacionEmail">
              Email de la Empresa <span className="text-red-500">*</span>
            </Label>
            <Input
              id="informacionEmail"
              name="informacionEmail"
              type="email"
              value={formData.informacionEmail}
              onChange={handleChange}
              placeholder="Ej: info@dell.com"
              required
            />
          </div>
        </div>
      </div>

      {/* Productos Suministrados y Calificación */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="productosSuministrados">Productos Suministrados</Label>
          <Input
            id="productosSuministrados"
            name="productosSuministrados"
            type="number"
            min="0"
            value={formData.productosSuministrados}
            onChange={handleChange}
            placeholder="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="calificacion">Calificación (0-5)</Label>
          <Input
            id="calificacion"
            name="calificacion"
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={formData.calificacion}
            onChange={handleChange}
            placeholder="0.0"
          />
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="default">
          {initialData ? "Guardar Cambios" : "Crear Proveedor"}
        </Button>
      </div>
    </form>
  );
}
