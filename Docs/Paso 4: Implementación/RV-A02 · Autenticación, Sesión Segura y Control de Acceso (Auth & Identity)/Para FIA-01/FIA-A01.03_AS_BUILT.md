# CENTRA-T · FIA-A01.03 · TOPNAVBAR CON PERFIL Y TELEMETRÍA DE RED (AS-BUILT)
**Rebanada Vertical:** RV-A01 · Scaffolding UI Base y Topología Espacial del Workspace (Scaffolding Primero)  
**Estado:** AS-BUILT CONSOLIDADO · CERRADO MEDIANTE LOCK · REBANADA RV-A01 CONCLUIDA  
**Evidencia de Cierre:** LOCK-FIA-A01.03.md APROBADO (Commit: `bdf04e3`)  

---

### 1. Identificación
- **FIA:** `FIA-A01.03`
- **Rebanada Vertical:** `RV-A01 · Scaffolding UI Base y Topología Espacial del Workspace (Scaffolding Primero)`
- **Unidad Implementada:** `TopNavbar con Perfil y Telemetría de Red`
- **PVF Satisfecha:** `PVF-A01.03 · Barra de Navegación Superior y Telemetría Visual`
- **VF Asociada:** `VF-A01.03 · Barra de Navegación Superior y Telemetría Visual`
- **Commit de Cierre (Git):** `bdf04e3`
- **Fecha de Cierre:** `2026-09-29`
- **LOCK Oficial:** `LOCK-FIA-A01.03.md Aprobado (14/14 tests en verde, 0 errores, 0 warnings)`
- **Estado Documental:** `AS-BUILT oficial consolidado. Sella definitivamente la RV-A01 y actúa como el LOCK vinculante para habilitar la apertura de RV-A02 · FIA-A02.01.`

### 2. Origen Documental
Derivada directamente de la `SPEC-FIA-A01.03.md` y `FIA-A01.03.md`, en cumplimiento del `CENTRA-T_INDICE_RV_FIA.docx` y `CENTRA-T_INDICE_PVF_VF.docx`, guiada por la arquitectura de `SUITE_ARQUITECTURA_UI.docx` y `Centra-T Pseudocódigo (unificado).odt`.

### 3. Estado AS-BUILT Usado
- **Repositorio Base:** Repositorio en `/home/hnoloh/Escritorio/Centra-T` en estado `LOCK-FIA-A01.02` (Commit `1aaf541`).
- **Archivos Base:** Layout responsive de 2 columnas con `HubContainer` colapsable reactivo y 8 tests previos en verde.

### 4. Objetivo Implementado
Materialización de la barra de navegación superior interactiva `TopNavbar` a 64px de altura fija en la cabecera del Workspace, con el logotipo "Centra-T", una píldora reactiva de telemetría de red basada en `navigator.onLine` que conmuta dinámicamente entre dot verde ("Online") y dot ámbar ("Offline") escuchando eventos de ventana, perfil de usuario con avatar tipográfico y nombre, y botón accesible [Cerrar Sesión] con emisión de callback `onLogout`.

### 5. Alcance Final
- Creación de `src/workspace/components/TopNavbar.tsx` con soporte de `online`/`offline`, cleanup estricto de listeners en `useEffect` y botón de logout accesible.
- Estilos encapsulados en `src/workspace/components/TopNavbar.module.css` respetando tokens oficiales y altura exacta de 64px.
- Actualización de `src/workspace/components/WorkspaceLayout.tsx` inyectando `TopNavbar` por defecto en su región `banner`.
- Suite de pruebas de integración `src/workspace/components/TopNavbar.test.tsx` (6 tests específicos de telemetría, eventos y accesibilidad).
- Total de suite global de la RV: 14/14 tests en verde (4 de WorkspaceLayout + 4 de HubContainer + 6 de TopNavbar).
- Actualización de los 3 archivos JSON de estado del repositorio cerrando formalmente la RV-A01.

### 6. Dependencias Reales
- **Dependencias de Producción:** `react` (^19.0.0), `react-dom` (^19.0.0).
- **Dependencias de Desarrollo:** `typescript` (~5.7.0), `vite` (^6.0.0), `vitest` (^3.0.0), `@testing-library/react` (^16.0.0), `@testing-library/user-event` (^14.0.0), `@testing-library/jest-dom` (^6.0.0), `jsdom`.

