import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2, Calendar, User } from "lucide-react";

export interface OrdenCompra {
  id: string;
  numeroOrden: string;
  fecha: string;
  proveedor: {
    nombre: string;
    codigo: string;
  };
  productos: string;
  fechaEntrega: string;
  total: number;
  estado: "Pendiente" | "Aprobado" | "Recibido" | "Cancelado" | "En Tránsito";
  usuario: string;
}

const estadoBadgeVariant = (
  estado: OrdenCompra["estado"]
): "default" | "secondary" | "outline" | "destructive" => {
  switch (estado) {
    case "Pendiente":
      return "secondary";
    case "Aprobado":
      return "default";
    case "En Tránsito":
      return "outline";
    case "Recibido":
      return "default";
    case "Cancelado":
      return "destructive";
    default:
      return "default";
  }
};

const estadoBadgeClass = (estado: OrdenCompra["estado"]): string => {
  switch (estado) {
    case "Pendiente":
      return "bg-amber-100 text-amber-800 hover:bg-amber-100";
    case "Aprobado":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    case "En Tránsito":
      return "bg-purple-100 text-purple-800 hover:bg-purple-100 border-purple-300";
    case "Recibido":
      return "bg-emerald-100 text-emerald-800 hover:bg-emerald-100";
    case "Cancelado":
      return "bg-red-100 text-red-800 hover:bg-red-100";
    default:
      return "";
  }
};

interface PurchaseOrderTableProps {
  ordenes: OrdenCompra[];
}

export function PurchaseOrderTable({ ordenes }: PurchaseOrderTableProps) {
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
                  <div className="space-y-1">
                    <div className="font-semibold">
                      €{orden.total.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      + €{(orden.total * 0.21).toLocaleString("es-ES", { minimumFractionDigits: 2 })} impuestos
                    </div>
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
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
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
