import { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { ClientStats } from '../components/ClientStats';
import { ClientFilters } from '../components/ClientFilters';
import { ClientTable } from '../components/ClientTable';
import { ClientForm } from '../components/ClientForm';

export interface Cliente {
  id: string;
  nombre: string;
  empresa?: string;
  ubicacion: string;
  telefono: string;
  email: string;
  tipo: 'Empresa' | 'Individual';
  estado: 'Activo' | 'Inactivo';
  comprasTotales: number;
  montoTotalComprado: number;
  ultimaCompra: Timestamp;
  limiteCredito: number;
  creditoDisponible: number;
  fechaCreacion: Timestamp;
}

export function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [clienteToDelete, setClienteToDelete] = useState<{ id: string; nombre: string } | null>(null);
  const [clienteToView, setClienteToView] = useState<Cliente | null>(null);

  // Lectura en tiempo real de clientes
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'clientes'),
      (snapshot) => {
        const clientesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Cliente[];
        setClientes(clientesData);
        setLoading(false);
      },
      (error) => {
        console.error('Error al cargar clientes:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Filtrado de clientes
  const clientesFiltrados = clientes.filter(cliente => {
    const searchLower = searchTerm.toLowerCase();
    return (
      cliente.nombre.toLowerCase().includes(searchLower) ||
      cliente.email.toLowerCase().includes(searchLower) ||
      cliente.telefono.includes(searchTerm) ||
      cliente.id.toLowerCase().includes(searchLower) ||
      cliente.empresa?.toLowerCase().includes(searchLower)
    );
  });

  // Crear cliente
  const handleCreateCliente = async (data: Omit<Cliente, 'id' | 'comprasTotales' | 'montoTotalComprado' | 'ultimaCompra' | 'creditoDisponible' | 'fechaCreacion' | 'estado'>) => {
    try {
      await addDoc(collection(db, 'clientes'), {
        ...data,
        estado: 'Activo',
        comprasTotales: 0,
        montoTotalComprado: 0,
        creditoDisponible: data.limiteCredito,
        fechaCreacion: serverTimestamp(),
        ultimaCompra: serverTimestamp()
      });
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error al crear cliente:', error);
    }
  };

  // Actualizar cliente
  const handleUpdateCliente = async (data: Omit<Cliente, 'id' | 'comprasTotales' | 'montoTotalComprado' | 'ultimaCompra' | 'creditoDisponible' | 'fechaCreacion' | 'estado'>) => {
    if (!selectedCliente) return;

    try {
      const clienteRef = doc(db, 'clientes', selectedCliente.id);
      await updateDoc(clienteRef, {
        ...data,
        creditoDisponible: data.limiteCredito - (selectedCliente.limiteCredito - selectedCliente.creditoDisponible)
      });
      setIsFormOpen(false);
      setSelectedCliente(null);
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
    }
  };

  // Eliminar cliente
  const handleDeleteCliente = async () => {
    if (!clienteToDelete) return;

    try {
      await deleteDoc(doc(db, 'clientes', clienteToDelete.id));
      setIsDeleteDialogOpen(false);
      setClienteToDelete(null);
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
    }
  };

  // Abrir formulario de creación
  const handleOpenCreateForm = () => {
    setSelectedCliente(null);
    setIsFormOpen(true);
  };

  // Abrir formulario de edición
  const handleOpenEditForm = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setIsFormOpen(true);
  };

  // Abrir diálogo de eliminación
  const handleOpenDeleteDialog = (id: string, nombre: string) => {
    setClienteToDelete({ id, nombre });
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-sm text-gray-600 mt-1">
            Gestiona la información de tus clientes y su historial de compras
          </p>
        </div>
        <Button onClick={handleOpenCreateForm}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Cliente
        </Button>
      </div>

      <ClientStats clientes={clientesFiltrados} />
      <ClientFilters searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      <ClientTable
        clientes={clientesFiltrados}
        loading={loading}
        onEdit={handleOpenEditForm}
        onDelete={handleOpenDeleteDialog}
        onView={(cliente) => setClienteToView(cliente)}
      />

      {/* Formulario de creación/edición */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
            </DialogTitle>
          </DialogHeader>
          <ClientForm
            initialData={selectedCliente}
            onSubmit={selectedCliente ? handleUpdateCliente : handleCreateCliente}
            onCancel={() => {
              setIsFormOpen(false);
              setSelectedCliente(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación de eliminación */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el cliente "{clienteToDelete?.nombre}".
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setClienteToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCliente}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog para ver detalles del cliente */}
      <Dialog open={clienteToView !== null} onOpenChange={(open) => {
        if (!open) setClienteToView(null);
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-600">Nombre</Label>
                <p className="text-gray-900 font-semibold">{clienteToView?.nombre}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-600">ID</Label>
                <p className="text-gray-900">{clienteToView?.id.substring(0, 8).toUpperCase()}</p>
              </div>
            </div>

            {clienteToView?.empresa && (
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-600">Empresa</Label>
                <p className="text-gray-900">{clienteToView.empresa}</p>
              </div>
            )}

            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-600">Ubicación</Label>
              <p className="text-gray-900">{clienteToView?.ubicacion}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-600">Teléfono</Label>
                <p className="text-gray-900">{clienteToView?.telefono}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-600">Email</Label>
                <p className="text-gray-900">{clienteToView?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-600">Tipo</Label>
                <p className="text-gray-900 font-semibold">{clienteToView?.tipo}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-600">Estado</Label>
                <p className={`font-semibold ${clienteToView?.estado === 'Activo' ? 'text-green-600' : 'text-red-600'}`}>
                  {clienteToView?.estado}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-600">Compras Totales</Label>
                <p className="text-gray-900 font-semibold">{clienteToView?.comprasTotales}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-600">Monto Total Comprado</Label>
                <p className="text-gray-900 font-semibold">
                  ₡{clienteToView?.montoTotalComprado.toLocaleString('es-CR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-600">Límite de Crédito</Label>
                <p className="text-gray-900 font-semibold">
                  ₡{clienteToView?.limiteCredito.toLocaleString('es-CR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-600">Crédito Disponible</Label>
                <p className="text-gray-900 font-semibold">
                  ₡{clienteToView?.creditoDisponible.toLocaleString('es-CR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-600">Última Compra</Label>
              <p className="text-gray-900">
                {clienteToView?.ultimaCompra ?
                  (clienteToView.ultimaCompra.toDate ? clienteToView.ultimaCompra.toDate() : new Date(clienteToView.ultimaCompra)).toLocaleDateString('es-CR')
                  : 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => setClienteToView(null)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
