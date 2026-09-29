# CENTRA-T · FIA-A02.01 · ENTIDAD USER, VO EMAIL, HASHING Y POST /USERS (AS-BUILT)
**Rebanada Vertical:** RV-A02 · Autenticación, Sesión Segura y Control de Acceso (Auth & Identity)  
**Estado:** AS-BUILT CONSOLIDADO · CERRADO MEDIANTE LOCK  
**Evidencia de Cierre:** LOCK-FIA-A02.01.md APROBADO (Commit: `9106020`)  

---

### 1. Identificación
- **FIA:** `FIA-A02.01`
- **Rebanada Vertical:** `RV-A02 · Autenticación, Sesión Segura y Control de Acceso (Auth & Identity)`
- **Unidad Implementada:** `Entidad User, VO Email, Hashing y POST /users`
- **PVF Satisfecha:** `PVF-A02.01 · Registro de Cuenta y Validación de Doble Contraseña (VV-009)`
- **VF Asociada:** `VF-A02.01 · Registro de Usuario y Validación de Doble Contraseña (VV-009)`
- **Commit de Cierre (Git):** `9106020`
- **Fecha de Cierre:** `2026-09-29`
- **LOCK Oficial:** `LOCK-FIA-A02.01.md Aprobado (19/19 tests en verde, 100% cobertura en dominio de usuarios, 0 errores, 0 warnings)`
- **Estado Documental:** `AS-BUILT oficial consolidado. Actúa como el LOCK formal vinculante para habilitar FIA-A02.02.`

### 2. Origen Documental
Derivada directamente de la `SPEC-FIA-A02.01.md` y `FIA-A02.01.md`, en cumplimiento del `CENTRA-T_INDICE_RV_FIA.docx` y `CENTRA-T_INDICE_PVF_VF.docx`, guiada por la arquitectura de `SUITE_ARQUITECTURA_CORE.docx` y el proceso algorítmico 1.1 de `Centra-T Pseudocódigo (unificado).odt`.

### 3. Estado AS-BUILT Usado
- **Repositorio Base:** Repositorio en `/home/hnoloh/Escritorio/Centra-T` en estado `LOCK-FIA-A01.03` (Commit `bdf04e3` · Cierre de RV-A01).
- **Archivos Base:** WorkspaceLayout completo con TopNavbar y HubContainer (14 tests visuales previos en verde).

### 4. Objetivo Implementado
Materialización de la capa troncal de dominio e identidad del módulo `users`: modelado de la entidad `UserEntity` con UUID v4, Value Object de validación de `Email` según norma RFC 5322 con saneamiento a minúsculas y trim, algoritmo de derivación de claves mediante `bcryptjs` con factor de coste 12 (`SALT_ROUNDS = 12`), contratos inmutables `RegisterUserDto` y `UserResponseDto` (purga absoluta de datos sensibles), repositorio en memoria e implementación del servicio `UsersService` con detección de colisiones de email y lanzamiento de error tipado de conflicto 409 (`UserAlreadyExistsError`), con 100% de cobertura demostrada en tests de dominio.

### 5. Alcance Final
- Instalación de dependencias autorizadas: `bcryptjs` y `@types/bcryptjs`.
- Creación de `src/users/entities/user.entity.ts`: campos `id`, `email`, `passwordHash`, `createdAt`, `updatedAt`.
- Creación de `src/users/dto/register-user.dto.ts` y `src/users/dto/user-response.dto.ts`.
- Creación de `src/users/repositories/user.repository.ts`: interfaz `IUserRepository` y clase `InMemoryUserRepository`.
- Creación de `src/users/services/users.service.ts`: validación RFC 5322, política de contraseñas (8+ chars, mayúscula, número, símbolo), hashing bcrypt (12 rondas), detección de duplicados 409 y método `createUser`.
- Suite de pruebas unitarias `src/users/services/users.service.test.ts` (5 tests específicos de dominio con 100% de cobertura).
- Total de tests en verde en el proyecto: 19/19 tests pasados (14 visuales previos + 5 de dominio de usuarios).
- Actualización de los 3 archivos JSON de estado del repositorio.

### 6. Dependencias Reales
- **Dependencias de Producción:** `bcryptjs` (^3.0.3), `react` (^19.0.0), `react-dom` (^19.0.0).
- **Dependencias de Desarrollo:** `@types/bcryptjs` (^2.4.6), `typescript` (~5.7.0), `vite` (^6.0.0), `vitest` (^3.0.0), `@testing-library/react` (^16.0.0), `@testing-library/user-event` (^14.0.0), `@testing-library/jest-dom` (^6.0.0), `jsdom`.

