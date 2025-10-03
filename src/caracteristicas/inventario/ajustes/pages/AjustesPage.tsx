import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, ClipboardList, CheckCircle, AlertCircle, DollarSign } from "lucide-react";
import { AdjustmentTable, type Ajuste } from "../components/AdjustmentTable";
import { AdjustmentForm, type AdjustmentFormData } from "../components/AdjustmentForm";
import { db, auth } from "@/lib/firebase";
import { collection, onSnapshot, doc, runTransaction, serverTimestamp } from "firebase/firestore";

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

  // Leer ajustes desde Firebase
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "ajustes"), (snapshot) => {
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
        });
      });
      ajustesData.sort((a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime());
      setAjustes(ajustesData);
    });

    return () => unsubscribe();
  }, []);

  // Registrar ajuste con transacción de Firestore
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

      // 3. Actualizar stock del producto
      transaction.update(productRef, {
        stock: formData.stockFisico,
      });

      // 4. Crear registro del ajuste
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
      });

      // 5. Crear registro del movimiento
      const tipoMovimiento = diferencia >= 0 ? "Entrada" : "Salida";
      const cantidad = Math.abs(diferencia);
      const precioUnitario = productData.precio || 0;

      const newMovementRef = doc(collection(db, "movimientos"));
      transaction.set(newMovementRef, {
        productoId: formData.productoId,
        producto,
        tipo: tipoMovimiento,
        cantidad,
        precioUnitario,
        total: cantidad * precioUnitario,
        concepto: `Ajuste por ${formData.motivo}`,
        documento: `AJ-${newAdjustmentRef.id.substring(0, 8).toUpperCase()}`,
        observaciones: formData.observaciones,
        usuario: userName,
        fecha: serverTimestamp(),
      });
    });

    setIsFormOpen(false);
    alert("Ajuste registrado exitosamente");
  };

  // Calcular estadísticas dinámicas
  const stats = useMemo(() => {
    const aprobados = ajustes.filter((a) => a.estado === "Aprobado");
    const pendientes = ajustes.filter((a) => a.estado === "Pendiente");
    const valorTotal = ajustes.reduce((sum, a) => sum + a.valor, 0);
    const diferenciaTotal = ajustes.reduce((sum, a) => sum + a.diferencia, 0);

    return {
      total: ajustes.length,
      aprobados: aprobados.length,
      pendientes: pendientes.length,
      valorTotal,
      diferenciaTotal,
    };
  }, [ajustes]);

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
              className="flex h-11 w-full rounded-[calc(var(--radius)+4px)] border border-[color:var(--border)] bg-[color:var(--input-background)] px-4 text-sm"
            />
          </div>
          <select className="flex h-11 w-full appearance-none items-center rounded-[calc(var(--radius)+4px)] border border-[color:var(--border)] bg-[color:var(--card)] px-4 text-sm">
            <option>Todos los tipos</option>
            <option>Conteo Físico</option>
            <option>Merma</option>
            <option>Corrección</option>
            <option>Vencimiento</option>
            <option>Robo/Pérdida</option>
          </select>
          <select className="flex h-11 w-full appearance-none items-center rounded-[calc(var(--radius)+4px)] border border-[color:var(--border)] bg-[color:var(--card)] px-4 text-sm">
            <option>Todos los estados</option>
            <option>Aprobado</option>
            <option>Pendiente</option>
            <option>Rechazado</option>
          </select>
        </div>
      </div>

      {/* Adjustments Table */}
      <AdjustmentTable ajustes={ajustes} />

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
    </div>
  );
}
