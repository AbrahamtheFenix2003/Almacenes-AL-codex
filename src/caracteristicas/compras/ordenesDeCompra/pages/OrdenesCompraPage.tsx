import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Package, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { PurchaseOrderStats } from "../components/PurchaseOrderStats";
import { PurchaseOrderFilters } from "../components/PurchaseOrderFilters";
import { PurchaseOrderTable, type OrdenCompra } from "../components/PurchaseOrderTable";
import {
  PurchaseOrderForm,
  type Producto,
  type Proveedor,
  type OrderFormData,
  type InitialOrderData,
  type OrderItem,
} from "../components/PurchaseOrderForm";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  getDocs,
  doc,
  writeBatch,
  serverTimestamp,
  query,
  where,
  runTransaction,
  Timestamp,
} from "firebase/firestore";

export default function OrdenesCompraPage() {
  const [ordenes, setOrdenes] = useState<OrdenCompra[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");

  // Estados para Ver orden
  const [ordenAVer, setOrdenAVer] = useState<OrdenCompra | null>(null);
  const [itemsAVer, setItemsAVer] = useState<OrderItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Estados para Editar orden
  const [ordenAEditar, setOrdenAEditar] = useState<InitialOrderData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Estados para Eliminar orden
  const [ordenAEliminar, setOrdenAEliminar] = useState<{ id: string; numero: string } | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Leer órdenes de compra en tiempo real con filtros
  useEffect(() => {
    let q = collection(db, "ordenesCompra");
    const constraints = [];

    // Aplicar filtro de estado
    if (selectedStatus) {
      constraints.push(where("estado", "==", selectedStatus));
    }

    // Aplicar filtro de proveedor
    if (selectedSupplier) {
      constraints.push(where("proveedorId", "==", selectedSupplier));
    }

    // Construir query con filtros
    const ordenesQuery = constraints.length > 0 ? query(q, ...constraints) : q;

    const unsubscribe = onSnapshot(
      ordenesQuery,
      (snapshot) => {
        const ordenesData: OrdenCompra[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          const rawEstado = typeof data.estado === "string" ? data.estado : "";
          const estadoNormalizado = rawEstado === "Recibido" ? "Recibido" : "Pendiente";

          return {
            id: doc.id,
            numeroOrden: data.numeroOrden || "",
            fecha: data.fecha || "",
            proveedor: {
              nombre: data.proveedorNombre || "",
              codigo: data.proveedorContacto || "",
            },
            proveedorId: data.proveedorId || "",
            productos: data.productosResumen || "",
            fechaEntrega: data.fechaEntrega || "",
            total: data.total || 0,
            estado: estadoNormalizado,
            usuario: data.usuario || "",
          };
        });
        setOrdenes(ordenesData);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [selectedStatus, selectedSupplier]);

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
          nombre: data.empresa || "",
          contacto: data.contactoNombre || "",
        };
      });
      setProveedores(proveedoresData);
    };

    fetchProveedores();
  }, []);

  // Filtrar órdenes localmente con searchTerm
  const ordenesFiltradas = useMemo(() => {
    if (!searchTerm) return ordenes;

    const termLower = searchTerm.toLowerCase();
    return ordenes.filter((orden) => {
      return (
        orden.numeroOrden.toLowerCase().includes(termLower) ||
        orden.proveedor.nombre.toLowerCase().includes(termLower) ||
        orden.usuario.toLowerCase().includes(termLower) ||
        orden.productos.toLowerCase().includes(termLower)
      );
    });
  }, [ordenes, searchTerm]);

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

  // Ver orden con detalles
  const handleViewOrder = async (orden: OrdenCompra) => {
    setOrdenAVer(orden);
    setIsViewDialogOpen(true);
    setLoadingItems(true);
    setItemsAVer([]);

    try {
      // Cargar items de la sub-colección
      const itemsSnapshot = await getDocs(
        collection(db, "ordenesCompra", orden.id, "items")
      );
      const items: OrderItem[] = itemsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          productoId: data.productoId || "",
          productoNombre: data.productoNombre || "",
          productoCodigo: data.productoCodigo || "",
          cantidad: data.cantidad || 0,
          costoUnitario: data.costoUnitario || 0,
        };
      });
      setItemsAVer(items);
    } catch (error) {
      console.error("Error al cargar items:", error);
      alert("Error al cargar los detalles de la orden");
    } finally {
      setLoadingItems(false);
    }
  };

  // Editar orden
  const handleEditOrder = async (orden: OrdenCompra) => {
    setLoadingItems(true);

    try {
      // Cargar items de la sub-colección
      const itemsSnapshot = await getDocs(
        collection(db, "ordenesCompra", orden.id, "items")
      );
      const items: OrderItem[] = itemsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          productoId: data.productoId || "",
          productoNombre: data.productoNombre || "",
          productoCodigo: data.productoCodigo || "",
          cantidad: data.cantidad || 0,
          costoUnitario: data.costoUnitario || 0,
        };
      });

      setOrdenAEditar({
        id: orden.id,
        proveedorId: orden.proveedorId || "",
        fechaEntrega: orden.fechaEntrega,
        items,
      });
      setIsEditDialogOpen(true);
    } catch (error) {
      console.error("Error al cargar orden para editar:", error);
      alert("Error al cargar la orden para editar");
    } finally {
      setLoadingItems(false);
    }
  };

  // Actualizar orden
  const handleUpdateOrder = async (formData: OrderFormData) => {
    if (!ordenAEditar) return;

    try {
      const batch = writeBatch(db);
      const ordenRef = doc(db, "ordenesCompra", ordenAEditar.id);

      // Crear resumen de productos
      const productosResumen = `${formData.items.length} productos\n${formData.items[0].productoNombre} ${formData.items.length > 1 ? `+${formData.items.length - 1} más` : ""}`;

      // Actualizar documento principal
      const orderData = {
        proveedorId: formData.proveedorId,
        proveedorNombre: formData.proveedorNombre,
        proveedorContacto: proveedores.find((p) => p.id === formData.proveedorId)?.contacto || "",
        fechaEntrega: formData.fechaEntrega,
        productosResumen,
        cantidadProductos: formData.items.length,
        total: formData.total,
      };

      batch.update(ordenRef, orderData);

      // Eliminar todos los items existentes
      const itemsSnapshot = await getDocs(
        collection(db, "ordenesCompra", ordenAEditar.id, "items")
      );
      itemsSnapshot.docs.forEach((itemDoc) => {
        batch.delete(doc(db, "ordenesCompra", ordenAEditar.id, "items", itemDoc.id));
      });

      // Agregar nuevos items
      formData.items.forEach((item) => {
        const itemRef = doc(collection(ordenRef, "items"));
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

      await batch.commit();

      setIsEditDialogOpen(false);
      setOrdenAEditar(null);
      alert("Orden actualizada exitosamente");
    } catch (error) {
      console.error("Error al actualizar orden:", error);
      alert("Error al actualizar la orden");
    }
  };

  // Preparar eliminación
  const handleDeleteOrder = (ordenId: string, numeroOrden: string) => {
    setOrdenAEliminar({ id: ordenId, numero: numeroOrden });
    setIsDeleteDialogOpen(true);
  };

  // Confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!ordenAEliminar) return;

    try {
      const batch = writeBatch(db);

      // Obtener todos los items de la sub-colección
      const itemsSnapshot = await getDocs(
        collection(db, "ordenesCompra", ordenAEliminar.id, "items")
      );

      // Agregar delete de cada item al batch
      itemsSnapshot.docs.forEach((itemDoc) => {
        batch.delete(doc(db, "ordenesCompra", ordenAEliminar.id, "items", itemDoc.id));
      });

      // Agregar delete del documento principal
      batch.delete(doc(db, "ordenesCompra", ordenAEliminar.id));

      // Ejecutar batch
      await batch.commit();

      setIsDeleteDialogOpen(false);
      setOrdenAEliminar(null);
      alert("Orden eliminada exitosamente");
    } catch (error) {
      console.error("Error al eliminar orden:", error);
      alert("Error al eliminar la orden");
    }
  };

  // Actualizar estado de la orden (simple)
  // Recibir orden (transacción compleja)
  const handleReceiveOrder = async (orden: OrdenCompra) => {
    if (!confirm(`¿Confirmar recepción de la orden ${orden.numeroOrden}? Esto actualizará el inventario.`)) {
      return;
    }

    try {
      // 1. Primero leer los items FUERA de la transacción
      const itemsSnapshot = await getDocs(
        collection(db, "ordenesCompra", orden.id, "items")
      );

      const items = itemsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          productoId: data.productoId as string,
          productoNombre: data.productoNombre as string,
          productoCodigo: data.productoCodigo as string,
          cantidad: data.cantidad as number,
          costoUnitario: data.costoUnitario as number,
        };
      });

      // 2. Ejecutar la transacción con todas las lecturas primero
      await runTransaction(db, async (transaction) => {
        // FASE DE LECTURA: Leer todos los productos primero
        const productReads = await Promise.all(
          items.map(async (item) => {
            const productRef = doc(db, "productos", item.productoId);
            const productSnap = await transaction.get(productRef);

            if (!productSnap.exists()) {
              throw new Error(`Producto ${item.productoNombre} no encontrado`);
            }

            return {
              ref: productRef,
              data: productSnap.data(),
              item: item,
            };
          })
        );

        // FASE DE ESCRITURA: Ahora actualizar todo
        for (const { ref: productRef, data: productData, item } of productReads) {
          const stockActual = productData.stock || 0;
          const nuevoStock = stockActual + item.cantidad;

          // Actualizar stock del producto
          transaction.update(productRef, {
            stock: nuevoStock,
          });

          // Crear movimiento de entrada
          const movimientoRef = doc(collection(db, "movimientos"));
          transaction.set(movimientoRef, {
            tipo: "Entrada",
            concepto: "Compra",
            productoId: item.productoId,
            productoNombre: item.productoNombre,
            productoCodigo: item.productoCodigo,
            cantidad: item.cantidad,
            precioUnitario: item.costoUnitario || 0,
            total: (item.cantidad * (item.costoUnitario || 0)),
            stockAnterior: stockActual,
            stockNuevo: nuevoStock,
            motivo: `Recepción orden de compra ${orden.numeroOrden}`,
            documento: orden.numeroOrden,
            ordenCompraId: orden.id,
            ordenCompraNumero: orden.numeroOrden,
            usuario: auth.currentUser?.displayName || auth.currentUser?.email || "Usuario",
            fecha: Timestamp.fromDate(new Date()),
            creadoEn: serverTimestamp(),
          });
        }

        // 3. Actualizar estado de la orden
        const ordenRef = doc(db, "ordenesCompra", orden.id);
        transaction.update(ordenRef, {
          estado: "Recibido",
        });
      });

      alert("Orden recibida exitosamente. Inventario actualizado.");
      setIsViewDialogOpen(false);
    } catch (error) {
      console.error("Error al recibir orden:", error);
      alert(`Error al recibir la orden: ${error instanceof Error ? error.message : "Error desconocido"}`);
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
      <PurchaseOrderStats ordenes={ordenesFiltradas} />

      {/* Filters */}
      <PurchaseOrderFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedSupplier={selectedSupplier}
        onSupplierChange={setSelectedSupplier}
        proveedores={proveedores}
      />

      {/* Table */}
      <PurchaseOrderTable
        ordenes={ordenesFiltradas}
        onView={handleViewOrder}
        onEdit={handleEditOrder}
        onDelete={handleDeleteOrder}
      />

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

      {/* Dialog para ver orden */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de la Orden</DialogTitle>
            <DialogDescription>
              {ordenAVer?.numeroOrden} - {ordenAVer?.proveedor.nombre}
            </DialogDescription>
          </DialogHeader>

          {ordenAVer && (
            <div className="space-y-6">
              {/* Información General */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Número de Orden</Label>
                  <p className="text-base font-semibold">{ordenAVer.numeroOrden}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Fecha</Label>
                  <p className="text-base">{ordenAVer.fecha}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Proveedor</Label>
                  <p className="text-base">{ordenAVer.proveedor.nombre}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Fecha de Entrega</Label>
                  <p className="text-base">{ordenAVer.fechaEntrega}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Estado</Label>
                  <p className="text-base">{ordenAVer.estado}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Usuario</Label>
                  <p className="text-base">{ordenAVer.usuario}</p>
                </div>
              </div>

              {/* Items del Pedido */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Items del Pedido</h3>
                {loadingItems ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Cargando detalles...</span>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Producto</TableHead>
                          <TableHead className="w-[120px]">Cantidad</TableHead>
                          <TableHead className="w-[140px]">Costo Unit. (S/.)</TableHead>
                          <TableHead className="text-right">Subtotal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {itemsAVer.map((item, index) => (
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
                            <TableCell>{item.cantidad}</TableCell>
                            <TableCell>{formatCurrency(item.costoUnitario)}</TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(item.cantidad * item.costoUnitario)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Total */}
                {!loadingItems && (
                  <div className="flex justify-end">
                    <div className="w-full max-w-sm space-y-2 rounded-lg border p-4 bg-muted/30">
                      <div className="flex justify-between">
                        <span className="font-semibold">Total:</span>
                        <span className="text-lg font-bold">
                          {formatCurrency(ordenAVer.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Botones de acción según estado */}
              {!loadingItems && (
                <div className="flex justify-end gap-2 pt-4 border-t">
                  {ordenAVer.estado === "Pendiente" ? (
                    <Button
                      onClick={() => handleReceiveOrder(ordenAVer)}
                      variant="default"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Marcar como recibida
                    </Button>
                  ) : (
                    <div className="text-sm text-green-600 font-medium">
                      Orden recibida
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para editar orden */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Orden de Compra</DialogTitle>
          </DialogHeader>
          <PurchaseOrderForm
            productos={productos}
            proveedores={proveedores}
            onSubmit={handleUpdateOrder}
            onCancel={() => {
              setIsEditDialogOpen(false);
              setOrdenAEditar(null);
            }}
            initialData={ordenAEditar || undefined}
          />
        </DialogContent>
      </Dialog>

      {/* AlertDialog para eliminar orden */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la orden{" "}
              <strong>{ordenAEliminar?.numero}</strong> y todos sus items asociados.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setOrdenAEliminar(null);
              }}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
