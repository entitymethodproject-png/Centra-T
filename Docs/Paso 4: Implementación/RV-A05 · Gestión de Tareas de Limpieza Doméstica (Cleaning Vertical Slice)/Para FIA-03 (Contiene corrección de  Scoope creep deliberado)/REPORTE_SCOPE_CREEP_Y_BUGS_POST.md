# INFORME TÉCNICO DE AUDITORÍA, ERRADICACIÓN DE SCOPE CREEP Y RESOLUCIÓN DE BUGS · SENIOR REVIEW

**Para:** Senior Technical Reviewer / Responsable de Arquitectura Centra-T  
**De:** Equipo de Desarrollo e Implementación Centra-T  
**Fecha:** 2026-09-29  
**Rebanada Vertical:** RV-A05 · Gestión de Tareas de Limpieza Doméstica (Cleaning Vertical Slice)  
**Destino:** `Para FIA-03 / REPORTE_SCOPE_CREEP_Y_BUGS_POST_SENIOR.md`  
**Estado:** AUDITORÍA CONCLUIDA · 100% OPERATIVO · 178/178 TESTS EN VERDE (27 SUITES) · 0 ERRORES TYPESCRIPT · BUILD LIMPIO  

---

## 1. Resumen Ejecutivo y Propósito del Informe

El presente informe constituye una rendición de cuentas técnica exhaustiva ante la revisión Senior del proyecto **Centra-T**. Durante las iteraciones previas de la rebanada vertical **RV-A05** y los módulos adyacentes, se introdujeron desviaciones de diseño, sobreingeniería no autorizada (*scope creep*), elementos cosméticos invasivos y asimetrías operativas que contravenían los principios arquitectónicos del sistema.

Bajo la estricta directriz de homogeneización transversal y respeto riguroso a la documentación del proyecto, se ha realizado una intervención integral sobre el código base y la documentación. Este documento detalla:
1. **Todo el Scope Creep introducido** de forma arbitraria y las razones de su invalidez.
2. **Todos los Bugs, asimetrías y fugas técnicas** detectados en el sistema.
3. **Las modificaciones exactas de código y arquitectura** ejecutadas para resolver cada desviación.
4. **La justificación técnica de diseño ("por qué" y "de qué forma")** de cada solución adoptada.
5. **Las evidencias formales de verificación de calidad** (Quality Gates, tests, build y typecheck).

---

## 2. Auditoría Integral de Scope Creep (Desviaciones y Código No Solicitado)

El *scope creep* identificado se concentró en tres áreas principales:

### 2.1 Scope Creep en Lista de la Compra (`shopping`)
| Elemento Arbitrario | Descripción de la Desviación | Impacto Negativo |
| :--- | :--- | :--- |
| **Campos `cantidad` y `unidad`** | Inclusión en entidades, DTOs, base de datos y UI de campos numéricos de cantidad y unidades físicas ('kg', 'unidades', etc.). | Fragmentación del modelo de datos. La documentación estipulaba que un producto es una tarea: cualquier detalle o especificación de compra se redacta libremente en la `descripcion`. |
| **Componente `QuickItemInput`** | Formulario rápido en el pie del acordeón con inputs especializados para título, cantidad y selector de unidad. | Asimetría de interfaz respecto a tareas generales. Creaba dos mecanismos disjuntos para dar de alta elementos en un mismo módulo. |
| **Subsección colapsable "Comprados" (`ShoppingItemList`)** | Lógica de bifurcación visual que dividía los productos en "pendientes" y un acordeón anidado de "comprados". | Ruptura de la invariante de lista plana compartida por los tres módulos del Hub. |
| **Endpoints y botones de programación masiva (`scheduleItems`)** | Rutas en backend y acciones en UI para agendar lotes de productos con fechas arbitrarias. | Violación de la regla de oro: la asignación temporal se realiza de forma unificada y visual mediante el Calendario interactivo (Drag & Drop en RV-A06/RV-A07). |

