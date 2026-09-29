# CENTRA-T · FIA-A02.01 · ENTIDAD USER, VO EMAIL, HASHING Y POST /USERS
**Rebanada Vertical:** RV-A02 · Autenticación, Sesión Segura y Control de Acceso (Auth & Identity)  
**Estado:** DERIVADA · PENDIENTE DE SPEC, IMPLEMENTACIÓN Y LOCK  
**Regla de Continuidad:** NO LOCK → NO NEXT  

---

### 1. Identificación
- **FIA:** `FIA-A02.01`
- **Rebanada Vertical:** `RV-A02 · Autenticación, Sesión Segura y Control de Acceso (Auth & Identity)`
- **Unidad Prevista:** `Entidad User, VO Email, Hashing y POST /users`
- **PVF de Cierre Cubierta:** `PVF-A02.01 · Registro de Cuenta y Validación de Doble Contraseña (VV-009)`
- **VF Interna de Derivación:** `VF-A02.01 · Registro de Usuario y Validación de Doble Contraseña (VV-009)`
- **Objetivo Indexado:** `Implementar entidad User con VO Email validado por regex RFC 5322, hashing bcrypt (coste 12), endpoint POST /users con DTO de registro y control de unicidad 409.`
- **Validación Indexada:** `src/users/entities/user.entity.ts` (y servicios/tests asociados)
- **Evidencia de Cierre Indexada:** `100% de cobertura en tests unitarios de dominio: hashing verificado, rechazo de emails duplicados y persistencia en base de datos.`
- **LOCK Previo Requerido:** `LOCK-FIA-A01.03.md APROBADO (Commit: bdf04e3 · Cierre de RV-A01)`
- **Estado Documental:** `FIA inicial derivada. No es SPEC, implementación, reporte ni LOCK.`

### 2. Objetivo
Construir la capa troncal de dominio e identidad del sistema para el módulo `users`: modelado de la entidad pura `User`, formalización del Value Object de validación de `Email` bajo norma RFC 5322 (con normalización trim y toLowerCase), algoritmo de derivación de claves criptográficas seguras mediante bcrypt con factor de coste 12, los contratos de datos `RegisterUserDto` y `UserResponseDto` (con purga estricta de hash sensible), y el servicio de creación de cuentas con detección de duplicidad y emisión determinista de error de conflicto HTTP 409, garantizando el 100% de cobertura en tests de lógica de negocio conforme a la doctrina TDD 100/80/0.

### 3. Alcance
- **IN-SCOPE (Obligatorio en esta FIA):**
  - Entidad de dominio `User`: identificador único `id` (UUID v4), `email` normalizado único, `passwordHash` criptográfico, marcas temporales `createdAt` y `updatedAt`.
  - Validación formal de Email según RFC 5322 (longitud entre 5 y 120 caracteres, saneamiento a minúsculas y sin espacios residuales).
  - Validación de política de contraseñas: longitud mínima 8 caracteres, al menos 1 letra mayúscula, 1 número y 1 carácter especial, longitud máxima 128 caracteres.
  - Servicio de hashing asíncrono con bcrypt fijado exactamente en factor de coste 12 (`rounds = 12`).
  - DTO de entrada `RegisterUserDto` tipado e inmutable.
  - DTO de salida seguro `UserResponseDto` que expone id, email y fecha de creación, certificando la ausencia absoluta del hash de contraseña.
  - Servicio de usuarios `UsersService` con método de creación (`create`) que verifica la no existencia del email y lanza excepción de conflicto (409 Conflict) ante colisiones.
  - Repositorio de usuarios en memoria / persistencia desacoplada con operaciones `findByEmail` y `save`.
  - Suite de pruebas unitarias de dominio con cobertura del 100% de las funciones puras y servicios de usuarios.
- **OUT-OF-SCOPE (Prohibición explícita):**
  - Maquetación de la pestaña visual [Crear Cuenta] o formulario en React (pertenece a `FIA-A02.02`).
  - Generación de token JWT de sesión o inyección de cookie HttpOnly (pertenece a `FIA-A02.03`).
  - Rate limiting del endpoint de autenticación (pertenece a `FIA-A02.04`).
  - Procedimientos de borrado de sesión o cierre de sesión (pertenece a `FIA-A02.05`).
  - Modificación de los componentes visuales ya bloqueados del Workspace (`RV-A01`).

