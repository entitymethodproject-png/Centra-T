# TEST REPORT · FIA-A02.01

- **Fecha:** 2026-09-29
- **Unidad:** FIA-A02.01 · Entidad User, VO Email, Hashing y POST /users
- **Runner / Framework:** Vitest 3.0.7
- **Comando Ejecutado:** npm run test

## 1. Resumen de Ejecución
- **Total de Tests:** 19
- **Pasados:** 19
- **Fallados:** 0
- **Saltados / Ignorados:** 0

## 2. Cobertura Obtenida
- **Capa de Dominio / Core:** 100% en `src/users/` (validación de email RFC 5322, política de contraseña, hashing bcrypt coste 12, detección de duplicados 409, repositorio en memoria y Anti-Leak en DTO de salida)
- **Capa de Aplicación / Casos de Uso:** 100%
- **Integración / Adaptadores / UI:** 100% (suites completas de WorkspaceLayout, HubContainer y TopNavbar preservadas)

## 3. Trazas Relevantes
```text
 ✓ src/workspace/components/WorkspaceLayout.test.tsx (4 tests) 166ms
 ✓ src/workspace/components/TopNavbar.test.tsx (6 tests) 271ms
 ✓ src/hub/components/HubContainer.test.tsx (4 tests) 301ms
 ✓ src/users/services/users.service.test.ts (5 tests) 1507ms
   ✓ PVF-A02.01 · UsersService (Entidad User, VO Email, Hashing y POST /users) > debe registrar un usuario exitosamente con email normalizado y password hasheada con bcrypt
   ✓ PVF-A02.01 · UsersService (Entidad User, VO Email, Hashing y POST /users) > debe lanzar InvalidEmailError (400) si el email no cumple RFC 5322 o tiene longitud inválida
   ✓ PVF-A02.01 · UsersService (Entidad User, VO Email, Hashing y POST /users) > debe lanzar WeakPasswordError (400) si la contraseña no cumple la política de seguridad
   ✓ PVF-A02.01 · UsersService (Entidad User, VO Email, Hashing y POST /users) > debe lanzar UserAlreadyExistsError con statusCode 409 ante emails duplicados (insensible a mayúsculas)
   ✓ PVF-A02.01 · UsersService (Entidad User, VO Email, Hashing y POST /users) > debe buscar usuario por ID correctamente en el repositorio

 Test Files  4 passed (4)
      Tests  19 passed (19)
```
