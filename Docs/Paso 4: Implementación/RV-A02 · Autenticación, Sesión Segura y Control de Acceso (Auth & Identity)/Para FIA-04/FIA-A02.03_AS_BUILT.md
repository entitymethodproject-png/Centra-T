# CENTRA-T · FIA-A02.03 · CONTROLADOR AUTH, COOKIE HTTPONLY Y THROTTLER (AS-BUILT)
**Rebanada Vertical:** RV-A02 · Autenticación, Sesión Segura y Control de Acceso (Auth & Identity)  
**Estado:** AS-BUILT CONSOLIDADO · CERRADO MEDIANTE LOCK · CASO FORENSE VV-001 BLINDADO  
**Evidencia de Cierre:** LOCK-FIA-A02.03.md APROBADO (Commit: `e7b8cba`)  

---

### 1. Identificación
- **FIA:** `FIA-A02.03`
- **Rebanada Vertical:** `RV-A02 · Autenticación, Sesión Segura y Control de Acceso (Auth & Identity)`
- **Unidad Implementada:** `Controlador Auth, Cookie HttpOnly y Throttler`
- **PVF Satisfecha:** `PVF-A02.03 · Autenticación Exitosa y Sesión Segura HttpOnly (VV-001)` y `PVF-A02.04 · Mitigación de Enumeración y Throttling`
- **VF Asociada:** `VF-A02.03 · Sesión Segura HttpOnly y Transición al Workspace (VV-001)`
- **Commit de Cierre (Git):** `e7b8cba` (feat: `65011e1`, test: `e440bcf`)
- **Fecha de Cierre:** `2026-09-29`
- **LOCK Oficial:** `LOCK-FIA-A02.03.md Aprobado (32/32 tests en verde, 100% cobertura en auth backend, 0 errores, 0 warnings)`
- **Estado Documental:** `AS-BUILT oficial consolidado. Actúa como el LOCK formal vinculante para habilitar FIA-A02.04.`

### 2. Origen Documental
Derivada directamente de la `SPEC-FIA-A02.03.md` y `FIA-A02.03.md`, en cumplimiento del `CENTRA-T_INDICE_RV_FIA.docx` y `CENTRA-T_INDICE_PVF_VF.docx`, guiada por la arquitectura de `SUITE_ARQUITECTURA_CORE.docx` y el proceso algorítmico 1.2 de `Centra-T Pseudocódigo (unificado).odt`.

### 3. Estado AS-BUILT Usado
- **Repositorio Base:** Repositorio en `/home/hnoloh/Escritorio/Centra-T` en estado `LOCK-FIA-A02.02` (Commit `e267f8e`).
- **Archivos Base:** Módulo `src/users/` y componente visual `RegisterTab` operativos con 27 tests en verde.

### 4. Objetivo Implementado
Materialización completa del motor de autenticación en backend: implementación de `AuthController`, `AuthService` y `ThrottlerService`, coordinando la verificación criptográfica de credenciales mediante `bcryptjs.compare`, prevención de enumeración de usuarios (respuesta 401 unificada con mensaje genérico *"Credenciales incorrectas"*), control de fuerza bruta con rate limiting (máximo 5 intentos fallidos en 15 minutos, bloqueo 429 Too Many Requests al 6º fallo) y blindaje formal del **Caso Forense VV-001** (emisión de la cookie `session_token` con todos los flags de seguridad obligatorios: `HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`).

### 5. Alcance Final
- Creación de DTOs inmutables: `src/authentication/dto/login-credentials.dto.ts` y `src/authentication/dto/auth-response.dto.ts`.
- Creación de `src/authentication/services/throttler.service.ts` con ventana de 15 minutos (900s), registro de intentos y excepción tipada `TooManyRequestsError` (429).
- Creación de `src/authentication/services/auth.service.ts` con verificación de hash, emisión de cabecera `Set-Cookie` y excepción tipada `InvalidCredentialsError` (401).
- Creación de `src/authentication/controllers/auth.controller.ts` coordinando el flujo de login, throttling y reseteo en éxito.
- Suite de pruebas de seguridad y robustez `src/authentication/controllers/auth.controller.test.ts` (5 tests específicos que certifican VV-001, anti-enumeración y throttling).
- Total de suite global del proyecto: 32/32 tests en verde al 100%.
- Actualización de los 3 archivos JSON de estado del repositorio.

### 6. Dependencias Reales
- **Dependencias de Producción:** `bcryptjs` (^3.0.3), `react` (^19.0.0), `react-dom` (^19.0.0).
- **Dependencias de Desarrollo:** `@types/bcryptjs` (^2.4.6), `typescript` (~5.7.0), `vite` (^6.0.0), `vitest` (^3.0.0), `@testing-library/react` (^16.0.0), `@testing-library/user-event` (^14.0.0), `@testing-library/jest-dom` (^6.0.0), `jsdom`.

