import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User as FirebaseUser, signOut } from 'firebase/auth';

// Importamos la instancia de 'auth' desde nuestro archivo de configuración central
import { auth } from './lib/firebase';

// Importamos la página de Login que creaste
import { LoginPage } from './caracteristicas/autenticacion/pages/LoginPage';

// --- Componente Placeholder para el Panel Principal ---
// Esto es lo que verá el usuario después de iniciar sesión.
// Más adelante, lo reemplazarás con tu layout completo del dashboard.
function PanelPrincipal({ user }: { user: FirebaseUser }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-2">¡Bienvenido al Sistema!</h1>
        <p className="text-gray-600 mb-4">Sesión iniciada como:</p>
        <p className="font-semibold text-indigo-600 mb-6">{user.email}</p>
        <button
          onClick={() => signOut(auth)}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged es el "oyente" de Firebase que se ejecuta
    // cada vez que el estado de autenticación cambia. Es la clave de todo.
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    // Limpieza al desmontar el componente para evitar fugas de memoria
    return () => unsubscribe();
  }, []);

  // Muestra un mensaje mientras Firebase verifica si ya existe una sesión
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><p>Verificando sesión...</p></div>;
  }
  
  // Esta es la lógica principal:
  // Si hay un objeto 'user', muestra el panel. Si es 'null', muestra la página de login.
  return user ? <PanelPrincipal user={user} /> : <LoginPage />;
}

