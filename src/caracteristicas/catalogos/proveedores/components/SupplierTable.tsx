import { Eye, Pencil, Trash2, Star, Phone, Mail, MapPin } from "lucide-react";
import type { Timestamp } from "firebase/firestore";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface Proveedor {
  id: string;
  codigo: string;
  empresa: string;
  ubicacion: string;
  contacto: {
    nombre: string;
    email: string;
    telefono: string;
  };
  informacion: {
    email: string;
    telefono: string;
  };
  productosSuministrados: number;
  ultimaCompra: string;
  calificacion: number;
  estado: "Activo" | "Inactivo";
  fechaCreacion?: Timestamp | Date | string | null;
}

interface SupplierTableProps {
  proveedores: Proveedor[];
  loading: boolean;
  error?: string | null;
  onEdit: (proveedor: Proveedor) => void;
  onDelete: (proveedorId: string, proveedorName: string) => void;
  onView: (proveedor: Proveedor) => void;
}

export const SupplierTable = ({
  proveedores,
  loading,
  error,
  onEdit,
  onDelete,
  onView
}: SupplierTableProps) => {
  // Renderizado condicional: mostrar mensaje de error
  if (error) {
    return (
      <Card>
        <CardContent className="px-6 py-12">
          <div className="flex flex-col items-center justify-center gap-2">
            <p className="text-lg font-semibold text-red-600">Error al cargar proveedores</p>
            <p className="text-sm text-gray-500 text-center">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Renderizado condicional: mostrar mensaje de carga
  if (loading) {
    return (
      <Card>
        <CardContent className="px-6 py-12">
          <div className="flex items-center justify-center">
            <p className="text-lg text-gray-500">
              Cargando proveedores...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">
          Lista de Proveedores
        </CardTitle>
        <p className="text-sm text-gray-500">{proveedores.length} proveedores encontrados</p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Información</TableHead>
                <TableHead className="text-center">Productos</TableHead>
                <TableHead>Última Compra</TableHead>
                <TableHead>Calificación</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proveedores.map((proveedor) => (
                <TableRow key={proveedor.id}>
                  <TableCell className="font-medium">{proveedor.codigo}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{proveedor.empresa}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {proveedor.ubicacion}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{proveedor.contacto.nombre}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {proveedor.contacto.telefono}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {proveedor.contacto.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {proveedor.informacion.telefono}
                      </div>
                      <div className="text-sm flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {proveedor.informacion.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{proveedor.productosSuministrados}</TableCell>
                  <TableCell>{proveedor.ultimaCompra}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{proveedor.calificacion}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={proveedor.estado === "Activo" ? "success" : "muted"}>
                      {proveedor.estado}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onView(proveedor)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onEdit(proveedor)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700"
                        onClick={() => onDelete(proveedor.id, proveedor.empresa)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
