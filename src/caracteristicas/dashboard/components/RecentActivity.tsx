import { ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Movimiento } from "../types";
import { Timestamp } from "firebase/firestore";

interface RecentActivityProps {
  movimientos: Movimiento[];
}

export function RecentActivity({ movimientos }: RecentActivityProps) {
  const formatTime = (timestamp: Timestamp) => {
    if (!timestamp || !timestamp.toDate) return "";
    const date = timestamp.toDate();
    return date.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
  };

  const getActionText = (movimiento: Movimiento) => {
    switch (movimiento.tipo) {
      case "Entrada":
        return `Entrada: ${movimiento.productoNombre}`;
      case "Salida":
        return `Salida: ${movimiento.productoNombre}`;
      case "Ajuste":
        return `Ajuste de stock: ${movimiento.productoNombre}`;
      case "Transferencia":
        return `Transferencia: ${movimiento.productoNombre}`;
      default:
        return `Movimiento: ${movimiento.productoNombre}`;
    }
  };

  return (
    <Card>
      <CardHeader className="px-7 pt-7 pb-4">
        <CardTitle className="text-xl">Actividad reciente</CardTitle>
        <p className="text-sm text-[color:var(--muted-foreground)]">
          Resumen de los ultimos movimientos en la plataforma
        </p>
      </CardHeader>
      <CardContent className="px-7 pb-7">
        {movimientos.length === 0 ? (
          <p className="text-sm text-[color:var(--muted-foreground)]">No hay movimientos recientes</p>
        ) : (
          <>
            <ul className="space-y-4 text-sm text-[color:var(--foreground)]/80">
              {movimientos.map((movimiento) => (
                <li key={movimiento.id} className="flex items-center justify-between">
                  <span>{getActionText(movimiento)}</span>
                  <span className="text-xs font-semibold text-[color:var(--muted-foreground)]">
                    {formatTime(movimiento.fecha)}
                  </span>
                </li>
              ))}
            </ul>
            <button className="mt-6 flex items-center gap-2 text-sm font-semibold text-[color:var(--primary)]">
              <ShieldCheck className="h-4 w-4" />
              Ver todo
            </button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