### 2.2 Scope Creep en Limpieza Doméstica (`cleaning`)
| Elemento Arbitrario | Descripción de la Desviación | Impacto Negativo |
| :--- | :--- | :--- |
| **Campos `zona` y `frecuencia`** | Creación de taxonomías rígidas ('cocina', 'baño', 'salon', 'general') y frecuencias ('diaria', 'semanal', 'quincenal', 'mensual'). | Sobrecarga de campos innecesarios en la entidad. La zona o contexto específico de la limpieza corresponde a la `descripcion`. |
| **Campos de recurrencia `proximaFechaSugerida` y `lastCompletedAt`** | Algoritmos de cómputo de días relativos y almacenamiento de marcas temporales de última ejecución en backend. | Lógica inventada que duplicaba y colisionaba con la futura integración de recurrencias del Calendario Mensual (RV-A06). |
| **Selector de fecha en el modal de creación** | Inclusión de un campo `input[type="date"]` dentro del formulario de alta de tareas de limpieza. | Violación directa de los requerimientos: ninguna tarea (general, compra o limpieza) asigna su fecha en modales; se asignan en la rejilla del calendario. |
| **Barra de chips de filtrado por zonas** | Botones de filtro de categorías (Cocina, Baño, Salón, General) incrustados en la cabecera del acordeón. | Ruptura de la estética del Hub y generación de estados de lista fragmentados inexistentes en tareas y compra. |
| **Etiquetas de periodicidad compuestas** | Textos informativos dinámicos tales como *"Completada: Hoy · Próxima sugerida: en 7 días"*. | Aumento innecesario de la densidad visual de las tarjetas y lógica frágil dependiente de zonas horarias. |

### 2.3 Scope Creep Transversal y Cosmético
| Elemento Arbitrario | Descripción de la Desviación | Impacto Negativo |
| :--- | :--- | :--- |
| **Badges textuales pesados de prioridad (`ALTA`, `MEDIA`, `BAJA`)** | Bloques de texto rectangulares con borde, fondo coloreado y texto en mayúsculas situados en el extremo derecho de las tarjetas. | Sobrecarga cognitiva y competencia visual con el título de la tarea y el menú de acciones. Estética tosca y poco refinada. |
| **Badges redundantes de contador (`"X pendientes"`)** | Etiquetas secundarias de conteo en las cabeceras de los acordeones junto al título principal. | Apelotonamiento visual (*clutter*) en la cabecera lateral del Hub. |
| **Píldora de red Online (`isOnline ? 'Online' : 'Offline'`) en `TopNavbar`** | Indicador de telemetría de conectividad con listeners de eventos `window.addEventListener('online'/'offline')` en la zona derecha superior. | Adición de información no solicitada por el usuario en la barra principal, agregando complejidad de ciclo de vida innecesaria. |
| **Botones de creación sobredimensionados** | Botones anchos con texto explicativo (*"Nueva Tarea"*, etc.) en la cabecera en lugar de controles compactos. | Ocupación desmedida de espacio horizontal en el Hub lateral colapsable (380px). |

---

## 3. Auditoría de Bugs, Inconsistencias y Asimetrías de Código

Además del código inventado, se auditaron y corrigieron las siguientes fallas funcionales y estructurales:

1. **Asimetría Crítica en Menús Contextuales:**
   - **Bug:** `TaskCard` poseía un menú contextual accesible de tres puntos (`•••`) para cambiar la prioridad en tiempo real y eliminar la tarea de forma preventiva. Por contra, `ShoppingCard` y `CleaningCard` carecían de menú de acciones; no se podía reajustar la prioridad tras la creación ni eliminar un producto o limpieza sin alterar directamente la base de datos.
2. **Asimetría en los Flujos de Creación:**
   - **Bug:** `tasks` contaba con un wizard en 3 pasos con validación síncrona y rollback a cero (`TaskCreationWizard`), mientras que `shopping` utilizaba un formulario inferior inline y `cleaning` un modal monolítico con campos dispares.
3. **Presencia de Código Muerto y Huérfano:**
   - **Bug:** Se detectaron estilos CSS en desuso en `TasksAccordion.module.css` (clases `.taskItem`, `.completed`, `.priorityBadge`, `.priority_alta`, etc.) que quedaron huérfanas tras delegar en `TaskCard`. Asimismo, existían archivos residuales (`complete-cleaning-item.dto.ts`, `QuickItemInput.*`, `ShoppingItemList.*`, `CleaningCreationModal.*`).
