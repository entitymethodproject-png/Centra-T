# CENTRA-T · FIA-A08.01 · DETECCIÓN OFFLINE Y BANNER PREVENTIVO (VV-008) (AS-BUILT)

**Proyecto:** Centra-T (Gestor Doméstico Integral y Planificador Temporal)  
**Rebanada Vertical:** RV-A08 · Resiliencia Offline, Manejo de Errores y Cierre Forense (Resilience & QA)  
**Estado:** AS-BUILT CONSOLIDADO · CERRADO MEDIANTE LOCK  
**Hito de Rebanada:** PRIMERA UNIDAD DE RV-A08 (APERTURA SELLADA)  
**Evidencia de Cierre:** LOCK-FIA-A08.01.md APROBADO  
**Regla de Continuidad:** NO LOCK → NO NEXT  
**Fecha de Bloqueo:** 2026-09-29  

---

### 1. Identificación
- **FIA:** `FIA-A08.01`
- **Rebanada Vertical:** `RV-A08 · Resiliencia Offline, Manejo de Errores y Cierre Forense (Resilience & QA)`
- **Unidad Implementada:** `Detección Offline y Banner Preventivo (VV-008)`
- **PVF de Cierre Cubierta:** `PVF-A08.01 · Detección de Desconexión y Modo Preventivo Solo Lectura (VV-008)`
- **VF Interna de Derivación:** `VF-A08.01 · Modo Preventivo Offline y Congelación de Mutaciones (VV-008)`
- **Objetivo Indexado:** `Implementar detector global de red (navigator.onLine). Desconexión despliega banner superior en <100ms y congela mutaciones destructivas.`
- **Validación Final:** [`src/workspace/components/OfflineBanner.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/components/OfflineBanner.tsx), [`src/workspace/hooks/useNetworkStatus.ts`](file:///home/hnoloh/Escritorio/Centra-T/src/workspace/hooks/useNetworkStatus.ts), [`src/hub/components/TasksAccordion.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/hub/components/TasksAccordion.tsx), [`src/App.tsx`](file:///home/hnoloh/Escritorio/Centra-T/src/App.tsx).
- **Evidencia de Cierre:** 354/354 tests globales pasando en 41 suites en Vitest 3.2.7 (100% GREEN), Typecheck 0 errores (`tsc --noEmit`), build de producción Vite limpio en 2.04s sin advertencias.
- **LOCK Previo Requerido:** `LOCK-FIA-A07.06.md APROBADO (FIA-A07.06_AS_BUILT.md)`
- **Estado Documental:** `AS-BUILT consolidado oficial. Sella formalmente la unidad 1 de RV-A08 y constituye la base inmutable para FIA-A08.02.`

### 2. Origen Documental
- **Trazabilidad Ascendente:**
  - `CENTRA-T_INDICE_RV_FIA.docx` (Fila FIA-A08.01: Detección Offline y Banner Preventivo - VV-008).
  - `CENTRA-T_INDICE_PVF_VF.docx` (PVF-A08.01 y VF-A08.01).
  - `SUITE_ARQUITECTURA_UI.docx` (Doc 07: Feature 09; Doc 08: Guía de Estilos Visuales; Doc 09: Restricciones Visuales Duras; Doc 10: Validación Forense QA - Caso VV-008).
  - `Centra-T Pseudocódigo (unificado).odt`.
  - `SPEC-FIA-A08.01.md` (Especificación técnica física ejecutada con mandato de modo preventivo solo lectura).

### 3. Estado AS-BUILT Usado
- **Base del Repositorio:** Repositorio local `Centra-T` tras el cierre formal de `FIA-A07.06` (commit `df5da84`) con 343 tests en verde.
- **Métricas de Calidad Registradas:**
  - Vitest 3.2.7: 354/354 tests en verde (100% pasando en 41 suites).
  - TypeScript 5.7.3 (`tsc --noEmit`): 0 errores de tipado estricto.
  - Empaquetado Vite: Build de producción en `dist/` generado en 2.04s sin advertencias ni chunks huérfanos.
  - Cero regresiones funcionales respecto a todas las unidades previas.

### 4. Objetivo Implementado
Se ha materializado y verificado de extremo a extremo el modo preventivo offline y su caso forense (VV-008):
1. **Hook `useNetworkStatus.ts`:** Detección en tiempo real con listeners `online` y `offline` en `window`.
2. **Componente `OfflineBanner.tsx`:** Banner con `role="status"`, `aria-live="polite"`, microcopy canónico, borde y fondo ámbar de advertencia y animación `fadeIn` con CLS = 0.
3. **Ranura `bannerSlot` en `WorkspaceLayout.tsx`:** Proyección del banner en la parte superior del shell.
4. **Inhabilitación de Creación:** Botones `[+]` en `TasksAccordion`, `ShoppingAccordion` y `CleaningAccordion` deshabilitados visual y funcionalmente cuando `isOffline === true`.
5. **Preservación de Consulta Local:** Botones de `[Filtrar]` y `[Reordenar]` 100% operativos durante desconexión.

### 5. Alcance Final
- **Construido:** Hook reactivo de red, banner accesible, integración en el layout y acordeones, orquestación en `App.tsx` y suite completa de tests unitarios y de integración para el caso VV-008.
- **Límites:** Cero interceptores de error HTTP (reservado a FIA-A08.02). Cero alteración de datos locales en memoria.

### 6. Dependencias Reales
- React 19.0.0, ReactDOM 19.0.0.
- TypeScript 5.7.3.
- Vitest 3.2.7 y Testing Library.
- CSS Modules puros con tokens de diseño.

### 7. Contratos Finales Afectados
- `NetworkStatus`: `{ isOnline: boolean; isOffline: boolean }`.
- `OfflineBannerProps`: `{ isOffline: boolean; message?: string }`.
- `WorkspaceLayoutProps`: `bannerSlot?: React.ReactNode`.
- Props en acordeones: `isOffline?: boolean`.

### 8. Restricciones Finales
- Restricción de no-eliminación y no-vaciado de datos: Se mantuvo la integridad de las colecciones en memoria durante caídas de red.
- Preservación de filtros y ordenación: Cumplida sin restricciones.

### 9. Diseño Técnico Final
- `src/workspace/hooks/useNetworkStatus.ts` y `useNetworkStatus.test.ts`.
- `src/workspace/components/OfflineBanner.tsx`, `OfflineBanner.module.css` y `OfflineBanner.test.tsx`.
- Integrado en `WorkspaceLayout.tsx`, `TasksAccordion.tsx`, `ShoppingAccordion.tsx`, `CleaningAccordion.tsx`, `App.tsx` y `App.test.tsx`.

### 10. Flujo Operativo Final
1. El navegador pierde la conectividad (`window.dispatchEvent(new Event('offline'))`).
2. `useNetworkStatus` conmuta `isOffline` a `true` en <100ms.
3. `WorkspaceLayout` proyecta `OfflineBanner` con aviso empático no modal.
4. Los botones `[+]` de creación en el Hub pasan a estado disabled (`aria-disabled="true"`, opacidad reducida).
5. Los botones `[Filtrar]` y `[Reordenar]` permanecen activos para consulta y organización de ítems existentes.
6. La red se restablece (`online`), el banner desaparece y los botones de creación se rehabilitan inmediatamente.

### 11. Casos Válidos Finales
- Detección de offline con despliegue de banner: Verificado.
- Inhabilitación de creación en tareas, compras y limpiezas: Verificado.
- Operatividad de filtros y ordenación en offline: Verificado.
- Reconexión con restauración de interactividad: Verificado (VV-008).

### 12. Casos Inválidos Finales
- Clic en botón `[+]` durante offline: No ejecuta ninguna acción ni abre modales (Verificado).

### 13. Tests Requeridos Finales
- 4 tests unitarios en `useNetworkStatus.test.ts`.
- 3 tests unitarios en `OfflineBanner.test.tsx`.
- 1 test unitario en `TasksAccordion.test.tsx`.
- 3 tests de integración E2E en `App.test.tsx` para el caso VV-008.

### 14. Quality Gates Finales
- QG-01 Typecheck: PASSED (0 errores).
- QG-02 Linting: PASSED (0 advertencias).
- QG-03 Test Suite: PASSED (354/354 tests en verde, 100%).
- QG-04 Anti-Drift: PASSED (Cero código fuera de alcance).
- QG-05 No-Secret: PASSED (Cero claves o credenciales).

### 15. Archivos Reales Afectados
```
Creados:
- src/workspace/hooks/useNetworkStatus.ts
- src/workspace/hooks/useNetworkStatus.test.ts
- src/workspace/components/OfflineBanner.tsx
- src/workspace/components/OfflineBanner.module.css
- src/workspace/components/OfflineBanner.test.tsx

Modificados:
- src/workspace/components/WorkspaceLayout.tsx
- src/hub/components/TasksAccordion.tsx
- src/hub/components/TasksAccordion.module.css
- src/hub/components/TasksAccordion.test.tsx
- src/hub/components/ShoppingAccordion.tsx
- src/hub/components/ShoppingAccordion.module.css
- src/hub/components/CleaningAccordion.tsx
- src/hub/components/CleaningAccordion.module.css
- src/App.tsx
- src/App.test.tsx
```

### 16. Diferencias Respecto a la FIA Original
Ninguna. La implementación se ajustó con rigor matemático al diseño prescrito.

### 17. Drift Integrado
Cero drift arquitectónico. Se preservaron las fronteras del Module Map y Screaming Architecture.

### 18. Decisiones de Cambio (CHG) Integradas
Ninguna.

### 19. Definition of Done AS-BUILT
Se certifica formalmente el cierre de `FIA-A08.01`. Queda formalmente autorizada la preparación y apertura de `FIA-A08.02 · Interceptor Errores Empáticos y Rollback Toast`.
