import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PackageX, AlertTriangle } from "lucide-react";
import type { Producto } from "../types";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface StockAlertsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productos: Producto[];
}

export function StockAlertsModal({ open, onOpenChange, productos }: StockAlertsModalProps) {
  const navigate = useNavigate();

  const getStockStatus = (stock: number, minimo: number): "critico" | "advertencia" => {
    const percentage = (stock / minimo) * 100;
    return percentage <= 30 ? "critico" : "advertencia";
  };

  const statusStyles = {
    critico: "bg-[#fde6ea] text-[#d43852]",
    advertencia: "bg-[#fff3d1] text-[#b8860b]",
  };

  const handleGoToProducts = () => {
    onOpenChange(false);
    navigate("/catalogos/productos");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <PackageX className="h-6 w-6 text-[#d43852]" />
            Alertas de Stock Bajo
          </DialogTitle>
          <DialogDescription>
            {productos.length > 0
              ? `${productos.length} producto${productos.length !== 1 ? "s" : ""} requieren atención inmediata`
              : "No hay productos con stock bajo"}
          </DialogDescription>
        </DialogHeader>

        {productos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-[#e5f7ed] p-4 mb-4">
              <PackageX className="h-12 w-12 text-[#1f8f4d]" />
            </div>
            <p className="text-lg font-semibold text-[color:var(--foreground)]">Todo está bien</p>
            <p className="text-sm text-[color:var(--muted-foreground)] mt-2">
              No hay productos con stock por debajo del mínimo
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {productos.map((producto) => {
              const status = getStockStatus(producto.stock, producto.stockMinimo);
              const percentage = Math.round((producto.stock / producto.stockMinimo) * 100);

              return (
                <div
                  key={producto.id}
                  className="flex items-start justify-between gap-4 rounded-lg border border-[color:var(--border)] bg-[color:var(--card)] p-4 hover:bg-[color:var(--secondary)] transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`rounded-full p-2 ${status === "critico" ? "bg-[#fde6ea]" : "bg-[#fff3d1]"}`}>
                      <AlertTriangle className={`h-5 w-5 ${status === "critico" ? "text-[#d43852]" : "text-[#b8860b]"}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-[color:var(--foreground)]">{producto.nombre}</h4>
                      <p className="text-sm text-[color:var(--muted-foreground)] mt-1">
                        Código: {producto.codigo} • Categoría: {producto.categoria}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="text-[color:var(--foreground)]">
                          <strong>Stock actual:</strong> {producto.stock} unidades
                        </span>
                        <span className="text-[color:var(--muted-foreground)]">
                          <strong>Mínimo:</strong> {producto.stockMinimo} unidades
                        </span>
                      </div>
                      {producto.ubicacion && (
                        <p className="text-xs text-[color:var(--muted-foreground)] mt-1">
                          📍 Ubicación: {producto.ubicacion}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${statusStyles[status]}`}>
                      {status === "critico" ? "Crítico" : "Advertencia"}
                    </span>
                    <span className="text-xs text-[color:var(--muted-foreground)]">{percentage}% del mínimo</span>
                  </div>
                </div>
              );
            })}

            <div className="flex justify-end gap-3 pt-4 border-t border-[color:var(--border)]">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cerrar
              </Button>
              <Button onClick={handleGoToProducts}>
                <PackageX className="h-4 w-4 mr-2" />
                Ir a Productos
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
