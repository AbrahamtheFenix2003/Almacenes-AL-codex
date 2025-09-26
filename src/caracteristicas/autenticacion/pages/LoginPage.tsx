import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  type UserCredential
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { LoginForm } from '../components/LoginForm';
import loginIllustration from '@/assets/carrologin.png';

const googleProvider = new GoogleAuthProvider();

export function LoginPage() {
  
  const handleLogin = (credentials: { email: string; password: string }): Promise<UserCredential> => {
    return signInWithEmailAndPassword(auth, credentials.email, credentials.password)
      .catch(error => {
        if (error.code === 'auth/user-not-found') {
          return createUserWithEmailAndPassword(auth, credentials.email, credentials.password);
        }
        return Promise.reject(error);
      });
  };

  const handleGoogleLogin = (): Promise<UserCredential> => {
    return signInWithPopup(auth, googleProvider);
  };
  
  // Lógica para recuperar contraseña (puedes implementarla más adelante)
  const handleForgotPassword = () => {
    // Aquí iría la lógica para sendPasswordResetEmail de Firebase
    console.info("Forgot password");
  };

  return (
    <div className="flex min-h-screen flex-col bg-sky-50 lg:flex-row">
      <div className="relative flex w-full flex-col justify-center px-6 py-14 sm:px-10 lg:w-[55%] xl:w-[50%]">
        <div className="pointer-events-none absolute -top-56 left-[-25%] h-96 w-96 rounded-full bg-sky-100 opacity-70 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-48 right-[-20%] h-96 w-96 rounded-full bg-cyan-100 opacity-70 blur-3xl" />

        <div className="relative mx-auto w-full max-w-xl space-y-10">
          <div className="space-y-3 text-center">
            <h1 className="text-3xl font-semibold text-sky-900 md:text-4xl">Bienvenido de vuelta</h1>
            <p className="text-sm text-sky-600 md:text-base">
              Accede a la plataforma para administrar inventarios, pedidos y movimientos del almacén.
            </p>
          </div>

          <LoginForm
            onLogin={handleLogin}
            onGoogleLogin={handleGoogleLogin}
            onForgotPassword={handleForgotPassword}
          />
        </div>
      </div>

      <div className="relative hidden flex-1 overflow-hidden lg:block">
        <img
          src={loginIllustration}
          alt="Pasillo de almacén con un montacargas amarillo"
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-slate-900/70 via-slate-900/30 to-transparent" />

        <div className="absolute bottom-12 left-12 max-w-sm text-white">
          <h2 className="text-2xl font-semibold">Gestiona tu almacén sin esfuerzo</h2>
          <p className="mt-3 text-sm text-slate-100/85">
            Centraliza los procesos clave, optimiza tus tiempos de entrega y mantén la trazabilidad en tiempo real.
          -          </p>
        </div>
      </div>
    </div>
  );
}

