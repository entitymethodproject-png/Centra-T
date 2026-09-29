# CENTRA-T · FIA-A02.02 · COMPONENTE DE REGISTRO EN UI Y PESTAÑA [CREAR CUENTA] (VV-009)
**Rebanada Vertical:** RV-A02 · Autenticación, Sesión Segura y Control de Acceso (Auth & Identity)  
**Estado:** DERIVADA · PENDIENTE DE SPEC, IMPLEMENTACIÓN Y LOCK  
**Regla de Continuidad:** NO LOCK → NO NEXT  

---

### 1. Identificación
- **FIA:** `FIA-A02.02`
- **Rebanada Vertical:** `RV-A02 · Autenticación, Sesión Segura y Control de Acceso (Auth & Identity)`
- **Unidad Prevista:** `Componente de Registro en UI y Pestaña [Crear Cuenta] (VV-009)`
- **PVF de Cierre Cubierta:** `PVF-A02.01 · Registro de Cuenta y Validación de Doble Contraseña (VV-009)`
- **VF Interna de Derivación:** `VF-A02.01 · Registro de Usuario y Validación de Doble Contraseña (VV-009)`
- **Objetivo Indexado:** `Construir pestaña [Crear Cuenta] en tarjeta Auth con validación de coincidencia de contraseñas, feedback de carga y emisión de llamada POST /users (VV-009).`
- **Validación Indexada:** `src/authentication/views/RegisterTab.tsx`
- **Evidencia de Cierre Indexada:** `Superación del caso VV-009: validación inline de contraseñas desiguales, creación exitosa, emisión de cookie y redirección a /workspace.`
- **LOCK Previo Requerido:** `LOCK-FIA-A02.01.md APROBADO (Commit: 9106020)`
- **Estado Documental:** `FIA inicial derivada. No es SPEC, implementación, reporte ni LOCK.`

### 2. Objetivo
Materializar en la interfaz de usuario el componente de formulario `RegisterTab` (pestaña [Crear Cuenta]) dentro de la superficie de autenticación, integrando los campos `email`, `password` y `passwordConfirm`, validación inline estricta de coincidencia de contraseñas (Caso Forense VV-009), gestión reactiva de la matriz canónica de 5 estados (Empty, Loading, Error, Success), consumo desacoplado de `UsersService` para persistir la cuenta y emisión de evento de éxito (`onSuccess`) para permitir la transición fluida al Workspace.

### 3. Alcance
- **IN-SCOPE (Obligatorio en esta FIA):**
  - Creación del componente `RegisterTab.tsx` en `src/authentication/views/RegisterTab.tsx`.
  - Hoja de estilos `RegisterTab.module.css` con diseño oscuro funcional y tokens oficiales (`#0B0F17`, `#131B26`, `#233144`, `#3B82F6`, `#EF4444` para error, `#10B981` para éxito).
  - Formulario accesible con etiquetas semánticas (`<label>`, `<input>`, `aria-invalid`, `aria-describedby`).
  - Validación en cliente con feedback inline:
    - Validación de email según RFC 5322.
    - Validación de política de contraseñas (8+ chars, mayúscula, número, símbolo).
    - **Caso Forense VV-009:** Validación obligatoria de igualdad estricta entre `password` y `passwordConfirm`. Si difieren, mostrar mensaje inline "Las contraseñas no coinciden", marcar campo con `aria-invalid="true"` y bloquear el submit.
  - Implementación de la matriz canónica de estados UI:
    - *Empty:* Formulario listo para entrada con botón habilitado.
    - *Loading:* Inputs deshabilitados y botón con texto "Creando cuenta..." durante el proceso de guardado/hashing.
    - *Error:* Alertas inline específicas y banner global en caso de colisión 409 ("No ha sido posible completar el registro. Compruebe los datos o intente iniciar sesión").
    - *Success:* Micro-feedback de éxito ("Cuenta creada correctamente") y disparo del callback `onSuccess`.
  - Conexión del formulario con `UsersService` para la persistencia real del usuario.
  - Suite de pruebas de integración con `@testing-library/react` que verifique el renderizado, el bloqueo por contraseñas desiguales (VV-009), el manejo de colisión 409 y el registro exitoso.
