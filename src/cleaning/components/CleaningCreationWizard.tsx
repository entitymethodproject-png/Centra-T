import React, { useState, useEffect, useRef } from 'react';
import styles from './CleaningCreationWizard.module.css';
import { CleaningItem, CleaningPriority, CLEANING_LIMITS } from '../entities/cleaning-item.entity';
import { CleaningService } from '../services/cleaning.service';

export interface CleaningCreationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  cleaningService?: CleaningService;
  onItemCreated?: (item: CleaningItem) => void;
}

export const CleaningCreationWizard: React.FC<CleaningCreationWizardProps> = ({
  isOpen,
  onClose,
  userId,
  cleaningService,
  onItemCreated,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [prioridad, setPrioridad] = useState<CleaningPriority>('media');
  const [titleError, setTitleError] = useState<string | null>(null);
  const [descError, setDescError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const titleInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (!isOpen) {
      resetWizardState();
    } else {
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

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
      setTitleError('El título no puede estar en blanco');
      return;
    }
    if (trimmed.length > CLEANING_LIMITS.MAX_TITLE_LENGTH) {
      setTitleError(`El título no puede superar los ${CLEANING_LIMITS.MAX_TITLE_LENGTH} caracteres`);
      return;
    }
    setTitleError(null);
    setStep(2);
  };

  const handleNextFromStep2 = () => {
    if (descripcion.length > CLEANING_LIMITS.MAX_DESCRIPTION_LENGTH) {
      setDescError(`La descripción no puede superar los ${CLEANING_LIMITS.MAX_DESCRIPTION_LENGTH} caracteres`);
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
      const service = cleaningService || new CleaningService();
      const createdItem = await service.createItem(userId, {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        prioridad,
      });

      resetWizardState();
      if (onItemCreated) {
        onItemCreated(createdItem);
      }
      onClose();
    } catch (err: any) {
      setIsLoading(false);
      setSubmitError(err?.message || 'Error al guardar la tarea de limpieza en el servidor');
    }
  };

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cleaning-wizard-title"
      data-testid="cleaning-creation-wizard-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          handleCancel();
        }
      }}
    >
      <div className={styles.modalCard} data-testid="cleaning-creation-wizard-card">
        {/* Cabecera del Wizard */}
        <div className={styles.modalHeader}>
          <div className={styles.headerInfo}>
            <span className={styles.stepBadge}>Paso {step} de 3</span>
            <h2 id="cleaning-wizard-title" className={styles.modalTitle}>
              {step === 1 && 'Nueva Tarea de Limpieza: Título'}
              {step === 2 && 'Nueva Tarea de Limpieza: Descripción'}
              {step === 3 && 'Nueva Tarea de Limpieza: Prioridad'}
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

        {/* Barra de progreso */}
        <div className={styles.progressBar}>
          <div
            className={`${styles.progressStep} ${step >= 1 ? styles.activeStep : ''}`}
            data-testid="cleaning-progress-step-1"
          />
          <div
            className={`${styles.progressStep} ${step >= 2 ? styles.activeStep : ''}`}
            data-testid="cleaning-progress-step-2"
          />
          <div
            className={`${styles.progressStep} ${step >= 3 ? styles.activeStep : ''}`}
            data-testid="cleaning-progress-step-3"
          />
        </div>

        {/* Contenido dinámico del Paso */}
        <div className={styles.stepContent}>
          {/* PASO 1: Título */}
          {step === 1 && (
            <div className={styles.stepContainer} data-testid="cleaning-wizard-step-1">
              <label htmlFor="cleaning-title-input" className={styles.label}>
                Título de la Tarea <span className={styles.requiredMark}>*</span>
              </label>
              <input
                ref={titleInputRef}
                id="cleaning-title-input"
                type="text"
                autoFocus
                disabled={isLoading}
                maxLength={CLEANING_LIMITS.MAX_TITLE_LENGTH}
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
                placeholder="Ej. Limpiar cristales del salón, Fregar suelos..."
                className={`${styles.input} ${titleError ? styles.inputError : ''}`}
                aria-invalid={!!titleError}
                aria-describedby={titleError ? 'cleaning-title-error' : 'cleaning-title-counter'}
                data-testid="cleaning-title-input"
              />
              <div className={styles.fieldMeta}>
                {titleError ? (
                  <span id="cleaning-title-error" role="alert" className={styles.errorMessage}>
                    {titleError}
                  </span>
                ) : (
                  <span className={styles.fieldHint}>Título conciso (1..120 caracteres)</span>
                )}
                <span
                  id="cleaning-title-counter"
                  className={styles.charCounter}
                  aria-live="polite"
                >
                  {titulo.length}/{CLEANING_LIMITS.MAX_TITLE_LENGTH}
                </span>
              </div>
            </div>
          )}

          {/* PASO 2: Descripción */}
          {step === 2 && (
            <div className={styles.stepContainer} data-testid="cleaning-wizard-step-2">
              <label htmlFor="cleaning-desc-input" className={styles.label}>
                Descripción y Notas <span className={styles.optionalMark}>(Opcional)</span>
              </label>
              <textarea
                id="cleaning-desc-input"
                rows={4}
                autoFocus
                disabled={isLoading}
                maxLength={CLEANING_LIMITS.MAX_DESCRIPTION_LENGTH}
                value={descripcion}
                onChange={(e) => {
                  setDescripcion(e.target.value);
                  if (descError) setDescError(null);
                }}
                placeholder="Añade instrucciones, productos a usar o detalles (admite saltos de línea)..."
                className={`${styles.textarea} ${descError ? styles.inputError : ''}`}
                aria-invalid={!!descError}
                aria-describedby={descError ? 'cleaning-desc-error' : 'cleaning-desc-counter'}
                data-testid="cleaning-desc-input"
              />
              <div className={styles.fieldMeta}>
                {descError ? (
                  <span id="cleaning-desc-error" role="alert" className={styles.errorMessage}>
                    {descError}
                  </span>
                ) : (
                  <span className={styles.fieldHint}>Especifica detalles de la limpieza si lo deseas</span>
                )}
                <span
                  id="cleaning-desc-counter"
                  className={styles.charCounter}
                  aria-live="polite"
                >
                  {descripcion.length}/{CLEANING_LIMITS.MAX_DESCRIPTION_LENGTH}
                </span>
              </div>
            </div>
          )}

          {/* PASO 3: Prioridad */}
          {step === 3 && (
            <div className={styles.stepContainer} data-testid="cleaning-wizard-step-3">
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
                  data-testid="cleaning-priority-alta"
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
                  data-testid="cleaning-priority-media"
                >
                  <span className={styles.priorityIndicator} />
                  <div className={styles.priorityDetails}>
                    <span className={styles.priorityName}>Media</span>
                    <span className={styles.priorityDesc}>Rutina semanal habitual</span>
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
                  data-testid="cleaning-priority-baja"
                >
                  <span className={styles.priorityIndicator} />
                  <div className={styles.priorityDetails}>
                    <span className={styles.priorityName}>Baja</span>
                    <span className={styles.priorityDesc}>Limpieza a fondo o aplazable</span>
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
                data-testid="cleaning-wizard-next-1"
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
                data-testid="cleaning-wizard-next-2"
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
                data-testid="cleaning-wizard-submit"
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
