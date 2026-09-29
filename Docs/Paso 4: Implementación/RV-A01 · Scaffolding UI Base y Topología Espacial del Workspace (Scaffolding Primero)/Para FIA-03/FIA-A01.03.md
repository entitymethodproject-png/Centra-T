# CENTRA-T · FIA-A01.03 · TOPNAVBAR CON PERFIL Y TELEMETRÍA DE RED
**Rebanada Vertical:** RV-A01 · Scaffolding UI Base y Topología Espacial del Workspace (Scaffolding Primero)  
**Estado:** DERIVADA · PENDIENTE DE SPEC, IMPLEMENTACIÓN Y LOCK  
**Regla de Continuidad:** NO LOCK → NO NEXT  

---

### 1. Identificación
- **FIA:** `FIA-A01.03`
- **Rebanada Vertical:** `RV-A01 · Scaffolding UI Base y Topología Espacial del Workspace (Scaffolding Primero)`
- **Unidad Prevista:** `TopNavbar con Perfil y Telemetría de Red`
- **PVF de Cierre Cubierta:** `PVF-A01.03 · Barra de Navegación Superior y Telemetría Visual`
- **VF Interna de Derivación:** `VF-A01.03 · Barra de Navegación Superior y Telemetría Visual`
- **Objetivo Indexado:** `Construir barra superior con datos de perfil de usuario mock/activo, botón de logout accesible y badge reactivo de conectividad (navigator.onLine verde/ámbar).`
- **Validación Indexada:** `src/workspace/components/TopNavbar.tsx`
- **Evidencia de Cierre Indexada:** `Test RTL verifica renderizado de avatar/nombre, disparo de evento logout y cambio dinámico de badge al emitir eventos online/offline.`
- **LOCK Previo Requerido:** `LOCK-FIA-A01.02.md APROBADO (Commit: 1aaf541)`
- **Estado Documental:** `FIA inicial derivada. No es SPEC, implementación, reporte ni LOCK.`

### 2. Objetivo
Construir el componente interactivo de navegación superior `TopNavbar` (altura fija de 64px) alojado en la cabecera del Workspace (`WorkspaceLayout`), renderizando de forma persistente la identidad del producto ("Centra-T"), la píldora reactiva de telemetría de red basada en `navigator.onLine` (indicador verde para estado "Online" y ámbar para "Offline"), el perfil de usuario (avatar y nombre/email) y el botón accesible de cierre de sesión (`[Cerrar Sesión]`), garantizando accesibilidad WCAG AA y respuesta en tiempo real a los eventos de red de la ventana.

### 3. Alcance
- **IN-SCOPE (Obligatorio en esta FIA):**
  - Creación del componente `TopNavbar` en `src/workspace/components/TopNavbar.tsx` con su hoja de estilos encapsulada.
  - Integración de la píldora de telemetría de red (`NetworkStatusBadge`) escuchando eventos de ventana `online` y `offline`:
    - Estado Online: Badge con dot verde semántico (`#10B981`) y texto accesible "Online".
    - Estado Offline: Badge con dot ámbar semántico (`#F59E0B`) y texto accesible "Offline".
  - Renderizado de la ficha de perfil de usuario con avatar (inicial o imagen) y nombre/email configurable por props.
  - Botón accesible de cierre de sesión (`[Cerrar Sesión]`) que dispara el callback `onLogout`.
  - Integración del `TopNavbar` en el slot de navegación de `WorkspaceLayout.tsx`.
  - Batería de pruebas de integración con React Testing Library que simule eventos de red (`window.dispatchEvent(new Event('offline'))`) y verifique la mutación visual del badge, así como el disparo de eventos al pulsar el botón de logout.
- **OUT-OF-SCOPE (Prohibición explícita):**
  - Implementación del endpoint backend `POST /logout` o purga de cookies HttpOnly (pertenece a `RV-A02 · FIA-A02.05`).
  - Guards de autenticación o redirecciones de router a `/auth/login` (pertenece a `RV-A02`).
  - Renderizado o lógica de acordeones internos de listas o tareas (`RV-A03`, `RV-A04`, `RV-A05`).
  - Lógica de la rejilla mensual del calendario (`RV-A06`).

