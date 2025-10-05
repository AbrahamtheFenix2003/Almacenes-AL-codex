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
import { TrendingUp, TrendingDown, Eye, User, Calendar } from "lucide-react";

export interface Ajuste {
  id: string;
  fechaHora: string;
  tipo: "Conteo Físico" | "Merma" | "Corrección" | "Vencimiento" | "Robo/Pérdida";
  producto: {
    nombre: string;
    codigo: string;
  };
  stockSistema: number;
  stockFisico: number;
  diferencia: number;
  valor: number;
  estado: "Aprobado" | "Pendiente" | "Rechazado";
  usuario: string;
  observaciones?: string;
}

interface AdjustmentTableProps {
  ajustes?: Ajuste[];
  onView?: (ajuste: Ajuste) => void;
}

const mockAjustes: Ajuste[] = [
  {
    id: "AJ001",
    fechaHora: "2024-01-22 09:15",
    tipo: "Conteo Físico",
    producto: {
      nombre: "Laptop Dell XPS 13",
      codigo: "PRD001",
    },
    stockSistema: 15,
    stockFisico: 13,
    diferencia: -2,
    valor: 2599.98,
    estado: "Aprobado",
    usuario: "María González",
  },
  {
    id: "AJ002",
    fechaHora: "2024-01-21 14:25",
    tipo: "Merma",
    producto: {
      nombre: "Mouse Inalámbrico Logitech",
      codigo: "PRD002",
    },
    stockSistema: 25,
    stockFisico: 22,
    diferencia: -3,
    valor: 89.97,
    estado: "Pendiente",
    usuario: "Carlos Mendoza",
  },
  {
    id: "AJ003",
    fechaHora: "2024-01-21 11:45",
    tipo: "Corrección",
    producto: {
      nombre: "Monitor 4K Samsung",
      codigo: "PRD003",
    },
    stockSistema: 5,
    stockFisico: 8,
    diferencia: 3,
    valor: 1049.97,
    estado: "Aprobado",
    usuario: "Ana Rodríguez",
  },
  {
    id: "AJ004",
    fechaHora: "2024-01-20 16:20",
    tipo: "Vencimiento",
    producto: {
      nombre: "Batería Recargable",
      codigo: "PRD007",
    },
    stockSistema: 50,
    stockFisico: 45,
    diferencia: -5,
    valor: 124.95,
    estado: "Rechazado",
    usuario: "Roberto Silva",
  },
  {
    id: "AJ005",
    fechaHora: "2024-01-20 10:10",
    tipo: "Robo/Pérdida",
    producto: {
      nombre: "Auriculares Bluetooth",
      codigo: "PRD006",
    },
    stockSistema: 20,
    stockFisico: 18,
    diferencia: -2,
    valor: 319.98,
    estado: "Aprobado",
    usuario: "Laura Jiménez",
  },
  {
    id: "AJ006",
    fechaHora: "2024-01-19 13:35",
    tipo: "Conteo Físico",
    producto: {
      nombre: "Teclado Mecánico RGB",
      codigo: "PRD004",
    },
    stockSistema: 12,
    stockFisico: 14,
    diferencia: 2,
    valor: 179.98,
    estado: "Pendiente",
    usuario: "José Pérez",
  },
];

export function AdjustmentTable({ ajustes = mockAjustes, onView }: AdjustmentTableProps) {
  const getTipoBadge = (tipo: Ajuste["tipo"]) => {
    const colors = {
      "Conteo Físico": "border border-blue-200 bg-blue-50 text-blue-700",
      Merma: "border border-red-200 bg-red-50 text-red-700",
      Corrección: "border border-yellow-200 bg-yellow-50 text-yellow-700",
      Vencimiento: "border border-orange-200 bg-orange-50 text-orange-700",
      "Robo/Pérdida": "border border-purple-200 bg-purple-50 text-purple-700",
    };
    return colors[tipo];
  };

  const getEstadoBadge = (estado: Ajuste["estado"]) => {
    const colors = {
      Aprobado: "border border-green-200 bg-green-50 text-green-700",
      Pendiente: "border border-yellow-200 bg-yellow-50 text-yellow-700",
      Rechazado: "border border-red-200 bg-red-50 text-red-700",
    };
    return colors[estado];
  };

  return (
    <div className="rounded-lg border bg-card">
      <div className="p-4 border-b">
        <h3 className="text-base font-semibold">Registro de Ajustes</h3>
        <p className="text-sm text-muted-foreground">
          {ajustes.length} ajustes encontrados
        </p>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Fecha/Hora</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead className="text-right">Stock Sistema</TableHead>
              <TableHead className="text-right">Stock Físico</TableHead>
              <TableHead className="text-right">Diferencia</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ajustes.map((ajuste) => (
              <TableRow key={ajuste.id}>
                <TableCell className="font-medium">{ajuste.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <div>
                      <div>{ajuste.fechaHora.split(" ")[0]}</div>
                      <div className="text-xs text-muted-foreground">
                        {ajuste.fechaHora.split(" ")[1]}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getTipoBadge(ajuste.tipo)}>
                    {ajuste.tipo}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="max-w-[200px]">
                    <div className="font-medium truncate">
                      {ajuste.producto.nombre}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {ajuste.producto.codigo}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">{ajuste.stockSistema}</TableCell>
                <TableCell className="text-right">{ajuste.stockFisico}</TableCell>
                <TableCell className="text-right">
                  <div
                    className={`flex items-center justify-end gap-1 ${
                      ajuste.diferencia > 0
                        ? "text-green-600"
                        : ajuste.diferencia < 0
                        ? "text-red-600"
                        : ""
                    }`}
                  >
                    {ajuste.diferencia > 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : ajuste.diferencia < 0 ? (
                      <TrendingDown className="h-3 w-3" />
                    ) : null}
                    <span className="font-medium">{ajuste.diferencia}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  �S/{ajuste.valor.toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge className={getEstadoBadge(ajuste.estado)}>
                    {ajuste.estado}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{ajuste.usuario}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onView?.(ajuste)}
                  >
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
