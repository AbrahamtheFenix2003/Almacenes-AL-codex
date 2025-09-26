import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';

// configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAJTgPxvWTkFZ_Pl8iOfPpPXoyiaA1nMa0",
  authDomain: "almacenes-al.firebaseapp.com",
  projectId: "almacenes-al",
  storageBucket: "almacenes-al.firebasestorage.app",
  messagingSenderId: "562107989473",
  appId: "1:562107989473:web:017fc1be32576db588a6a0",
  measurementId: "G-RPKJK2FVFY"
};

// Inicialización de Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // Exportamos 'auth' para usarlo en toda la app