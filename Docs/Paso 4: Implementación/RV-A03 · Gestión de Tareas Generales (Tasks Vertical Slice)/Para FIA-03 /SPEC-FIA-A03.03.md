# SPEC-FIA-A03.03 · MODAL WIZARD DE CREACIÓN EN 3 PASOS (VV-004)

**Proyecto:** Centra-T (Gestor Doméstico Integral y Planificador Temporal)  
**Rebanada Vertical:** RV-A03 · Gestión de Tareas Generales (Tasks Vertical Slice)  
**Modo:** SPEC EJECUTABLE  
**FIA Fuente:** FIA-A03.03 · Modal Wizard de Creación en 3 Pasos (VV-004)  
**PVF de Cierre:**  
- PVF-A03.02 · Wizard de Creación en 3 Pasos y Fronteras Tipográficas  
- PVF-A03.03 · Cancelación del Wizard con Rollback Total a Cero (VV-004)  
**VF:**  
- VF-A03.02 · Alta de Tarea mediante Wizard y Límites Tipográficos  
- VF-A03.03 · Rollback Total a Cero en Cancelación de Wizard (VV-004)  
**Estado de Entrada:** FIA aprobada · Pendiente de implementación y LOCK  
**LOCK Previo Requerido:** LOCK-FIA-A03.02.md APROBADO (Commit: `f9df22d`)  
**Regla de Continuidad:** NO LOCK → NO NEXT  

---

## 1. Identificación
Compilar la especificación técnica ejecutable para materializar el componente modal interactivo `TaskCreationWizard` en `src/tasks/components/TaskCreationWizard.tsx` (con sus estilos encapsulados en `TaskCreationWizard.module.css` y tests exhaustivos en `TaskCreationWizard.test.tsx`), e integrarlo en `src/hub/components/TasksAccordion.tsx` para Antigravity CLI. Esta unidad abarca el asistente guiado de creación en 3 pasos (Paso 1: Nombre/Título 1..120 caracteres; Paso 2: Descripción 0..1000 caracteres; Paso 3: Selector de Prioridad y Guardado), el blindaje incondicional del **Caso Forense VV-004 & Decisión 3A (Rollback Total a Cero)** al cancelar o presionar `ESC`, y la inserción reactiva inmediata en la cabecera de la lista de tareas del Hub con actualización de contadores.

## 2. Objetivo
Construir y certificar mediante TDD con `@testing-library/react` y Vitest:
1. Componente `TaskCreationWizard` en `src/tasks/components/TaskCreationWizard.tsx` con soporte para diálogo modal accesible (`role="dialog"`, `aria-modal="true"`, `aria-labelledby="wizard-title"`).
2. Flujo secuencial guiado en 3 pasos:
   - **Paso 1 (Nombre):** Input de texto con `autoFocus`, límite rígido de 120 caracteres (Decisión 2B), contador en tiempo real (`${titulo.length}/120`), bloqueo con error inline (*"El nombre no puede estar en blanco"*) y botones `[Siguiente]` y `[Cancelar]`.
   - **Paso 2 (Descripción):** Textarea multilínea, límite rígido de 1000 caracteres (Decisión 2B), contador (`${descripcion.length}/1000`), botón `[Atrás]` (que retrocede al Paso 1 conservando intacto el título), botón `[Siguiente]` y botón `[Cancelar]`.
   - **Paso 3 (Prioridad y Guardado):** Tarjetas selectoras de prioridad (`Alta` en rojo, `Media` en ámbar por defecto, `Baja` en azul), botón `[Atrás]` (retrocede a Paso 2 conservando la descripción), botón `[Guardar]` / `[Crear Tarea]` y botón `[Cancelar]`.
3. **Caso Forense VV-004 & Decisión 3A:** Pulsar `[Cancelar]`, el botón `(✕)` o la tecla `ESC` en **cualquier paso** destruye inmediatamente todo el buffer temporal en memoria (`Rollback total a cero`). Al volver a abrir, el modal nace obligatoriamente en **Paso 1**, con campos **100% vacíos**.
4. Persistencia y ciclo de vida: Al pulsar `[Guardar]`, el wizard muestra estado de carga (`Guardando...`), invoca `tasksService.createTask(userId, payload)`. Al resolverse exitosamente (201 Created), purga su estado, cierra el modal e invoca `onTaskCreated(newTask)`, actualizando la lista de `TasksAccordion` y su contador `Tareas (N)`.
5. 100% de los tests del proyecto en verde (mínimo 87-90 tests globales pasando en Vitest).

## 3. Estado Actual del Repositorio
*(Basado estrictamente en `FIA-A03.02_AS_BUILT.md`, `repo_state.json` y el árbol físico de `Centra-T`)*
- **Archivos Existentes:**
  - Capa de Dominio Tasks: `src/tasks/entities/task-item.entity.ts`, DTOs, `src/tasks/repositories/task.repository.ts`, `src/tasks/services/tasks.service.ts`, `src/tasks/controllers/tasks.controller.ts` (12 tests de dominio y API REST).
  - Capa de Hub & UI: `src/hub/components/TasksAccordion.*`, `src/hub/components/HubContainer.*` (11 tests verificando matriz EV-LIST-01..05 y contenedor).
  - Capa de Autenticación & Raíz: `src/authentication/*`, `src/users/*`, `src/workspace/*`, `src/App.*` (54 tests, incluyendo usuario demo out-of-the-box).
- **Estado de Tests Actual:** 77/77 tests pasando en verde a través de 12 archivos de pruebas.
- **Riesgos Iniciales:** El modal no debe interferir con la navegación de fondo ni fugar el foco del teclado; al cerrarse por cualquier medio cancelatorio, la memoria no debe retener cadenas de texto parciales.

## 4. Estado Objetivo
El repositorio debe contar con `TaskCreationWizard.tsx`, `TaskCreationWizard.module.css` y `TaskCreationWizard.test.tsx` en `src/tasks/components/`, conectado de forma transparente a `TasksAccordion.tsx` en `src/hub/components/`.
- **Restricciones negativas explícitas:**
  - Prohibido conservar borradores o reabrir el formulario en estados previos tras pulsar Cancelar o presionar ESC (violación grave del Caso Forense VV-004 y Decisión 3A).
  - Prohibido permitir la creación de tareas sin título o que superen los 120 caracteres (violación de Decisión 2B).
  - Prohibido degradar cualquiera de los 77 tests existentes.