### 4. Dependencias
- **Documentales:** 
  - `SUITE_ARQUITECTURA_CORE.docx` (Docs 01 a 05: Documento Maestro, Domain Model, Module Map, SSDLC).
  - `Centra-T Pseudocódigo (unificado).odt` (Módulo 1.1: `Registrar_Usuario`).
  - `CENTRA-T_INDICE_PVF_VF.docx` (Doc 11: Fila PVF-A02.01 / VF-A02.01).
  - `CENTRA-T_INDICE_RV_FIA.docx` (Doc 12: Fila FIA-A02.01).
  - `FIA-A01.03_AS_BUILT.md` (Cierre formal de RV-A01).
  - `ZUG_KNOWLEDGE_BASE.md`.
- **Tecnológicas Autorizadas:** TypeScript 5.x, `bcrypt` o `bcryptjs`, `uuid`, Vitest.
- **Dependencia Secuencial (NO LOCK → NO NEXT):**
  - *Previa:* Requiere LOCK formal de `FIA-A01.03` (Aprobado en commit `bdf04e3`).
  - *Posterior:* La unidad `FIA-A02.02` (Componente de Registro en UI y Pestaña [Crear Cuenta]) no podrá iniciarse hasta el cierre y LOCK de esta FIA.

### 5. Contratos Afectados
- **Contrato Funcional:** Creación determinista de identidad de usuario con email normalizado único, contraseña protegida con bcrypt (coste 12) y respuesta de conflicto 409 ante emails ya registrados.
- **Contrato Físico / Module Map:** Ubicación canónica en el módulo de usuarios:
  - `src/users/entities/user.entity.ts`
  - `src/users/dto/register-user.dto.ts`
  - `src/users/dto/user-response.dto.ts`
  - `src/users/services/users.service.ts`
  - `src/users/repositories/user.repository.ts`
  - `src/users/services/users.service.test.ts`
- **Contrato de Aislamiento:** El módulo `users` es la autoridad base de identidad. No puede importar de `tasks`, `shopping`, `cleaning` ni de componentes de interfaz.

### 6. Restricciones
- Prohibido retornar `passwordHash` en DTOs de salida o respuestas HTTP bajo cualquier circunstancia.
- Factor de coste de bcrypt innegociable: exactamente `12`.
- Prohibido persistir emails sin normalización previa (trim + toLowerCase).
- Prohibida la creación de carpetas cajón de sastre (`utils/`, `shared/`, `helpers/`).

### 7. Diseño Técnico
- **Entrada / Punto de Acceso:** `src/users/services/users.service.ts`.
- **Estructura Interna:**
  - `UserEntity`: Clase o interfaz con `id: string`, `email: string`, `passwordHash: string`, `createdAt: Date`, `updatedAt: Date`.
  - `RegisterUserDto`: `{ email: string; password: string }`.
  - `UserResponseDto`: `{ id: string; email: string; createdAt: Date }`.
  - `UsersService`:
    - `createUser(dto: RegisterUserDto): Promise<UserResponseDto>`
    - `findUserByEmail(email: string): Promise<UserEntity | null>`
    - `findUserById(id: string): Promise<UserEntity | null>`
  - `UserRepository`: Interfaz y adaptador en memoria que encapsula la colección de usuarios con control de concurrencia e índices por email.
- **Manejo de Errores:** Errores tipados de dominio (ej. `UserAlreadyExistsError` con código HTTP mapeado a 409 Conflict, `InvalidEmailError` a 400 Bad Request, `WeakPasswordError` a 400 Bad Request).
- **Fronteras Físicas Autorizadas:** Directorio `src/users/*`.

### 8. Flujo Operativo
1. El servicio recibe el `RegisterUserDto` con email y contraseña en texto plano.
2. Se ejecuta la normalización y validación del email contra la expresión regular RFC 5322.
3. Se verifica que la contraseña satisfaga los requisitos mínimos (8+ caracteres, mayúscula, número y símbolo).
4. El servicio consulta al repositorio por email normalizado:
   - Si el email ya existe en el sistema, se interrumpe el flujo y se lanza una excepción de conflicto (409 Conflict).
