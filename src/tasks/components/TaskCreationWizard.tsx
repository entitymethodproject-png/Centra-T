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