## 5. Contratos Afectados
- **5.1 Contrato de Interfaz (`TaskCreationWizardProps`):**
  ```typescript
  export interface TaskCreationWizardProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    tasksService?: TasksService;
    onTaskCreated?: (task: TaskItem) => void;
  }
  ```
- **5.2 Contrato de Actualización de `TasksAccordionProps`:**
  ```typescript
  export interface TasksAccordionProps {
    tasks?: TaskItem[];
    tasksService?: TasksService;
    userId?: string;
    initialExpanded?: boolean;
    isLoading?: boolean;
    error?: string | null;
    onToggleExpand?: (expanded: boolean) => void;
    onCreateTaskClick?: () => void;
    onTaskCreated?: (task: TaskItem) => void;
    onTaskToggle?: (taskId: string) => void;
    onRetry?: () => void;
  }
  ```
- **5.3 Contrato Físico / Module Map:** Directorio `src/tasks/components/*` e integración en `src/hub/components/*`.
- **5.4 Contrato de Accesibilidad:** `role="dialog"`, `aria-modal="true"`, `aria-labelledby="wizard-title"`, `aria-invalid`, `aria-live="polite"` para contadores, y captura de `Escape`.

## 6. Archivos Afectados (Clasificación Física Obligatoria)

### 6.1 Crear (Archivos nuevos a materializar)
- `src/tasks/components/TaskCreationWizard.tsx`: Componente React del modal wizard en 3 pasos con soporte de rollback total.
- `src/tasks/components/TaskCreationWizard.module.css`: Estilos oscuros Centra-T (overlay difuminado, tarjeta modal, tarjetas de prioridad y barra de pasos).
- `src/tasks/components/TaskCreationWizard.test.tsx`: Batería exhaustiva de tests TDD (10 pruebas unitarias y de integración, incluyendo Caso Forense VV-004).

### 6.2 Modificar (Archivos existentes del repo a alterar)
- `src/hub/components/TasksAccordion.tsx`: Integrar `TaskCreationWizard` para que los botones `[+ Nueva]` y `[+ Crear Tarea]` abran el modal y la creación inserte la tarea reactivamente en la cabecera.

### 6.3 Preservar (Archivos existentes que NO deben romperse)
- `src/tasks/entities/task-item.entity.ts`, `src/tasks/services/tasks.service.ts` y controladores (12 tests previos intactos).
- `src/hub/components/TasksAccordion.test.tsx` (7 tests de matriz EV-LIST intactos).
- `src/hub/components/HubContainer.*`, `src/workspace/*`, `src/authentication/*`, `src/users/*`, `src/App.*` (58 tests intactos).

### 6.4 Prohibido Tocar (Fronteras infranqueables de esta FIA)
- `src/shopping/*`, `src/cleaning/*` (pertenecen a rebanadas posteriores).
- Archivos de configuración raíz no relacionados (`vite.config.ts`, `tsconfig.json`).

## 7. Dependencias
- **Documentales:** `SUITE_ARQUITECTURA_CORE.docx` (Decisión 2B y Decisión 3A), `07_CENTRA_T_UI_SPECS_FEATURES.docx` (Feature 04), `Centra-T Pseudocódigo (unificado).odt` (Proceso 4.1), `CENTRA-T_INDICE_PVF_VF.docx`, `CENTRA-T_INDICE_RV_FIA.docx`, `FIA-A03.02_AS_BUILT.md`.
- **Tecnológicas Autorizadas:** React 19, TypeScript 5.x, CSS Modules, Vitest, `@testing-library/react`, `@testing-library/user-event`.
- **Dependencia Secuencial:** Requiere LOCK de `FIA-A03.02`. Desbloquea `FIA-A03.04`.

## 8. Restricciones
- El modal debe iniciar obligatoriamente en el **Paso 1** con el cursor en el input de título (`autoFocus`).
- Si el usuario pulsa `[Cancelar]`, `ESC` o `(✕)`, el buffer temporal en memoria se destruye de inmediato (**Rollback total a cero**).
- No se permiten títulos vacíos ni títulos que excedan 120 caracteres tras `.trim()`.
- La descripción es opcional con un límite máximo estricto de 1000 caracteres.
- La prioridad por defecto es `'media'`.

## 9. Plan de Implementación (Secuencia en 8 Pasos Ejecutables TDD)
- **Paso 1 — Preparar Tests:** Escribir en `src/tasks/components/TaskCreationWizard.test.tsx` los 10 tests unitarios y de integración:
  1. Renderizado en Paso 1 con autofocus y contador `0/120`.
  2. Bloqueo con alerta inline ante título vacío al pulsar Siguiente.
  3. Límite estricto de 120 caracteres en título (Decisión 2B).
  4. Navegación fluida a Paso 2 y preservación del título al retroceder con `[Atrás]`.
  5. Textarea de descripción con límite de 1000 caracteres y contador visual.
  6. Selector de prioridad en Paso 3 (Alta, Media, Baja; por defecto 'media').
  7. Persistencia exitosa con `tasksService.createTask`, invocación de callbacks y cierre.
  8. Alerta accesible ante fallo del servicio sin perder el estado del Paso 3.
  9. **Caso Forense VV-004 & Decisión 3A:** Escribir en Paso 1 y Paso 2, pulsar `[Cancelar]`, reabrir el modal y comprobar que nace en Paso 1 con todos los campos 100% limpios.
  10. Cancelación y purga total al presionar la tecla `Escape`.
  Verificar que los tests fallan (`RED`).
- **Paso 2 — Validar Estado Actual:** Comprobar que los fallos corresponden a la ausencia del componente `TaskCreationWizard`.
- **Paso 3 — Implementar Mínimo:** Crear `TaskCreationWizard.tsx` y `TaskCreationWizard.module.css` satisfaciendo todos los requerimientos funcionales y de accesibilidad (`GREEN`).
- **Paso 4 — Integrar con TasksAccordion:** Conectar la apertura del wizard y la inserción reactiva de tareas en `src/hub/components/TasksAccordion.tsx`.
- **Paso 5 — Ejecutar Tests:** Correr `npm run test` asegurando que pasan los 77 tests previos más los 10 nuevos tests (mínimo 87 tests totales en verde).
- **Paso 6 — Ejecutar Quality Gates:** Ejecutar `npm run typecheck` y `npm run lint`.
- **Paso 7 — Estado Documental:** Preparar deltas en los 3 JSONs de estado en la raíz del proyecto.
- **Paso 8 — Generar Reportes y Detener:** Emitir `IMPLEMENTATION_REPORT_FIA-A03.03.md`, `TEST_REPORT_FIA-A03.03.md`, redactar la propuesta formal de `LOCK-FIA-A03.03.md` y detener la sesión (**STOP**).

