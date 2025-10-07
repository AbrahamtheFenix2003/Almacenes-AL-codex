import { PackageX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Producto } from "../types";

interface LowStockAlertProps {
  productos: Producto[];
}

const statusStyles = {
  critico: "bg-[#fde6ea] text-[#d43852]",
  advertencia: "bg-[#fff3d1] text-[#b8860b]",
};

export function LowStockAlert({ productos }: LowStockAlertProps) {
  const getStockStatus = (stock: number, minimo: number): "critico" | "advertencia" => {
    const percentage = (stock / minimo) * 100;
    return percentage <= 30 ? "critico" : "advertencia";
  };

  return (
    <Card>
      <CardHeader className="px-7 pt-7 pb-4">
        <CardTitle className="text-xl">Stock bajo</CardTitle>
        <p className="text-sm text-[color:var(--muted-foreground)]">
          Productos que requieren atencion inmediata
        </p>
      </CardHeader>
      <CardContent className="px-7 pb-7">
        {productos.length === 0 ? (
          <p className="text-sm text-[color:var(--muted-foreground)]">No hay productos con stock bajo</p>
        ) : (
          <>
            <ul className="space-y-4 text-sm text-[color:var(--foreground)]/80">
              {productos.slice(0, 4).map((producto) => {
                const status = getStockStatus(producto.stock, producto.stockMinimo);
                return (
                  <li key={producto.id} className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[color:var(--foreground)]">{producto.nombre}</p>
                      <p className="text-xs text-[color:var(--muted-foreground)]">
                        Stock {producto.stock} - Minimo {producto.stockMinimo}
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status]}`}>
                      {status === "critico" ? "Critico" : "Advertencia"}
                    </span>
                  </li>
                );
              })}
            </ul>
            <button className="mt-6 flex items-center gap-2 text-sm font-semibold text-[color:var(--primary)]">
              <PackageX className="h-4 w-4" />
              Gestionar stock
            </button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
