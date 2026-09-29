# REPORTE DE IMPLEMENTACIÓN · FIA-A08.02
**Rebanada Vertical:** RV-A08 · Resiliencia Offline, Manejo de Errores y Cierre Forense (Resilience & QA)  
**FIA:** FIA-A08.02 · Interceptor Errores Empáticos y Rollback Toast  
**Hito de Rebanada:** SEGUNDA UNIDAD DE RV-A08 (MANEJO EMPÁTICO DE ERRORES, CAPA HTTP Y REVERSIÓN OPTIMISTA)  
**Fecha:** 2026-09-29  
**Estado:** IMPLEMENTACIÓN COMPLETADA Y VERIFICADA (100% GREEN)  

---

### 1. Resumen de la Implementación
En esta segunda unidad táctica de la rebanada vertical **RV-A08**, se ha materializado el subsistema cliente HTTP con interceptor de mensajes empáticos de 3 componentes, el componente flotante accesible de notificación Toast y la garantía de rollback reactivo ante fallos optimistas en mutaciones de la UI:

1. **Cliente HTTP e Interceptor Empático ([`src/infrastructure/http/apiClient.ts`](file:///home/hnoloh/Escritorio/Centra-T/src/infrastructure/http/apiClient.ts)):**
   - Interfaz `EmpathicMessage` con las 3 dimensiones canónicas obligatorias (`what`, `why`, `action`) y `fullMessage`.
   - Clase de error especializada `EmpathicError` extendiendo `Error` nativo.
   - Función transformadora pura `formatEmpathicError(status, context)` con mapeo semántico exhaustivo:
     - **500 / 5xx:** *"No se pudo completar la operación en el servidor."* | *"Ha ocurrido un fallo temporal en los servicios centrales."* | *"Hemos revertido el cambio automáticamente para proteger tus datos. Por favor, inténtalo de nuevo en unos instantes."*
     - **400:** *"Los datos enviados no son válidos."* | *"Alguno de los campos no cumple con las restricciones requeridas."* | *"Por favor, revisa la información introducida e inténtalo nuevamente."*
     - **401 / 403:** *"No tienes autorización para realizar esta acción."* | *"Tu sesión ha caducado o no cuentas con los permisos necesarios."* | *"Por favor, inicia sesión nuevamente para continuar."*
     - **404:** *"El elemento solicitado no fue encontrado."* | *"Es posible que haya sido eliminado o trasladado previamente."* | *"Verifica la lista de elementos o actualiza la vista."*
     - **409:** *"Se ha detectado un conflicto con el estado actual."* | *"El registro ha sido modificado de forma concurrente."* | *"Hemos cancelado la operación. Actualiza la vista para ver los cambios más recientes."*
     - **Fallo de red / genérico:** *"No se pudo establecer comunicación con el servidor."* | *"La conexión se interrumpió o el servidor no respondió a tiempo."* | *"Comprueba tu conexión a internet o inténtalo de nuevo en unos instantes."*
   - Prohibición absoluta de mostrar errores crudos del servidor ("500 Internal Server Error", "Failed to fetch").
   - Métodos semánticos tipados: `get`, `post`, `patch`, `delete` envolviendo `fetch` con parseo JSON e interceptor automático.

2. **Componente de Notificación Flotante Toast ([`src/workspace/components/Toast.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/components/Toast.tsx)):**
   - WAI-ARIA estricto: `role="alert"`, `aria-live="assertive"`, `data-testid="toast-notification"`.
   - Despliegue estructurado e independiente de las 3 partes mediante `data-testid="toast-what"`, `data-testid="toast-why"` y `data-testid="toast-action"`.
   - Descarte interactivo manual mediante botón `[×]` (`aria-label="Cerrar notificación"`, `data-testid="toast-close-btn"`).
   - Auto-cierre configurable con temporizador (`autoCloseMs = 5000` por defecto).
   - Estilizado sobrio en [`Toast.module.css`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/components/Toast.module.css): posicionamiento `position: fixed`, coordenadas `bottom: 24px, right: 24px`, `z-index: 1100`, fondo `--bg-card`, animación suave `slideUp` y cero impacto en Cumulative Layout Shift (CLS = 0).
   - Soporte de variantes semánticas `error` (borde rojo/carmesí, icono `❌`), `warning` (ámbar, icono `⚠️`) e `info` (azul, icono `ℹ️`).

3. **Mecanismo de Rollback Optimista en [`src/App.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/App.tsx):**
   - Prop `simulateApiErrorOnToggle?: boolean` para testing de inyección de rechazo 500.
   - Estado reactivo `toastState` gestionando la visibilidad y el payload empático.
   - En `handleTaskToggle`, `handleShoppingToggle` y `handleCleaningToggle`:
     1. Actualización optimista inmediata en memoria (<16ms).
     2. En caso de fallo asíncrono simulado o real (error 500):
        - Rollback reactivo incondicional al estado previo (`setAllTasks(previousTasks)`).
        - Despliegue inmediato del componente `<Toast />` con el mensaje empático de 3 componentes.
        - Cero recargas de página (`window.location.reload()`) y cero pérdida de estado concurrente en la sesión.

4. **Sincronización de Componentes de Tarjeta:**
   - Actualización en [`TaskCard.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/tasks/components/TaskCard.tsx), [`ShoppingCard.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/shopping/components/ShoppingCard.tsx) y [`CleaningCard.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/cleaning/components/CleaningCard.tsx) para sincronizar reactivamente `isCompleted` con las mutaciones de la entidad del padre, evitando llamadas redundantes que interfieran con el rollback.

5. **Pruebas de Integración UI en [`src/App.test.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/App.test.tsx):**
   - Verificación de que al marcar una tarea con fallo 500, el checkbox se revierte al estado desmarcado.
   - Verificación de que el Toast empático se renderiza con `role="alert"`, `aria-live="assertive"` y los 3 textos canónicos exactos.
   - Verificación del aislamiento de la mutación (la otra tarea permanece inalterada).
   - Verificación del descarte interactivo pulsando el botón `[×]`.

---

### 2. Archivos Creados y Modificados
- **Archivos Creados (5 archivos nuevos):**
  - [`src/infrastructure/http/apiClient.ts`](file:///home/hnoloh/Escritorio/Centra-T/src/infrastructure/http/apiClient.ts)
  - [`src/infrastructure/http/apiClient.test.ts`](file:///home/hnoloh/Escritorio/Centra-T/src/infrastructure/http/apiClient.test.ts) (10 tests)
  - [`src/workspace/components/Toast.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/components/Toast.tsx)
  - [`src/workspace/components/Toast.module.css`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/components/Toast.module.css)
  - [`src/workspace/components/Toast.test.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/components/Toast.test.tsx) (6 tests)

- **Archivos Modificados (5 archivos):**
  - [`src/App.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/App.tsx): Estado `toastState`, rollback asíncrono y renderizado de `<Toast />`.
  - [`src/App.test.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/App.test.tsx): Suite de pruebas de integración para rollback y Toast (+2 tests).
  - [`src/tasks/components/TaskCard.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/tasks/components/TaskCard.tsx): Sincronización reactiva con `task` y supresión de llamadas en cascada redundantes.
  - [`src/shopping/components/ShoppingCard.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/shopping/components/ShoppingCard.tsx): Sincronización reactiva con `item`.
  - [`src/cleaning/components/CleaningCard.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/cleaning/components/CleaningCard.tsx): Sincronización reactiva con `item`.

---

### 3. Quality Gates Superados
- **QG-01 · Typecheck:** `npm run typecheck` (`tsc --noEmit`) con **0 errores** de tipado estricto.
- **QG-02 · Linting:** `npm run lint` superado sin advertencias ni errores.
- **QG-03 · Test Suite:** **372 / 372 tests PASSED en 43 suites (100% GREEN)** en Vitest 3.2.7.
- **QG-04 · Anti-Drift Scan:** Cero código fuera de alcance; sin adelantar suites Playwright de `FIA-A08.03`.
- **QG-05 · No-Secret Scan:** Cero credenciales, claves de API o secretos hardcodeados.