## 10. Cambios Requeridos

### 10.1 Estructura canónica de `src/tasks/components/TaskCreationWizard.tsx`:
```tsx
import React, { useState, useEffect, useRef } from 'react';
import styles from './TaskCreationWizard.module.css';
import { TaskItem, TaskPriority, TASK_LIMITS } from '../entities/task-item.entity';
import { TasksService } from '../services/tasks.service';

export interface TaskCreationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  tasksService?: TasksService;
  onTaskCreated?: (task: TaskItem) => void;
}

export const TaskCreationWizard: React.FC<TaskCreationWizardProps> = ({
  isOpen,
  onClose,
  userId,
  tasksService,
  onTaskCreated,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [prioridad, setPrioridad] = useState<TaskPriority>('media');
  const [titleError, setTitleError] = useState<string | null>(null);
  const [descError, setDescError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const titleInputRef = useRef<HTMLInputElement>(null);

  // Decisión 3A / Caso Forense VV-004: Purga absoluta de estado en memoria
  const resetWizardState = () => {
    setStep(1);
    setTitulo('');
    setDescripcion('');
    setPrioridad('media');
    setTitleError(null);
    setDescError(null);
    setIsLoading(false);
    setSubmitError(null);
  };

  // Al abrir o cerrar externamente, purgar si se cierra
  useEffect(() => {
    if (!isOpen) {
      resetWizardState();
    } else {
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Decisión 3A / Caso Forense VV-004: Captura de tecla ESC para rollback total
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        handleCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading]);

  if (!isOpen) return null;

  const handleCancel = () => {
    resetWizardState();
    onClose();
  };

  const handleNextFromStep1 = () => {
    const trimmed = titulo.trim();
    if (!trimmed) {
      setTitleError('El nombre no puede estar en blanco');
      return;
    }
    if (trimmed.length > TASK_LIMITS.MAX_TITLE_LENGTH) {
      setTitleError(`El título no puede superar los ${TASK_LIMITS.MAX_TITLE_LENGTH} caracteres`);
      return;
    }
    setTitleError(null);
    setStep(2);
  };

  const handleNextFromStep2 = () => {
    if (descripcion.length > TASK_LIMITS.MAX_DESCRIPTION_LENGTH) {
      setDescError(`La descripción no puede superar los ${TASK_LIMITS.MAX_DESCRIPTION_LENGTH} caracteres`);
      return;
    }
    setDescError(null);
    setStep(3);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setSubmitError(null);

    try {
      const service = tasksService || new TasksService();
      const createdTask = await service.createTask(userId, {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        prioridad,
      });

      resetWizardState();
      if (onTaskCreated) {
        onTaskCreated(createdTask);
      }
      onClose();
    } catch (err: any) {
      setIsLoading(false);
      setSubmitError(err?.message || 'Error al guardar el elemento en el servidor');
    }
  };

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="wizard-title"
      data-testid="task-creation-wizard-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          handleCancel();
        }
      }}
    >
      <div className={styles.modalCard} data-testid="task-creation-wizard-card">
        {/* Cabecera del Wizard */}
        <div className={styles.modalHeader}>
          <div className={styles.headerInfo}>
            <span className={styles.stepBadge}>Paso {step} de 3</span>
            <h2 id="wizard-title" className={styles.modalTitle}>
              {step === 1 && 'Nueva Tarea: Título'}
              {step === 2 && 'Nueva Tarea: Descripción'}
              {step === 3 && 'Nueva Tarea: Prioridad'}
            </h2>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={handleCancel}
            disabled={isLoading}
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Barra de progreso visual */}
        <div className={styles.progressBar}>
          <div
            className={`${styles.progressStep} ${step >= 1 ? styles.activeStep : ''}`}
            data-testid="progress-step-1"
          />
          <div
            className={`${styles.progressStep} ${step >= 2 ? styles.activeStep : ''}`}
            data-testid="progress-step-2"
          />
          <div
            className={`${styles.progressStep} ${step >= 3 ? styles.activeStep : ''}`}
            data-testid="progress-step-3"
          />
        </div>

        {/* Contenido dinámico del Paso */}
        <div className={styles.stepContent}>
          {/* PASO 1: Título */}
          {step === 1 && (
            <div className={styles.stepContainer} data-testid="wizard-step-1">
              <label htmlFor="task-title-input" className={styles.label}>
                Título o Nombre de la Tarea <span className={styles.requiredMark}>*</span>
              </label>
              <input
                ref={titleInputRef}
                id="task-title-input"
                type="text"
                autoFocus
                disabled={isLoading}
                maxLength={TASK_LIMITS.MAX_TITLE_LENGTH}
                value={titulo}
                onChange={(e) => {
                  setTitulo(e.target.value);
                  if (titleError) setTitleError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleNextFromStep1();
                  }
                }}
                placeholder="Ej. Revisar caldera y ajustar presión..."
                className={`${styles.input} ${titleError ? styles.inputError : ''}`}
                aria-invalid={!!titleError}
                aria-describedby={titleError ? 'title-error' : 'title-counter'}
              />
              <div className={styles.fieldMeta}>
                {titleError ? (
                  <span id="title-error" role="alert" className={styles.errorMessage}>
                    {titleError}
                  </span>
                ) : (
                  <span className={styles.fieldHint}>Escribe un nombre conciso (1..120 caracteres)</span>
                )}
                <span
                  id="title-counter"
                  className={styles.charCounter}
                  aria-live="polite"
                >
                  {titulo.length}/{TASK_LIMITS.MAX_TITLE_LENGTH}
                </span>
              </div>
            </div>
          )}

          {/* PASO 2: Descripción */}
          {step === 2 && (
            <div className={styles.stepContainer} data-testid="wizard-step-2">
              <label htmlFor="task-desc-input" className={styles.label}>
                Descripción detallada <span className={styles.optionalMark}>(Opcional)</span>
              </label>
              <textarea
                id="task-desc-input"
                rows={4}
                autoFocus
                disabled={isLoading}
                maxLength={TASK_LIMITS.MAX_DESCRIPTION_LENGTH}
                value={descripcion}
                onChange={(e) => {
                  setDescripcion(e.target.value);
                  if (descError) setDescError(null);
                }}
                placeholder="Añade notas, pasos o detalles relevantes (admite saltos de línea)..."
                className={`${styles.textarea} ${descError ? styles.inputError : ''}`}
                aria-invalid={!!descError}
                aria-describedby={descError ? 'desc-error' : 'desc-counter'}
              />
              <div className={styles.fieldMeta}>
                {descError ? (
                  <span id="desc-error" role="alert" className={styles.errorMessage}>
                    {descError}
                  </span>
                ) : (
                  <span className={styles.fieldHint}>Admite saltos de línea e instrucciones</span>
                )}
                <span
                  id="desc-counter"
                  className={styles.charCounter}
                  aria-live="polite"
                >
                  {descripcion.length}/{TASK_LIMITS.MAX_DESCRIPTION_LENGTH}
                </span>
              </div>
            </div>
          )}

          {/* PASO 3: Prioridad */}
          {step === 3 && (
            <div className={styles.stepContainer} data-testid="wizard-step-3">
              <label className={styles.label}>Nivel de Prioridad</label>
              <div className={styles.priorityGrid} role="radiogroup" aria-label="Selecciona la prioridad">
                <button
                  type="button"
                  role="radio"
                  aria-checked={prioridad === 'alta'}
                  className={`${styles.priorityOption} ${styles.priorityAlta} ${
                    prioridad === 'alta' ? styles.prioritySelected : ''
                  }`}
                  onClick={() => setPrioridad('alta')}
                  disabled={isLoading}
                >
                  <span className={styles.priorityIndicator} />
                  <div className={styles.priorityDetails}>
                    <span className={styles.priorityName}>Alta</span>
                    <span className={styles.priorityDesc}>Urgente o prioritaria</span>
                  </div>
                </button>

                <button
                  type="button"
                  role="radio"
                  aria-checked={prioridad === 'media'}
                  className={`${styles.priorityOption} ${styles.priorityMedia} ${
                    prioridad === 'media' ? styles.prioritySelected : ''
                  }`}
                  onClick={() => setPrioridad('media')}
                  disabled={isLoading}
                >
                  <span className={styles.priorityIndicator} />
                  <div className={styles.priorityDetails}>
                    <span className={styles.priorityName}>Media</span>
                    <span className={styles.priorityDesc}>Importante en la semana</span>
                  </div>
                </button>

                <button
                  type="button"
                  role="radio"
                  aria-checked={prioridad === 'baja'}
                  className={`${styles.priorityOption} ${styles.priorityBaja} ${
                    prioridad === 'baja' ? styles.prioritySelected : ''
                  }`}
                  onClick={() => setPrioridad('baja')}
                  disabled={isLoading}
                >
                  <span className={styles.priorityIndicator} />
                  <div className={styles.priorityDetails}>
                    <span className={styles.priorityName}>Baja</span>
                    <span className={styles.priorityDesc}>Rutinaria o postergable</span>
                  </div>
                </button>
              </div>

              {submitError && (
                <div role="alert" className={styles.submitErrorAlert}>
                  {submitError}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className={styles.modalFooter}>
          <div className={styles.leftActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancelar
            </button>
          </div>

          <div className={styles.rightActions}>
            {step > 1 && (
              <button
                type="button"
                className={styles.backButton}
                onClick={() => setStep((prev) => (prev === 3 ? 2 : 1))}
                disabled={isLoading}
              >
                Atrás
              </button>
            )}

            {step === 1 && (
              <button
                type="button"
                className={styles.nextButton}
                onClick={handleNextFromStep1}
                disabled={isLoading}
              >
                Siguiente
              </button>
            )}

            {step === 2 && (
              <button
                type="button"
                className={styles.nextButton}
                onClick={handleNextFromStep2}
                disabled={isLoading}
              >
                Siguiente
              </button>
            )}

            {step === 3 && (
              <button
                type="button"
                className={styles.submitButton}
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? 'Guardando...' : 'Guardar Tarea'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
```

