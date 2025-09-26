import { useState } from "react";
import { type UserCredential } from 'firebase/auth';
import { Boxes, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface LoginFormProps {
  onLogin: (credentials: { email: string; password: string }) => Promise<UserCredential>;
  onGoogleLogin: () => Promise<UserCredential>;
  onForgotPassword: () => void;
}

export function LoginForm({ onLogin, onGoogleLogin, onForgotPassword }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email || !password) {
      setError("Por favor ingresa tu email y contraseña.");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      await onLogin({ email, password });
    } catch (loginError) {
        const firebaseError = loginError as { code?: string };
        if (firebaseError.code === 'auth/wrong-password' || firebaseError.code === 'auth/invalid-credential' || firebaseError.code === 'auth/user-not-found') {
          setError('Credenciales incorrectas. Verifica tu email y contraseña.');
        } else {
          setError("Ocurrió un error inesperado al iniciar sesión.");
        }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await onGoogleLogin();
    } catch {
      setError("Ocurrió un error al iniciar sesión con Google.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-[420px] border-2 border-sky-100/80 bg-white">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sky-100 text-sky-600">
          <Boxes className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <CardTitle>Iniciar Sesión</CardTitle>
        <CardDescription className="text-base text-sky-700">
          Accede a tu sistema de gestión de almacén
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} noValidate>
        <CardContent className="space-y-5">
          <div className="space-y-2 text-left">
            <Label htmlFor="email" className="text-sky-900">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="usuario@empresa.com"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2 text-left">
            <Label htmlFor="password" className="text-sky-900">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Ingresa tu contraseña"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isLoading}
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword((previous) => !previous)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sky-500 transition-colors hover:text-sky-600"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {error ? <p className="text-sm font-medium text-red-500 text-center">{error}</p> : null}
        </CardContent>

        <CardFooter className="flex-col space-y-4">
          <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
            {isLoading ? "Procesando..." : "Iniciar Sesión"}
          </Button>

          <div className="w-full flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-sky-400">
            <span className="h-px flex-1 bg-sky-100" />
            <span>O</span>
            <span className="h-px flex-1 bg-sky-100" />
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <GoogleIcon className="mr-2 h-5 w-5" />
            Continuar con Google
          </Button>

          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm font-medium text-sky-600 underline-offset-2 transition-colors hover:text-sky-700 hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </CardFooter>
      </form>
    </Card>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={className}>
      <path d="M21.805 10.023h-9.59v3.955h5.49c-.237 1.27-.954 2.345-2.033 3.06l3.284 2.55c1.92-1.77 2.849-4.376 2.849-7.28 0-.68-.062-1.335-.181-1.956z" fill="#3f83f8" />
      <path d="M12.215 21c2.571 0 4.728-.851 6.303-2.307l-3.283-2.55c-.91.612-2.073.975-3.02.975-2.32 0-4.287-1.565-4.993-3.67l-3.388 2.617C5.773 18.897 8.772 21 12.215 21z" fill="#34a853" />
      <path d="M7.222 13.448a4.8 4.8 0 0 1-.25-1.533c0-.533.092-1.053.243-1.532L3.79 7.724A8.73 8.73 0 0 0 3.12 11.9c0 1.383.335 2.69.935 3.852l3.167-2.304z" fill="#fbbc04" />
      <path d="M12.215 6.042c1.398 0 2.645.481 3.627 1.427l2.719-2.7C16.935 2.972 14.786 2 12.215 2 8.772 2 5.773 4.103 4.055 7.179l3.16 2.659c.706-2.105 2.673-3.796 4.999-3.796z" fill="#ea4335" />
    </svg>
  );
}

