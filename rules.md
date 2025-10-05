Principios de Codificación (Reglas del Proyecto)
Aplica SIEMPRE los siguientes principios en el código que generes:

Arquitectura Modular Estricta: El código debe estar separado en archivos según su responsabilidad, siguiendo la estructura de carpetas del proyecto. La lógica de negocio (Firebase) va en los componentes de página (pages), y la interfaz de usuario (UI) en los componentes visuales (components).

Código Limpio y Conciso (DRY): No repitas código. Crea funciones y componentes reutilizables. El código debe ser lo más directo y legible posible.

Uso Exclusivo de shadcn/ui y lucide-react: Todos los elementos de la interfaz deben construirse utilizando los componentes de shadcn/ui. Todos los íconos deben ser de lucide-react.

SDK Modular de Firebase v9+: Todas las interacciones con Firebase deben usar la sintaxis moderna e modular (ej. import { getFirestore } from 'firebase/firestore').

Tipado Estricto con TypeScript: Define interfaces claras para las props de los componentes y para los objetos de datos (como la interfaz Producto).

Debes hablarme siempre en español.