### 10.2 Estilos encapsulados de `src/tasks/components/TaskCreationWizard.module.css`:
```css
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
  animation: fadeIn 0.15s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modalCard {
  background: #131b26;
  border: 1px solid #233144;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from {
    transform: translateY(12px) scale(0.98);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.modalHeader {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #233144;
}

.headerInfo {
  display: flex;
  flex-direction: column;
}

.stepBadge {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: #3b82f6;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.modalTitle {
  font-size: 18px;
  font-weight: 600;
  color: #f8fafc;
  margin: 0;
}

.closeButton {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  line-height: 1;
  transition: color 0.15s, background 0.15s;
}

.closeButton:hover:not(:disabled) {
  color: #f8fafc;
  background: rgba(255, 255, 255, 0.05);
}

.closeButton:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.progressBar {
  display: flex;
  gap: 6px;
  padding: 12px 24px 0;
}

.progressStep {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: #1e293b;
  transition: background 0.3s ease;
}

.activeStep {
  background: #3b82f6;
}

.stepContent {
  padding: 24px;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stepContainer {
  display: flex;
  flex-direction: column;
}

.label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #cbd5e1;
  margin-bottom: 8px;
}

.requiredMark {
  color: #ef4444;
}

.optionalMark {
  color: #64748b;
  font-weight: 400;
  font-size: 12px;
}

.input,
.textarea {
  width: 100%;
  background: #0b0f17;
  border: 1px solid #233144;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 14px;
  color: #f8fafc;
  font-family: inherit;
  transition: border-color 0.15s, box-shadow 0.15s;
  box-sizing: border-box;
}

.input:focus,
.textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.input:disabled,
.textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.inputError {
  border-color: #ef4444 !important;
}

.inputError:focus {
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2) !important;
}

.textarea {
  resize: vertical;
  min-height: 85px;
}

.fieldMeta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
  font-size: 12px;
}

.errorMessage {
  color: #ef4444;
}

.fieldHint {
  color: #64748b;
}

.charCounter {
  color: #64748b;
  font-family: monospace;
}

.priorityGrid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 8px;
}

.priorityOption {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  background: #0b0f17;
  border: 1px solid #233144;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
  width: 100%;
  box-sizing: border-box;
}

.priorityOption:hover:not(:disabled) {
  border-color: #334155;
  background: #111827;
}

.priorityOption:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.priorityIndicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.priorityAlta .priorityIndicator {
  background: #ef4444;
}

.priorityMedia .priorityIndicator {
  background: #f59e0b;
}

.priorityBaja .priorityIndicator {
  background: #3b82f6;
}

.priorityDetails {
  display: flex;
  flex-direction: column;
}

.priorityName {
  font-size: 14px;
  font-weight: 600;
  color: #f8fafc;
}

.priorityDesc {
  font-size: 12px;
  color: #94a3b8;
}

.priorityAlta.prioritySelected {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.priorityMedia.prioritySelected {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
}

.priorityBaja.prioritySelected {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
}

.submitErrorAlert {
  margin-top: 12px;
  padding: 10px 14px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 6px;
  color: #ef4444;
  font-size: 13px;
}

.modalFooter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-top: 1px solid #233144;
  background: rgba(11, 15, 23, 0.5);
}

.leftActions,
.rightActions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.cancelButton,
.backButton,
.nextButton,
.submitButton {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.cancelButton {
  background: transparent;
  border: 1px solid #233144;
  color: #94a3b8;
}

.cancelButton:hover:not(:disabled) {
  border-color: #334155;
  color: #f8fafc;
}

.backButton {
  background: #1e293b;
  border: 1px solid #334155;
  color: #e2e8f0;
}

.backButton:hover:not(:disabled) {
  background: #334155;
  color: #ffffff;
}

.nextButton {
  background: #3b82f6;
  border: 1px solid #2563eb;
  color: #ffffff;
}

.nextButton:hover:not(:disabled) {
  background: #2563eb;
}

.submitButton {
  background: #10b981;
  border: 1px solid #059669;
  color: #ffffff;
}

.submitButton:hover:not(:disabled) {
  background: #059669;
}

.cancelButton:disabled,
.backButton:disabled,
.nextButton:disabled,
.submitButton:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### 10.3 Batería exhaustiva de tests en `src/tasks/components/TaskCreationWizard.test.tsx`:
```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskCreationWizard } from './TaskCreationWizard';
import { TasksService } from '../services/tasks.service';
import { InMemoryTaskRepository } from '../repositories/task.repository';

