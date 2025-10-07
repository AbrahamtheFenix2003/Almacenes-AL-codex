import {
  ShoppingCart,
  ArrowDownCircle,
  BadgeAlert,
  PackageSearch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface QuickActionsProps {
  onOpenAlertsModal: () => void;
}

export function QuickActions({ onOpenAlertsModal }: QuickActionsProps) {
  const navigate = useNavigate();

  const quickActions = [
    { 
      label: "Registrar venta", 
      icon: ShoppingCart,
      onClick: () => navigate("/ventas/punto-de-venta")
    },
    { 
      label: "Ajuste de inventario", 
      icon: ArrowDownCircle,
      onClick: () => navigate("/inventario/ajustes")
    },
    { 
      label: "Nuevo producto", 
      icon: PackageSearch,
      onClick: () => navigate("/catalogos/productos")
    },
    { 
      label: "Ver alertas", 
      icon: BadgeAlert,
      onClick: onOpenAlertsModal
    },
  ];

  return (
    <Card>
      <CardHeader className="px-7 pt-7 pb-4">
        <CardTitle className="text-xl">Acciones rapidas</CardTitle>
        <p className="text-sm text-[color:var(--muted-foreground)]">
          Accede rapidamente a las operaciones mas frecuentes
        </p>
      </CardHeader>
      <CardContent className="px-7 pb-7">
        <ul className="space-y-3">
          {quickActions.map(({ label, icon: Icon, onClick }) => (
            <li key={label}>
              <Button
                variant="outline"
                onClick={onClick}
                className="flex w-full items-center justify-between rounded-[16px] border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--foreground)] hover:bg-[color:var(--secondary)]"
              >
                <span className="flex items-center gap-3 text-sm font-semibold">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--secondary)] text-[color:var(--primary)]">
                    <Icon className="h-4 w-4" />
                  </span>
                  {label}
                </span>
                <span className="text-lg text-[color:var(--muted-foreground)]">&#8250;</span>
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
