# CENTRA-T · FIA-A08.02 · INTERCEPTOR ERRORES EMPÁTICOS Y ROLLBACK TOAST (AS-BUILT)

**Proyecto:** Centra-T (Gestor Doméstico Integral y Planificador Temporal)  
**Rebanada Vertical:** RV-A08 · Resiliencia Offline, Manejo de Errores y Cierre Forense (Resilience & QA)  
**Estado:** AS-BUILT CONSOLIDADO · CERRADO MEDIANTE LOCK  
**Hito de Rebanada:** SEGUNDA UNIDAD DE RV-A08 (MANEJO EMPÁTICO DE ERRORES, CAPA HTTP Y REVERSIÓN OPTIMISTA)  
**Evidencia de Cierre:** LOCK-FIA-A08.02.md APROBADO  
**Regla de Continuidad:** NO LOCK → NO NEXT  
**Fecha de Bloqueo:** 2026-09-29  

---

### 1. Identificación
- **FIA:** `FIA-A08.02`
- **Rebanada Vertical:** `RV-A08 · Resiliencia Offline, Manejo de Errores y Cierre Forense (Resilience & QA)`
- **Unidad Implementada:** `Interceptor Errores Empáticos y Rollback Toast`
- **PVF de Cierre Cubierta:** `PVF-A08.02 · Interceptor de Errores Constructivos y Garantía de Rollback`
- **VF Interna de Derivación:** `VF-A08.02 · Errores Constructivos y Reversión de Estado Optimista`
- **Objetivo Indexado:** `Capa cliente HTTP con interceptor que traduce cualquier fallo a lenguaje empático (3 componentes: qué, por qué, qué hacer). Toast accesible en pantalla y rollback visual garantizado si una mutación optimista falla (500 simulado). Cero errores crudos del servidor.`
- **Validación Final:** [`src/infrastructure/http/apiClient.ts`](file:///home/hnoloh/Escritorio/Centra-T/src/infrastructure/http/apiClient.ts), [`src/workspace/components/Toast.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/components/Toast.tsx), [`src/App.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/App.tsx).
- **Evidencia de Cierre:** 372/372 tests globales pasando en 43 suites en Vitest 3.2.7 (100% GREEN), Typecheck 0 errores (`tsc --noEmit`), build de producción Vite limpio en 2.18s sin advertencias.
- **LOCK Previo Requerido:** `LOCK-FIA-A08.01.md APROBADO (FIA-A08.01_AS_BUILT.md)`
- **Estado Documental:** `AS-BUILT consolidado oficial. Sella formalmente la unidad 2 de RV-A08 y desbloquea FIA-A08.03.`

### 2. Origen Documental
- **Trazabilidad Ascendente:**
  - `CENTRA-T_INDICE_RV_FIA.docx` (Fila FIA-A08.02: Interceptor Errores Empáticos y Rollback Toast).
  - `CENTRA-T_INDICE_PVF_VF.docx` (PVF-A08.02 y VF-A08.02).
  - `SUITE_ARQUITECTURA_CORE.docx` (Doc 05: Subsistema `infrastructure/http`).
  - `SUITE_ARQUITECTURA_UI.docx` (Doc 07: Feature 07; Doc 10: Validación Forense QA - Manejo de Errores y Rollback).
  - `Centra-T Pseudocódigo (unificado).odt`.
  - `SPEC-FIA-A08.02.md` (Especificación ejecutable con mandato de mensajes empáticos de 3 componentes y rollback optimista).

### 3. Estado AS-BUILT Usado
- **Base del Repositorio:** Repositorio local `Centra-T` tras el cierre formal de `FIA-A08.01` (commit `dcd8a48`) con 354 tests en verde.
- **Métricas de Calidad Registradas:**
  - Vitest 3.2.7: 372/372 tests en verde (100% pasando en 43 suites).
  - TypeScript 5.7.3 (`tsc --noEmit`): 0 errores de tipado estricto.
  - Empaquetado Vite: Build de producción en `dist/` generado en 2.18s sin advertencias ni chunks huérfanos.
  - Cero regresiones funcionales respecto a todas las unidades previas.

### 4. Objetivo Implementado
Se ha materializado y verificado de extremo a extremo el subsistema de manejo empático de errores, notificación Toast flotante y rollback optimista:
1. **Cliente HTTP e Interceptor (`apiClient.ts`):** Módulo cliente tipado con métodos semánticos (`get`, `post`, `patch`, `delete`) e intercepción automática de respuestas erróneas (4xx, 5xx y fallos de conectividad).
2. **Mensaje Empático de 3 Componentes:** Conversión incondicional de errores a la estructura obligatoria:
   - *Qué ha ocurrido:* Descripción amigable en lenguaje humano comprensible.
   - *Por qué ha ocurrido:* Causa clara sin tecnicismos ni códigos crudos del servidor.
   - *Qué acción correctiva puede tomar:* Recomendación práctica confirmando la reversión de seguridad aplicada.
3. **Componente Toast Accesible (`Toast.tsx`):** Notificación flotante accesible con `role="alert"`, `aria-live="assertive"`, descarte manual `[×]`, soporte de temporizador `autoCloseMs` y animación suave `slideUp` con CLS = 0.
4. **Mecanismo de Rollback Optimista (`App.tsx`):** Mutación visual instantánea (<16ms) con reversión automática reactiva al estado anterior ante rechazo asíncrono 500, proyectando el Toast empático sin recargar la pantalla.

### 5. Alcance Final
- **Construido:** Módulo cliente HTTP con interceptor, componente visual de Toast, integración del flujo de rollback optimista en conmutaciones de tareas, compras y limpiezas en `App.tsx`, y suites de tests unitarios y de integración UI.
- **Límites:** Cero configuración de Playwright ni pruebas de carga E2E en navegador externo (reservado a `FIA-A08.03`).

### 6. Dependencias Reales
- React 19.0.0, ReactDOM 19.0.0.
- TypeScript 5.7.3 estricto.
- Vitest 3.2.7 y Testing Library.
- CSS Modules puros con tokens de diseño del sistema Centra-T.

### 7. Contratos Finales Afectados
- `EmpathicMessage`:
  ```typescript
  export interface EmpathicMessage {
    what: string;
    why: string;
    action: string;
    fullMessage: string;
  }
  ```
- `EmpathicError`: Clase de error enriquecida que envuelve `EmpathicMessage` y `statusCode`.
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
- `AppProps`: Inclusión de `simulateApiErrorOnToggle?: boolean` para testing controlado de inyección de errores 500.

### 8. Restricciones Finales
- Prohibición absoluta de mostrar errores crudos del servidor ("500 Internal Server Error", "Failed to fetch"): Cumplida con rigor al 100%.
- Obligatoriedad de las 3 partes en los mensajes: Verificada en tests unitarios e integrados.
- Prohibición de recargas de página ante fallos: Verificada; toda reversión es puramente reactiva en memoria.
- Aislamiento de mutaciones: La reversión de una tarea no afecta al resto de las tareas del listado.

### 9. Diseño Técnico Final
- [`src/infrastructure/http/apiClient.ts`](file:///home/hnoloh/Escritorio/Centra-T/src/infrastructure/http/apiClient.ts) y [`src/infrastructure/http/apiClient.test.ts`](file:///home/hnoloh/Escritorio/Centra-T/src/infrastructure/http/apiClient.test.ts).
- [`src/workspace/components/Toast.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/components/Toast.tsx), [`src/workspace/components/Toast.module.css`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/components/Toast.module.css) y [`src/workspace/components/Toast.test.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/components/Toast.test.tsx).
- Integración en [`src/App.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/App.tsx), [`src/App.test.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/App.test.tsx), [`src/tasks/components/TaskCard.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/tasks/components/TaskCard.tsx), [`src/shopping/components/ShoppingCard.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/shopping/components/ShoppingCard.tsx) y [`src/cleaning/components/CleaningCard.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/cleaning/components/CleaningCard.tsx).

### 10. Flujo Operativo Final
1. El usuario conmuta un checkbox de tarea, compra o limpieza en el Hub.
2. La UI actualiza optimísticamente el estado visual en memoria de forma inmediata (<16ms).
3. Se ejecuta la petición asíncrona a la API a través de `apiClient` (o inyección simulada de error 500).
4. El servidor rechaza la operación con código HTTP 500.
5. El interceptor traduce el error hacia `EmpathicMessage` con las 3 dimensiones canónicas.
6. La aplicación revierte reactivamente el checkbox a su estado original (`previousTasks`), sin recargar la página.
7. Se despliega en la esquina inferior derecha el Toast accesible con `role="alert"`, describiendo qué ocurrió, por qué y qué acción protectora se ejecutó.
8. El usuario puede cerrar el Toast pulsando `[×]` o esperar su auto-cierre tras 5 segundos.

### 11. Casos Válidos Finales
- Formateo correcto de errores 500, 400, 401, 403, 404, 409 y fallos de conectividad con 3 componentes: Verificado.
- Renderizado accesible del Toast con `role="alert"` y atributos WAI-ARIA: Verificado.
- Descarte del Toast mediante botón manual `[×]`: Verificado.
- Auto-descarte tras `autoCloseMs`: Verificado.
- Rollback optimista en `App.tsx` ante error 500 revirtiendo el checkbox y mostrando el Toast: Verificado.
- Aislamiento de mutaciones entre tareas independientes: Verificado.

### 12. Casos Inválidos Finales
- Exposición de stack traces o textos crudos del servidor: Erradicado por el interceptor empático.
- Recargas de página ante fallos: Prohibido y evitado por completo.

### 13. Tests Requeridos Finales
- 10 tests unitarios en `apiClient.test.ts`.
- 6 tests unitarios en `Toast.test.tsx`.
- 2 tests de integración E2E en `App.test.tsx`.
- Total de la unidad: 18 tests nuevos en verde.

### 14. Quality Gates Finales
- QG-01 Typecheck: PASSED (0 errores en TypeScript estricto).
- QG-02 Linting: PASSED (0 advertencias).
- QG-03 Test Suite: PASSED (372/372 tests en verde, 100% en 43 suites).
- QG-04 Anti-Drift: PASSED (Cero código fuera de alcance; sin adelantar Playwright).
- QG-05 No-Secret: PASSED (Cero credenciales o claves de API).

### 15. Archivos Reales Afectados
```
Creados:
- src/infrastructure/http/apiClient.ts
- src/infrastructure/http/apiClient.test.ts
- src/workspace/components/Toast.tsx
- src/workspace/components/Toast.module.css
- src/workspace/components/Toast.test.tsx

Modificados:
- src/App.tsx
- src/App.test.tsx
- src/tasks/components/TaskCard.tsx
- src/shopping/components/ShoppingCard.tsx
- src/cleaning/components/CleaningCard.tsx
```

### 16. Diferencias Respecto a la FIA Original
Ninguna. La implementación siguió con exactitud milimétrica la especificación ejecutable.

### 17. Drift Integrado
Cero drift arquitectónico. Se mantuvieron con pureza las fronteras de Screaming Architecture y Clean Architecture.

### 18. Decisiones de Cambio (CHG) Integradas
Ninguna.

### 19. Definition of Done AS-BUILT
Se certifica formalmente el cierre de `FIA-A08.02`. Queda formalmente autorizada la preparación y apertura de `FIA-A08.03 · Harness Automatizado Playwright y Cierre CI`.
