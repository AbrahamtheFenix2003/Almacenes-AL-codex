import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Plus, ClipboardList, CheckCircle, AlertCircle, DollarSign, Calendar, User, TrendingUp, TrendingDown } from "lucide-react";
import { AdjustmentTable, type Ajuste } from "../components/AdjustmentTable";
import { AdjustmentForm, type AdjustmentFormData } from "../components/AdjustmentForm";
import { db, auth } from "@/lib/firebase";
import { collection, onSnapshot, doc, runTransaction, serverTimestamp, query, where, updateDoc } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";

interface Producto {
  id: string;
  nombre: string;
  codigo: string;
  stock: number;
  precio: number;
}

export function AjustesPage() {
  const [ajustes, setAjustes] = useState<Ajuste[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [ajusteAVer, setAjusteAVer] = useState<Ajuste | null>(null);

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoAjuste, setTipoAjuste] = useState("");
  const [estadoAjuste, setEstadoAjuste] = useState("");

  // Leer productos desde Firebase
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "productos"), (snapshot) => {
      const productosData: Producto[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        productosData.push({
          id: doc.id,
          nombre: data.nombre || "",
          codigo: data.codigo || "",
          stock: data.stock || 0,
          precio: data.precio || 0,
        });
      });
      setProductos(productosData);
    });

    return () => unsubscribe();
  }, []);

  // Leer ajustes desde Firebase con filtros dinámicos
  useEffect(() => {
    // Construir consulta dinámica
    let ajustesQuery = collection(db, "ajustes");
    const constraints = [];

    if (tipoAjuste) {
      constraints.push(where("motivo", "==", tipoAjuste));
    }

    if (estadoAjuste) {
      constraints.push(where("estado", "==", estadoAjuste));
    }

    if (constraints.length > 0) {
      ajustesQuery = query(collection(db, "ajustes"), ...constraints) as any;
    }

    const unsubscribe = onSnapshot(ajustesQuery, (snapshot) => {
      const ajustesData: Ajuste[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        const fecha = data.fecha?.toDate?.() || new Date();
        ajustesData.push({
          id: doc.id,
          fechaHora: fecha.toLocaleString("es-ES"),
          tipo: data.motivo || "Conteo Físico",
          producto: {
            nombre: data.producto?.nombre || "",
            codigo: data.producto?.codigo || "",
          },
          stockSistema: data.stockSistema || 0,
          stockFisico: data.stockFisico || 0,
          diferencia: data.diferencia || 0,
          valor: data.valor || 0,
          estado: data.estado || "Pendiente",
          usuario: data.usuario || "",
          observaciones: data.observaciones || "",
        });
      });
      ajustesData.sort((a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime());
      setAjustes(ajustesData);
    });

    return () => unsubscribe();
  }, [tipoAjuste, estadoAjuste]);

  // Registrar ajuste con transacción de Firestore (sin aplicar cambios hasta aprobar)
  const handleRegisterAdjustment = async (formData: AdjustmentFormData) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("Usuario no autenticado");
    }

    const userName = currentUser.displayName || currentUser.email || "Usuario";

    await runTransaction(db, async (transaction) => {
      // 1. Obtener referencia al producto y leerlo
      const productRef = doc(db, "productos", formData.productoId);
      const productDoc = await transaction.get(productRef);

      if (!productDoc.exists()) {
        throw new Error("El producto no existe");
      }

      const productData = productDoc.data();
      const producto = {
        nombre: productData.nombre || "",
        codigo: productData.codigo || "",
      };

      // 2. Calcular diferencia
      const diferencia = formData.diferencia;
      const valor = Math.abs(diferencia) * (productData.precio || 0);

      // 3. Crear registro del ajuste en estado Pendiente (SIN actualizar stock)
      const newAdjustmentRef = doc(collection(db, "ajustes"));
      transaction.set(newAdjustmentRef, {
        productoId: formData.productoId,
        producto,
        stockSistema: formData.stockSistema,
        stockFisico: formData.stockFisico,
        diferencia,
        valor,
        motivo: formData.motivo,
        observaciones: formData.observaciones,
        estado: "Pendiente",
        usuario: userName,
        fecha: serverTimestamp(),
        precioUnitario: productData.precio || 0, // Guardamos el precio para usar al aprobar
      });

      // NO se actualiza el stock ni se crea el movimiento hasta que se apruebe
    });

    setIsFormOpen(false);
    alert("Ajuste registrado exitosamente. Requiere aprobación para aplicar cambios.");
  };

  // Filtro local por término de búsqueda
  const ajustesFiltrados = useMemo(() => {
    if (!searchTerm) return ajustes;

    const term = searchTerm.toLowerCase();
    return ajustes.filter(
      (ajuste) =>
        ajuste.producto.nombre.toLowerCase().includes(term) ||
        ajuste.producto.codigo.toLowerCase().includes(term) ||
        ajuste.tipo.toLowerCase().includes(term) ||
        ajuste.id.toLowerCase().includes(term) ||
        ajuste.usuario.toLowerCase().includes(term)
    );
  }, [ajustes, searchTerm]);

  // Calcular estadísticas dinámicas
  const stats = useMemo(() => {
    const aprobados = ajustesFiltrados.filter((a) => a.estado === "Aprobado");
    const pendientes = ajustesFiltrados.filter((a) => a.estado === "Pendiente");
    const valorTotal = ajustesFiltrados.reduce((sum, a) => sum + a.valor, 0);
    const diferenciaTotal = ajustesFiltrados.reduce((sum, a) => sum + a.diferencia, 0);

    return {
      total: ajustesFiltrados.length,
      aprobados: aprobados.length,
      pendientes: pendientes.length,
      valorTotal,
      diferenciaTotal,
    };
  }, [ajustesFiltrados]);

  // Función para abrir modal de ver
  const handleAbrirModalVer = (ajuste: Ajuste) => {
    setAjusteAVer(ajuste);
  };

  // Función para aprobar ajuste (aplica cambios al stock y crea movimiento)
  const handleAprobarAjuste = async () => {
    if (!ajusteAVer) return;

    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert("Usuario no autenticado");
      return;
    }

    const userName = currentUser.displayName || currentUser.email || "Usuario";

    try {
      await runTransaction(db, async (transaction) => {
        // 1. Leer el documento del ajuste
        const ajusteRef = doc(db, "ajustes", ajusteAVer.id);
        const ajusteDoc = await transaction.get(ajusteRef);

        if (!ajusteDoc.exists()) {
          throw new Error("El ajuste no existe");
        }

        const ajusteData = ajusteDoc.data();

        // 2. Obtener referencia al producto y leerlo
        const productRef = doc(db, "productos", ajusteData.productoId);
        const productDoc = await transaction.get(productRef);

        if (!productDoc.exists()) {
          throw new Error("El producto no existe");
        }

        // 3. Actualizar stock del producto
        transaction.update(productRef, {
          stock: ajusteData.stockFisico,
        });

        // 4. Actualizar estado del ajuste a Aprobado
        transaction.update(ajusteRef, {
          estado: "Aprobado",
          aprobadoPor: userName,
          fechaAprobacion: serverTimestamp(),
        });

        // 5. Crear registro del movimiento
        const tipoMovimiento = ajusteData.diferencia >= 0 ? "Entrada" : "Salida";
        const cantidad = Math.abs(ajusteData.diferencia);
        const precioUnitario = ajusteData.precioUnitario || 0;

        const newMovementRef = doc(collection(db, "movimientos"));
        transaction.set(newMovementRef, {
          productoId: ajusteData.productoId,
          producto: ajusteData.producto,
          tipo: tipoMovimiento,
          cantidad,
          precioUnitario,
          total: cantidad * precioUnitario,
          concepto: `Ajuste por ${ajusteData.motivo}`,
          documento: `AJ-${ajusteAVer.id.substring(0, 8).toUpperCase()}`,
          observaciones: ajusteData.observaciones || "",
          usuario: ajusteData.usuario,
          fecha: serverTimestamp(),
        });
      });

      setAjusteAVer(null);
      alert("Ajuste aprobado exitosamente. Stock actualizado y movimiento registrado.");
    } catch (error) {
      console.error("Error al aprobar ajuste:", error);
      alert("Error al aprobar el ajuste: " + (error as Error).message);
    }
  };

  // Función para rechazar ajuste (solo cambia el estado, no modifica stock)
  const handleRechazarAjuste = async () => {
    if (!ajusteAVer) return;

    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert("Usuario no autenticado");
      return;
    }

    const userName = currentUser.displayName || currentUser.email || "Usuario";

    try {
      const ajusteRef = doc(db, "ajustes", ajusteAVer.id);
      await updateDoc(ajusteRef, {
        estado: "Rechazado",
        rechazadoPor: userName,
        fechaRechazo: serverTimestamp(),
      });
      setAjusteAVer(null);
      alert("Ajuste rechazado. No se realizaron cambios en el inventario.");
    } catch (error) {
      console.error("Error al rechazar ajuste:", error);
      alert("Error al rechazar el ajuste: " + (error as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Ajustes de Inventario
          </h1>
          <p className="text-muted-foreground">
            Gestión de diferencias, mermas y correcciones de inventario
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Ajuste
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ajustes</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Este periodo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprobados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.aprobados}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? ((stats.aprobados / stats.total) * 100).toFixed(1) : 0}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendientes}</div>
            <p className="text-xs text-muted-foreground">Requieren aprobación</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Ajustado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{stats.valorTotal.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Diferencia {stats.diferenciaTotal > 0 ? "+" : ""}{stats.diferenciaTotal} unidades
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="rounded-[var(--radius-xl)] border border-[color:var(--border)] bg-[color:var(--card)] p-6">
        <h3 className="text-sm font-medium mb-4">Filtros de Búsqueda</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar producto, documento, motivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex h-11 w-full rounded-[calc(var(--radius)+4px)] border border-[color:var(--border)] bg-[color:var(--input-background)] px-4 text-sm"
            />
          </div>
          <select
            value={tipoAjuste}
            onChange={(e) => setTipoAjuste(e.target.value)}
            className="flex h-11 w-full appearance-none items-center rounded-[calc(var(--radius)+4px)] border border-[color:var(--border)] bg-[color:var(--card)] px-4 text-sm"
          >
            <option value="">Todos los tipos</option>
            <option value="Conteo Físico">Conteo Físico</option>
            <option value="Merma">Merma</option>
            <option value="Corrección">Corrección</option>
            <option value="Vencimiento">Vencimiento</option>
            <option value="Robo/Pérdida">Robo/Pérdida</option>
          </select>
          <select
            value={estadoAjuste}
            onChange={(e) => setEstadoAjuste(e.target.value)}
            className="flex h-11 w-full appearance-none items-center rounded-[calc(var(--radius)+4px)] border border-[color:var(--border)] bg-[color:var(--card)] px-4 text-sm"
          >
            <option value="">Todos los estados</option>
            <option value="Aprobado">Aprobado</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Rechazado">Rechazado</option>
          </select>
        </div>
      </div>

      {/* Adjustments Table */}
      <AdjustmentTable ajustes={ajustesFiltrados} onView={handleAbrirModalVer} />

      {/* Modal de Formulario */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Registrar Nuevo Ajuste de Inventario</DialogTitle>
          </DialogHeader>
          <AdjustmentForm
            productos={productos}
            onSubmit={handleRegisterAdjustment}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de Visualización de Ajuste */}
      <Dialog open={ajusteAVer !== null} onOpenChange={() => setAjusteAVer(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalles del Ajuste</DialogTitle>
            <DialogDescription>
              Información completa del ajuste de inventario
            </DialogDescription>
          </DialogHeader>

          {ajusteAVer && (
            <div className="space-y-6">
              {/* Información General */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    ID del Ajuste
                  </label>
                  <p className="text-base font-semibold">{ajusteAVer.id}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Fecha y Hora
                  </label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-base">{ajusteAVer.fechaHora}</p>
                  </div>
                </div>
              </div>

              {/* Tipo y Estado */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Tipo de Ajuste
                  </label>
                  <Badge
                    variant="outline"
                    className={
                      ajusteAVer.tipo === "Conteo Físico"
                        ? "border-blue-200 bg-blue-50 text-blue-700"
                        : ajusteAVer.tipo === "Merma"
                        ? "border-red-200 bg-red-50 text-red-700"
                        : ajusteAVer.tipo === "Corrección"
                        ? "border-yellow-200 bg-yellow-50 text-yellow-700"
                        : ajusteAVer.tipo === "Vencimiento"
                        ? "border-orange-200 bg-orange-50 text-orange-700"
                        : "border-purple-200 bg-purple-50 text-purple-700"
                    }
                  >
                    {ajusteAVer.tipo}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Estado
                  </label>
                  <Badge
                    variant="outline"
                    className={
                      ajusteAVer.estado === "Aprobado"
                        ? "border-green-200 bg-green-50 text-green-700"
                        : ajusteAVer.estado === "Pendiente"
                        ? "border-yellow-200 bg-yellow-50 text-yellow-700"
                        : "border-red-200 bg-red-50 text-red-700"
                    }
                  >
                    {ajusteAVer.estado}
                  </Badge>
                </div>
              </div>

              {/* Producto */}
              <div className="space-y-2 rounded-lg border p-4 bg-muted/50">
                <label className="text-sm font-medium text-muted-foreground">
                  Producto
                </label>
                <div>
                  <p className="text-base font-semibold">
                    {ajusteAVer.producto.nombre}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Código: {ajusteAVer.producto.codigo}
                  </p>
                </div>
              </div>

              {/* Stock y Diferencia */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2 rounded-lg border p-4">
                  <label className="text-sm font-medium text-muted-foreground">
                    Stock Sistema
                  </label>
                  <p className="text-2xl font-bold">{ajusteAVer.stockSistema}</p>
                </div>
                <div className="space-y-2 rounded-lg border p-4">
                  <label className="text-sm font-medium text-muted-foreground">
                    Stock Físico
                  </label>
                  <p className="text-2xl font-bold">{ajusteAVer.stockFisico}</p>
                </div>
                <div className="space-y-2 rounded-lg border p-4">
                  <label className="text-sm font-medium text-muted-foreground">
                    Diferencia
                  </label>
                  <div
                    className={`flex items-center gap-2 text-2xl font-bold ${
                      ajusteAVer.diferencia > 0
                        ? "text-green-600"
                        : ajusteAVer.diferencia < 0
                        ? "text-red-600"
                        : ""
                    }`}
                  >
                    {ajusteAVer.diferencia > 0 ? (
                      <TrendingUp className="h-5 w-5" />
                    ) : ajusteAVer.diferencia < 0 ? (
                      <TrendingDown className="h-5 w-5" />
                    ) : null}
                    {ajusteAVer.diferencia}
                  </div>
                </div>
              </div>

              {/* Valor y Usuario */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Valor del Ajuste
                  </label>
                  <p className="text-2xl font-bold">€{ajusteAVer.valor.toFixed(2)}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Usuario
                  </label>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <p className="text-base">{ajusteAVer.usuario}</p>
                  </div>
                </div>
              </div>

              {/* Observaciones */}
              {ajusteAVer.observaciones && (
                <div className="space-y-2 rounded-lg border p-4 bg-muted/30">
                  <label className="text-sm font-medium text-muted-foreground">
                    Observaciones
                  </label>
                  <p className="text-sm leading-relaxed">{ajusteAVer.observaciones}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            {ajusteAVer?.estado === "Pendiente" && (
              <>
                <Button
                  variant="outline"
                  onClick={handleRechazarAjuste}
                  className="border-red-200 text-red-700 hover:bg-red-50"
                >
                  Rechazar Ajuste
                </Button>
                <Button
                  onClick={handleAprobarAjuste}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Aprobar Ajuste
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => setAjusteAVer(null)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