- **OUT-OF-SCOPE (Prohibición explícita):**
  - Formulario de login o pestaña [Iniciar Sesión] (pertenece a `FIA-A02.03`).
  - Emisión de cookies HttpOnly seguras firmadas por JWT backend (pertenece a `FIA-A02.03`).
  - Rate limiting (pertenece a `FIA-A02.04`).
  - Lógica de acordeones o listas de tareas.

### 4. Dependencias
- **Documentales:** 
  - `SUITE_ARQUITECTURA_CORE.docx` (Docs 01 a 05: SSDLC, Caso Forense VV-009).
  - `SUITE_ARQUITECTURA_UI.docx` (Docs 06 a 10: Matriz de 5 Estados, WCAG AA, Tokens).
  - `Centra-T Pseudocódigo (unificado).odt` (Módulo 1.1: Paso 1, Paso 2 y Cláusulas de Escape).
  - `CENTRA-T_INDICE_PVF_VF.docx` (Doc 11: Fila PVF-A02.01 / VF-A02.01).
  - `CENTRA-T_INDICE_RV_FIA.docx` (Doc 12: Fila FIA-A02.02).
  - `FIA-A02.01_AS_BUILT.md` (Estado previo bloqueado: `UsersService` operativo).
  - `ZUG_KNOWLEDGE_BASE.md`.
- **Tecnológicas Autorizadas:** React 19, TypeScript 5.x, CSS Modules, Vitest, `@testing-library/react`, `@testing-library/user-event`.
- **Dependencia Secuencial (NO LOCK → NO NEXT):**
  - *Previa:* Requiere LOCK formal de `FIA-A02.01` (Aprobado en commit `9106020`).
  - *Posterior:* La unidad `FIA-A02.03` (Autenticación Exitosa y Sesión Segura HttpOnly - VV-001) no podrá iniciarse hasta el cierre y LOCK de esta FIA.

### 5. Contratos Afectados
- **Contrato Funcional:** La vista `RegisterTab` expone un formulario de 3 campos, aplica la regla innegociable de validación de doble contraseña (VV-009), interactúa con `UsersService` y gestiona la transición asíncrona de estados.
- **Contrato Físico / Module Map:** Ubicación en `src/authentication/views/RegisterTab.tsx` (y sus estilos/tests asociados).
- **Contrato de Aislamiento:** La UI consume `UsersService` mediante inyección de dependencias o instancia por defecto. Prohibido manipular hashes o almacenamiento interno directamente desde el componente.

### 6. Restricciones
- Caso Forense VV-009 innegociable: el formulario no debe enviar peticiones si `password !== passwordConfirm`.
- Prohibido parpadeo de maquetación al desplegar mensajes de error inline (reservar altura o usar animación suave).
- Prohibida la inclusión de scripts o librerías de validación externas pesadas (usar TypeScript y validación pura).

### 7. Diseño Técnico
- **Entrada / Punto de Acceso:** `src/authentication/views/RegisterTab.tsx`.
- **Estructura Interna:**
  - `RegisterTab`: Componente funcional con estado local para campos (`email`, `password`, `passwordConfirm`), errores inline (`errors: { email?, password?, passwordConfirm?, global? }`) y estado de carga (`isLoading: boolean`).
  - `RegisterTabProps`:
    ```typescript
    export interface RegisterTabProps {
      usersService?: UsersService;
      onSuccess?: (user: UserResponseDto) => void;
      onSwitchToLogin?: () => void;
    }
    ```
- **Manejo de Errores:** Errores inline mapeados desde las validaciones síncronas o capturados desde las excepciones tipadas de `UsersService` (`UserAlreadyExistsError` genera alerta global de colisión 409).
- **Fronteras Físicas Autorizadas:** Directorio `src/authentication/views/*`.