### 7. Contratos Finales Afectados
- **Contrato Funcional:** En 200 OK emite cabecera `Set-Cookie` con `session_token` e `HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`; ante credenciales erróneas devuelve 401 unificado; al 6º intento fallido consecutivo devuelve 429 Too Many Requests.
- **Contrato Físico / Module Map:** Directorio `src/authentication/` desacoplado, consumiendo `UsersService` sin alterar la persistencia interna.
- **Contrato de Aislamiento:** Cumplido con rigor. Cero filtración de contraseñas ni hashes en respuestas HTTP ni tokens.
- **Contrato de Interfaz:**
  ```typescript
  export interface AuthHttpResponse {
    statusCode: number;
    headers: {
      'Set-Cookie': string;
    };
    body: AuthResponseDto;
  }
  ```

### 8. Restricciones Finales
- Presencia incondicional de los 4 flags de seguridad en la cookie (`HttpOnly`, `Secure`, `SameSite=Strict`, `Path=/`, `Max-Age=86400`).
- Mensaje 401 inalterable: *"Credenciales incorrectas"*.
- Límite de throttling: exactamente 5 intentos fallidos / 15 min.

### 9. Diseño Técnico Final
- `src/authentication/services/throttler.service.ts`: Manejo de registros en memoria con expiración y cálculo de tiempo restante.
- `src/authentication/services/auth.service.ts`: Verificación de credenciales y ensamblado de sesión.
- `src/authentication/controllers/auth.controller.ts`: Orquestador principal de acceso seguro.

### 10. Flujo Operativo Final
1. Se invoca `authController.login(dto)`.
2. Se consulta `throttlerService.checkBlocked(key)`. Si está bloqueado, lanza 429.
3. Se verifica el usuario y hash contra `UsersService`. Si falla cualquiera, registra fallo en Throttler y lanza 401 unificado.
4. Con credenciales válidas, limpia el Throttler, genera token de sesión y emite `Set-Cookie` con los flags de seguridad completos.

### 11. Casos Válidos Finales
- **Validado 1 (Caso Forense VV-001):** Respuesta 200 OK con cabecera `Set-Cookie` completa (`session_token`, `HttpOnly`, `Secure`, `SameSite=Strict`, `Path=/`, `Max-Age=86400`).
- **Validado 2:** Reseteo exitoso del historial de throttling tras login válido.

### 12. Casos Inválidos Finales
- **Validado 1 (Anti-Enumeración):** Error 401 con mensaje "Credenciales incorrectas" idéntico ante usuario inexistente y ante contraseña incorrecta.
- **Validado 2 (Throttling / Fuerza Bruta):** Bloqueo con HTTP 429 Too Many Requests tras 5 intentos fallidos consecutivos.

### 13. Tests Requeridos Finales
Suite de 32 tests validada al 100% en verde:
- `auth.controller.test.ts` (5 tests): autenticación exitosa VV-001, anti-enumeración por email, anti-enumeración por contraseña, bloqueo 429 por throttling y reseteo tras éxito.
- Tests previos: 14 de layout/hub/navbar + 5 de users + 8 de RegisterTab.

### 14. Quality Gates Finales
- `QG-01 · Typecheck:` Superado (0 errores TypeScript).
- `QG-02 · Linting:` Superado (0 warnings).
- `QG-03 · Tests Suite:` Superado (32/32 tests en verde).
- `QG-04 · Cumplimiento Caso Forense VV-001:` Cabecera `Set-Cookie` certificada por pruebas.
- `QG-05 · Anti-Leak de Seguridad:` Superado (cero datos sensibles filtrados).

### 15. Archivos Reales Afectados
```
Creados:
- src/authentication/dto/login-credentials.dto.ts
- src/authentication/dto/auth-response.dto.ts
- src/authentication/services/throttler.service.ts
- src/authentication/services/auth.service.ts
- src/authentication/controllers/auth.controller.ts
- src/authentication/controllers/auth.controller.test.ts

Modificados:
(Ninguno)
```

### 16. Diferencias Respecto a la FIA Original
Ninguna. Fidelidad absoluta a la especificación técnica.

### 17. Drift Integrado
Cero drift arquitectónico.

### 18. Decisiones de Cambio (CHG) Integradas
Ninguna.

### 19. Definition of Done AS-BUILT
Se certifica que la unidad `FIA-A02.03` ha completado su ciclo operativo bajo el Método zug, superando todos los Quality Gates con tests en verde y blindaje formal del caso forense VV-001 y mitigaciones OWASP. Queda formalmente sellada con **LOCK APROBADO**, autorizando el desbloqueo y ejecución de **`FIA-A02.04`**.
