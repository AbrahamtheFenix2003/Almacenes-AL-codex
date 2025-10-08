import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { SupplierStats } from "../components/SupplierStats";
import { SupplierFilters } from "../components/SupplierFilters";
import { SupplierTable, type Proveedor } from "../components/SupplierTable";
import { SupplierForm, type SupplierFormData } from "../components/SupplierForm";

export const ProveedoresPage = () => {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [proveedorAEditar, setProveedorAEditar] = useState<Proveedor | null>(null);
  const [proveedorAEliminar, setProveedorAEliminar] = useState<{ id: string; nombre: string } | null>(null);
  const [proveedorAVer, setProveedorAVer] = useState<Proveedor | null>(null);

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    setLoading(true);

    const proveedoresQuery = collection(db, 'proveedores');

    // Escuchar cambios en tiempo real con onSnapshot
    const unsubscribe = onSnapshot(
      proveedoresQuery,
      (snapshot) => {
        const proveedoresData: Proveedor[] = snapshot.docs.map((doc) => {
          const data = doc.data();

          return {
            id: doc.id,
            codigo: data.codigo || '',
            empresa: data.empresa || '',
            ubicacion: data.ubicacion || '',
            contacto: {
              nombre: data.contactoNombre || '',
              email: data.contactoEmail || '',
              telefono: data.contactoTelefono || '',
            },
            informacion: {
              email: data.informacionEmail || '',
              telefono: data.informacionTelefono || '',
            },
            productosSuministrados: data.productosSuministrados || 0,
            ultimaCompra: data.ultimaCompra || '',
            calificacion: data.calificacion || 0,
            estado: data.estado || 'Activo',
            fechaCreacion: data.fechaCreacion || null,
          };
        });

        const resolveFechaCreacion = (fecha: Proveedor['fechaCreacion']): number => {
          if (!fecha) return 0;
          if (fecha instanceof Timestamp) return fecha.toMillis();
          if (fecha instanceof Date) return fecha.getTime();
          if (typeof fecha === 'string') {
            const parsed = Date.parse(fecha);
            return Number.isNaN(parsed) ? 0 : parsed;
          }
          return 0;
        };

        proveedoresData.sort((a, b) => resolveFechaCreacion(b.fechaCreacion) - resolveFechaCreacion(a.fechaCreacion));

        setProveedores(proveedoresData);
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error('Error al obtener proveedores:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    // Cleanup: desuscribirse cuando el componente se desmonte
    return () => unsubscribe();
  }, []);

  const handleCreateSupplier = async (formData: SupplierFormData): Promise<boolean> => {
    try {
      const proveedoresRef = collection(db, 'proveedores');

      // Generar ID automático
      const codigo = `PROV${String(proveedores.length + 1).padStart(3, '0')}`;

      await addDoc(proveedoresRef, {
        codigo: codigo,
        empresa: formData.empresa,
        ubicacion: formData.ubicacion,
        contactoNombre: formData.contactoNombre,
        contactoTelefono: formData.contactoTelefono,
        contactoEmail: formData.contactoEmail,
        informacionTelefono: formData.informacionTelefono,
        informacionEmail: formData.informacionEmail,
        productosSuministrados: formData.productosSuministrados || 0,
        calificacion: formData.calificacion || 0,
        ultimaCompra: new Date().toISOString().split('T')[0],
        estado: 'Activo',
        fechaCreacion: Timestamp.fromDate(new Date()),
      });

      setIsModalOpen(false);
      return true;
    } catch (err) {
      console.error('Error al crear proveedor:', err);
      alert('Error al crear el proveedor. Por favor, intenta de nuevo.');
      return false;
    }
  };

  const handleUpdateSupplier = async (formData: SupplierFormData): Promise<boolean> => {
    try {
      if (!proveedorAEditar) return false;

      const proveedorRef = doc(db, 'proveedores', proveedorAEditar.id);

      await updateDoc(proveedorRef, {
        empresa: formData.empresa,
        ubicacion: formData.ubicacion,
        contactoNombre: formData.contactoNombre,
        contactoTelefono: formData.contactoTelefono,
        contactoEmail: formData.contactoEmail,
        informacionTelefono: formData.informacionTelefono,
        informacionEmail: formData.informacionEmail,
        productosSuministrados: formData.productosSuministrados || 0,
        calificacion: formData.calificacion || 0,
        fechaModificacion: Timestamp.fromDate(new Date()),
      });

      setIsModalOpen(false);
      setProveedorAEditar(null);
      return true;
    } catch (err) {
      console.error('Error al actualizar proveedor:', err);
      alert('Error al actualizar el proveedor. Por favor, intenta de nuevo.');
      return false;
    }
  };

  const handleAbrirModalEdicion = (proveedor: Proveedor) => {
    setProveedorAEditar(proveedor);
    setIsModalOpen(true);
  };

  const handleConfirmarEliminar = async () => {
    if (!proveedorAEliminar) return;

    try {
      const proveedorRef = doc(db, 'proveedores', proveedorAEliminar.id);
      await deleteDoc(proveedorRef);
      setProveedorAEliminar(null);
    } catch (err) {
      console.error('Error al eliminar proveedor:', err);
      alert('Error al eliminar el proveedor. Por favor, intenta de nuevo.');
    }
  };

  const handleAbrirModalEliminar = (proveedorId: string, proveedorName: string) => {
    setProveedorAEliminar({ id: proveedorId, nombre: proveedorName });
  };

  const handleAbrirModalVer = (proveedor: Proveedor) => {
    setProveedorAVer(proveedor);
  };

  // Filtrar proveedores localmente por término de búsqueda
  const proveedoresFiltrados = proveedores.filter((proveedor) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      proveedor.empresa.toLowerCase().includes(searchLower) ||
      proveedor.id.toLowerCase().includes(searchLower) ||
      proveedor.contacto.nombre.toLowerCase().includes(searchLower) ||
      proveedor.contacto.email.toLowerCase().includes(searchLower)
    );
  });

  // Calcular estadísticas
  const totalProveedores = proveedoresFiltrados.length;
  const proveedoresActivos = proveedoresFiltrados.filter(p => p.estado === 'Activo').length;
  const productosSuministrados = proveedoresFiltrados.reduce((sum, p) => sum + p.productosSuministrados, 0);
  const calificacionPromedio = proveedoresFiltrados.length > 0
    ? proveedoresFiltrados.reduce((sum, p) => sum + p.calificacion, 0) / proveedoresFiltrados.length
    : 0;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Proveedores</h1>
          <p className="text-gray-600 mt-1">Gestiona la información de tus proveedores</p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-[calc(var(--radius)+4px)] bg-[color:var(--primary)] px-5 py-2 text-[color:var(--primary-foreground)] shadow-sm hover:bg-[color:var(--primary)]/90"
        >
          <Plus className="h-4 w-4" />
          Nuevo Proveedor
        </Button>
      </div>

      <SupplierStats
        totalProveedores={totalProveedores}
        proveedoresActivos={proveedoresActivos}
        productosSuministrados={productosSuministrados}
        calificacionPromedio={calificacionPromedio}
      />
      <SupplierFilters searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      <SupplierTable
        proveedores={proveedoresFiltrados}
        loading={loading}
        error={error}
        onEdit={handleAbrirModalEdicion}
        onDelete={handleAbrirModalEliminar}
        onView={handleAbrirModalVer}
      />

      {/* Dialog para crear/editar proveedor */}
      <Dialog open={isModalOpen} onOpenChange={(open) => {
        setIsModalOpen(open);
        if (!open) {
          setProveedorAEditar(null);
        }
      }}>
        <DialogContent onClose={() => setIsModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>{proveedorAEditar ? "Editar Proveedor" : "Nuevo Proveedor"}</DialogTitle>
            <DialogDescription>
              {proveedorAEditar
                ? "Modifique los datos del proveedor. Los campos marcados con * son obligatorios."
                : "Agregue un nuevo proveedor al sistema. Los campos marcados con * son obligatorios."
              }
            </DialogDescription>
          </DialogHeader>
          <SupplierForm
            onSubmit={proveedorAEditar ? handleUpdateSupplier : handleCreateSupplier}
            onCancel={() => setIsModalOpen(false)}
            initialData={proveedorAEditar ? {
              empresa: proveedorAEditar.empresa,
              ubicacion: proveedorAEditar.ubicacion,
              contactoNombre: proveedorAEditar.contacto.nombre,
              contactoTelefono: proveedorAEditar.contacto.telefono,
              contactoEmail: proveedorAEditar.contacto.email,
              informacionTelefono: proveedorAEditar.informacion.telefono,
              informacionEmail: proveedorAEditar.informacion.email,
              productosSuministrados: proveedorAEditar.productosSuministrados,
              calificacion: proveedorAEditar.calificacion,
            } : undefined}
          />
        </DialogContent>
      </Dialog>

      {/* AlertDialog para confirmación de eliminación */}
      <AlertDialog open={proveedorAEliminar !== null} onOpenChange={(open) => {
        if (!open) setProveedorAEliminar(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar el proveedor "{proveedorAEliminar?.nombre}"?
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmarEliminar}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog para ver detalles del proveedor */}
      <Dialog open={proveedorAVer !== null} onOpenChange={(open) => {
        if (!open) setProveedorAVer(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalles del Proveedor</DialogTitle>
            <DialogDescription>
              Información completa del proveedor seleccionado
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-500">
                  Empresa
                </Label>
                <p className="text-gray-900 font-semibold">
                  {proveedorAVer?.empresa}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-500">
                  Ubicación
                </Label>
                <p className="text-gray-900">
                  {proveedorAVer?.ubicacion}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-500">
                Contacto Principal
              </Label>
              <p className="text-gray-900 font-semibold">
                {proveedorAVer?.contacto.nombre}
              </p>
              <p className="text-gray-600 text-sm">
                {proveedorAVer?.contacto.telefono}
              </p>
              <p className="text-gray-600 text-sm">
                {proveedorAVer?.contacto.email}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-500">
                  Productos Suministrados
                </Label>
                <p className="text-gray-900 font-semibold">
                  {proveedorAVer?.productosSuministrados}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-500">
                  Última Compra
                </Label>
                <p className="text-gray-900">
                  {proveedorAVer?.ultimaCompra}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-500">
                  Calificación
                </Label>
                <p className="text-gray-900 font-semibold">
                  {proveedorAVer?.calificacion}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-500">
                Estado
              </Label>
              <p className={`font-semibold ${
                proveedorAVer?.estado === 'Activo' ? 'text-green-600' : 'text-gray-600'
              }`}>
                {proveedorAVer?.estado}
              </p>
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => setProveedorAVer(null)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
