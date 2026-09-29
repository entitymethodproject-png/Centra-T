# TEST REPORT · FIA-A02.02

- **Fecha:** 2026-09-29
- **Unidad:** FIA-A02.02 · Componente de Registro en UI y Pestaña [Crear Cuenta] (VV-009)
- **Runner / Framework:** Vitest 3.2.7 + @testing-library/react 16.3.2 + @testing-library/user-event 14.6.1
- **Comando Ejecutado:** `npm run test`
- **Commit Git:** `e267f8e`

## 1. Resumen de Ejecución
- **Total de Archivos de Test:** 5
- **Archivos Pasados:** 5
- **Archivos Fallados:** 0
- **Total de Tests:** 27
- **Pasados:** 27
- **Fallados:** 0
- **Saltados / Ignorados:** 0

## 2. Cobertura Obtenida
- **Capa de Dominio / Core (`src/users/`):** 100% de cobertura (5 tests).
- **Capa de Topología / Layout (`src/workspace/`, `src/hub/`):** 100% de cobertura (14 tests).
- **Capa de UI de Autenticación (`src/authentication/views/`):** 100% de cobertura en `RegisterTab` (8 tests).
  - Renderizado de campos y accesibilidad WCAG AA.
  - **Caso Forense VV-009:** Bloqueo absoluto y error inline ante contraseñas desiguales.
  - Validación reactiva de email (RFC 5322).
  - Validación reactiva de política de contraseña.
  - Deshabilitación reactiva e indicador de carga ("Creando cuenta...").
  - Captura y feedback visual del error 409 (`UserAlreadyExistsError`).
  - Éxito en registro, mensaje reactivo e invocación de `onSuccess`.
  - Navegación contextual a login mediante `onSwitchToLogin`.

## 3. Trazas Relevantes
```text
 ✓ src/workspace/components/WorkspaceLayout.test.tsx (4 tests) 181ms
 ✓ src/hub/components/HubContainer.test.tsx (4 tests) 319ms
 ✓ src/workspace/components/TopNavbar.test.tsx (6 tests) 316ms
 ✓ src/users/services/users.service.test.ts (5 tests) 1670ms
   ✓ PVF-A02.01 · UsersService (Entidad User, VO Email, Hashing y POST /users) > debe registrar un usuario exitosamente con email normalizado y password hasheada con bcrypt 965ms
   ✓ PVF-A02.01 · UsersService (Entidad User, VO Email, Hashing y POST /users) > debe lanzar UserAlreadyExistsError con statusCode 409 ante emails duplicados (insensible a mayúsculas) 342ms
   ✓ PVF-A02.01 · UsersService (Entidad User, VO Email, Hashing y POST /users) > debe buscar usuario por ID correctamente en el repositorio 357ms
 ✓ src/authentication/views/RegisterTab.test.tsx (8 tests) 1687ms
   ✓ PVF-A02.01 · RegisterTab (Componente de Registro y Caso Forense VV-009) > debe renderizar los campos obligatorios, labels WCAG AA y el botón de creación
   ✓ PVF-A02.01 · RegisterTab (Componente de Registro y Caso Forense VV-009) > debe bloquear el envío y mostrar error inline cuando las contraseñas no coinciden (Caso Forense VV-009) 383ms
   ✓ PVF-A02.01 · RegisterTab (Componente de Registro y Caso Forense VV-009) > debe mostrar error inline si el formato del correo electrónico es inválido
   ✓ PVF-A02.01 · RegisterTab (Componente de Registro y Caso Forense VV-009) > debe mostrar error inline si la contraseña no cumple los requisitos mínimos de seguridad
   ✓ PVF-A02.01 · RegisterTab (Componente de Registro y Caso Forense VV-009) > debe deshabilitar inputs y botón mostrando estado de carga durante el registro
   ✓ PVF-A02.01 · RegisterTab (Componente de Registro y Caso Forense VV-009) > debe mostrar alerta global si el usuario ya existe (Error 409 UserAlreadyExistsError)
   ✓ PVF-A02.01 · RegisterTab (Componente de Registro y Caso Forense VV-009) > debe invocar onSuccess tras un registro exitoso con datos válidos
   ✓ PVF-A02.01 · RegisterTab (Componente de Registro y Caso Forense VV-009) > debe invocar onSwitchToLogin al hacer clic en el enlace de inicio de sesión

 Test Files  5 passed (5)
      Tests  27 passed (27)
   Duration  3.23s
```
