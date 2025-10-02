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
import { ArrowUp, ArrowDown, Eye, User, Calendar } from "lucide-react";

export interface Movimiento {
  id: string;
  fechaHora: string;
  tipo: "Entrada" | "Salida";
  concepto: string;
  producto: {
    nombre: string;
    codigo: string;
  };
  cantidad: number;
  precioUnitario: number;
  total: number;
  documento: string;
  usuario: string;
}

interface MovementTableProps {
  movimientos?: Movimiento[];
}

const mockMovimientos: Movimiento[] = [
  {
    id: "MOV001",
    fechaHora: "2024-01-22 14:30",
    tipo: "Entrada",
    concepto: "Compra",
    producto: {
      nombre: "Laptop Dell XPS 13",
      codigo: "PRD001",
    },
    cantidad: 10,
    precioUnitario: 1299.99,
    total: 12999.9,
    documento: "COMP-2024-001",
    usuario: "María González",
  },
  {
    id: "MOV002",
    fechaHora: "2024-01-22 10:15",
    tipo: "Salida",
    concepto: "Venta",
    producto: {
      nombre: "Mouse Inalámbrico Logitech",
      codigo: "PRD002",
    },
    cantidad: 2,
    precioUnitario: 29.99,
    total: 59.98,
    documento: "VENTA-2024-045",
    usuario: "Carlos Mendoza",
  },
  {
    id: "MOV003",
    fechaHora: "2024-01-21 16:45",
    tipo: "Entrada",
    concepto: "Devolución Cliente",
    producto: {
      nombre: "Monitor 4K Samsung",
      codigo: "PRD003",
    },
    cantidad: 1,
    precioUnitario: 349.99,
    total: 349.99,
    documento: "DEV-CLT-2024-012",
    usuario: "Ana Rodríguez",
  },
  {
    id: "MOV004",
    fechaHora: "2024-01-21 09:30",
    tipo: "Salida",
    concepto: "Transferencia",
    producto: {
      nombre: "Teclado Mecánico RGB",
      codigo: "PRD004",
    },
    cantidad: 5,
    precioUnitario: 89.99,
    total: 449.95,
    documento: "TRANS-2024-008",
    usuario: "Roberto Silva",
  },
  {
    id: "MOV005",
    fechaHora: "2024-01-20 11:20",
    tipo: "Entrada",
    concepto: "Ajuste",
    producto: {
      nombre: "Mouse Inalámbrico Logitech",
      codigo: "PRD002",
    },
    cantidad: 3,
    precioUnitario: 29.99,
    total: 89.97,
    documento: "AJ-2024-003",
    usuario: "Laura Jiménez",
  },
  {
    id: "MOV006",
    fechaHora: "2024-01-20 15:10",
    tipo: "Salida",
    concepto: "Devolución Proveedor",
    producto: {
      nombre: "Auriculares Bluetooth",
      codigo: "PRD006",
    },
    cantidad: 2,
    precioUnitario: 159.99,
    total: 319.98,
    documento: "DEV-PROV-2024-004",
    usuario: "José Pérez",
  },
];

export function MovementTable({ movimientos = mockMovimientos }: MovementTableProps) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="p-4 border-b">
        <h3 className="text-base font-semibold">Registro de Movimientos</h3>
        <p className="text-sm text-muted-foreground">
          {movimientos.length} movimientos encontrados
        </p>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Fecha/Hora</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Concepto</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead className="text-right">Cantidad</TableHead>
              <TableHead className="text-right">Precio Unit.</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movimientos.map((mov) => (
              <TableRow key={mov.id}>
                <TableCell className="font-medium">{mov.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <div>
                      <div>{mov.fechaHora.split(" ")[0]}</div>
                      <div className="text-xs text-muted-foreground">
                        {mov.fechaHora.split(" ")[1]}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {mov.tipo === "Entrada" ? (
                    <Badge
                      variant="outline"
                      className="gap-1 border-green-200 bg-green-50 text-green-700"
                    >
                      <ArrowUp className="h-3 w-3" />
                      Entrada
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="gap-1 border-red-200 bg-red-50 text-red-700"
                    >
                      <ArrowDown className="h-3 w-3" />
                      Salida
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{mov.concepto}</Badge>
                </TableCell>
                <TableCell>
                  <div className="max-w-[200px]">
                    <div className="font-medium truncate">{mov.producto.nombre}</div>
                    <div className="text-xs text-muted-foreground">
                      {mov.producto.codigo}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">{mov.cantidad}</TableCell>
                <TableCell className="text-right">
                  €{mov.precioUnitario.toFixed(2)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  €{mov.total.toFixed(2)}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {mov.documento}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{mov.usuario}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