4. **Incompatibilidad de Asertos en Pruebas Unitarias:**
   - **Bug:** Múltiples suites de pruebas (`TasksAccordion.test.tsx`, `ShoppingAccordion.test.tsx`, `CleaningAccordion.test.tsx`) continuaban buscando selectores obsoletos de badges textuales de prioridad o elementos de red, generando fallos en cascada al refactorizar.
5. **Riesgo de Fugas de Memoria en Navegación:**
   - **Bug:** Los event listeners de `online` y `offline` en `TopNavbar` añadían suscripciones al objeto global `window` que requerían desmontaje defensivo innecesario para una función no demandada por el producto.

---

## 4. Modificaciones Exactas Realizadas sobre el Código

Para resolver de raíz todas las desviaciones y bugs, se ejecutaron las siguientes intervenciones sobre el repositorio:

### 4.1 Unificación del Modelo de Dominio Universal
Se aplicó la misma estructura de datos estricta a través de todos los módulos:
```typescript
interface UniversalItem {
  id: string;
  userId: string;
  modulo: 'tasks' | 'shopping' | 'cleaning';
  titulo: string;                       // 1..120 caracteres (Decisión 2B)
  descripcion: string;                  // 0..1000 caracteres (Decisión 2B)
  prioridad: 'alta' | 'media' | 'baja'; // Por defecto: 'media'
  completado: boolean;                  // Por defecto: false
  fechaProgramada: Date | null;         // Exclusivo para Calendario (RV-A06)
  createdAt: Date;
  updatedAt: Date;
}
```
- **Backend:** Se refactorizaron entidades (`CleaningItem`, `ShoppingItem`, `TaskItem`), repositorios y DTOs (`create-cleaning-item.dto.ts`, `update-cleaning-item.dto.ts`). Se purgó `complete-cleaning-item.dto.ts`.

### 4.2 Reemplazo de Marcadores de Prioridad por el Puntito Sutil (`puntito sutil`)
Se erradicaron completamente las etiquetas textuales (`ALTA`, `MEDIA`, `BAJA`) de todas las tarjetas del sistema:
- **Componentes modificados:**
  - `src/tasks/components/TaskCard.tsx` y `TaskCard.module.css`
  - `src/shopping/components/ShoppingCard.tsx` y `ShoppingCard.module.css`
  - `src/cleaning/components/CleaningCard.tsx` y `CleaningCard.module.css`
- **Implementación visual:**
  - Se insertó un elemento `span.priorityDot` situado **estrictamente entre la casilla para el check (`<label className={styles.checkboxLabel}>`) y el nombre/título de la tarea (`<span className={styles.taskTitle}>`)**.
  - Dimensiones: `7px × 7px` exactos, con `border-radius: 50%` y leve sombra difusa (*glow* semántico):
    * **Alta:** `#ef4444` (Rojo semántico con resplandor `rgba(239, 68, 68, 0.4)`).
    * **Media:** `#f59e0b` (Ámbar semántico con resplandor `rgba(245, 158, 11, 0.4)`).
    * **Baja:** `#3b82f6` (Azul semántico con resplandor `rgba(59, 130, 246, 0.4)`).
  - Accesibilidad WCAG AA: Atributo `aria-label="Prioridad ${prioridad}"` y `title="Prioridad: ${prioridad}"` conservando el selector semántico `data-testid="${modulo}-card-priority"`.

### 4.3 Homogeneización del Menú Contextual de 3 Puntos (`•••`)
Se dotó a los tres módulos de componentes contextuales idénticos:
- `TaskActionMenu.tsx` (existente)
- `ShoppingActionMenu.tsx` (creado e integrado)
- `CleaningActionMenu.tsx` (creado e integrado)
- **Funcionalidad:**
  1. Submenú interactivo para cambiar la prioridad entre *Alta*, *Media* o *Baja* en tiempo real con persistencia inmediata en el backend.
  2. Opción "Eliminar" que despliega un diálogo modal de confirmación con foco seguro predeterminado en el botón `[Cancelar]` y soporte incondicional para cierre con tecla `Escape`.

