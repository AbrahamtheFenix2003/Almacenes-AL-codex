import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Package } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export interface Producto {
  id: string;
  nombre: string;
  codigo: string;
  precio: number;
  stock: number;
}

export interface Proveedor {
  id: string;
  nombre: string;
  contacto?: string;
}

export interface OrderItem {
  productoId: string;
  productoNombre: string;
  productoCodigo: string;
  cantidad: number;
  costoUnitario: number;
}

export interface OrderFormData {
  proveedorId: string;
  proveedorNombre: string;
  fechaEntrega: string;
  items: OrderItem[];
  total: number;
}

export interface InitialOrderData {
  id: string;
  proveedorId: string;
  fechaEntrega: string;
  items: OrderItem[];
}

interface PurchaseOrderFormProps {
  productos: Producto[];
  proveedores: Proveedor[];
  onSubmit: (data: OrderFormData) => void;
  onCancel: () => void;
  initialData?: InitialOrderData;
}

export function PurchaseOrderForm({
  productos,
  proveedores,
  onSubmit,
  onCancel,
  initialData,
}: PurchaseOrderFormProps) {
  const [proveedorId, setProveedorId] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [items, setItems] = useState<OrderItem[]>([]);
  const [cantidad, setCantidad] = useState<number>(1);
  const [costoUnitario, setCostoUnitario] = useState<number>(0);

  // Pre-llenar el formulario cuando hay initialData
  useEffect(() => {
    if (initialData) {
      setProveedorId(initialData.proveedorId);
      setFechaEntrega(initialData.fechaEntrega);
      setItems(initialData.items);
    }
  }, [initialData]);

  // Calcular total
  const total = useMemo(() => {
    return items.reduce(
      (acc, item) => acc + item.cantidad * item.costoUnitario,
      0
    );
  }, [items]);

  const handleAddProduct = () => {
    if (!selectedProductId || cantidad <= 0 || costoUnitario <= 0) {
      alert("Por favor completa todos los campos del producto");
      return;
    }

    const producto = productos.find((p) => p.id === selectedProductId);
    if (!producto) return;

    // Verificar si el producto ya está en la lista
    const existingIndex = items.findIndex(
      (item) => item.productoId === selectedProductId
    );

    if (existingIndex >= 0) {
      // Actualizar cantidad y costo
      const newItems = [...items];
      newItems[existingIndex] = {
        ...newItems[existingIndex],
        cantidad: newItems[existingIndex].cantidad + cantidad,
        costoUnitario,
      };
      setItems(newItems);
    } else {
      // Agregar nuevo producto
      setItems([
        ...items,
        {
          productoId: producto.id,
          productoNombre: producto.nombre,
          productoCodigo: producto.codigo,
          cantidad,
          costoUnitario,
        },
      ]);
    }

    // Reset campos
    setSelectedProductId("");
    setCantidad(1);
    setCostoUnitario(0);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (
    index: number,
    field: "cantidad" | "costoUnitario",
    value: number
  ) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!proveedorId) {
      alert("Por favor selecciona un proveedor");
      return;
    }

    if (!fechaEntrega) {
      alert("Por favor selecciona una fecha de entrega");
      return;
    }

    if (items.length === 0) {
      alert("Por favor agrega al menos un producto");
      return;
    }

    const proveedor = proveedores.find((p) => p.id === proveedorId);
    if (!proveedor) return;

    onSubmit({
      proveedorId,
      proveedorNombre: proveedor.nombre,
      fechaEntrega,
      items,
      total,
    });
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
    const producto = productos.find((p) => p.id === productId);
    if (producto) {
      setCostoUnitario(producto.precio);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Datos Generales */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Datos Generales</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="proveedor">Proveedor *</Label>
            <select
              id="proveedor"
              value={proveedorId}
              onChange={(e) => setProveedorId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              required
            >
              <option value="">Seleccionar proveedor...</option>
              {proveedores.map((proveedor) => (
                <option key={proveedor.id} value={proveedor.id}>
                  {proveedor.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechaEntrega">Fecha de Entrega Estimada *</Label>
            <Input
              id="fechaEntrega"
              type="date"
              value={fechaEntrega}
              onChange={(e) => setFechaEntrega(e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      {/* Items del Pedido */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Items del Pedido</h3>

        {/* Agregar Producto */}
        <div className="rounded-lg border p-4 space-y-4 bg-muted/30">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="producto">Producto</Label>
              <select
                id="producto"
                value={selectedProductId}
                onChange={(e) => handleProductSelect(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Seleccionar producto...</option>
                {productos.map((producto) => (
                  <option key={producto.id} value={producto.id}>
                    {producto.codigo} - {producto.nombre} (Stock: {producto.stock})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cantidad">Cantidad</Label>
              <Input
                id="cantidad"
                type="number"
                min="1"
                value={cantidad}
                onChange={(e) => setCantidad(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="costoUnitario">Costo Unitario (S/.)</Label>
              <Input
                id="costoUnitario"
                type="number"
                min="0"
                step="0.01"
                value={costoUnitario}
                onChange={(e) => setCostoUnitario(Number(e.target.value))}
              />
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleAddProduct}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Añadir Producto
          </Button>
        </div>

        {/* Tabla de Items */}
        {items.length > 0 && (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead className="w-[120px]">Cantidad</TableHead>
                  <TableHead className="w-[140px]">Costo Unit. (S/.)</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{item.productoNombre}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.productoCodigo}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        value={item.cantidad}
                        onChange={(e) =>
                          handleUpdateItem(index, "cantidad", Number(e.target.value))
                        }
                        className="h-8"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.costoUnitario}
                        onChange={(e) =>
                          handleUpdateItem(
                            index,
                            "costoUnitario",
                            Number(e.target.value)
                          )
                        }
                        className="h-8"
                      />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.cantidad * item.costoUnitario)}
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Resumen de Totales */}
        {items.length > 0 && (
          <div className="flex justify-end">
            <div className="w-full max-w-sm space-y-2 rounded-lg border p-4 bg-muted/30">
              <div className="flex justify-between">
                <span className="font-semibold">Total:</span>
                <span className="text-lg font-bold">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Botones de Acción */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {initialData ? "Guardar Cambios" : "Crear Orden de Compra"}
        </Button>
      </div>
    </form>
  );
}
