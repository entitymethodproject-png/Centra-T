# SPEC-FIA-A08.01 · DETECCIÓN OFFLINE Y BANNER PREVENTIVO (VV-008)

**Proyecto:** Centra-T (Gestor Doméstico Integral y Planificador Temporal)  
**Rebanada Vertical:** RV-A08 · Resiliencia Offline, Manejo de Errores y Cierre Forense (Resilience & QA)  
**Hito de Rebanada:** PRIMERA UNIDAD DE RV-A08 (APERTURA FORMAL DE LA REBANADA VERTICAL RV-A08)  
**Modo:** SPEC EJECUTABLE  
**FIA Fuente:** FIA-A08.01 · Detección Offline y Banner Preventivo (VV-008)  
**PVF de Cierre:** PVF-A08.01 · Detección de Desconexión y Modo Preventivo Solo Lectura (VV-008)  
**VF:** VF-A08.01 · Modo Preventivo Offline y Congelación de Mutaciones (VV-008)  
**Estado de Entrada:** FIA aprobada · Pendiente de implementación y LOCK  
**LOCK Previo Requerido:** LOCK-FIA-A07.06.md APROBADO (FIA-A07.06_AS_BUILT.md)  
**Regla de Continuidad:** NO LOCK → NO NEXT  

---

## 1. Identificación
Compilar la especificación técnica física y ejecutable para el Agente Implementador (Antigravity CLI), materializando el detector global de conectividad de red (`navigator.onLine`, eventos nativos `online`/`offline`), el banner superior de advertencia preventivo [`OfflineBanner.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/components/OfflineBanner.tsx) y la congelación preventiva de mutaciones en modo solo lectura, inaugurando formalmente la Rebanada Vertical **RV-A08** y satisfaciendo de forma demostrable la auditoría forense **VV-008** en [`src/workspace/`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace), [`src/hub/`](file:///home/hnoloh/Escritorio/Centra-T/src/hub) y [`src/App.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/App.tsx).