describe('TaskCreationWizard Component (Wizard 3 Pasos & Caso Forense VV-004)', () => {
  let mockRepository: InMemoryTaskRepository;
  let tasksService: TasksService;
  const mockUserId = 'usr-demo-test-01';

  beforeEach(() => {
    mockRepository = new InMemoryTaskRepository();
    tasksService = new TasksService(mockRepository);
  });

  it('debe renderizar el modal en el Paso 1 con autofocus y contador de caracteres (0/120)', () => {
    const handleClose = vi.fn();
    render(
      <TaskCreationWizard
        isOpen={true}
        onClose={handleClose}
        userId={mockUserId}
        tasksService={tasksService}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/paso 1 de 3/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /nueva tarea: título/i })).toBeInTheDocument();

    const titleInput = screen.getByRole('textbox', { name: /título o nombre de la tarea/i });
    expect(titleInput).toBeInTheDocument();
    expect(screen.getByText('0/120')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /siguiente/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
  });

  it('debe bloquear el avance a Paso 2 y mostrar error si el título está vacío o solo contiene espacios', async () => {
    const user = userEvent.setup();
    render(
      <TaskCreationWizard
        isOpen={true}
        onClose={vi.fn()}
        userId={mockUserId}
        tasksService={tasksService}
      />
    );

    const nextButton = screen.getByRole('button', { name: /siguiente/i });
    await user.click(nextButton);

    expect(screen.getByRole('alert')).toHaveTextContent(/el nombre no puede estar en blanco/i);
    expect(screen.getByText(/paso 1 de 3/i)).toBeInTheDocument();

    // Probar con espacios en blanco
    const titleInput = screen.getByRole('textbox', { name: /título o nombre de la tarea/i });
    await user.type(titleInput, '    ');
    await user.click(nextButton);

    expect(screen.getByRole('alert')).toHaveTextContent(/el nombre no puede estar en blanco/i);
    expect(screen.getByText(/paso 1 de 3/i)).toBeInTheDocument();
  });

  it('debe respetar el límite de 120 caracteres en el título (Decisión 2B)', async () => {
    const user = userEvent.setup();
    render(
      <TaskCreationWizard
        isOpen={true}
        onClose={vi.fn()}
        userId={mockUserId}
        tasksService={tasksService}
      />
    );

    const titleInput = screen.getByRole('textbox', { name: /título o nombre de la tarea/i });
    const longTitle = 'A'.repeat(150);
    await user.type(titleInput, longTitle);

    expect(titleInput).toHaveValue('A'.repeat(120));
    expect(screen.getByText('120/120')).toBeInTheDocument();
  });

  it('debe navegar al Paso 2 y permitir retroceder al Paso 1 conservando el buffer con el botón Atrás', async () => {
    const user = userEvent.setup();
    render(
      <TaskCreationWizard
        isOpen={true}
        onClose={vi.fn()}
        userId={mockUserId}
        tasksService={tasksService}
      />
    );

    const titleInput = screen.getByRole('textbox', { name: /título o nombre de la tarea/i });
    await user.type(titleInput, 'Comprar filtro de agua');

    const nextButton = screen.getByRole('button', { name: /siguiente/i });
    await user.click(nextButton);

    // En Paso 2
    expect(screen.getByText(/paso 2 de 3/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /nueva tarea: descripción/i })).toBeInTheDocument();

    // Retroceder a Paso 1
    const backButton = screen.getByRole('button', { name: /atrás/i });
    await user.click(backButton);

    expect(screen.getByText(/paso 1 de 3/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /título o nombre de la tarea/i })).toHaveValue(
      'Comprar filtro de agua'
    );
  });

  it('debe permitir añadir descripción en Paso 2 y respetar el límite de 1000 caracteres (Decisión 2B)', async () => {
    const user = userEvent.setup();
    render(
      <TaskCreationWizard
        isOpen={true}
        onClose={vi.fn()}
        userId={mockUserId}
        tasksService={tasksService}
      />
    );

    await user.type(
      screen.getByRole('textbox', { name: /título o nombre de la tarea/i }),
      'Revisar radiadores'
    );
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    const descTextarea = screen.getByRole('textbox', { name: /descripción detallada/i });
    expect(screen.getByText('0/1000')).toBeInTheDocument();

    const descText = 'Purgar el aire de los radiadores de las habitaciones.';
    await user.type(descTextarea, descText);

    expect(descTextarea).toHaveValue(descText);
    expect(screen.getByText(`${descText.length}/1000`)).toBeInTheDocument();
  });

  it('debe avanzar al Paso 3, permitir seleccionar la prioridad y mantener "media" por defecto', async () => {
    const user = userEvent.setup();
    render(
      <TaskCreationWizard
        isOpen={true}
        onClose={vi.fn()}
        userId={mockUserId}
        tasksService={tasksService}
      />
    );

    await user.type(
      screen.getByRole('textbox', { name: /título o nombre de la tarea/i }),
      'Pintar valla'
    );
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    // En Paso 3
    expect(screen.getByText(/paso 3 de 3/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /nueva tarea: prioridad/i })).toBeInTheDocument();

    const mediaRadio = screen.getByRole('radio', { name: /media/i });
    const altaRadio = screen.getByRole('radio', { name: /alta/i });

    expect(mediaRadio).toHaveAttribute('aria-checked', 'true');
    expect(altaRadio).toHaveAttribute('aria-checked', 'false');

    await user.click(altaRadio);
    expect(altaRadio).toHaveAttribute('aria-checked', 'true');
    expect(mediaRadio).toHaveAttribute('aria-checked', 'false');
  });

  it('debe persistir exitosamente la tarea al pulsar Guardar e invocar onTaskCreated y onClose', async () => {
    const user = userEvent.setup();
    const handleCreated = vi.fn();
    const handleClose = vi.fn();

    render(
      <TaskCreationWizard
        isOpen={true}
        onClose={handleClose}
        userId={mockUserId}
        tasksService={tasksService}
        onTaskCreated={handleCreated}
      />
    );

    await user.type(
      screen.getByRole('textbox', { name: /título o nombre de la tarea/i }),
      'Instalar termostato'
    );
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    await user.type(
      screen.getByRole('textbox', { name: /descripción detallada/i }),
      'Modelo inteligente Wi-Fi'
    );
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    const saveButton = screen.getByRole('button', { name: /guardar tarea/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(handleCreated).toHaveBeenCalledTimes(1);
    });

    const createdTask = handleCreated.mock.calls[0][0];
    expect(createdTask.titulo).toBe('Instalar termostato');
    expect(createdTask.descripcion).toBe('Modelo inteligente Wi-Fi');
    expect(createdTask.prioridad).toBe('media');
    expect(createdTask.userId).toBe(mockUserId);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('debe mostrar alerta de error si el servicio de tareas falla durante la persistencia y permitir reintentar', async () => {
    const user = userEvent.setup();
    const brokenService = {
      createTask: vi.fn().mockRejectedValue(new Error('Fallo crítico en servidor de base de datos')),
    } as unknown as TasksService;

    render(
      <TaskCreationWizard
        isOpen={true}
        onClose={vi.fn()}
        userId={mockUserId}
        tasksService={brokenService}
      />
    );

    await user.type(
      screen.getByRole('textbox', { name: /título o nombre de la tarea/i }),
      'Tarea problemática'
    );
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    await user.click(screen.getByRole('button', { name: /guardar tarea/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/fallo crítico en servidor/i);
    });

    expect(screen.getByText(/paso 3 de 3/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /guardar tarea/i })).not.toBeDisabled();
  });

  it('CASO FORENSE VV-004 & DECISIÓN 3A: pulsar [Cancelar] en Paso 2 o 3 destruye el buffer en memoria y al reabrir nace 100% limpio en Paso 1', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    const { rerender } = render(
      <TaskCreationWizard
        isOpen={true}
        onClose={handleClose}
        userId={mockUserId}
        tasksService={tasksService}
      />
    );

    // Escribir en Paso 1
    await user.type(
      screen.getByRole('textbox', { name: /título o nombre de la tarea/i }),
      'Borrador incompleto que debe ser purgado'
    );
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    // Escribir en Paso 2
    await user.type(
      screen.getByRole('textbox', { name: /descripción detallada/i }),
      'Notas secretas temporales'
    );

    // Pulsar Cancelar (Caso Forense VV-004)
    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    await user.click(cancelButton);

    expect(handleClose).toHaveBeenCalledTimes(1);

    // Simular cierre y reapertura del modal
    rerender(
      <TaskCreationWizard
        isOpen={false}
        onClose={handleClose}
        userId={mockUserId}
        tasksService={tasksService}
      />
    );

    rerender(
      <TaskCreationWizard
        isOpen={true}
        onClose={handleClose}
        userId={mockUserId}
        tasksService={tasksService}
      />
    );

    // Comprobar rigurosamente que nace 100% limpio en Paso 1 (Decisión 3A)
    expect(screen.getByText(/paso 1 de 3/i)).toBeInTheDocument();
    const cleanTitleInput = screen.getByRole('textbox', { name: /título o nombre de la tarea/i });
    expect(cleanTitleInput).toHaveValue('');
    expect(screen.getByText('0/120')).toBeInTheDocument();
    expect(screen.queryByText(/notas secretas temporales/i)).not.toBeInTheDocument();
  });

  it('CASO FORENSE VV-004: presionar la tecla Escape purga el buffer en memoria y cierra el modal', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    const { rerender } = render(
      <TaskCreationWizard
        isOpen={true}
        onClose={handleClose}
        userId={mockUserId}
        tasksService={tasksService}
      />
    );

    await user.type(
      screen.getByRole('textbox', { name: /título o nombre de la tarea/i }),
      'Tarea abortada con tecla Escape'
    );

    // Presionar tecla ESC
    await user.keyboard('{Escape}');

    expect(handleClose).toHaveBeenCalledTimes(1);

    // Reabrir y verificar que el buffer ha sido purgado a cero
    rerender(
      <TaskCreationWizard
        isOpen={false}
        onClose={handleClose}
        userId={mockUserId}
        tasksService={tasksService}
      />
    );

    rerender(
      <TaskCreationWizard
        isOpen={true}
        onClose={handleClose}
        userId={mockUserId}
        tasksService={tasksService}
      />
    );

    expect(screen.getByRole('textbox', { name: /título o nombre de la tarea/i })).toHaveValue('');
  });
});
```

### 10.4 Actualización canónica de `src/hub/components/TasksAccordion.tsx`:
```tsx
import React, { useState, useEffect } from 'react';
import styles from './TasksAccordion.module.css';
import { TaskItem } from '../../tasks/entities/task-item.entity';
import { TasksService } from '../../tasks/services/tasks.service';
import { TaskCreationWizard } from '../../tasks/components/TaskCreationWizard';

