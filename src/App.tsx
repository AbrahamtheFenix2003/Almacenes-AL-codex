import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, type User as FirebaseUser } from "firebase/auth";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import PanelLayout from "@/layouts/PanelLayout";
import { DashboardPage } from "@/caracteristicas/dashboard/pages/DashboardPage";
import { ProductosPage } from "@/caracteristicas/catalogos/productos/pages/ProductosPage";
import { ProveedoresPage } from "@/caracteristicas/catalogos/proveedores/pages/ProveedoresPage";
import { ClientesPage } from "@/caracteristicas/catalogos/clientes/pages/ClientesPage";
import { MovimientosPage } from "@/caracteristicas/inventario/movimientos/pages/MovimientosPage";
import { AjustesPage } from "@/caracteristicas/inventario/ajustes/pages/AjustesPage";
import OrdenesCompraPage from "@/caracteristicas/compras/ordenesDeCompra/pages/OrdenesCompraPage";
import PuntoDeVentaPage from "@/caracteristicas/ventas/puntoDeVenta/pages/PuntoDeVentaPage";
import { LoginPage } from "@/caracteristicas/autenticacion/pages/LoginPage";
import { auth } from "./lib/firebase";

function PrivateRoute() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[color:var(--background)] text-[color:var(--muted-foreground)]">
        <p>Verificando sesion...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const name = user.displayName ?? user.email ?? "Usuario";

  return (
    <PanelLayout onSignOut={() => signOut(auth)} userName={name} userEmail={user.email ?? undefined}>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/catalogos/productos" element={<ProductosPage />} />
        <Route path="/catalogos/proveedores" element={<ProveedoresPage />} />
        <Route path="/catalogos/clientes" element={<ClientesPage />} />
        <Route path="/inventario/movimientos" element={<MovimientosPage />} />
        <Route path="/inventario/ajustes" element={<AjustesPage />} />
        <Route path="/compras/ordenes" element={<OrdenesCompraPage />} />
        <Route path="/ventas/punto-de-venta" element={<PuntoDeVentaPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </PanelLayout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*" element={<PrivateRoute />} />
      </Routes>
    </BrowserRouter>
  );
}
