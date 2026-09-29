# SPEC-FIA-A08.02 · INTERCEPTOR ERRORES EMPÁTICOS Y ROLLBACK TOAST

**Proyecto:** Centra-T (Gestor Doméstico Integral y Planificador Temporal)  
**Rebanada Vertical:** RV-A08 · Resiliencia Offline, Manejo de Errores y Cierre Forense (Resilience & QA)  
**Hito de Rebanada:** SEGUNDA UNIDAD DE RV-A08 (MANEJO EMPÁTICO DE ERRORES, CAPA HTTP Y REVERSIÓN OPTIMISTA)  
**Modo:** SPEC EJECUTABLE  
**FIA Fuente:** FIA-A08.02 · Interceptor Errores Empáticos y Rollback Toast  
**PVF de Cierre:** PVF-A08.02 · Interceptor de Errores Constructivos y Garantía de Rollback  
**VF:** VF-A08.02 · Errores Constructivos y Reversión de Estado Optimista  
**Estado de Entrada:** FIA aprobada · Pendiente de implementación y LOCK  
**LOCK Previo Requerido:** LOCK-FIA-A08.01.md APROBADO (FIA-A08.01_AS_BUILT.md)  
**Regla de Continuidad:** NO LOCK → NO NEXT  

---

## 1. Identificación
Compilar la especificación técnica física y ejecutable para el Agente Implementador (Antigravity CLI), materializando la capa cliente HTTP con interceptor de errores empáticos de 3 componentes ([`src/infrastructure/http/apiClient.ts`](file:///home/hnoloh/Escritorio/Centra-T/src/infrastructure/http/apiClient.ts)), el componente flotante accesible de notificación Toast ([`src/workspace/components/Toast.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/components/Toast.tsx)) y la garantía de rollback reactivo ante fallos en mutaciones optimistas en [`src/App.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/App.tsx).

Esta segunda unidad táctica de la Rebanada Vertical **RV-A08** cubre:
1. La creación del módulo cliente HTTP tipado [`src/infrastructure/http/apiClient.ts`](file:///home/hnoloh/Escritorio/Centra-T/src/infrastructure/http/apiClient.ts) con métodos semánticos (`get`, `post`, `patch`, `delete`).
2. El interceptor de respuestas HTTP que captura fallos (4xx, 5xx, cortes de red) y los traduce incondicionalmente a la estructura canónica de **Mensaje Empático de 3 Componentes**:
   - **Qué ha ocurrido:** Descripción amigable en lenguaje humano.
   - **Por qué ha ocurrido:** Motivo contextualizado comprensible (sin tecnicismos de servidor).
   - **Qué acción correctiva puede tomar:** Recomendación clara y confirmación de la reversión aplicada.
3. La creación del componente accesible de notificación flotante [`src/workspace/components/Toast.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/components/Toast.tsx) y sus estilos en [`Toast.module.css`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/components/Toast.module.css), con WAI-ARIA (`role="alert"`, `aria-live="assertive"`), descarte manual `[×]` y temporizador opcional con auto-cierre.
4. La integración en `src/App.tsx` del flujo de **Rollback Optimista**: ante un fallo simulado o real de API (ej. error 500 al conmutar completado de una tarea/ítem), la UI revierte inmediatamente el estado visual a su valor original y despliega el Toast empático explicando el motivo y la acción correctiva.
5. Cero exposición de errores crudos del servidor, cero recargas de página y cero desincronizaciones de memoria.
6. La certificación de 100% de tests en verde sin regresiones en las 41 suites existentes.

---

## 2. Objetivo
Construir y verificar con TDD estricto en Vitest:
1. **Capa Cliente HTTP e Interceptor de Errores (`apiClient.ts`):**
   - Interfaz `EmpathicMessage`:
     ```typescript
     export interface EmpathicMessage {
       what: string;
       why: string;
       action: string;
       fullMessage: string;
     }
     ```
   - Clase de error personalizada `EmpathicError`.
   - Función transformadora `formatEmpathicError(status: number | undefined, customContext?: string): EmpathicMessage`.
   - Prohibición absoluta de mostrar textos crudos de error ("500 Internal Server Error", "TypeError: Failed to fetch").
2. **Componente Notificación Toast (`Toast.tsx`):**
   - Renderizado condicional basado en prop `isOpen: boolean`.
   - WAI-ARIA estricto: `role="alert"`, `aria-live="assertive"`, `data-testid="toast-notification"`.
   - Despliegue de los 3 componentes: título/qué, motivo/por qué y acción recomendada.
   - Cierre interactivo mediante botón `[×]` (`aria-label="Cerrar notificación"`) y soporte de auto-descarte tras `autoCloseMs` (por defecto 5000ms).
   - Estilizado sobrio con tokens de diseño (`--bg-card`, `--border-subtle`, acento carmesí/ámbar).
3. **Mecanismo de Rollback Optimista en `App.tsx`:**
   - En `handleTaskToggle` (y conmutaciones de items), actualización optimista en memoria inmediata (<16ms).
   - Soporte para ejecutar la llamada asíncrona a través de `apiClient` (o inyector de mutación con opción de fallo simulado).
   - Captura del fallo: reversión reactiva del estado previo (`completado: !prevStatus`) y activación de `toastState`.
4. **Verificación de Integración UI:**
   - Test en `App.test.tsx` verificando que un fallo 500:
     1. Desmarca el checkbox previamente marcado optimísticamente.
     2. Muestra el Toast en pantalla conteniendo el mensaje empático estructurado.
5. **Cobertura y Métricas de Calidad:**
   - 100% de tests en verde (mínimo 368+ tests en 43 suites).

---

## 3. Estado Actual del Repositorio
*(Basado estrictamente en `FIA-A08.01_AS_BUILT.md`, `repo_state.json` y `context_accumulated.json`)*
- **Archivos Existentes:**
  - `src/workspace/components/WorkspaceLayout.tsx`: Admite `bannerSlot`, `navbarSlot`, `hubSlot` y `workbenchSlot`.
  - `src/workspace/components/OfflineBanner.tsx`: Despliega el banner preventivo cuando la red cae.
  - `src/App.tsx`: Contiene `handleTaskToggle`, `handleShoppingToggle`, `handleCleaningToggle`, pero carece de mecanismo de rollback asíncrono y de soporte de notificaciones Toast.
- **Estado de Tests y Compilación:**
  - 354/354 tests en verde en 41 suites en Vitest 3.2.7.
  - `tsc --noEmit`: 0 errores en TypeScript estricto.
  - Build de producción Vite: 2.04s limpio sin advertencias.
- **Riesgos Iniciales:**
  - El Toast no debe provocar Cumulative Layout Shift (CLS = 0) en la pantalla. Debe posicionarse flotante con `fixed` y `z-index: 1100`.
  - La reversión de estado no debe recargar la página ni perder otros cambios concurrentes en la sesión.

---

## 4. Estado Objetivo
Tras la ejecución de esta SPEC:
1. Existirán físicamente:
   - `src/infrastructure/http/apiClient.ts`
   - `src/infrastructure/http/apiClient.test.ts`
   - `src/workspace/components/Toast.tsx`
   - `src/workspace/components/Toast.module.css`
   - `src/workspace/components/Toast.test.tsx`
2. `src/App.tsx` gestionará el estado `toastState` y orquestará el rollback optimista con mensajes empáticos ante rechazos 500.
3. El componente `<Toast />` se proyectará flotante en el workspace ante cualquier error interceptado.
4. Las pruebas de integración en `src/App.test.tsx` verificarán la reversión del checkbox y la presencia del Toast con los 3 componentes.
5. El total de tests en verde alcanzará un mínimo de 368+ tests en 43 suites.

---

## 5. Contratos Afectados
### 5.1 Contrato de Entrada / Arranque
- `EmpathicMessage`:
  ```typescript
  export interface EmpathicMessage {
    what: string;
    why: string;
    action: string;
    fullMessage: string;
  }
  ```
- `ToastProps`:
  ```typescript
  export interface ToastProps {
    isOpen: boolean;
    type?: 'error' | 'warning' | 'info' | 'success';
    what: string;
    why: string;
    action: string;
    onClose: () => void;
    autoCloseMs?: number;
    'data-testid'?: string;
  }
  ```

### 5.2 Contrato de Geometría / Interfaz
- `Toast`:
  - Contenedor flotante con `position: fixed`, coordenadas `bottom: 24px, right: 24px` y `z-index: 1100`.
  - Ancho máximo `420px`, mínimo `320px`, padding `14px 16px`.
  - Fondo `--bg-card` (`#1A2433`), borde de 1px sólido en `rgba(239, 68, 68, 0.45)` (para tipo error) o `--border-subtle` (`#233144`).
  - Sombra pronunciada `box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5)`.
  - Animación de entrada suave: `animation: slideUp 0.18s ease-out`.
  - Estructura visual interna:
    - Cabecera: Icono de advertencia/error (`❌` / `⚠️`), título (*Qué*) en negrita 14px y botón de cierre `[×]`.
    - Cuerpo: Motivo (*Por qué*) en 13px color `--text-secondary`.
    - Pie: Acción (*Acción sugerida*) en 12px con acento ámbar o cobalto.

### 5.3 Contrato de Aislamiento
- La reversión de estado afecta única y exclusivamente a la entidad cuyo cambio fue rechazado por la API. No muta ni restablece las demás tareas, compras o limpiezas.

### 5.4 Contrato de Dominio / Datos
- Las entidades de dominio se mantienen inalteradas.

---

## 6. Archivos Afectados (Clasificación Física Obligatoria)
### 6.1 Crear (Archivos nuevos a materializar)
- [`src/infrastructure/http/apiClient.ts`](file:///home/hnoloh/Escritorio/Centra-T/src/infrastructure/http/apiClient.ts): Cliente HTTP e interceptor de errores empáticos.
- [`src/infrastructure/http/apiClient.test.ts`](file:///home/hnoloh/Escritorio/Centra-T/src/infrastructure/http/apiClient.test.ts): Pruebas unitarias de traducción y captura HTTP.
- [`src/workspace/components/Toast.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/components/Toast.tsx): Componente visual accesible de Toast.
- [`src/workspace/components/Toast.module.css`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/components/Toast.module.css): Estilos del Toast flotante.
- [`src/workspace/components/Toast.test.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/components/Toast.test.tsx): Suite de pruebas unitarias y de accesibilidad del Toast.

### 6.2 Modificar (Archivos existentes del repo a alterar)
- [`src/App.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/App.tsx): Incorporar estado `toastState`, soporte de rollback en `handleTaskToggle` (y conmutaciones) y renderizado de `<Toast />`.
- [`src/App.test.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/App.test.tsx): Suite de integración verificando reversión de checkbox y presencia del Toast empático ante error 500.

### 6.3 Preservar (Archivos existentes que NO deben romperse)
- [`src/workspace/components/OfflineBanner.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/components/OfflineBanner.tsx): Banner offline sellado en FIA-A08.01.
- [`src/workspace/hooks/useNetworkStatus.ts`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/hooks/useNetworkStatus.ts): Hook de red sellado.
- [`src/hub/components/*`](file:///home/hnoloh/Escritorio/Centra-T/src/hub/components): Acordeones del Hub intactos.
- [`src/calendar-sync/*`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync): Componentes de calendario intactos.

### 6.4 Prohibido Tocar (Fronteras infranqueables de esta FIA)
- `playwright.config.ts` y suites Playwright (reservado exclusivamente a `FIA-A08.03`).
- `src/authentication/*` y `src/users/*`.

---

## 7. Dependencias
- **Documentales:**
  - `SUITE_ARQUITECTURA_CORE.docx` (Doc 05: Subsistema `infrastructure/http`).
  - `SUITE_ARQUITECTURA_UI.docx` (Doc 07: Feature 07; Doc 10: Validación Forense QA - Manejo de Errores y Rollback).
  - `Centra-T Pseudocódigo (unificado).odt`.
  - `CENTRA-T_INDICE_RV_FIA.docx` (Fila FIA-A08.02).
  - `CENTRA-T_INDICE_PVF_VF.docx` (PVF-A08.02 y VF-A08.02).
  - `FIA-A08.01_AS_BUILT.md` (Cierre formal de FIA-A08.01).
- **Tecnológicas Autorizadas:**
  - React 19.0.0, ReactDOM 19.0.0, TypeScript 5.7.3 estricto, CSS Modules puros, Vitest 3.2.7 y Testing Library.
- **Dependencia Secuencial (NO LOCK → NO NEXT):**
  - Requiere LOCK formal de `FIA-A08.01` (Sellado y consolidado con 354 tests en verde).
  - Desbloquea la elaboración de `FIA-A08.03` (Harness Automatizado Playwright y Cierre CI).

---

## 8. Restricciones
- Prohibido el uso de librerías externas para mensajes o alertas (`react-toastify`, `sonner`, etc.).
- Prohibido exponer mensajes crudos de error del servidor o códigos HTTP aislados al usuario.
- Prohibido realizar recargas de página (`window.location.reload()`) ante errores.
- Todo mensaje de error debe incorporar innegociablemente las 3 dimensiones: Qué, Por qué y Acción correctiva.
- TDD estricto: pruebas previas en rojo antes de tocar código de producción.

---

## 9. Plan de Implementación (Secuencia en 8 Pasos Ejecutables)
- **Paso 1 — Preparar Tests:**
  - Crear `src/infrastructure/http/apiClient.test.ts` con tests en rojo:
    1. Formateo de error 500 a mensaje empático de 3 partes.
    2. Formateo de error 400, 404, 409 y error de red a mensajes empáticos.
    3. Lanzamiento de `EmpathicError` enriquecido ante rechazos de fetch.
  - Crear `src/workspace/components/Toast.test.tsx` con tests en rojo:
    1. Renderizado condicional si `isOpen === true` con `role="alert"`.
    2. Visualización estructurada de qué, por qué y acción correctiva.
    3. Invocación de `onClose` al pulsar el botón `[×]`.
    4. Auto-cierre tras `autoCloseMs`.
    5. Ausencia en el DOM cuando `isOpen === false`.
  - Comprobar que los nuevos tests fallan (`RED`).
- **Paso 2 — Validar Estado Actual:**
  - Comprobar que el fallo en rojo se debe exclusivamente a la inexistencia de `apiClient.ts` y `Toast.tsx`.
- **Paso 3 — Implementar Mínimo:**
  - Crear `src/infrastructure/http/apiClient.ts`.
  - Crear `src/workspace/components/Toast.tsx` y `Toast.module.css`.
  - Comprobar que las suites de prueba unitarias pasan a verde (`GREEN`).
- **Paso 4 — Integrar:**
  - En `src/App.tsx`:
    - Incorporar estado `toastState: { isOpen: boolean; message: EmpathicMessage; type?: 'error' | 'warning' } | null`.
    - Renderizar `<Toast />` flotante condicionado por `toastState`.
    - Actualizar `handleTaskToggle` (y conmutaciones de items) para admitir la ejecución asíncrona con inyector/simulador de rechazo 500:
      - Al dispararse un error, revertir inmediatamente el estado en memoria (`rollback`).
      - Desplegar el Toast con el mensaje empático generado.
    - Añadir en `src/App.test.tsx` la prueba de integración verificando:
      - Checkbox se marca optimísticamente.
      - Al simular rechazo 500, el checkbox se desmarca (rollback visual).
      - El Toast empático se visualiza conteniendo los 3 componentes.
- **Paso 5 — Ejecutar Tests:**
  - Ejecutar la suite completa (`npm test`). Comprobar que pasan el 100% de tests en verde (mínimo 368+ tests en 43 suites).
- **Paso 6 — Ejecutar Quality Gates:**
  - Comprobar `tsc --noEmit` (0 errores).
  - Ejecutar `npm run build` (build Vite limpio en `dist/`).
  - Verificar que no hubo drift fuera del alcance.
- **Paso 7 — Estado Documental:**
  - Actualizar `context_accumulated.json`, `repo_state.json` y `ui_state_accumulated.json`.
- **Paso 8 — Generar Reportes y Detener:**
  - Emitir `IMPLEMENTATION_REPORT_FIA-A08.02.md`, `TEST_REPORT_FIA-A08.02.md`, propuesta de `LOCK-FIA-A08.02.md` y detener la sesión.

---

## 10. Cambios Requeridos
### 10.1 `src/infrastructure/http/apiClient.ts`
```typescript
export interface EmpathicMessage {
  what: string;
  why: string;
  action: string;
  fullMessage: string;
}

export class EmpathicError extends Error {
  constructor(
    public readonly empathic: EmpathicMessage,
    public readonly statusCode?: number,
    public readonly originalError?: unknown
  ) {
    super(empathic.fullMessage);
    this.name = 'EmpathicError';
  }
}

export function formatEmpathicError(statusCode?: number, customContext?: string): EmpathicMessage {
  const contextPrefix = customContext ? `${customContext}: ` : '';

  if (statusCode === 500 || (statusCode && statusCode >= 500 && statusCode < 600)) {
    const what = `${contextPrefix}No se pudo completar la operación en el servidor.`;
    const why = 'Ha ocurrido un fallo temporal en los servicios centrales.';
    const action = 'Hemos revertido el cambio automáticamente para proteger tus datos. Por favor, inténtalo de nuevo en unos instantes.';
    return { what, why, action, fullMessage: `${what} ${why} ${action}` };
  }

  if (statusCode === 400) {
    const what = `${contextPrefix}Los datos enviados no son válidos.`;
    const why = 'Alguno de los campos no cumple con las restricciones requeridas.';
    const action = 'Por favor, revisa la información introducida e inténtalo nuevamente.';
    return { what, why, action, fullMessage: `${what} ${why} ${action}` };
  }

  if (statusCode === 401 || statusCode === 403) {
    const what = `${contextPrefix}No tienes autorización para realizar esta acción.`;
    const why = 'Tu sesión ha caducado o no cuentas con los permisos necesarios.';
    const action = 'Por favor, inicia sesión nuevamente para continuar.';
    return { what, why, action, fullMessage: `${what} ${why} ${action}` };
  }

  if (statusCode === 404) {
    const what = `${contextPrefix}El elemento solicitado no fue encontrado.`;
    const why = 'Es posible que haya sido eliminado o trasladado previamente.';
    const action = 'Verifica la lista de elementos o actualiza la vista.';
    return { what, why, action, fullMessage: `${what} ${why} ${action}` };
  }

  if (statusCode === 409) {
    const what = `${contextPrefix}Se ha detectado un conflicto con el estado actual.`;
    const why = 'El registro ha sido modificado de forma concurrente.';
    const action = 'Hemos cancelado la operación. Actualiza la vista para ver los cambios más recientes.';
    return { what, why, action, fullMessage: `${what} ${why} ${action}` };
  }

  // Fallo de red o genérico
  const what = `${contextPrefix}No se pudo establecer comunicación con el servidor.`;
  const why = 'La conexión se interrumpió o el servidor no respondió a tiempo.';
  const action = 'Comprueba tu conexión a internet o inténtalo de nuevo en unos instantes.';
  return { what, why, action, fullMessage: `${what} ${why} ${action}` };
}

export const apiClient = {
  formatError: formatEmpathicError,
  async request<T>(url: string, options: RequestInit = {}, customContext?: string): Promise<T> {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const empathic = formatEmpathicError(response.status, customContext);
        throw new EmpathicError(empathic, response.status);
      }
      return (await response.json()) as T;
    } catch (err: unknown) {
      if (err instanceof EmpathicError) throw err;
      const empathic = formatEmpathicError(undefined, customContext);
      throw new EmpathicError(empathic, undefined, err);
    }
  },
  get: <T>(url: string, options?: RequestInit, context?: string) =>
    apiClient.request<T>(url, { ...options, method: 'GET' }, context),
  post: <T>(url: string, body?: unknown, options?: RequestInit, context?: string) =>
    apiClient.request<T>(
      url,
      {
        ...options,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...options?.headers },
        body: body ? JSON.stringify(body) : undefined,
      },
      context
    ),
  patch: <T>(url: string, body?: unknown, options?: RequestInit, context?: string) =>
    apiClient.request<T>(
      url,
      {
        ...options,
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...options?.headers },
        body: body ? JSON.stringify(body) : undefined,
      },
      context
    ),
  delete: <T>(url: string, options?: RequestInit, context?: string) =>
    apiClient.request<T>(url, { ...options, method: 'DELETE' }, context),
};
```

### 10.2 `src/workspace/components/Toast.tsx`
```typescript
import React, { useEffect } from 'react';
import styles from './Toast.module.css';

export interface ToastProps {
  isOpen: boolean;
  type?: 'error' | 'warning' | 'info' | 'success';
  what: string;
  why: string;
  action: string;
  onClose: () => void;
  autoCloseMs?: number;
  'data-testid'?: string;
}

export const Toast: React.FC<ToastProps> = ({
  isOpen,
  type = 'error',
  what,
  why,
  action,
  onClose,
  autoCloseMs = 5000,
  'data-testid': testId = 'toast-notification',
}) => {
  useEffect(() => {
    if (!isOpen || autoCloseMs <= 0) return;
    const timer = setTimeout(() => {
      onClose();
    }, autoCloseMs);
    return () => clearTimeout(timer);
  }, [isOpen, autoCloseMs, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      data-testid={testId}
      className={`${styles.toastContainer} ${styles['toast_' + type]}`}
    >
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <span className={styles.icon} aria-hidden="true">
            {type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}
          </span>
          <strong className={styles.whatText} data-testid="toast-what">
            {what}
          </strong>
        </div>
        <button
          type="button"
          onClick={onClose}
          className={styles.closeButton}
          aria-label="Cerrar notificación"
          data-testid="toast-close-btn"
        >
          &times;
        </button>
      </div>

      <div className={styles.body}>
        <p className={styles.whyText} data-testid="toast-why">
          {why}
        </p>
      </div>

      <div className={styles.footer}>
        <p className={styles.actionText} data-testid="toast-action">
          {action}
        </p>
      </div>
    </div>
  );
};
```

### 10.3 `src/workspace/components/Toast.module.css`
```css
.toastContainer {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1100;
  width: calc(100vw - 48px);
  max-width: 420px;
  min-width: 320px;
  background-color: var(--bg-card, #1a2433);
  border: 1px solid var(--border-subtle, #233144);
  border-radius: var(--radius-md, 10px);
  padding: 14px 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  box-sizing: border-box;
  animation: slideUp 0.18s ease-out;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.toast_error {
  border-left: 4px solid var(--accent-red, #ef4444);
}

.toast_warning {
  border-left: 4px solid var(--accent-amber, #f59e0b);
}

.header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.titleSection {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon {
  font-size: 15px;
  line-height: 1;
}

.whatText {
  font-family: var(--font-sans, inherit);
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text-primary, #ffffff);
  line-height: 1.3;
}

.closeButton {
  background: transparent;
  border: none;
  color: var(--text-muted, #94a3b8);
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  padding: 0 4px;
  transition: color 0.15s ease;
}

.closeButton:hover {
  color: var(--text-primary, #ffffff);
}

.body {
  padding-left: 23px;
}

.whyText {
  margin: 0;
  font-family: var(--font-sans, inherit);
  font-size: 12.5px;
  color: var(--text-secondary, #cbd5e1);
  line-height: 1.4;
}

.footer {
  padding-left: 23px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: 6px;
}

.actionText {
  margin: 0;
  font-family: var(--font-sans, inherit);
  font-size: 11.5px;
  color: var(--accent-amber, #f59e0b);
  line-height: 1.3;
  font-weight: 500;
}
```

### 10.4 `src/App.tsx`
Orquestar rollback optimista y `<Toast />`:
```typescript
import { Toast } from './workspace/components/Toast';
import { EmpathicMessage, formatEmpathicError } from './infrastructure/http/apiClient';

// Props de App para soportar inyección de fallo simulado en testing:
export interface AppProps {
  initialAuthenticated?: boolean;
  initialShoppingItems?: ShoppingItem[];
  simulateApiErrorOnToggle?: boolean; // Permite simular rechazo 500 en tests
}

// Estado de Toast:
const [toastState, setToastState] = useState<{
  isOpen: boolean;
  message: EmpathicMessage;
  type?: 'error' | 'warning';
} | null>(null);

// Manejador optimista con Rollback:
const handleTaskToggle = async (taskId: string) => {
  // 1. Guardar estado previo para rollback
  const previousTasks = allTasks;
  const targetTask = allTasks.find((t) => t.id === taskId);
  if (!targetTask) return;

  // 2. Actualización optimista inmediata (<16ms)
  setAllTasks((prev) =>
    prev.map((t) => (t.id === taskId ? { ...t, completado: !t.completado } : t))
  );

  // 3. Simulación o ejecución de API
  if (simulateApiErrorOnToggle) {
    // Simular error 500 de API
    const errorMsg = formatEmpathicError(500, 'Actualización de tarea');
    // 4. ROLLBACK inmediato
    setAllTasks(previousTasks);
    // 5. Desplegar Toast empático
    setToastState({
      isOpen: true,
      message: errorMsg,
      type: 'error',
    });
  }
};

// En el JSX de App:
<Toast
  isOpen={Boolean(toastState?.isOpen)}
  what={toastState?.message.what || ''}
  why={toastState?.message.why || ''}
  action={toastState?.message.action || ''}
  onClose={() => setToastState(null)}
/>
```

---

## 11. Tests Requeridos
### 11.1 Tests Unitarios
1. `src/infrastructure/http/apiClient.test.ts`:
   - `formatea error 500 con los 3 componentes canónicos (qué, por qué, qué hacer)`
   - `formatea error 400 con los 3 componentes canónicos`
   - `formatea error 404 y 409 con mensajes empáticos`
   - `formatea error de red desconocido con los 3 componentes`
   - `lanza EmpathicError enriquecido ante respuesta no-ok`
2. `src/workspace/components/Toast.test.tsx`:
   - `renderiza el Toast con role alert cuando isOpen es true`
   - `muestra los 3 componentes por separado (what, why, action)`
   - `invoca onClose al hacer clic en el botón de cerrar`
   - `invoca onClose automáticamente tras autoCloseMs`
   - `no renderiza nada en el DOM cuando isOpen es false`

### 11.2 Tests de Integración / UI
1. `src/App.test.tsx`:
   - `[Rollback Optimista]: Marcar una tarea con fallo 500 revierte el checkbox al estado original y muestra Toast empático con 3 componentes`
   - `Cerrar el Toast pulsando [×] descarta la notificación`

### 11.3 Tests Negativos y de Regresión
- Verificar que el rollback no afecta a otras tareas del listado.
- Preservar al 100% las 41 suites previas (354 tests existentes sin regresión).

### 11.4 Comandos de Ejecución
```bash
npm run test
npm run typecheck
npm run build
```

---

## 12. Quality Gates
- `QG-01 · Typecheck:` `npm run typecheck` (`tsc --noEmit`) con 0 errores y sin tipos `any`.
- `QG-02 · Linting:` `npm run lint` superado sin advertencias ni errores.
- `QG-03 · Tests Suite:` 100% de tests en verde (mínimo 368+ tests totales en 43 suites).
- `QG-04 · Anti-Drift Scan:` Verificación de ausencia de código fuera de alcance (no adelantar Playwright de `FIA-A08.03`).
- `QG-05 · No-Secret Scan:` Cero credenciales, claves de API o secretos hardcodeados.

---

## 13. Actualización context_accumulated.json
```json
{
  "active_slice": "RV-A08 · Resiliencia Offline, Manejo de Errores y Cierre Forense (Resilience & QA)",
  "capabilities_completed": [
    "FIA-A08.01: Detección global de red, OfflineBanner superior reactivo y modo preventivo solo lectura (Caso Forense VV-008)",
    "FIA-A08.02: Capa cliente HTTP con interceptor de errores empáticos de 3 componentes, componente Toast accesible y rollback optimista de UI"
  ],
  "active_constraints": [
    "Prohibición absoluta de mostrar errores crudos del servidor",
    "Estructura obligatoria de 3 componentes en cada mensaje de error: qué, por qué y qué hacer",
    "Garantía de rollback inmediato en mutaciones optimistas fallidas sin recarga de página"
  ],
  "unlocked_next": "FIA-A08.03 · Harness Automatizado Playwright y Cierre CI"
}
```

---

## 14. Actualización repo_state.json
```json
{
  "files_created": [
    "src/infrastructure/http/apiClient.ts",
    "src/infrastructure/http/apiClient.test.ts",
    "src/workspace/components/Toast.tsx",
    "src/workspace/components/Toast.module.css",
    "src/workspace/components/Toast.test.tsx"
  ],
  "files_modified": [
    "src/App.tsx",
    "src/App.test.tsx"
  ],
  "quality_gates_passed": ["QG-01", "QG-02", "QG-03", "QG-04", "QG-05"]
}
```

---

## 15. Actualización ui_state_accumulated.json
```json
{
  "mounted_components": [
    "App",
    "WorkspaceLayout",
    "OfflineBanner",
    "Toast",
    "HubContainer",
    "FilterModal",
    "SortMenu",
    "TasksAccordion",
    "ShoppingAccordion",
    "CleaningAccordion",
    "TaskCard",
    "ShoppingCard",
    "CleaningCard",
    "MonthlyCalendarGrid",
    "CalendarDropZone",
    "CalendarTaskPill",
    "CalendarItemContextMenu",
    "ReassignmentConfirmModal",
    "BulkShoppingConfirmModal",
    "TopNavbar",
    "LoginPage"
  ],
  "observable_states": {
    "toast_notification": "floating_alert_with_empathic_3_component_message",
    "optimistic_ui": "immediate_toggle_with_guaranteed_rollback_on_500_failure",
    "offline_banner": "rendered_when_navigator_offline_with_status_role",
    "hub_creation_buttons": "disabled_in_offline_mode_preserving_filters_and_sort",
    "workbench": "monthly_calendar_grid_with_past_date_blocking_and_task_pills"
  }
}
```

---

## 16. Definition of Done (DoD)
La ejecución de esta SPEC se considerará completada si y solo si:
1. `apiClient.ts` está implementado con el interceptor de mensajes empáticos de 3 componentes.
2. `Toast.tsx` está estilizado, es accesible y se encuentra verificado unitariamente.
3. El rollback optimista en `App.tsx` revierte de forma reactiva cualquier mutación fallida sin recargar la página.
4. Los 8 pasos del plan fueron ejecutados secuencialmente.
5. Los 5 Quality Gates pasaron limpiamente sin errores de tipado estricto.
6. Se generaron `IMPLEMENTATION_REPORT_FIA-A08.02.md`, `TEST_REPORT_FIA-A08.02.md` y `LOCK-FIA-A08.02.md`.

---

## 17. Instrucciones para Antigravity CLI (Mandatos para el Implementador)
- **Regla de Unidad Única:** Trabaja única y exclusivamente en `FIA-A08.02`. Queda prohibido avanzar a `FIA-A08.03` en la misma sesión.
- **TDD Estricto:** Ejecuta el Paso 1 escribiendo los tests en rojo antes de tocar el código de producción.
- **Mensaje Empático Completo:** Cada error debe incluir estrictamente los 3 componentes: qué ha ocurrido, por qué ha ocurrido y qué puede hacer el usuario. Prohibido mostrar errores crudos.
- **Rollback Garantizado:** Ante fallo 500, la UI debe volver a su estado previo sin recarga de pantalla.
- **Zero Scope Creep:** Prohibido instalar o configurar Playwright (reservado a `FIA-A08.03`).
- **Parada Obligatoria:** Tras superar los 5 Quality Gates y generar los reportes y el archivo `LOCK-FIA-A08.02.md`, DETÉN LA EJECUCIÓN INMEDIATAMENTE y devuelve el control al usuario.
