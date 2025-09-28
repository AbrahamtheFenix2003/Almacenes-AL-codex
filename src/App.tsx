import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, type User as FirebaseUser } from "firebase/auth";

import PanelLayout from "@/layouts/PanelLayout";
import { DashboardPage } from "@/caracteristicas/dashboard/pages/DashboardPage";
import { LoginPage } from "@/caracteristicas/autenticacion/pages/LoginPage";
import { auth } from "./lib/firebase";

function PanelPrincipal({ user }: { user: FirebaseUser }) {
  const name = user.displayName ?? user.email ?? "Usuario";

  return (
    <PanelLayout
      onSignOut={() => signOut(auth)}
      userName={name}
      userEmail={user.email ?? undefined}
    >
      <DashboardPage />
    </PanelLayout>
  );
}

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[color:var(--background)] text-[color:var(--muted-foreground)]">
        <p>Verificando sesion...</p>
      </div>
    );
  }

  return user ? <PanelPrincipal user={user} /> : <LoginPage />;
}