### 8. Flujo Operativo
1. El usuario visualiza la pestaña [Crear Cuenta] en estado Empty con los 3 campos vacíos y el botón [Crear Cuenta] habilitado.
2. El usuario introduce email y contraseñas.
3. Si el usuario introduce contraseñas distintas y hace clic en [Crear Cuenta] (o al desenfocar `passwordConfirm`), se activa el estado de error inline "Las contraseñas no coinciden" (VV-009) y se detiene la ejecución.
4. Si los datos son válidos, al pulsar [Crear Cuenta] el formulario pasa a estado Loading (inputs deshabilitados, botón muestra "Creando cuenta...").
5. Se invoca asíncronamente `usersService.createUser(...)`.
6. Si el email ya existe, el servicio arroja error 409; el componente transiciona a estado Error y muestra el banner: "No ha sido posible completar el registro. Compruebe los datos o intente iniciar sesión", reactivando los inputs.
7. Si el registro tiene éxito, el componente transiciona a Success, muestra micro-feedback de éxito y llama a `onSuccess(createdUser)`.

### 9. Casos Válidos (Happy Path & Escenarios Permitidos)
- **Caso 1 (Registro exitoso completo):**
  - *Input:* Email válido, contraseña robusta y confirmación idéntica.
  - *Resultado:* Pasa por Loading, se crea el usuario y se ejecuta el callback `onSuccess`.
- **Caso 2 (Conmutación a Login):**
  - *Acción:* Clic en enlace "¿Ya tienes cuenta? Inicia sesión".
  - *Resultado:* Se invoca `onSwitchToLogin` y se resetea el formulario.

### 10. Casos Inválidos (Manejo de Excepciones y Rechazos)
- **Caso Inválido 1 (Caso Forense VV-009 - Contraseñas no coincidentes):**
  - *Input:* `password: "Pass1234!"`, `passwordConfirm: "Pass9999!"`.
  - *Resultado:* Error inline "Las contraseñas no coinciden", `aria-invalid="true"`, ninguna llamada a `usersService.createUser`.
- **Caso Inválido 2 (Colisión 409 - Email ya registrado):**
  - *Input:* Email previamente registrado.
  - *Resultado:* Banner de error global "No ha sido posible completar el registro. Compruebe los datos o intente iniciar sesión".
- **Caso Inválido 3 (Email malformado o contraseña débil):**
  - *Resultado:* Mensaje inline específico antes de intentar el guardado.

### 11. Tests Requeridos
- **Tests de Integración (Testing Library):**
  - Renderizado inicial de los 3 campos y botón [Crear Cuenta].
  - **Prueba del Caso Forense VV-009:** Ingreso de contraseñas desiguales; verificación de que aparece el mensaje "Las contraseñas no coinciden" y que `createUser` nunca es llamado.
  - Manejo de colisión 409: Simular que el servicio arroja `UserAlreadyExistsError`; verificar que se muestra la alerta global y que los campos vuelven a habilitarse.
  - Flujo feliz: Ingreso de datos válidos; verificación de estado de carga y disparo del callback `onSuccess` con los datos del usuario.
- **Evidencia Exigida:** Suite de tests ejecutada en verde con reporte emitido por Vitest.

### 12. Quality Gates (QG-FIA-A02.02)
- `QG-FIA-A02.02-01 · Compilación y Tipado:` Typecheck estricto sin errores TypeScript.
- `QG-FIA-A02.02-02 · Tests Suite:` 100% de tests de `RegisterTab` en verde.
- `QG-FIA-A02.02-03 · Superación del Caso Forense VV-009:` Verificación automatizada irrefutable del bloqueo por contraseñas desiguales.
- `QG-FIA-A02.02-04 · Anti-Scope Creep:` Cero código de cookies HttpOnly ni endpoints de login.

### 13. Definition of Done (DoD)
Una FIA se considera completada y lista para LOCK si y solo si:
1. `RegisterTab` y su hoja de estilos están implementados respetando la matriz de 5 estados.
2. La validación del caso forense VV-009 está demostrada con tests automatizados.
3. El componente se conecta limpiamente con `UsersService`.
4. El 100% de los tests del proyecto pasan en verde.
5. Se emiten el `IMPLEMENTATION_REPORT_FIA-A02.02.md`, `TEST_REPORT_FIA-A02.02.md` y la propuesta formal de `LOCK-FIA-A02.02.md`.