### 4. Dependencias
- **Documentales:** 
  - `SUITE_ARQUITECTURA_CORE.docx` (Docs 01 a 05: Fail-Fast y Resiliencia).
  - `SUITE_ARQUITECTURA_UI.docx` (Docs 06 a 10: Navbar h=64px, Tokens de Diseño, WCAG AA).
  - `Centra-T Pseudocódigo (unificado).odt` (Módulo 1 y 2).
  - `CENTRA-T_INDICE_PVF_VF.docx` (Doc 11: Fila PVF-A01.03 / VF-A01.03).
  - `CENTRA-T_INDICE_RV_FIA.docx` (Doc 12: Fila FIA-A01.03).
  - `FIA-A01.02_AS_BUILT.md` (Estado previo bloqueado y certificado).
- **Tecnológicas Autorizadas:** React 19, TypeScript 5.x, CSS Modules, Vitest, `@testing-library/react`.
- **Dependencia Secuencial (NO LOCK → NO NEXT):**
  - *Previa:* Requiere LOCK formal de `FIA-A01.02` (Aprobado en commit `1aaf541`).
  - *Posterior:* Cierra la rebanada inaugural `RV-A01` y desbloquea el inicio de la rebanada de seguridad `RV-A02 · FIA-A02.01` (Auth & Identity).

### 5. Contratos Afectados
- **Contrato Funcional:** La barra superior se mantiene fija a 64px de altura, expone el rol semántico `banner`, detecta reactivamente caídas y recuperaciones de red del navegador y expone la acción de cierre de sesión.
- **Contrato Físico / Module Map:** `src/workspace/components/TopNavbar.tsx` (y sus estilos/tests) integrado en `src/workspace/components/WorkspaceLayout.tsx`.
- **Contrato de Aislamiento:** Componente puramente presentacional. El estado de red se consulta directamente del entorno del navegador (`navigator.onLine` / window events) sin peticiones HTTP.

### 6. Restricciones
- La altura del Navbar debe ser estrictamente fija a 64px (`height: 64px`).
- Prohibido acoplar llamadas HTTP directas a `/logout` en esta unidad.
- Prohibido utilizar iconos externos pesados o paquetes de terceros no autorizados.
- La píldora de conectividad debe tener soporte accesible mediante atributos ARIA (`role="status"`, `aria-live="polite"`).

### 7. Diseño Técnico
- **Entrada / Punto de Acceso:** `src/workspace/components/TopNavbar.tsx`.
- **Estructura Interna:**
  - `TopNavbar`: Envoltorio `<header role="banner" className={styles.navbarContainer}>`.
  - Zona Izquierda: Título/Marca "Centra-T".
  - Zona Derecha: Controles de estado y usuario:
    - `NetworkStatusBadge`: Badge con dot coloreado y texto dinámico ("Online" / "Offline").
    - `UserProfile`: Avatar circular con inicial o imagen y nombre de usuario.
    - `LogoutButton`: `<button type="button" aria-label="Cerrar sesión" className={styles.logoutButton} onClick={onLogout}>Cerrar Sesión</button>`.
- **Manejo de Errores y Tipado:** Props estrictas con TypeScript:
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
- **Fronteras Físicas Autorizadas:**
  - `src/workspace/components/TopNavbar.tsx`
  - `src/workspace/components/TopNavbar.module.css`
  - `src/workspace/components/TopNavbar.test.tsx`
  - `src/workspace/components/WorkspaceLayout.tsx` (inyección en `navbarSlot` por defecto)