### 7. Contratos Finales Afectados
- **Contrato Funcional:** Navbar persistente a 64px de altura, rol `banner`, reactividad instantánea a pérdidas y recuperaciones de red del navegador y botón accesible de logout.
- **Contrato Físico / Module Map:** Ubicación en `src/workspace/components/TopNavbar.tsx` acoplado al `WorkspaceLayout`.
- **Contrato de Aislamiento:** Componente puramente presentacional. Telemetría resuelta a nivel de cliente con APIs nativas del navegador (`navigator.onLine`).
- **Contrato de Interfaz:**
  ```typescript
  export interface UserProfileData {
    name: string;
    email?: string;
    avatarUrl?: string;
  }

  export interface TopNavbarProps {
    user?: UserProfileData;
    onLogout?: () => void;
  }
  ```

### 8. Restricciones Finales
- Altura innegociable de 64px verificada.
- Limpieza garantizada de listeners en cleanup de `useEffect` (cero memory leaks).
- Cero librerías de terceros añadidas para iconos o utilidades.

### 9. Diseño Técnico Final
- `TopNavbar.tsx`: Envoltorio con roles accesibles (`role="banner"`), píldora de telemetría con `role="status"` y `aria-live="polite"`, avatar circular con inicial y botón de logout accesible (`aria-label="Cerrar sesión"`).
- `TopNavbar.module.css`: Flexbox con distribución space-between, colores semánticos de red (`#34D399` online, `#FBBF24` offline).

### 10. Flujo Operativo Final
1. `WorkspaceLayout` monta `TopNavbar` en la parte superior del viewport.
2. Se evalúa el estado inicial de red y se muestra "Online" en verde.
3. Al simular evento `offline`, el badge muta a "Offline" con fondo ámbar y texto descriptivo.
4. Al simular evento `online`, se restaura "Online".
5. Al pulsar [Cerrar Sesión], se emite el callback `onLogout`.

### 11. Casos Válidos Finales
- **Validado 1:** Renderizado íntegro de marca, avatar e iniciales de usuario por defecto y personalizadas.
- **Validado 2:** Conmutación dinámica del badge al disparar eventos `offline` y `online` en `window`.
- **Validado 3:** Disparo exitoso de `onLogout` al interactuar con el botón de logout.

### 12. Casos Inválidos Finales
- **Validado:** Resistencia a usuarios anónimos o sin nombre, aplicando fallback accesible "Usuario Demo" sin romper el layout.

### 13. Tests Requeridos Finales
Suite de 14 tests ejecutada y validada en verde al 100%:
- `WorkspaceLayout.test.tsx`: 4 tests (roles semánticos, placeholders, contención).
- `HubContainer.test.tsx`: 4 tests (colapso, toggle ARIA, preservación de hijos).
- `TopNavbar.test.tsx`: 6 tests (renderizado, fallback, telemetría online/offline, disparo de logout y limpieza de listeners).

### 14. Quality Gates Finales
- `QG-01 · Typecheck:` Superado (0 errores TypeScript).
- `QG-02 · Linting:` Superado (0 warnings).
- `QG-03 · Tests Suite:` Superado (14/14 tests en verde).
- `QG-04 · Anti-Drift Scan:` Superado (0 archivos fuera de perímetro).
- `QG-05 · No-Secret Scan:` Superado (0 credenciales hardcodeadas).

### 15. Archivos Reales Afectados
```
Creados:
- src/workspace/components/TopNavbar.tsx
- src/workspace/components/TopNavbar.module.css
- src/workspace/components/TopNavbar.test.tsx

Modificados:
- src/workspace/components/WorkspaceLayout.tsx
```

### 16. Diferencias Respecto a la FIA Original
Ninguna. La implementación física calcó la especificación técnica original con cero drift.

### 17. Drift Integrado
Cero drift.

### 18. Decisiones de Cambio (CHG) Integradas
Ninguna.

### 19. Definition of Done AS-BUILT y Cierre de RV-A01
Se certifica que la unidad `FIA-A01.03` y la totalidad de la **Rebanada Vertical RV-A01 (Scaffolding UI Base y Topología Espacial del Workspace)** han completado su ciclo operativo bajo el Método zug. Quedan formalmente selladas mediante **LOCK APROBADO**, autorizando formalmente la apertura de la **Rebanada Vertical RV-A02 (Auth & Identity)** y su primera unidad **`FIA-A02.01`**.
