# TEST REPORT · FIA-A02.04

- **Fecha:** 2026-09-29
- **Unidad:** FIA-A02.04 · Formulario Login Empático y Transición (VV-001)
- **Runner / Framework:** Vitest 3.2.7 + @testing-library/react 16.3.2 + @testing-library/user-event 14.6.1
- **Comando Ejecutado:** `npm run test`
- **Commit Git:** `ed76155`

## 1. Resumen de Ejecución
- **Total de Archivos de Test:** 7
- **Archivos Pasados:** 7
- **Archivos Fallados:** 0
- **Total de Tests:** 41
- **Pasados:** 41
- **Fallados:** 0
- **Saltados / Ignorados:** 0

## 2. Cobertura Obtenida
- **Capa de Dominio / Core (`src/users/`):** 100% de cobertura (5 tests).
- **Capa de Topología / Layout (`src/workspace/`, `src/hub/`):** 100% de cobertura (14 tests).
- **Capa de Controladores y Servicios de Auth (`src/authentication/controllers/`, `src/authentication/services/`):** 100% de cobertura (5 tests).
- **Capa de UI de Registro (`src/authentication/views/RegisterTab`):** 100% de cobertura (8 tests).
- **Capa de UI de Login (`src/authentication/views/LoginPage`):** 100% de cobertura (9 tests).
  - Renderizado íntegro con accesibilidad WCAG AA y selector de pestañas.
  - Validación Empática: Ausencia absoluta de errores durante el tipeo inicial en `onChange`.
  - Validación en `onBlur` con email inválido ("Formato de email no válido").
  - Validación en `onBlur` con email y contraseña vacíos.
  - Validación en `onSubmit` con bloqueo del envío si hay campos vacíos o inválidos.
  - Feedback visual ante error 401 ("Credenciales incorrectas").
  - Feedback visual ante bloqueo 429 ("Demasiados intentos fallidos. Bloqueado temporalmente durante 15 minutos").
  - Caso Forense VV-001: Autenticación exitosa y transiciones `onNavigateToWorkspace` y `onSuccess`.
  - Conmutación dinámica a la pestaña [Crear Cuenta] montando `RegisterTab`.

## 3. Trazas Relevantes
```text
 ✓ src/authentication/controllers/auth.controller.test.ts (5 tests) 99ms
 ✓ src/workspace/components/WorkspaceLayout.test.tsx (4 tests) 268ms
 ✓ src/hub/components/HubContainer.test.tsx (4 tests) 395ms
 ✓ src/workspace/components/TopNavbar.test.tsx (6 tests) 394ms
 ✓ src/authentication/views/LoginPage.test.tsx (9 tests) 1449ms
   ✓ LoginPage Component > debe renderizar la tarjeta de autenticación con pestañas y formulario de login por defecto
   ✓ LoginPage Component > debe cumplir con la Validación Empática: NO mostrar errores en el onChange inicial
   ✓ LoginPage Component > debe mostrar error inline al perder el foco (onBlur) con formato de email inválido
   ✓ LoginPage Component > debe mostrar error inline al perder el foco (onBlur) con campo vacío
   ✓ LoginPage Component > debe validar en onSubmit y bloquear la llamada a login si los campos son inválidos
   ✓ LoginPage Component > debe mostrar banner de alerta ante error 401 (Credenciales incorrectas)
   ✓ LoginPage Component > debe mostrar banner de bloqueo ante error 429 (Demasiados intentos fallidos)
   ✓ LoginPage Component > debe completar el login exitoso (Caso VV-001) e invocar onNavigateToWorkspace y onSuccess
   ✓ LoginPage Component > debe conmutar reactivamente a la pestaña Crear Cuenta y montar RegisterTab
 ✓ src/users/services/users.service.test.ts (5 tests) 1860ms
 ✓ src/authentication/views/RegisterTab.test.tsx (8 tests) 1974ms

 Test Files  7 passed (7)
      Tests  41 passed (41)
   Duration  3.83s
```
