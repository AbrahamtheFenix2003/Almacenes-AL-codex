import { useEffect, useState } from "react";
import { AlertCircle, Boxes, TrendingUp } from "lucide-react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { StatCard } from "../components/StatCard";
import { QuickActions } from "../components/QuickActions";
import { RecentActivity } from "../components/RecentActivity";
import { LowStockAlert } from "../components/LowStockAlert";
import { SystemStatus } from "../components/SystemStatus";
import { StockAlertsModal } from "../components/StockAlertsModal";
import type { Producto, OrdenCompra, Movimiento } from "../types";

export function DashboardPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [ordenesCompra, setOrdenesCompra] = useState<OrdenCompra[]>([]);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const productosSnapshot = await getDocs(collection(db, "productos"));
        const productosData = productosSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Producto[];
        setProductos(productosData);

        const ordenesSnapshot = await getDocs(collection(db, "ordenesCompra"));
        const ordenesData = ordenesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as OrdenCompra[];
        setOrdenesCompra(ordenesData);

        const movimientosQuery = query(
          collection(db, "movimientos"),
          orderBy("fecha", "desc"),
          limit(5)
        );
        const movimientosSnapshot = await getDocs(movimientosQuery);
        const movimientosData = movimientosSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Movimiento[];
        setMovimientos(movimientosData);
      } catch (error) {
        console.error("Error al cargar datos del dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalProductos = productos.length;
  const pedidosPendientes = ordenesCompra.filter((orden) => orden.estado === "Pendiente").length;
  const productosStockBajo = productos.filter((producto) => {
    const stock = Number(producto.stock ?? 0);
    const minimo = Number(producto.stockMinimo ?? 0);
    return stock <= minimo;
  });
  const alertasCriticas = productosStockBajo.length;

  const statHighlights = [
    {
      title: "Productos en stock",
      value: loading ? "..." : totalProductos.toLocaleString("es-MX"),
      helper: `${productosStockBajo.length} con stock bajo`,
      trend: productosStockBajo.length > 0 ? `${productosStockBajo.length} alertas` : "Todo OK",
      trendType: productosStockBajo.length > 0 ? ("negative" as const) : ("positive" as const),
      icon: Boxes,
    },
    {
      title: "Pedidos pendientes",
      value: loading ? "..." : pedidosPendientes.toString(),
      helper: `${ordenesCompra.length} ordenes totales`,
      trend: pedidosPendientes > 0 ? `${pedidosPendientes} pendientes` : "Sin pendientes",
      trendType: pedidosPendientes > 5 ? ("negative" as const) : ("neutral" as const),
      icon: TrendingUp,
    },
    {
      title: "Alertas criticas",
      value: loading ? "..." : alertasCriticas.toString(),
      helper: "Stock bajo en productos",
      trend: alertasCriticas > 0 ? `${alertasCriticas} alertas` : "Todo OK",
      trendType: alertasCriticas > 0 ? ("negative" as const) : ("positive" as const),
      icon: AlertCircle,
    },
  ];

  return (
    <>
      <div className="space-y-8 text-[color:var(--foreground)]">
        <section className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {statHighlights.map((item) => (
            <StatCard key={item.title} {...item} />
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[2fr_1.2fr_1.5fr]">
          <QuickActions onOpenAlertsModal={() => setIsAlertsModalOpen(true)} />
          <RecentActivity movimientos={movimientos} />
          <LowStockAlert productos={productosStockBajo} />
        </section>

        <SystemStatus />
      </div>

      <StockAlertsModal
        open={isAlertsModalOpen}
        onOpenChange={setIsAlertsModalOpen}
        productos={productosStockBajo}
      />
    </>
  );
}
