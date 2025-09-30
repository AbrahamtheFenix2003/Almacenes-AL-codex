Integración Firestore — Proyecto Almacenes-AL
============================================

Resumen
-------
Este documento describe los cambios realizados para conectar el módulo "Gestión de Productos" a Cloud Firestore (lectura en tiempo real) y las optimizaciones posteriores.

Objetivos cumplidos
-------------------
- Reemplazar datos mock por lectura en tiempo real desde Firestore.
- Usar el SDK modular de Firebase v9+ (imports directos: getFirestore, collection, onSnapshot).
- Calcular dinámicamente el estado del producto ("Activo", "Stock Bajo", "Agotado").
- Manejar estados de carga y errores.
- Limpiar / optimizar código y eliminar artefactos temporales.

Archivos modificados
--------------------
- `src/lib/firebase.ts`
  - Agregada exportación `db` conectada a la base de datos `almacenes-al`.
  - Ejemplo: `export const db = getFirestore(app, 'almacenes-al');`

- `src/caracteristicas/catalogos/productos/pages/ProductosPage.tsx`
  - Ahora obtiene productos en tiempo real con `onSnapshot` sobre la colección `productos`.
  - Define la interface `Producto` y mapea documentos a dicha interface.
  - Maneja `loading` y `error` y pasa ambos al componente `ProductTable`.
  - Limpieza: eliminada la lógica temporal de creación de datos (seed) y verificaciones redundantes.

- `src/caracteristicas/catalogos/productos/components/ProductTable.tsx`
  - Ahora recibe `productos: Producto[]` y `loading: boolean` y `error?: string` como props.
  - Muestra mensaje de carga, error o la tabla con los productos.
  - Usa `Badge` para mostrar el estado con variantes de color.

- Se eliminaron archivos temporales/auxiliares:
  - `src/scripts/seedProductos.ts` (script de seed temporal)
  - `firestore.rules` y `firestore.indexes.json` (creados temporalmente para pruebas)

Cambios clave en el comportamiento
---------------------------------
- La tabla de productos ahora se actualiza automáticamente cuando cambian los documentos en Firestore.
- El campo `estado` se calcula en el cliente en base a `stock` y `stockMinimo`.
- Si Firestore devuelve un error (por ejemplo, problemas de permisos), el usuario verá un mensaje claro en la UI.

Cómo probar localmente
----------------------
1. Asegúrate de tener la configuración correcta en `src/lib/firebase.ts` con las credenciales del proyecto `almacenes-al`.
2. Reglas de Firestore: durante desarrollo puedes permitir acceso público temporalmente desde la consola de Firebase. Recuerda revertirlo en producción.
3. Ejecuta la app (por ejemplo `npm run dev` o `pnpm dev` según el proyecto).
4. Inicia sesión en la aplicación (la app requiere autenticación para la navegación privada).
5. Navega a: `/catalogos/productos` — la tabla debe actualizarse automáticamente con los documentos existentes en la colección `productos`.

Notas de seguridad y próxima acciones
------------------------------------
- No dejar reglas públicas en producción. Revertir a reglas que requieran autenticación y roles.
  - Ejemplo mínimo:
    ```js
    match /productos/{productoId} {
      allow read: if request.auth != null; // leer solo si está autenticado
      allow write: if get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol == 'admin';
    }
    ```
- Considerar mover la lógica de cálculo de `estado` al backend si se necesita confianza en el valor o consistencia.
- Añadir pruebas unitarias para mapeo de documentos a `Producto` y para el componente `ProductTable`.

Cambios pendientes / Recomendados
---------------------------------
- Implementar filtros y búsqueda usando consultas indexadas en Firestore.
- Paginación y carga parcial (limit / startAfter) para colecciones grandes.
- Añadir tests (Jest/React Testing Library) para `ProductosPage` y `ProductTable`.

Contacto
--------
Si necesitas que implemente las reglas, cree productos de prueba en la BD `almacenes-al` o añada tests automatizados, dime y lo hago.