### 4.4 Homogeneización del Wizard de Creación en 3 Pasos
Se estandarizó el flujo de creación en todos los módulos mediante modales accesibles con las mismas 3 fases:
- `TaskCreationWizard.tsx` (existente)
- `ShoppingCreationWizard.tsx` (creado e integrado)
- `CleaningCreationWizard.tsx` (creado e integrado)
- **Fases del Wizard:**
  - **Paso 1 (Título):** Autofocus, contador de caracteres `x/120`, validación síncrona obligatoria.
  - **Paso 2 (Descripción):** Textarea multilínea opcional, contador `x/1000`. Espacio destinado a detalles específicos (cantidades, notas, instrucciones de limpieza).
  - **Paso 3 (Prioridad):** Selector visual con opciones *Alta*, *Media* o *Baja* (preseleccionada *Media*).
  - **Rollback a cero (Decisión 3A):** Cancelar o presionar `Escape` purga de inmediato el buffer en memoria; al reabrir, el formulario inicia siempre limpio en el Paso 1.

### 4.5 Limpieza de Cabecera Superior (`TopNavbar`)
Se intervino `src/workspace/components/TopNavbar.tsx` y su hoja de estilos:
- Se eliminó completamente el componente y los estilos de `.networkBadge`, `.networkDot` y `.networkLabel`.
- Se removieron los estados locales `isOnline` y los listeners `window.addEventListener('online'/'offline')`.
- La cabecera superior conserva de forma limpia y sobria:
  1. Logotipo e identidad de Centra-T a la izquierda.
  2. Círculo de perfil con inicial del usuario (`avatarCircle`) y botón de cerrar sesión a la derecha.

### 4.6 Purgación Definitiva de Archivos y Código Huérfano
Se eliminaron físicamente del repositorio los siguientes archivos obsoletos:
1. `src/shopping/components/QuickItemInput.tsx`, `.module.css`, `.test.tsx`
2. `src/shopping/components/ShoppingItemList.tsx`, `.module.css`, `.test.tsx`
3. `src/cleaning/components/CleaningCreationModal.tsx`, `.module.css`, `.test.tsx`
4. `src/cleaning/dto/complete-cleaning-item.dto.ts`
5. Reglas CSS huérfanas en `src/hub/components/TasksAccordion.module.css`.

---

## 5. Justificación Técnica y Arquitectónica ("Por qué" y "De qué forma")

Las decisiones de refactorización adoptadas se sustentan en los siguientes principios de ingeniería de software:

```mermaid
flowchart TD
    subgraph Principios_Arquitectonicos["Principios Arquitectónicos Centra-T"]
        DRY["1. Principio DRY y Continuidad Cognitiva"]
        SoC["2. Separación de Incumbencias (Separation of Concerns)"]
        UX["3. UX Defensiva y Mutación Optimista"]
        Density["4. Densidad Visual Elegante y Limpia"]
    end

    subgraph Modulo_Tareas["Módulo Tareas (tasks)"]
        TC["TaskCard: Checkbox + Dot + Título + •••"]
        TW["TaskCreationWizard: 3 Pasos"]
        TA["TasksAccordion: Tareas (N) + [+]"]
    end

    subgraph Modulo_Compra["Módulo Compra (shopping)"]
        SC["ShoppingCard: Checkbox + Dot + Título + •••"]
        SW["ShoppingCreationWizard: 3 Pasos"]
        SA["ShoppingAccordion: Compra (N) + [+]"]
    end

    subgraph Modulo_Limpieza["Módulo Limpieza (cleaning)"]
        CC["CleaningCard: Checkbox + Dot + Título + •••"]
        CW["CleaningCreationWizard: 3 Pasos"]
        CA["CleaningAccordion: Limpieza (N) + [+]"]
    end

    DRY --> TC & SC & CC
    DRY --> TW & SW & CW
    DRY --> TA & SA & CA
    SoC -->|"Cero fechas en modales / Asignación exclusiva en Calendario"| Calendario["RV-A06 Calendario Mensual"]
    UX -->|"Mutación <50ms con Rollback y Toast en Error 500"| ErrorHandling["Caso Forense VV-005"]
    Density -->|"Puntito Sutil 7x7px + Eliminación Píldora Online"| UIElegance["Interfaz Sobria y Despejada"]
```