### 8. Flujo Operativo
1. El usuario visualiza la aplicación en el navegador con el `TopNavbar` renderizado en la parte superior del Workspace.
2. El componente evalúa `navigator.onLine` y muestra la píldora en estado "Online" con dot verde (`#10B981`).
3. Si el dispositivo pierde la conectividad a internet, el navegador emite el evento `'offline'`.
4. El hook/efecto interno captura el evento y conmuta inmediatamente el badge a "Offline" con dot ámbar (`#F59E0B`), anunciándolo de forma accesible (`aria-live="polite"`).
5. Al restaurarse la conexión, el evento `'online'` revierte el badge a "Online" en verde.
6. El usuario pulsa el botón [Cerrar Sesión]: se dispara de forma determinista la invocación del callback `onLogout`.

### 9. Casos Válidos (Happy Path & Escenarios Permitidos)
- **Caso 1 (Renderizado de Perfil y Marca):**
  - *Condición:* Montar `TopNavbar` con usuario `{ name: "Elena Ramos" }`.
  - *Comportamiento esperado:* Se renderiza el título "Centra-T", el avatar con inicial "E" y el nombre "Elena Ramos".
- **Caso 2 (Transición Reactiva de Red):**
  - *Condición:* Montar `TopNavbar` en estado online.
  - *Acción:* Disparar evento de ventana `'offline'`.
  - *Comportamiento esperado:* El badge muestra texto "Offline" y clase/estilo de color ámbar.
- **Caso 3 (Disparo de Logout):**
  - *Condición:* Botón [Cerrar Sesión] visible.
  - *Acción:* Clic en el botón.
  - *Comportamiento esperado:* Se ejecuta la función `onLogout` proporcionada por props.

### 10. Casos Inválidos (Manejo de Excepciones y Rechazos)
- **Caso Inválido 1 (Usuario no proporcionado / no autenticado):**
  - *Comportamiento esperado:* Renderizar un placeholder elegante de perfil anónimo ("Usuario", avatar genérico) sin romper el renderizado del Navbar.
- **Causas de Rechazo Automático:**
  - Altura del Navbar distinta de 64px o CLS > 0 en el Workspace.
  - Ausencia de respuesta al conmutar los eventos `'online'` / `'offline'`.
  - Omisión de rol semántico `banner` o botón de logout inalcanzable por teclado.

### 11. Tests Requeridos
- **Tests Unitarios:**
  - Renderizado del Navbar con perfil predeterminado o mock.
  - Verificación de que el botón [Cerrar Sesión] dispara el callback `onLogout`.
- **Tests de Integración (Testing Library):**
  - Estado inicial de conectividad online verificado con badge accesible (`getByRole('status')`).
  - Simulación de evento de desconexión (`window.dispatchEvent(new Event('offline'))`) y comprobación de mutación a texto "Offline".
  - Simulación de reconexión (`window.dispatchEvent(new Event('online'))`) y reversión a "Online".
- **Evidencia Exigida:** Suite de tests completa en verde (mínimo 12 tests en total en el proyecto) ejecutada con Vitest.

### 12. Quality Gates (QG-FIA-A01.03)
- `QG-FIA-A01.03-01 · Compilación y Tipado:` Typecheck estricto sin errores TypeScript.
- `QG-FIA-A01.03-02 · Tests:` 100% de tests unitarios y de integración en verde.
- `QG-FIA-A01.03-03 · Anti-Scope Creep:` Cero código de cookies, redirecciones de router o endpoints backend.
- `QG-FIA-A01.03-04 · Verificación Funcional:` Telemetría de red reactiva y control de logout observables según `VF-A01.03`.

### 13. Definition of Done (DoD)
Una FIA se considera completada y lista para LOCK si y solo si:
1. `TopNavbar` y su telemetría de red están implementados satisfaciendo el objetivo indexado.
2. El componente queda integrado de forma nativa en `WorkspaceLayout.tsx`.
3. Los 4 Quality Gates están superados con evidencia técnica.
4. Se emiten el `IMPLEMENTATION_REPORT_FIA-A01.03.md`, `TEST_REPORT_FIA-A01.03.md` y la propuesta formal de `LOCK-FIA-A01.03.md`, cerrando la rebanada `RV-A01`.