Esta primera unidad táctica de la Rebanada Vertical **RV-A08** cubre:
1. La creación del hook reactivo de red [`src/workspace/hooks/useNetworkStatus.ts`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/hooks/useNetworkStatus.ts) con escucha a eventos del DOM en tiempo real (`<100ms`).
2. El componente accesible [`OfflineBanner.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/components/OfflineBanner.tsx) y su hoja de estilos [`OfflineBanner.module.css`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/components/OfflineBanner.module.css), proyectado en la cabecera del workspace con rol semántico (`role="status"` o `role="alert"`), `aria-live="polite"` y tokens ámbar de advertencia (`--accent-amber` / `#F59E0B`).
3. La propagación del estado `isOffline` a [`WorkspaceLayout.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/components/WorkspaceLayout.tsx), [`TasksAccordion.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/hub/components/TasksAccordion.tsx), [`ShoppingAccordion.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/hub/components/ShoppingAccordion.tsx) y [`CleaningAccordion.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/hub/components/CleaningAccordion.tsx).
4. La inhabilitación visual y funcional de los botones de creación `[+]` en los acordeones del Hub (`disabled`, `aria-disabled="true"`, opacidad reducida y cursor `not-allowed`).
5. **Preservación Innegociable de Consulta Local:** Los botones de `[Filtrar]` y `[Reordenar]` en el Hub lateral permanecen activos y 100% interactivos para consulta, ordenación y filtrado de los ítems existentes en memoria.
6. La restauración instantánea del modo interactivo y ocultación del banner al restablecerse la red (`window.dispatchEvent(new Event('online'))`).
7. La validación forense automatizada completa del caso **`[VV-008]`** en `src/App.test.tsx`.

---

## 2. Objetivo
Construir y verificar con TDD estricto en Vitest:
1. **Hook de Detección de Conexión (`useNetworkStatus.ts`):**
   - Inicialización reactiva con `navigator.onLine` (o parámetro `initialOnline` configurable para testing).
   - Suscripción y limpieza adecuada de listeners para eventos `online` y `offline` en `window`.
   - Retorno tipado `{ isOnline: boolean; isOffline: boolean }`.
2. **Componente `OfflineBanner.tsx`:**
   - Renderizado condicional si `isOffline === true`.
   - Elemento con `role="status"` (o `role="alert"`), `aria-live="polite"`, `data-testid="offline-banner"`.
   - Microcopy descriptivo: *"Modo sin conexión: la aplicación está en modo solo lectura. Las modificaciones y creaciones están deshabilitadas hasta restablecer la red."*
   - Diseño sin desplazamiento acumulado de diseño (Cumulative Layout Shift, CLS = 0).
3. **Inhabilitación Preventiva de Creación en Acordeones (`TasksAccordion`, `ShoppingAccordion`, `CleaningAccordion`):**
   - Prop `isOffline?: boolean` en cada acordeón.
   - Botón `[+]` con atributo `disabled={isOffline}`, `aria-disabled={isOffline}` y clase `.newButtonDisabled`.
   - Si `isOffline === true`, hacer clic en el botón `[+]` no abre el wizard de creación.
4. **Mantenimiento Operativo de Consulta Local:**
   - Barra de control del Hub (`HubContainer`): botones `[Filtrar]` y `[Reordenar]` operativos al 100%.
5. **Orquestación en `src/App.tsx`:**
   - Integración de `useNetworkStatus()`.
   - Renderizado de `<OfflineBanner isOffline={isOffline} />` en `WorkspaceLayout` (a través de `bannerSlot`).
   - Suministro de `isOffline` a la tríada de acordeones.
6. **Cobertura y Cero Regresiones:**
   - 100% de tests en verde (mínimo 355+ tests totales en 41 suites).
   - Superación demostrable del caso de prueba forense QA **`[VV-008]`**.

---

## 3. Estado Actual del Repositorio
*(Basado estrictamente en `FIA-A07.06_AS_BUILT.md`, `repo_state.json` y `context_accumulated.json`)*
- **Archivos Existentes:**
  - `src/workspace/components/WorkspaceLayout.tsx`: Contenedor principal del workspace con slots para `navbarSlot`, `hubSlot` y `workbenchSlot`, pero carece de un slot específico para banners de advertencia del sistema (`bannerSlot`).
  - `src/hub/components/TasksAccordion.tsx`, `ShoppingAccordion.tsx`, `CleaningAccordion.tsx`: Contienen cabeceras con botón `[+]`, pero no aceptan prop de estado offline ni inhabilitan la creación si la red cae.
  - `src/App.tsx`: Orquesta autenticación, acordeones, modales de filtros y ordenación, y el calendario interactivo, pero no monitorea el estado de conectividad del navegador.
- **Estado de Tests y Compilación:**
  - 343/343 tests en verde en 39 suites en Vitest 3.2.7.
  - `tsc --noEmit`: 0 errores en TypeScript estricto.
  - Build de producción Vite: 2.09s limpio sin advertencias.
- **Riesgos Iniciales:**
  - El banner no debe empujar bruscamente el diseño hacia abajo de forma desagradable (respetar CLS = 0).
  - La caída de red no debe vaciar las listas en memoria ni alterar los datos locales existentes.
  - Los filtros locales y la ordenación multinivel no deben ser bloqueados, pues no requieren peticiones de red para funcionar.

---

## 4. Estado Objetivo
Tras la ejecución de esta SPEC:
1. Existirán físicamente `src/workspace/components/OfflineBanner.tsx`, `OfflineBanner.module.css`, `OfflineBanner.test.tsx`, `src/workspace/hooks/useNetworkStatus.ts` y `useNetworkStatus.test.ts`.
2. `WorkspaceLayout.tsx` aceptará `bannerSlot?: React.ReactNode` y proyectará el banner justo sobre la barra de navegación o en la parte superior del shell.
3. `TasksAccordion.tsx`, `ShoppingAccordion.tsx` y `CleaningAccordion.tsx` recibirán `isOffline?: boolean` e inhabilitarán visual y funcionalmente el botón `[+]` de creación.
4. `src/App.tsx` consumirá `useNetworkStatus()` y propagará el modo offline preventivo.
5. El caso forense **`[VV-008]`** estará plenamente verificado en `src/App.test.tsx`:
   - Caída de red -> Despliegue de banner + botones de creación inhabilitados + filtros/ordenación activos.
   - Reconexión -> Ocultación de banner + restablecimiento de botones de creación.
6. El total de tests en verde alcanzará un mínimo de 355+ tests en 41 suites.

---

## 5. Contratos Afectados
### 5.1 Contrato de Entrada / Arranque
- `OfflineBannerProps`:
  ```typescript
  export interface OfflineBannerProps {
    isOffline: boolean;
    message?: string;
  }
  ```
- `WorkspaceLayoutProps`:
  ```typescript
  export interface WorkspaceLayoutProps {
    navbarSlot?: React.ReactNode;
    bannerSlot?: React.ReactNode;
    hubSlot?: React.ReactNode;
    workbenchSlot?: React.ReactNode;
    children?: React.ReactNode;
  }
  ```
- Props en `TasksAccordion`, `ShoppingAccordion`, `CleaningAccordion`:
  ```typescript
  isOffline?: boolean;
  ```

### 5.2 Contrato de Geometría / Interfaz
- `OfflineBanner`:
  - Contenedor con `role="status"` o `role="alert"`, `aria-live="polite"`.
  - Fondo ámbar oscuro (`rgba(245, 158, 11, 0.15)` o `#2D2310`), borde de 1px sólido en `rgba(245, 158, 11, 0.4)`, bordes redondeados (`border-radius: var(--radius-md, 8px)` o alineado al layout).
  - Altura contenida (`min-height: 40px`, padding: `8px 16px`), display `flex`, `align-items: center`, gap de `10px`.
  - Icono `⚠️` con color ámbar (`#F59E0B`), texto de advertencia con tamaño `13px` y color `#F0F4F8`.
- Botones `[+]` en acordeones cuando `isOffline === true`:
  - Atributos: `disabled={true}`, `aria-disabled="true"`.
  - Clase CSS `.newButtonDisabled`: `opacity: 0.4`, `cursor: not-allowed`, `pointer-events: none`.

### 5.3 Contrato de Aislamiento
- El modo offline no muta ni limpia ninguna colección existente (`allTasks`, `allShopping`, `allCleaning`).
- Los motores de filtros y ordenación (`applyFilters`, `sortItems`) operan en memoria local sin interferencia del estado de red.

### 5.4 Contrato de Dominio / Datos
- Cero alteraciones en los esquemas de entidades (`TaskItem`, `ShoppingItem`, `CleaningItem`).

---

## 6. Archivos Afectados (Clasificación Física Obligatoria)
### 6.1 Crear (Archivos nuevos a materializar)
- [`src/workspace/hooks/useNetworkStatus.ts`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/hooks/useNetworkStatus.ts): Hook de reactividad para conectividad de red.
- [`src/workspace/hooks/useNetworkStatus.test.ts`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/hooks/useNetworkStatus.test.ts): Pruebas unitarias del hook de red.
- [`src/workspace/components/OfflineBanner.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/components/OfflineBanner.tsx): Componente del banner superior de advertencia.
- [`src/workspace/components/OfflineBanner.module.css`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/components/OfflineBanner.module.css): Estilos del banner.
- [`src/workspace/components/OfflineBanner.test.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/components/OfflineBanner.test.tsx): Suite de pruebas del banner.

### 6.2 Modificar (Archivos existentes del repo a alterar)
- [`src/workspace/components/WorkspaceLayout.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/components/WorkspaceLayout.tsx): Añadir prop `bannerSlot` y renderizado en el layout.
- [`src/workspace/components/WorkspaceLayout.module.css`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/components/WorkspaceLayout.module.css): Ajuste para albergar el banner superior.
- [`src/hub/components/TasksAccordion.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/hub/components/TasksAccordion.tsx): Añadir prop `isOffline` y deshabilitar botón `[+]`.
- [`src/hub/components/TasksAccordion.module.css`](file:///home/hnoloh/Escritorio/Centra-T/src/hub/components/TasksAccordion.module.css): Estilo `.newButtonDisabled`.
- [`src/hub/components/TasksAccordion.test.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/hub/components/TasksAccordion.test.tsx): Test unitario para botón `[+]` deshabilitado en offline.
- [`src/hub/components/ShoppingAccordion.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/hub/components/ShoppingAccordion.tsx): Añadir prop `isOffline` y deshabilitar botón `[+]`.
- [`src/hub/components/ShoppingAccordion.module.css`](file:///home/hnoloh/Escritorio/Centra-T/src/hub/components/ShoppingAccordion.module.css): Estilo `.newButtonDisabled`.
- [`src/hub/components/CleaningAccordion.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/hub/components/CleaningAccordion.tsx): Añadir prop `isOffline` y deshabilitar botón `[+]`.
- [`src/hub/components/CleaningAccordion.module.css`](file:///home/hnoloh/Escritorio/Centra-T/src/hub/components/CleaningAccordion.module.css): Estilo `.newButtonDisabled`.
- [`src/App.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/App.tsx): Orquestar `useNetworkStatus`, renderizar `OfflineBanner` y suministrar `isOffline` a los acordeones.
- [`src/App.test.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/App.test.tsx): Suite de pruebas de integración para el caso forense **`[VV-008]`**.

### 6.3 Preservar (Archivos existentes que NO deben romperse)
- [`src/calendar-sync/components/*`](file:///home/hnoloh/Escritorio/Centra-T/src/calendar-sync/components): Receptores de calendario, pastillas y menús contextuales intactos.
- [`src/workspace/components/MonthlyCalendarGrid.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/components/MonthlyCalendarGrid.tsx): Matriz del mes y navegación intacta.
- [`src/hub/components/HubContainer.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/hub/components/HubContainer.tsx): Barra de filtros y ordenación inalterada.

### 6.4 Prohibido Tocar (Fronteras infranqueables de esta FIA)
- `src/infrastructure/http/apiClient.ts` e interceptores HTTP (reservado estrictamente a `FIA-A08.02`).
- `playwright.config.ts` y tests E2E Playwright (reservado a `FIA-A08.03`).
- `src/authentication/*` y `src/users/*`.

---

## 7. Dependencias
- **Documentales:**
  - `SUITE_ARQUITECTURA_UI.docx` (Doc 07: Feature 09; Doc 10: Validación Forense QA - Caso VV-008).
  - `Centra-T Pseudocódigo (unificado).odt`.
  - `CENTRA-T_INDICE_RV_FIA.docx` (Fila FIA-A08.01).
  - `CENTRA-T_INDICE_PVF_VF.docx` (PVF-A08.01 y VF-A08.01).
  - `FIA-A07.06_AS_BUILT.md` (Cierre formal de RV-A07).
- **Tecnológicas Autorizadas:**
  - React 19.0.0, ReactDOM 19.0.0, TypeScript 5.7.3 estricto, CSS Modules puros, Vitest 3.2.7 y Testing Library.
- **Dependencia Secuencial (NO LOCK → NO NEXT):**
  - Requiere LOCK formal de `FIA-A07.06` (Sellado y consolidado con 343 tests en verde).
  - Desbloquea la elaboración de `FIA-A08.02` (Interceptor de Errores Empáticos y Rollback Toast).

---

## 8. Restricciones
- Prohibido el uso de librerías de terceros para la detección de conectividad o notificaciones.
- Prohibido ocultar o vaciar las tareas, compras o limpiezas cuando se corte la conexión.
- Prohibido deshabilitar los botones de `[Filtrar]` o `[Reordenar]`: deben mantenerse 100% operativos en modo offline.
- Prohibido escribir código de producción sin tests previos en rojo (TDD estricto).

---

## 9. Plan de Implementación (Secuencia en 8 Pasos Ejecutables)
- **Paso 1 — Preparar Tests:**
  - Crear `src/workspace/hooks/useNetworkStatus.test.ts` con tests en rojo:
    1. Retorno de `isOffline: false` cuando el navegador está online.
    2. Conmutación a `isOffline: true` al recibir evento `offline`.
    3. Retorno a `isOffline: false` al recibir evento `online`.
  - Crear `src/workspace/components/OfflineBanner.test.tsx` con tests en rojo:
    1. Renderizado del banner con `role="status"` y texto informativo cuando `isOffline === true`.
    2. Ausencia del banner en el DOM cuando `isOffline === false`.
  - Comprobar que los nuevos tests fallan (`RED`).
- **Paso 2 — Validar Estado Actual:**
  - Comprobar que el fallo en rojo se debe exclusivamente a la inexistencia de `useNetworkStatus` y `OfflineBanner`.
- **Paso 3 — Implementar Mínimo:**
  - Crear `src/workspace/hooks/useNetworkStatus.ts`.
  - Crear `src/workspace/components/OfflineBanner.tsx` y `OfflineBanner.module.css`.
  - Modificar `WorkspaceLayout.tsx` para aceptar y renderizar `bannerSlot`.
  - Modificar `TasksAccordion.tsx`, `ShoppingAccordion.tsx` y `CleaningAccordion.tsx` para aceptar `isOffline` y deshabilitar el botón `[+]`.
  - Comprobar que las suites de prueba unitarias pasan a verde (`GREEN`).
- **Paso 4 — Integrar:**
  - En `src/App.tsx`, conectar el hook `useNetworkStatus()`.
  - Pasar `<OfflineBanner isOffline={isOffline} />` al `bannerSlot` de `WorkspaceLayout`.
  - Pasar `isOffline={isOffline}` a `TasksAccordion`, `ShoppingAccordion` y `CleaningAccordion`.
  - Añadir en `src/App.test.tsx` la suite de integración forense para el caso **`[VV-008]`**:
    1. Disparar evento `offline` en `window`.
    2. Verificar presencia de `OfflineBanner` con microcopy canónico.
    3. Verificar que los botones `[+]` de creación están inhabilitados.
    4. Verificar que `[Filtrar]` y `[Reordenar]` siguen respondiendo al clic.
    5. Disparar evento `online` en `window`.
    6. Verificar que el banner desaparece y los botones `[+]` se rehabilitan.
- **Paso 5 — Ejecutar Tests:**
  - Ejecutar la suite completa (`npm test`). Comprobar que pasan el 100% de tests en verde (mínimo 355+ tests en 41 suites).
- **Paso 6 — Ejecutar Quality Gates:**
  - Comprobar `tsc --noEmit` (0 errores).
  - Ejecutar `npm run build` (build Vite limpio en `dist/`).
  - Verificar que no hubo drift fuera del alcance.
- **Paso 7 — Estado Documental:**
  - Actualizar `context_accumulated.json`, `repo_state.json` y `ui_state_accumulated.json`.
- **Paso 8 — Generar Reportes y Detener:**
  - Emitir `IMPLEMENTATION_REPORT_FIA-A08.01.md`, `TEST_REPORT_FIA-A08.01.md`, propuesta de `LOCK-FIA-A08.01.md` y detener la sesión.

---

## 10. Cambios Requeridos
### 10.1 `src/workspace/hooks/useNetworkStatus.ts`
```typescript
import { useState, useEffect } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  isOffline: boolean;
}

export function useNetworkStatus(initialOnline?: boolean): NetworkStatus {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (initialOnline !== undefined) return initialOnline;
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      return navigator.onLine;
    }
    return true;
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    isOffline: !isOnline,
  };
}
```

### 10.2 `src/workspace/components/OfflineBanner.tsx`
```typescript
import React from 'react';
import styles from './OfflineBanner.module.css';

export interface OfflineBannerProps {
  isOffline: boolean;
  message?: string;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  isOffline,
  message = 'Modo sin conexión: la aplicación está en modo solo lectura. Las modificaciones y creaciones están deshabilitadas hasta restablecer la red.',
}) => {
  if (!isOffline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={styles.bannerContainer}
      data-testid="offline-banner"
    >
      <span className={styles.icon} aria-hidden="true">
        ⚠️
      </span>
      <span className={styles.message}>{message}</span>
    </div>
  );
};
```

### 10.3 `src/workspace/components/OfflineBanner.module.css`
```css
.bannerContainer {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 16px;
  background-color: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.4);
  border-radius: var(--panel-radius, 14px);
  box-sizing: border-box;
  animation: fadeIn 0.15s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.icon {
  font-size: 16px;
  line-height: 1;
  color: var(--accent-amber, #f59e0b);
}

.message {
  font-family: var(--font-sans, inherit);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary, #f0f4f8);
  line-height: 1.4;
}
```

### 10.4 `src/workspace/components/WorkspaceLayout.tsx`
```typescript
export interface WorkspaceLayoutProps {
  navbarSlot?: React.ReactNode;
  bannerSlot?: React.ReactNode;
  hubSlot?: React.ReactNode;
  workbenchSlot?: React.ReactNode;
  children?: React.ReactNode;
}

export const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = ({
  navbarSlot,
  bannerSlot,
  hubSlot,
  workbenchSlot,
}) => {
  return (
    <div className={styles.workspaceShell}>
      {bannerSlot}
      <header role="banner" className={styles.navbarRegion}>
        {navbarSlot || <TopNavbar data-testid="navbar-placeholder" />}
      </header>
      <div className={styles.bodyRegion}>
        {hubSlot !== undefined ? (
          hubSlot
        ) : (
          <HubContainer>
            <div data-testid="hub-placeholder">Hub Lateral (380px)</div>
          </HubContainer>
        )}
        <main role="main" aria-label="Lienzo de trabajo" className={styles.workbenchRegion}>
          {workbenchSlot || <div data-testid="workbench-placeholder">Workbench / Calendario</div>}
        </main>
      </div>
    </div>
  );
};
```

### 10.5 Inhabilitación en Acordeones (`TasksAccordion`, `ShoppingAccordion`, `CleaningAccordion`)
En los componentes de acordeón:
```tsx
export interface TasksAccordionProps {
  // ...props existentes...
  isOffline?: boolean;
}
```
En el botón `[+]`:
```tsx
<button
  type="button"
  disabled={isOffline}
  className={`${styles.newButton} ${isOffline ? styles.newButtonDisabled : ''}`}
  onClick={(e) => {
    e.stopPropagation();
    if (!isOffline) {
      handleOpenWizard();
    }
  }}
  aria-label="Crear nueva tarea"
  title={isOffline ? "Creación deshabilitada en modo sin conexión" : "Crear nueva tarea"}
>
  +
</button>
```
En los estilos CSS de cada acordeón:
```css
.newButtonDisabled {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}
```

### 10.6 `src/App.tsx`
```typescript
import { useNetworkStatus } from './workspace/hooks/useNetworkStatus';
import { OfflineBanner } from './workspace/components/OfflineBanner';

// Dentro de App:
const { isOffline } = useNetworkStatus();

// En el JSX:
<WorkspaceLayout
  bannerSlot={<OfflineBanner isOffline={isOffline} />}
  navbarSlot={<TopNavbar user={{ name: 'Usuario Centra-T' }} onLogout={handleLogout} />}
  hubSlot={
    <HubContainer ...>
      <TasksAccordion ... isOffline={isOffline} />
      <ShoppingAccordion ... isOffline={isOffline} />
      <CleaningAccordion ... isOffline={isOffline} />
    </HubContainer>
  }
  ...
/>
```

---

## 11. Tests Requeridos
### 11.1 Tests Unitarios
1. `src/workspace/hooks/useNetworkStatus.test.ts`:
   - `inicializa con isOffline = false por defecto`
   - `actualiza a isOffline = true al recibir evento window offline`
   - `actualiza a isOffline = false al recibir evento window online`
   - `remueve los event listeners al desmontar`
2. `src/workspace/components/OfflineBanner.test.tsx`:
   - `renderiza el banner con role status y texto cuando isOffline es true`
   - `no renderiza nada en el DOM cuando isOffline es false`
   - `muestra el mensaje personalizado si se proporciona`
3. `src/hub/components/TasksAccordion.test.tsx`:
   - `deshabilita el botón de crear (+) cuando isOffline es true`

### 11.2 Tests de Integración / UI
1. `src/App.test.tsx`:
   - `[VV-008]: Desconectar red despliega OfflineBanner superior y desactiva los botones de creación en el Hub`
   - `[VV-008]: En modo offline los botones de Filtrar y Reordenar permanecen activos y funcionales para consulta local`
   - `[VV-008]: Reconectar red oculta el OfflineBanner y restablece los botones de creación`

### 11.3 Tests Negativos y de Regresión
- Verificar que la desconexión no borra ni resetea la lista de tareas/compras/limpiezas cargadas.
- Preservar al 100% las 39 suites previas (343 tests existentes sin regresión).

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
- `QG-03 · Tests Suite:` 100% de tests en verde (mínimo 355+ tests totales en 41 suites).
- `QG-04 · Anti-Drift Scan:` Verificación de ausencia de código fuera de alcance (no adelantar interceptor HTTP de `FIA-A08.02` ni Playwright de `FIA-A08.03`).
- `QG-05 · No-Secret Scan:` Cero credenciales, claves de API o secretos hardcodeados.

---

## 13. Actualización context_accumulated.json
```json
{
  "active_slice": "RV-A08 · Resiliencia Offline, Manejo de Errores y Cierre Forense (Resilience & QA)",
  "capabilities_completed": [
    "FIA-A08.01: Detección global de red, OfflineBanner superior reactivo y modo preventivo solo lectura (Caso Forense VV-008)"
  ],
  "active_constraints": [
    "Detección de caída de red en <100ms con listener window offline/online",
    "Banner preventivo visible con role status y aviso no modal",
    "Inhabilitación de botones de creación [+] en acordeones durante desconexión",
    "Preservación incondicional de consulta local: botones [Filtrar] y [Reordenar] activos"
  ],
  "unlocked_next": "FIA-A08.02 · Interceptor Errores Empáticos y Rollback Toast"
}
```

---

## 14. Actualización repo_state.json
```json
{
  "files_created": [
    "src/workspace/hooks/useNetworkStatus.ts",
    "src/workspace/hooks/useNetworkStatus.test.ts",
    "src/workspace/components/OfflineBanner.tsx",
    "src/workspace/components/OfflineBanner.module.css",
    "src/workspace/components/OfflineBanner.test.tsx"
  ],
  "files_modified": [
    "src/workspace/components/WorkspaceLayout.tsx",
    "src/workspace/components/WorkspaceLayout.module.css",
    "src/hub/components/TasksAccordion.tsx",
    "src/hub/components/TasksAccordion.module.css",
    "src/hub/components/TasksAccordion.test.tsx",
    "src/hub/components/ShoppingAccordion.tsx",
    "src/hub/components/ShoppingAccordion.module.css",
    "src/hub/components/CleaningAccordion.tsx",
    "src/hub/components/CleaningAccordion.module.css",
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
    "offline_banner": "rendered_when_navigator_offline_with_status_role",
    "hub_creation_buttons": "disabled_in_offline_mode_preserving_filters_and_sort",
    "workbench": "monthly_calendar_grid_with_past_date_blocking_and_task_pills",
    "calendar_header": "month_year_controls_previous_next_today",
    "hub_cards": "draggable_cards_with_html5_dnd_payload"
  }
}
```

---

## 16. Definition of Done (DoD)
La ejecución de esta SPEC se considerará completada si y solo si:
1. `useNetworkStatus.ts` detecta cambios de conectividad con eventos nativos del navegador.
2. `OfflineBanner.tsx` se proyecta y oculta reactivamente sin causar CLS.
3. Los botones `[+]` de creación se inhabilitan en modo offline, manteniendo activos los filtros y ordenaciones.
4. Se supera de forma demostrable la auditoría del caso forense `VV-008`.
5. Los 8 pasos del plan fueron ejecutados secuencialmente.
6. Los 5 Quality Gates pasaron limpiamente sin errores de tipado estricto.
7. Se generaron `IMPLEMENTATION_REPORT_FIA-A08.01.md`, `TEST_REPORT_FIA-A08.01.md` y `LOCK-FIA-A08.01.md`.

---

## 17. Instrucciones para Antigravity CLI (Mandatos para el Implementador)
- **Regla de Unidad Única:** Trabaja única y exclusivamente en `FIA-A08.01`. Queda prohibido avanzar a `FIA-A08.02` en la misma sesión.
- **TDD Estricto:** Ejecuta el Paso 1 escribiendo los tests en rojo antes de tocar el código de producción.
- **Consulta Local Innegociable:** Prohibido inhabilitar los botones de `[Filtrar]` o `[Reordenar]`. Solo se congelan las mutaciones de creación/borrado.
- **Zero Scope Creep:** Prohibido implementar interceptores HTTP de errores ni toasts de rollback (reservado a `FIA-A08.02`).
- **Parada Obligatoria:** Tras superar los 5 Quality Gates y generar los reportes y el archivo `LOCK-FIA-A08.01.md`, DETÉN LA EJECUCIÓN INMEDIATAMENTE y devuelve el control al usuario.