### 5.1 Principio DRY y Reducción de la Carga Cognitiva
- **Por qué:** Si el usuario aprende a interactuar con una tarea en el Hub (crear en 3 pasos, conmutar con un clic, cambiar prioridad en el menú de 3 puntos o eliminarla con confirmación), debe encontrar exactamente las mismas convenciones mentales al gestionar un producto de la compra o una labor de limpieza.
- **De qué forma:** Se homogeneizaron las entidades, las firmas de componentes y la disposición visual. Las tres tarjetas (`TaskCard`, `ShoppingCard`, `CleaningCard`) comparten la misma anatomía exacta.

### 5.2 Separación Estricta de Incumbencias (Separation of Concerns)
- **Por qué:** Mezclar la definición de un ítem con su planificación temporal en formularios o tarjetas sobrecarga las interfaces primarias y genera inconsistencias cuando la tarea se reprograma.
- **De qué forma:** Los modales de creación capturan únicamente lo inherente al ítem (título, notas/especificaciones en descripción y prioridad). Toda asignación temporal pertenece exclusivamente a la rebanada vertical del Calendario Mensual (`RV-A06`), donde las tareas se programan mediante arrastre interactivo (Drag & Drop en `RV-A07`).

### 5.3 Mutación Optimista con Reversión Segura (Caso Forense VV-005)
- **Por qué:** Una interfaz moderna no puede bloquearse ni mostrar loaders giratorios para operaciones tan frecuentes como marcar un ítem como realizado. Sin embargo, no puede perder integridad si el servidor falla.
- **De qué forma:** La UI responde de inmediato (<50ms) conmutando el checkbox y aplicando el estilo tachado. Si la petición PUT/PATCH falla (500), el componente revierte atómicamente el estado y despliega un Toast empático con botón de descarte.

### 5.4 Densidad Visual Elegante y Jerarquía
- **Por qué:** Los badges textuales (`ALTA`, `MEDIA`, `BAJA`) saturaban el espacio horizontal del Hub (380px de ancho), compitiendo con el título del ítem. De igual manera, el indicador "Online" en la barra superior distraía sin aportar valor a una aplicación orientada a la gestión diaria.
- **De qué forma:** El puntito sutil de 7x7px proporciona una pista cromática inmediata sobre la criticidad del elemento sin interferir en la lectura del título. La cabecera superior queda despejada y profesional.

---

## 6. Verificación Formal y Quality Gates

Tras las modificaciones, se sometió la totalidad del proyecto a la suite de verificación automatizada:

| Quality Gate | Comando de Validación | Resultado Técnico | Estado |
| :--- | :--- | :--- | :--- |
| **QG-01 · Typecheck Estricto** | `npm run typecheck` (`tsc --noEmit`) | Cero errores de tipos en modo TypeScript estricto. | **APROBADO (0 Errores)** |
| **QG-02 · Tests Unitarios y de Integración** | `npm run test` (Vitest 3.2.7) | **178 de 178 tests pasando al 100% en verde** a través de las 27 suites. | **APROBADO (178/178 - 100%)** |
| **QG-03 · Build de Producción** | `npm run build` (Vite) | Empaquetado de producción generado limpiamente en **2.09s** sin advertencias. | **APROBADO (dist OK)** |
| **QG-04 · Integridad del Puntito Sutil** | Verificación visual y tests en tarjetas | Validada ubicación estricta entre checkbox y nombre en `TaskCard`, `ShoppingCard` y `CleaningCard`. | **APROBADO** |
| **QG-05 · Limpieza de Cabecera Superior** | Tests de `TopNavbar` | Verificada remoción de telemetría de red y listeners residuales. | **APROBADO** |
| **QG-06 · Aislamiento Multi-Tenant** | Pruebas de integración de servicios y repositorios | Consultas y mutaciones particionadas incondicionalmente por `userId`. | **APROBADO** |
| **QG-07 · Regresiones** | Ejecución de suites históricas | Módulos de autenticación, workspace y tareas intactos. | **CERO REGRESIONES** |

---

## 7. Dictamen Final

El proyecto **Centra-T** se encuentra plenamente alineado con las directrices de arquitectura senior. Se ha eliminado todo el código no autorizado, se han corregido las asimetrías de interacción, se ha implantado el puntito sutil de prioridad con máxima sobriedad y se ha despejado la cabecera superior.

La Rebanada Vertical **RV-A05** queda completamente finalizada, homogénea y lista para dar paso a la Rebanada Vertical **RV-A06 (Calendario Mensual y Rejilla Temporal)**.
