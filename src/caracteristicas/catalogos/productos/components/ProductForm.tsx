import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export interface ProductFormData {
  nombre: string;
  codigo?: string;
  categoria: string;
  proveedor: string;
  precio: number;
  stock: number;
  stockMinimo: number;
  ubicacion?: string;
  descripcion?: string;
}

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => Promise<boolean> | boolean;
  onCancel: () => void;
  initialData?: Partial<ProductFormData>;
  proveedores: Array<{ id: string; nombre: string }>;
}

const createInitialFormState = (): ProductFormData => ({
  nombre: "",
  codigo: "",
  categoria: "",
  proveedor: "",
  precio: 0,
  stock: 0,
  stockMinimo: 5,
  ubicacion: "",
  descripcion: "",
});

export function ProductForm({ onSubmit, onCancel, initialData, proveedores }: ProductFormProps) {
  const [formData, setFormData] = React.useState<ProductFormData>(createInitialFormState());

  React.useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
      }));
    }
  }, [initialData]);

  const providerOptions = React.useMemo(() => {
    const names = Array.from(
      new Set(
        proveedores
          .map((proveedor) => proveedor.nombre?.toString().trim())
          .filter((nombre): nombre is string => Boolean(nombre && nombre.length))
      )
    ).sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));

    if (
      formData.proveedor &&
      formData.proveedor.trim().length > 0 &&
      !names.includes(formData.proveedor)
    ) {
      names.unshift(formData.proveedor);
    }

    return names;
  }, [proveedores, formData.proveedor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const wasCreated = await onSubmit(formData);

    if (wasCreated) {
      setFormData(createInitialFormState());
      onCancel();
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "precio" || name === "stock" || name === "stockMinimo"
        ? parseFloat(value) || 0
        : value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nombre y Código */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="nombre">
            Nombre del Producto <span className="text-red-500">*</span>
          </Label>
          <Input
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Ej: Laptop Dell XPS 13"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="codigo">Código del Producto</Label>
          <Input
            id="codigo"
            name="codigo"
            value={formData.codigo}
            onChange={handleChange}
            placeholder="Se genera automáticamente si se deja vacío"
          />
        </div>
      </div>

      {/* Categoría y Proveedor */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="categoria">
            Categoría <span className="text-red-500">*</span>
          </Label>
          <Select
            id="categoria"
            name="categoria"
            value={formData.categoria}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione una categoría</option>
            <option value="Electrónicos">Electrónicos</option>
            <option value="Muebles">Muebles</option>
            <option value="Accesorios">Accesorios</option>
            <option value="Ropa">Ropa</option>
            <option value="Alimentos">Alimentos</option>
            <option value="Otros">Otros</option>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="proveedor">Proveedor</Label>
          <Select
            id="proveedor"
            name="proveedor"
            value={formData.proveedor}
            onChange={handleChange}
          >
            <option value="">
              {providerOptions.length > 0
                ? "Seleccione un proveedor"
                : "No hay proveedores registrados"}
            </option>
            {providerOptions.map((nombre) => (
              <option key={nombre} value={nombre}>
                {nombre}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Precio, Stock Inicial y Stock Mínimo */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="precio">
            Precio Unitario (S/.) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="precio"
            name="precio"
            type="number"
            step="0.01"
            min="0"
            value={formData.precio}
            onChange={handleChange}
            placeholder="0.00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="stock">
            Stock Inicial <span className="text-red-500">*</span>
          </Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            min="0"
            value={formData.stock}
            onChange={handleChange}
            placeholder="0"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="stockMinimo">Stock Mínimo</Label>
          <Input
            id="stockMinimo"
            name="stockMinimo"
            type="number"
            min="0"
            value={formData.stockMinimo}
            onChange={handleChange}
            placeholder="5"
          />
        </div>
      </div>

      {/* Ubicación en Almacén */}
      <div className="space-y-2">
        <Label htmlFor="ubicacion">Ubicación en Almacén</Label>
        <Input
          id="ubicacion"
          name="ubicacion"
          value={formData.ubicacion}
          onChange={handleChange}
          placeholder="Ej: Estante A-1, Nivel 2"
        />
      </div>

      {/* Descripción */}
      <div className="space-y-2">
        <Label htmlFor="descripcion">Descripción</Label>
        <Textarea
          id="descripcion"
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          placeholder="Descripción detallada del producto..."
          rows={3}
        />
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="default">
          {initialData ? "Guardar Cambios" : "Crear Producto"}
        </Button>
      </div>
    </form>
  );
}