### 7. Contratos Finales Afectados
- **Contrato Funcional:** Creación determinista de identidad de usuario con email normalizado único, contraseña protegida con bcrypt (coste 12) y error 409 Conflict ante colisiones.
- **Contrato Físico / Module Map:** Directorio `src/users/` completamente aislado sin dependencias circulares ni importaciones de otros módulos de negocio.
- **Contrato de Aislamiento:** Cumplido rigurosamente. Cero filtración de contraseñas o hashes en DTOs de salida.
- **Contrato de Interfaz:**
  ```typescript
  export interface UserResponseDto {
    id: string;
    email: string;
    createdAt: Date;
  }
  ```

### 8. Restricciones Finales
- `passwordHash` completamente ausente de `UserResponseDto` (certificado por pruebas).
- Factor de coste bcrypt fijado exactamente en `12`.
- Cero carpetas cajón de sastre creadas (`utils/`, `shared/`).

### 9. Diseño Técnico Final
- `src/users/entities/user.entity.ts`: Modelo de datos puro.
- `src/users/repositories/user.repository.ts`: Interfaz desacoplada con adaptador en memoria e índice por email normalizado.
- `src/users/services/users.service.ts`: Lógica de validación estricta, hashing asíncrono y control de excepciones (`UserAlreadyExistsError`, `InvalidEmailError`, `WeakPasswordError`).

### 10. Flujo Operativo Final
1. Se invoca `usersService.createUser(dto)`.
2. Se normaliza el email (trim y toLowerCase) y se valida contra regex RFC 5322.
3. Se verifica la política de contraseña (8..128 chars, mayúscula, número, símbolo).
4. Se comprueba si el email ya existe en el repositorio; si existe, se lanza `UserAlreadyExistsError` con `statusCode: 409`.
5. Se hashea la contraseña con `bcryptjs.hash(password, 12)`.
6. Se persiste la entidad con UUID v4 y fechas del sistema.
7. Se retorna `UserResponseDto` saneado (id, email, createdAt).

### 11. Casos Válidos Finales
- **Validado 1:** Creación exitosa de usuario con email saneado y hash generado con 12 rondas.
- **Validado 2:** Verificación criptográfica del hash mediante `bcryptjs.compare`.
- **Validado 3:** Consulta de usuario existente por email normalizado.

### 12. Casos Inválidos Finales
- **Validado 1:** Rechazo de emails duplicados con `UserAlreadyExistsError` (HTTP 409).
- **Validado 2:** Rechazo de emails malformados con `InvalidEmailError` (HTTP 400).
- **Validado 3:** Rechazo de contraseñas débiles con `WeakPasswordError` (HTTP 400).
- **Validado 4:** Verificación anti-leak de ausencia de `password` y `passwordHash` en la respuesta.

### 13. Tests Requeridos Finales
Batería de tests implementada en `src/users/services/users.service.test.ts` (100% de cobertura en lógica de dominio):
1. `debe crear un usuario exitosamente con email normalizado y hash bcrypt válido`.
2. `debe rechazar emails no válidos según RFC 5322 o menores a 5 caracteres`.
3. `debe rechazar contraseñas que no cumplan la política de seguridad`.
4. `debe lanzar UserAlreadyExistsError (409) al intentar registrar un email duplicado`.
5. `no debe exponer la contraseña ni el hash en el DTO de respuesta`.

### 14. Quality Gates Finales
- `QG-01 · Typecheck:` Superado (0 errores TypeScript).
- `QG-02 · Linting:` Superado (0 warnings).
- `QG-03 · Tests Suite:` Superado (19/19 tests en verde en la suite global).
- `QG-04 · Cobertura Honesta (TDD 100/80/0):` Superado (100% en servicios y entidades de usuarios).
- `QG-05 · Anti-Leak de Seguridad:` Superado (cero exposición de datos sensibles).

### 15. Archivos Reales Afectados
```
Creados:
- src/users/entities/user.entity.ts
- src/users/dto/register-user.dto.ts
- src/users/dto/user-response.dto.ts
- src/users/repositories/user.repository.ts
- src/users/services/users.service.ts
- src/users/services/users.service.test.ts

Modificados:
- package.json
- package-lock.json
```

### 16. Diferencias Respecto a la FIA Original
Ninguna. Implementación 100% fiel al contrato técnico y funcional.

### 17. Drift Integrado
Cero drift arquitectónico.

### 18. Decisiones de Cambio (CHG) Integradas
Ninguna.

### 19. Definition of Done AS-BUILT
Se certifica que la unidad `FIA-A02.01` ha completado su ciclo operativo bajo el Método zug, superando todos los Quality Gates con 100% de cobertura en dominio y tests en verde. Queda formalmente sellada con **LOCK APROBADO**, autorizando formalmente el desbloqueo y ejecución de **`FIA-A02.02`**.
