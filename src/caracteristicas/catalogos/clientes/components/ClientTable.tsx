import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Pencil, Trash2, Building2, User, MapPin, Phone, Mail } from 'lucide-react';
import type { Cliente } from '../pages/ClientesPage';

interface ClientTableProps {
  clientes: Cliente[];
  loading: boolean;
  onEdit: (cliente: Cliente) => void;
  onDelete: (id: string, nombre: string) => void;
  onView: (cliente: Cliente) => void;
}

export function ClientTable({ clientes, loading, onEdit, onDelete, onView }: ClientTableProps) {
  // Formatear fecha de Firestore Timestamp
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toISOString().split('T')[0];
  };

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return `₡${amount.toLocaleString('es-CR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  if (loading) {
    return (
      <Card className="border-gray-200">
        <CardContent className="px-6 py-12">
          <div className="flex items-center justify-center">
            <p className="text-lg text-gray-500">Cargando clientes...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (clientes.length === 0) {
    return (
      <Card className="border-gray-200">
        <CardContent className="px-6 py-12">
          <div className="flex flex-col items-center justify-center gap-2">
            <p className="text-lg font-semibold text-gray-700">No se encontraron clientes</p>
            <p className="text-sm text-gray-500">Intenta ajustar los filtros o crea un nuevo cliente</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700">Lista de Clientes</h3>
        <p className="text-sm text-gray-500">{clientes.length} clientes encontrados</p>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">ID</TableHead>
              <TableHead className="min-w-[250px]">Cliente</TableHead>
              <TableHead className="min-w-[220px]">Contacto</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Compras</TableHead>
              <TableHead className="text-right">Monto Total</TableHead>
              <TableHead>Última Compra</TableHead>
              <TableHead className="text-right">Crédito</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-center w-32">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientes.map((cliente) => (
              <TableRow key={cliente.id}>
                <TableCell className="font-medium">{cliente.id.substring(0, 6).toUpperCase()}</TableCell>
                <TableCell>
                  <div className="flex items-start gap-2">
                    {cliente.tipo === 'Empresa' ? (
                      <Building2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <User className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{cliente.nombre}</p>
                      {cliente.empresa && (
                        <p className="text-sm text-gray-600">{cliente.empresa}</p>
                      )}
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {cliente.ubicacion}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <Phone className="w-3.5 h-3.5" />
                      {cliente.telefono}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <Mail className="w-3.5 h-3.5" />
                      {cliente.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={cliente.tipo === 'Empresa' ? 'default' : 'secondary'}>
                    {cliente.tipo}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{cliente.comprasTotales}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(cliente.montoTotalComprado)}
                </TableCell>
                <TableCell>{formatDate(cliente.ultimaCompra)}</TableCell>
                <TableCell className="text-right">
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">
                      {formatCurrency(cliente.creditoDisponible)}
                    </p>
                    <p className="text-xs text-gray-500">
                      de {formatCurrency(cliente.limiteCredito)}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={cliente.estado === 'Activo' ? 'success' : 'danger'}>
                    {cliente.estado}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onView(cliente)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onEdit(cliente)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600 hover:text-red-700"
                      onClick={() => onDelete(cliente.id, cliente.nombre)}
                    >
                      <Trash2 className="w-4 h-4" />
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