5. Se genera el hash de la contraseña mediante bcrypt con factor de coste 12.
6. Se instancia la entidad `User` con un identificador UUID v4 generado y timestamps del sistema.
7. Se persiste la entidad en el repositorio.
8. Se devuelve el `UserResponseDto` saneado (sin datos sensibles) con estado 201 Created.

### 9. Casos Válidos (Happy Path & Escenarios Permitidos)
- **Caso 1 (Registro exitoso de nuevo usuario):**
  - *Input:* `{ email: "  Elena.Ramos@Example.COM  ", password: "Password123!" }`.
  - *Resultado:* Usuario persistido con email `"elena.ramos@example.com"`, hash bcrypt válido (prefijo `$2a$12$` o `$2b$12$`), id UUID v4 y respuesta sin `passwordHash`.
- **Caso 2 (Consulta de usuario existente por email):**
  - *Input:* Email previamente registrado.
  - *Resultado:* Retorna la entidad para validación interna de credenciales.

### 10. Casos Inválidos (Manejo de Excepciones y Rechazos)
- **Caso Inválido 1 (Email duplicado - Conflicto 409):**
  - *Input:* Registro con email que ya existe en la base de datos (incluso variando mayúsculas/espacios).
  - *Resultado:* Rechazo inmediato con error 409 Conflict y mensaje "El usuario con este correo electrónico ya existe".
- **Caso Inválido 2 (Formato de email inválido):**
  - *Input:* Email sin arroba, sin dominio o menor a 5 caracteres.
  - *Resultado:* Rechazo inmediato con error 400 Bad Request ("Formato de email no válido").
- **Caso Inválido 3 (Contraseña débil):**
  - *Input:* Contraseña con menos de 8 caracteres o sin números/símbolos.
  - *Resultado:* Rechazo con error 400 Bad Request ("La contraseña no cumple los requisitos mínimos de seguridad").

### 11. Tests Requeridos
- **Tests Unitarios de Dominio (100% Cobertura en Users):**
  - Validación de email con casos frontera (espacios, mayúsculas, formatos RFC 5322 inválidos).
  - Verificación de la política de contraseñas (longitud, caracteres requeridos).
  - Hashing con bcrypt: comprobación de que el hash generado difiere del texto plano y valida correctamente con `bcrypt.compare`.
  - Unicidad: comprobación de que intentar registrar un email dos veces arroja error de conflicto 409.
  - Contrato de DTO de salida: comprobación de que la respuesta nunca incluye `password` ni `passwordHash`.
- **Evidencia Exigida:** Suite de tests ejecutada en verde con reporte de cobertura del 100% sobre `src/users/`.

### 12. Quality Gates (QG-FIA-A02.01)
- `QG-FIA-A02.01-01 · Compilación y Tipado:` Typecheck estricto sin errores TypeScript.
- `QG-FIA-A02.01-02 · Tests Suite:` 100% tests en verde sin exclusiones.
- `QG-FIA-A02.01-03 · Cobertura Honesta (TDD 100/80/0):` 100% de cobertura en servicios y lógica de dominio de usuarios.
- `QG-FIA-A02.01-04 · Anti-Leak de Seguridad:` Inspección de tipos comprobando que `UserResponseDto` no contiene campos de contraseña.

### 13. Definition of Done (DoD)
Una FIA se considera completada y lista para LOCK si y solo si:
1. La entidad `User`, DTOs, validaciones y `UsersService` están implementados y satisfacen el objetivo indexado.
2. Los 4 Quality Gates están superados con 100% de cobertura demostrada en tests de dominio.
3. El control de colisión 409 y el hashing bcrypt (coste 12) están verificados mediante pruebas automatizadas.
4. Se emiten el `IMPLEMENTATION_REPORT_FIA-A02.01.md`, `TEST_REPORT_FIA-A02.01.md` y la propuesta formal de `LOCK-FIA-A02.01.md`.
