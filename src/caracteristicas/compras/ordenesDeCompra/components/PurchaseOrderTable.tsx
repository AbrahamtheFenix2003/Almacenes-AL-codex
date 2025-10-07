import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2, Calendar, User } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export interface OrdenCompra {
  id: string;
  numeroOrden: string;
  fecha: string;
  proveedor: {
    nombre: string;
    codigo: string;
  };
  proveedorId?: string; // ID del proveedor para edición
  productos: string;
  fechaEntrega: string;
  total: number;
  estado: "Pendiente" | "Recibido";
  usuario: string;
}

const estadoBadgeVariant = (
  estado: OrdenCompra["estado"]
): BadgeVariant => {
  switch (estado) {
    case "Pendiente":
      return "warning";
    case "Recibido":
      return "success";
    default:
      return "default";
  }
};

const estadoBadgeClass = (estado: OrdenCompra["estado"]): string => {
  switch (estado) {
    case "Pendiente":
      return "bg-amber-100 text-amber-800 hover:bg-amber-100";
    case "Recibido":
      return "bg-emerald-100 text-emerald-800 hover:bg-emerald-100";
    default:
      return "";
  }
};

interface PurchaseOrderTableProps {
  ordenes: OrdenCompra[];
  onView: (orden: OrdenCompra) => void;
  onEdit: (orden: OrdenCompra) => void;
  onDelete: (ordenId: string, numeroOrden: string) => void;
}

export function PurchaseOrderTable({ ordenes, onView, onEdit, onDelete }: PurchaseOrderTableProps) {
  if (ordenes.length === 0) {
    return (
      <div className="rounded-md border p-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold">No hay órdenes de compra</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Crea tu primera orden de compra para comenzar
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Lista de Órdenes de Compra</h3>
          <p className="text-sm text-muted-foreground">
            {ordenes.length} órdenes encontradas
          </p>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número Orden</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>Productos</TableHead>
              <TableHead>Fecha Entrega</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordenes.map((orden) => (
              <TableRow key={orden.id}>
                <TableCell className="font-medium text-primary">
                  {orden.numeroOrden}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{orden.fecha}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{orden.proveedor.nombre}</div>
                    <div className="text-sm text-muted-foreground">
                      {orden.proveedor.codigo}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {orden.productos.split("\n").map((line, idx) => (
                      <div
                        key={idx}
                        className={idx === 0 ? "font-medium" : "text-sm text-muted-foreground"}
                      >
                        {line}
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell>{orden.fechaEntrega}</TableCell>
                <TableCell>
                  <div className="font-semibold">
                    {formatCurrency(orden.total)}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={estadoBadgeVariant(orden.estado)}
                    className={estadoBadgeClass(orden.estado)}
                  >
                    {orden.estado}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{orden.usuario}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onView(orden)}
                      title="Ver detalles"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(orden)}
                      title="Editar orden"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(orden.id, orden.numeroOrden)}
                      title="Eliminar orden"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
