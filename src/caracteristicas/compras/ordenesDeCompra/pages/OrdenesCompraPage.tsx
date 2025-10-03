import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { PurchaseOrderStats } from "../components/PurchaseOrderStats";
import { PurchaseOrderFilters } from "../components/PurchaseOrderFilters";
import { PurchaseOrderTable, type OrdenCompra } from "../components/PurchaseOrderTable";
import {
  PurchaseOrderForm,
  type Producto,
  type Proveedor,
  type OrderFormData,
} from "../components/PurchaseOrderForm";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  getDocs,
  doc,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";

export default function OrdenesCompraPage() {
  const [ordenes, setOrdenes] = useState<OrdenCompra[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Leer órdenes de compra en tiempo real
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "ordenesCompra"),
      (snapshot) => {
        const ordenesData: OrdenCompra[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            numeroOrden: data.numeroOrden || "",
            fecha: data.fecha || "",
            proveedor: {
              nombre: data.proveedorNombre || "",
              codigo: data.proveedorContacto || "",
            },
            productos: data.productosResumen || "",
            fechaEntrega: data.fechaEntrega || "",
            total: data.subtotal || 0,
            estado: data.estado || "Pendiente",
            usuario: data.usuario || "",
          };
        });
        setOrdenes(ordenesData);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Leer productos (una vez)
  useEffect(() => {
    const fetchProductos = async () => {
      const snapshot = await getDocs(collection(db, "productos"));
      const productosData: Producto[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          nombre: data.nombre || "",
          codigo: data.codigo || "",
          precio: data.precio || 0,
          stock: data.stock || 0,
        };
      });
      setProductos(productosData);
    };

    fetchProductos();
  }, []);

  // Leer proveedores (una vez)
  useEffect(() => {
    const fetchProveedores = async () => {
      const snapshot = await getDocs(collection(db, "proveedores"));
      const proveedoresData: Proveedor[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          nombre: data.nombre || "",
          contacto: data.contacto || "",
        };
      });
      setProveedores(proveedoresData);
    };

    fetchProveedores();
  }, []);

  const handleCreateOrder = async (formData: OrderFormData) => {
    try {
      const batch = writeBatch(db);
      const userName = auth.currentUser?.displayName || auth.currentUser?.email || "Usuario";

      // Crear referencia para la nueva orden
      const newOrderRef = doc(collection(db, "ordenesCompra"));

      // Generar número de orden
      const year = new Date().getFullYear();
      const orderNumber = `COMP-${year}-${String(ordenes.length + 1).padStart(3, "0")}`;

      // Crear resumen de productos
      const productosResumen = `${formData.items.length} productos\n${formData.items[0].productoNombre} ${formData.items.length > 1 ? `+${formData.items.length - 1} más` : ""}`;

      // Datos de la orden principal
      const orderData = {
        numeroOrden: orderNumber,
        fecha: new Date().toISOString().split("T")[0],
        proveedorId: formData.proveedorId,
        proveedorNombre: formData.proveedorNombre,
        proveedorContacto: proveedores.find((p) => p.id === formData.proveedorId)?.contacto || "",
        fechaEntrega: formData.fechaEntrega,
        productosResumen,
        cantidadProductos: formData.items.length,
        subtotal: formData.subtotal,
        impuestos: formData.impuestos,
        total: formData.total,
        estado: "Pendiente",
        usuario: userName,
        creadoEn: serverTimestamp(),
      };

      batch.set(newOrderRef, orderData);

      // Agregar items a la sub-colección
      formData.items.forEach((item) => {
        const itemRef = doc(collection(newOrderRef, "items"));
        batch.set(itemRef, {
          productoId: item.productoId,
          productoNombre: item.productoNombre,
          productoCodigo: item.productoCodigo,
          cantidad: item.cantidad,
          costoUnitario: item.costoUnitario,
          subtotal: item.cantidad * item.costoUnitario,
          creadoEn: serverTimestamp(),
        });
      });

      // Ejecutar batch
      await batch.commit();

      setIsDialogOpen(false);
      alert("Orden de compra creada exitosamente");
    } catch (error) {
      console.error("Error al crear orden:", error);
      alert("Error al crear la orden de compra");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Cargando órdenes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Órdenes de Compra</h1>
          <p className="text-muted-foreground">
            Gestión completa de órdenes de compra y seguimiento de proveedores
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Orden de Compra
        </Button>
      </div>

      {/* Stats Cards */}
      <PurchaseOrderStats ordenes={ordenes} />

      {/* Filters */}
      <PurchaseOrderFilters />

      {/* Table */}
      <PurchaseOrderTable ordenes={ordenes} />

      {/* Dialog para crear orden */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva Orden de Compra</DialogTitle>
          </DialogHeader>
          <PurchaseOrderForm
            productos={productos}
            proveedores={proveedores}
            onSubmit={handleCreateOrder}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
