import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Calendar, Package, FileText, User, Building } from "lucide-react";
import { MovementStats } from "../components/MovementStats";
import { MovementFilters } from "../components/MovementFilters";
import { MovementTable, type Movimiento } from "../components/MovementTable";
import { MovementForm } from "../components/MovementForm";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  doc,
  runTransaction,
  serverTimestamp,
  onSnapshot,
  getDocs,
  query,
  where,
} from "firebase/firestore";

interface Producto {
  id: string;
  nombre: string;
  precio: number;
  codigo: string;
  stock: number;
}

interface MovementFormData {
  tipo: "Entrada" | "Salida" | "";
  concepto: string;
  productoId: string;
  cantidad: number;
  precioUnitario: number;
  numeroDocumento: string;
  almacen: string;
  observaciones: string;
}

export function MovimientosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [movimientoAVer, setMovimientoAVer] = useState<Movimiento | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoMovimiento, setTipoMovimiento] = useState("all");
  const [periodo, setPeriodo] = useState("all");

  // Fetch productos once on mount
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const productosSnapshot = await getDocs(collection(db, "productos"));
        const productosData = productosSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Producto[];
        setProductos(productosData);
      } catch (error) {
        console.error("Error al cargar productos:", error);
        alert("Error al cargar los productos");
      }
    };

    fetchProductos();
  }, []);

  // Listen to movimientos collection in real-time with tipo filter
  useEffect(() => {
    let movimientosQuery = collection(db, "movimientos");

    // Apply tipo filter if selected
    if (tipoMovimiento !== "all") {
      movimientosQuery = query(
        collection(db, "movimientos"),
        where("tipo", "==", tipoMovimiento)
      ) as any;
    }

    const unsubscribe = onSnapshot(
      movimientosQuery,
      (snapshot) => {
        const movimientosData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            fechaHora: data.fecha?.toDate().toLocaleString("es-ES") || "",
            tipo: data.tipo,
            concepto: data.concepto,
            producto: {
              nombre: data.productoNombre || "",
              codigo: data.productoCodigo || "",
            },
            cantidad: data.cantidad,
            precioUnitario: data.precioUnitario,
            total: data.cantidad * data.precioUnitario,
            documento: data.numeroDocumento || "",
            usuario: data.usuario || "Sistema",
          } as Movimiento;
        });
        setMovimientos(movimientosData);
        setLoading(false);
      },
      (error) => {
        console.error("Error al cargar movimientos:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [tipoMovimiento]);

  // Filter movements by search term and period
  const movimientosFiltrados = useMemo(() => {
    let filtered = movimientos;

    // Filter by search term (local filtering)
    if (searchTerm) {
      filtered = filtered.filter(
        (m) =>
          m.producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.documento.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.usuario.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by period
    if (periodo !== "all") {
      const now = new Date();
      filtered = filtered.filter((m) => {
        const movDate = new Date(
          m.fechaHora.split(",")[0].split("/").reverse().join("-")
        );
        const diffDays = Math.floor(
          (now.getTime() - movDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        switch (periodo) {
          case "today":
            return diffDays === 0;
          case "week":
            return diffDays <= 7;
          case "month":
            return diffDays <= 30;
          case "quarter":
            return diffDays <= 90;
          case "year":
            return diffDays <= 365;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [movimientos, searchTerm, periodo]);

  const handleRegisterMovement = async (formData: MovementFormData) => {
    try {
      // Get current authenticated user
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("Usuario no autenticado");
      }

      const userName = currentUser.displayName || currentUser.email || "Usuario";

      await runTransaction(db, async (transaction) => {
        // Get product reference
        const productRef = doc(db, "productos", formData.productoId);

        // Read product document
        const productDoc = await transaction.get(productRef);

        if (!productDoc.exists()) {
          throw new Error("El producto seleccionado no existe");
        }

        const productData = productDoc.data();
        const currentStock = productData.stock || 0;

        // Validate stock for "Salida"
        if (formData.tipo === "Salida" && currentStock < formData.cantidad) {
          throw new Error(
            `Stock insuficiente. Disponible: ${currentStock}, Solicitado: ${formData.cantidad}`
          );
        }

        // Calculate new stock
        const newStock =
          currentStock +
          (formData.tipo === "Entrada" ? formData.cantidad : -formData.cantidad);

        // Update product stock
        transaction.update(productRef, { stock: newStock });

        // Create new movement reference
        const newMovementRef = doc(collection(db, "movimientos"));

        // Create movement record
        transaction.set(newMovementRef, {
          tipo: formData.tipo,
          concepto: formData.concepto,
          productoId: formData.productoId,
          productoNombre: productData.nombre,
          productoCodigo: productData.codigo,
          cantidad: formData.cantidad,
          precioUnitario: formData.precioUnitario,
          numeroDocumento: formData.numeroDocumento,
          almacen: formData.almacen,
          observaciones: formData.observaciones,
          fecha: serverTimestamp(),
          usuario: userName,
        });
      });

      // Success
      alert("Movimiento registrado exitosamente");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error al registrar movimiento:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Error al registrar el movimiento"
      );
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Movimientos de Inventario
          </h1>
          <p className="text-muted-foreground">
            Registro completo de entradas y salidas de inventario
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Movimiento
        </Button>
      </div>

      {/* Stats Cards */}
      <MovementStats movimientos={movimientosFiltrados} />

      {/* Filters */}
      <MovementFilters
        searchTerm={searchTerm}
        tipoMovimiento={tipoMovimiento}
        periodo={periodo}
        onSearchChange={setSearchTerm}
        onTypeChange={setTipoMovimiento}
        onPeriodChange={setPeriodo}
      />

      {/* Movements Table */}
      {loading ? (
        <div className="text-center py-8">Cargando movimientos...</div>
      ) : (
        <MovementTable
          movimientos={movimientosFiltrados}
          onView={setMovimientoAVer}
        />
      )}

      {/* Modal for New Movement */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent onClose={() => setIsModalOpen(false)}>
          <MovementForm
            productos={productos}
            onSubmit={handleRegisterMovement}
            onCancel={() => setIsModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Modal for View Movement Details */}
      <Dialog open={!!movimientoAVer} onOpenChange={() => setMovimientoAVer(null)}>
        <DialogContent onClose={() => setMovimientoAVer(null)}>
          {movimientoAVer && (
            <>
              <DialogHeader>
                <DialogTitle>Detalles del Movimiento</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 mt-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Fecha y Hora</span>
                    </div>
                    <p className="text-base font-medium">{movimientoAVer.fechaHora}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Package className="h-4 w-4" />
                      <span>Tipo de Movimiento</span>
                    </div>
                    <div>
                      {movimientoAVer.tipo === "Entrada" ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                          <Plus className="h-3 w-3" />
                          Entrada
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-700 rounded-lg text-sm font-medium">
                          <Plus className="h-3 w-3 rotate-45" />
                          Salida
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Concepto</p>
                    <p className="text-base font-medium">{movimientoAVer.concepto}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">ID Movimiento</p>
                    <p className="text-base font-mono">{movimientoAVer.id}</p>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="text-sm font-semibold mb-4">Producto</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Nombre</p>
                      <p className="text-base font-medium">
                        {movimientoAVer.producto.nombre}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Código</p>
                      <p className="text-base font-mono">
                        {movimientoAVer.producto.codigo}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="text-sm font-semibold mb-4">Cantidades y Precios</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Cantidad</p>
                      <p className="text-2xl font-bold">{movimientoAVer.cantidad}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Precio Unitario</p>
                      <p className="text-2xl font-bold">
                        €{movimientoAVer.precioUnitario.toFixed(2)}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-2xl font-bold text-primary">
                        €{movimientoAVer.total.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span>Documento</span>
                      </div>
                      <p className="text-base font-mono">
                        {movimientoAVer.documento || "N/A"}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>Registrado por</span>
                      </div>
                      <p className="text-base font-medium">{movimientoAVer.usuario}</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