export interface TasksAccordionProps {
  tasks?: TaskItem[];
  tasksService?: TasksService;
  userId?: string;
  initialExpanded?: boolean;
  isLoading?: boolean;
  error?: string | null;
  onToggleExpand?: (expanded: boolean) => void;
  onCreateTaskClick?: () => void;
  onTaskCreated?: (task: TaskItem) => void;
  onTaskToggle?: (taskId: string) => void;
  onRetry?: () => void;
}

export const TasksAccordion: React.FC<TasksAccordionProps> = ({
  tasks: propTasks,
  tasksService,
  userId = 'usr-demo-elena-001',
  initialExpanded = true,
  isLoading: propLoading = false,
  error: propError = null,
  onToggleExpand,
  onCreateTaskClick,
  onTaskCreated,
  onTaskToggle,
  onRetry,
}) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [tasks, setTasks] = useState<TaskItem[]>(propTasks || []);
  const [isLoading, setIsLoading] = useState(propLoading);
  const [error, setError] = useState<string | null>(propError);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // Sincronizar props cuando cambian
  useEffect(() => {
    if (propTasks !== undefined) {
      setTasks(propTasks);
    }
  }, [propTasks]);

  useEffect(() => {
    setIsLoading(propLoading);
  }, [propLoading]);

  useEffect(() => {
    setError(propError);
  }, [propError]);

  // Carga automática opcional si se provee tasksService y userId
  useEffect(() => {
    if (tasksService && userId && propTasks === undefined) {
      setIsLoading(true);
      setError(null);
      tasksService
        .findAllByUser(userId)
        .then((items) => setTasks(items))
        .catch(() => setError('Error al cargar las tareas'))
        .finally(() => setIsLoading(false));
    }
  }, [tasksService, userId, propTasks]);

  const handleHeaderClick = () => {
    const next = !isExpanded;
    setIsExpanded(next);
    if (onToggleExpand) {
      onToggleExpand(next);
    }
  };

  const handleOpenWizard = () => {
    if (onCreateTaskClick) {
      onCreateTaskClick();
    } else {
      setIsWizardOpen(true);
    }
  };

  const handleTaskCreated = (newTask: TaskItem) => {
    setTasks((prev) => [newTask, ...prev]);
    setIsWizardOpen(false);
    if (onTaskCreated) {
      onTaskCreated(newTask);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    if (onTaskToggle) {
      onTaskToggle(taskId);
    }
    if (tasksService && userId) {
      try {
        const updated = await tasksService.toggleTaskStatus(userId, taskId);
        setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      } catch {
        // En caso de fallo, se mantiene el estado previo
      }
    } else {
      // Mutación local si es controlado por props
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, completado: !t.completado } : t))
      );
    }
  };

  return (
    <div className={styles.accordionContainer}>
      {/* Cabecera del Acordeón */}
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        className={styles.header}
        onClick={handleHeaderClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleHeaderClick();
          }
        }}
      >
        <div className={styles.titleSection}>
          <span
            className={`${styles.chevron} ${isExpanded ? styles.chevronOpen : ''}`}
            aria-hidden="true"
          >
            ▶
          </span>
          <h3 className={styles.title}>Tareas ({tasks.length})</h3>
        </div>

        <button
          type="button"
          className={styles.newButton}
          onClick={(e) => {
            e.stopPropagation();
            handleOpenWizard();
          }}
          aria-label="Crear nueva tarea"
        >
          + Nueva
        </button>
      </div>

      {/* Cuerpo del Acordeón */}
      {isExpanded && (
        <div className={styles.contentArea}>
          {/* EV-LIST-02: Skeleton Screen de Carga */}
          {isLoading && (
            <div className={styles.skeletonContainer} data-testid="tasks-skeleton">
              <div className={styles.skeletonItem} />
              <div className={styles.skeletonItem} />
              <div className={styles.skeletonItem} />
            </div>
          )}

          {/* EV-LIST-05: Estado de Error */}
          {!isLoading && error && (
            <div role="alert" className={styles.errorContainer} data-testid="tasks-error-state">
              <span className={styles.errorMessage}>{error}</span>
              {onRetry && (
                <button type="button" onClick={onRetry} className={styles.retryButton}>
                  Reintentar
                </button>
              )}
            </div>
          )}

          {/* EV-LIST-03: Empty State */}
          {!isLoading && !error && tasks.length === 0 && (
            <div className={styles.emptyContainer} data-testid="tasks-empty-state">
              <div className={styles.emptyIcon} aria-hidden="true">
                📋
              </div>
              <p className={styles.emptyTitle}>No tienes tareas pendientes</p>
              <p className={styles.emptySubtitle}>Añade tareas para organizarte en casa</p>
              <button
                type="button"
                onClick={handleOpenWizard}
                className={styles.emptyCtaButton}
              >
                + Crear Tarea
              </button>
            </div>
          )}

          {/* EV-LIST-01: Lista Poblada de Tareas */}
          {!isLoading && !error && tasks.length > 0 && (
            <ul className={styles.taskList} role="list" data-testid="tasks-populated-list">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className={`${styles.taskItem} ${task.completado ? styles.completed : ''}`}
                >
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={task.completado}
                      onChange={() => handleToggleTask(task.id)}
                      className={styles.checkbox}
                      aria-label={`Completar tarea ${task.titulo}`}
                    />
                  </label>

                  <span className={styles.taskTitle}>{task.titulo}</span>

                  <span
                    className={`${styles.priorityBadge} ${styles['priority_' + task.prioridad]}`}
                  >
                    {task.prioridad.toUpperCase()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Modal Wizard de Creación en 3 Pasos (VV-004) */}
      <TaskCreationWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        userId={userId}
        tasksService={tasksService}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  );
};
```

## 11. Verificación y Evidencia
- Ejecutar la suite completa:
  ```bash
  npm test -- --run
  ```
- **Evidencia requerida:** Mínimo 87-90 tests pasando al 100% en verde a través de 13 archivos de prueba sin ninguna advertencia crítica ni regresión en las suites previas.

## 12. Matriz de Trazabilidad
| Requerimiento Indexado | Archivo de Especificación | Componente / Código | Test de Verificación |
| :--- | :--- | :--- | :--- |
| **PVF-A03.02 / VF-A03.02** | `SPEC-FIA-A03.03.md` (Sec. 10.1) | `TaskCreationWizard.tsx` (Paso 1, 2, 3) | `TaskCreationWizard.test.tsx` (Tests 1 a 7) |
| **PVF-A03.03 / VF-A03.03** | `SPEC-FIA-A03.03.md` (Sec. 10.1, 10.3) | `resetWizardState()`, `handleCancel()` | `TaskCreationWizard.test.tsx` (Tests 9 y 10) |
| **Decisión 2B (120/1000 chars)** | `SPEC-FIA-A03.03.md` (Sec. 10.1) | `TASK_LIMITS`, `maxLength`, contador | `TaskCreationWizard.test.tsx` (Tests 3 y 5) |
| **Integración en Hub** | `SPEC-FIA-A03.03.md` (Sec. 10.4) | `TasksAccordion.tsx` (`handleOpenWizard`) | `TasksAccordion.test.tsx` (7 tests intactos) |

## 13. Actualización context_accumulated.json
```json
{
  "active_slice": "RV-A03 · Gestión de Tareas Generales (Tasks Vertical Slice)",
  "completed_fias": ["FIA-A01.01", "FIA-A01.02", "FIA-A01.03", "FIA-A02.01", "FIA-A02.02", "FIA-A02.03", "FIA-A02.04", "FIA-A02.05", "FIA-A03.01", "FIA-A03.02", "FIA-A03.03"],
  "latest_locked_fia": "FIA-A03.03",
  "architectural_decisions_applied": [
    "Aislamiento absoluto de tenant por userId en todas las consultas y creaciones de tareas",
    "Decisión 2B innegociable: corte estricto en 120 caracteres de título y 1000 de descripción",
    "Decisión 3A & Caso Forense VV-004: Rollback total a cero en memoria al cancelar o presionar ESC",
    "Prohibición de spinners a pantalla completa: modal autocontenido y carga local",
    "Usuario demo elena@centrat.local con acceso out-of-the-box blindado"
  ],
  "unlocked_next": "FIA-A03.04 (TaskCard con Mutación Optimista de Checkbox, Rollback y Toast ante 500)"
}
```

## 14. Actualización repo_state.json
```json
{
  "files_created": [
    "src/tasks/components/TaskCreationWizard.tsx",
    "src/tasks/components/TaskCreationWizard.module.css",
    "src/tasks/components/TaskCreationWizard.test.tsx"
  ],
  "files_modified": [
    "src/hub/components/TasksAccordion.tsx"
  ],
  "quality_gates_passed": ["QG-01", "QG-02", "QG-03", "QG-04", "QG-05"]
}
```

## 15. Actualización ui_state_accumulated.json
```json
{
  "mounted_components": [
    "App",
    "WorkspaceLayout",
    "HubContainer",
    "TasksAccordion",
    "TaskCreationWizard",
    "TopNavbar",
    "RegisterTab",
    "LoginPage"
  ],
  "viewport_topology": {
    "root": "100vw x 100vh, padding 16px, background #0B0F17",
    "navbar": "TopNavbar (h=64px, logout reactivo)",
    "hub": "HubContainer (w=380px/colapsado) -> aloja TasksAccordion con trigger de Wizard",
    "modal_layer": "TaskCreationWizard (fixed inset-0, z-index 1000, card 500px centrada)",
    "workbench": "flex 1",
    "auth_surface": "LoginPage (card 440px centrada, tabs conmutables, inputs empáticos)"
  },
  "observable_states": {
    "hub": "reactivo_toggle_con_acordeon_tareas_y_wizard",
    "tasks_wizard": "step_flow_1_2_3_atomic_rollback_vv004",
    "session_lifecycle": "login_guard_logout_purgado_completo",
    "tasks_backend": "crud_tenant_isolated_decision_2b_active"
  }
}
```

## 16. Definition of Done (DoD)
La ejecución de esta SPEC se considera completada si y solo si:
1. `TaskCreationWizard` y sus estilos encapsulados están implementados respetando la accesibilidad WCAG AA, los 3 pasos guiados y el límite Decisión 2B.
2. El Caso Forense VV-004 (Rollback total a cero en memoria al cancelar o presionar ESC) está demostrado mediante tests automatizados rigurosos.
3. El modal está plenamente integrado con `TasksAccordion.tsx` permitiendo crear tareas y verlas reflejadas de inmediato en el Hub.
4. El 100% de los tests del proyecto (mínimo 87 tests) pasan en verde con Vitest.
5. Los 3 JSONs de estado quedan actualizados en la raíz del proyecto.
6. Se emiten el `IMPLEMENTATION_REPORT_FIA-A03.03.md`, `TEST_REPORT_FIA-A03.03.md` y la propuesta formal de `LOCK-FIA-A03.03.md`.

## 17. Instrucciones para Antigravity CLI (Mandatos para el Implementador)
- **Regla de Unidad Única:** Trabaja única y exclusivamente en `FIA-A03.03`. Prohibido implementar `TaskCard` con mutación optimista o menús contextuales en esta sesión (reservados a `FIA-A03.04` y `FIA-A03.05`).
- **TDD Estricto:** Ejecuta el Paso 1 antes de escribir el componente de producción.
- **Blindaje Caso Forense VV-004:** Verifica explícitamente que tras cancelar o pulsar ESC, el formulario no conserve ningún residuo de texto y comience en Paso 1.
- **Parada Obligatoria:** Tras verificar los tests en verde, actualizar los 3 JSONs y generar los reportes y el `LOCK-FIA-A03.03.md`, DETÉN LA EJECUCIÓN INMEDIATAMENTE (**STOP**) y devuelve el control al usuario.
