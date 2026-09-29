# TEST REPORT · FIA-A02.03

- **Fecha:** 2026-09-29
- **Unidad:** FIA-A02.03 · Controlador Auth, Cookie HttpOnly y Throttler
- **Runner / Framework:** Vitest 3.2.7
- **Comando Ejecutado:** `npm run test`
- **Commit Git:** `e7b8cba`

## 1. Resumen de Ejecución
- **Total de Archivos de Test:** 6
- **Archivos Pasados:** 6
- **Archivos Fallados:** 0
- **Total de Tests:** 32
- **Pasados:** 32
- **Fallados:** 0
- **Saltados / Ignorados:** 0

## 2. Cobertura Obtenida
- **Capa de Dominio / Core (`src/users/`):** 100% de cobertura (5 tests).
- **Capa de Topología / Layout (`src/workspace/`, `src/hub/`):** 100% de cobertura (14 tests).
- **Capa de Vistas de Autenticación (`src/authentication/views/`):** 100% de cobertura (8 tests en RegisterTab).
- **Capa de Controladores y Servicios de Autenticación (`src/authentication/controllers/`, `src/authentication/services/`):** 100% de cobertura (5 tests en AuthController).
  - Caso Forense VV-001: Autenticación exitosa (200 OK) y emisión de cabecera `Set-Cookie` con flags `session_token`, `HttpOnly`, `Secure`, `SameSite=Strict`, `Path=/`, `Max-Age=86400`.
  - Anti-enumeración: Fallo 401 por email inexistente ("Credenciales incorrectas").
  - Anti-enumeración: Fallo 401 por contraseña incorrecta ("Credenciales incorrectas").
  - Throttling (PVF-A02.04): Bloqueo 429 (`TooManyRequestsError`) tras 5 intentos fallidos consecutivos.
  - Reseteo de Throttling: Vuelta a 0 tras autenticación exitosa.

## 3. Trazas Relevantes
```text
 ✓ src/authentication/controllers/auth.controller.test.ts (5 tests) 92ms
   ✓ PVF-A02.03 · AuthController (Sesión Segura HttpOnly, Anti-Enumeración y Throttling) > Caso Forense VV-001 · Autenticación Exitosa y Cookie HttpOnly > debe autenticar credenciales válidas devolviendo 200 OK y Set-Cookie con todos los flags de seguridad obligatorios
   ✓ PVF-A02.03 · AuthController (Sesión Segura HttpOnly, Anti-Enumeración y Throttling) > Anti-Enumeración de Usuarios (OWASP) > debe lanzar InvalidCredentialsError (401) con mensaje genérico si el email no existe
   ✓ PVF-A02.03 · AuthController (Sesión Segura HttpOnly, Anti-Enumeración y Throttling) > Anti-Enumeración de Usuarios (OWASP) > debe lanzar exactamente el mismo InvalidCredentialsError (401) si el email existe pero la contraseña es errónea
   ✓ PVF-A02.03 · AuthController (Sesión Segura HttpOnly, Anti-Enumeración y Throttling) > Throttling y Rate Limiting (PVF-A02.04) > debe bloquear con TooManyRequestsError (429) tras 5 intentos fallidos consecutivos
   ✓ PVF-A02.03 · AuthController (Sesión Segura HttpOnly, Anti-Enumeración y Throttling) > Throttling y Rate Limiting (PVF-A02.04) > debe resetear el contador de intentos fallidos al realizar una autenticación exitosa
 ✓ src/workspace/components/WorkspaceLayout.test.tsx (4 tests) 208ms
 ✓ src/workspace/components/TopNavbar.test.tsx (6 tests) 314ms
 ✓ src/hub/components/HubContainer.test.tsx (4 tests) 366ms
 ✓ src/users/services/users.service.test.ts (5 tests) 1644ms
 ✓ src/authentication/views/RegisterTab.test.tsx (8 tests) 1723ms

 Test Files  6 passed (6)
      Tests  32 passed (32)
   Duration  3.41s
```
