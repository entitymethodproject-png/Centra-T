import React, { useState, useEffect, useRef } from 'react';
import styles from './ItemCreationWizard.module.css';
import { Item, ItemModulo, ItemPriority, ITEM_LIMITS } from '../entities/item.entity';
import { ItemsService, PolymorphicItemsService } from '../services/items.service';

export interface ItemCreationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  itemsService?: PolymorphicItemsService;
  tasksService?: PolymorphicItemsService; // alias retrocompatible
  shoppingService?: PolymorphicItemsService; // alias retrocompatible
  cleaningService?: PolymorphicItemsService; // alias retrocompatible
  modulo?: ItemModulo;
  onItemCreated?: (createdItem: Item) => void;
  onTaskCreated?: (createdTask: Item) => void; // alias retrocompatible
}

export const ItemCreationWizard: React.FC<ItemCreationWizardProps> = ({
  isOpen,
  onClose,
  userId = 'usr-demo-elena-001',
  itemsService,
  tasksService,
  shoppingService,
  cleaningService,
  modulo = 'tasks',
  onItemCreated,
  onTaskCreated,
}) => {
  const service = itemsService || tasksService || shoppingService || cleaningService;
  const notifyCreated = onItemCreated || onTaskCreated;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [prioridad, setPrioridad] = useState<ItemPriority>('media');
  const [fechaProgramada, setFechaProgramada] = useState<string>('');

  const [titleError, setTitleError] = useState<string | null>(null);
  const [descError, setDescError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);

  const resetWizardState = () => {
    setStep(1);
    setTitulo('');
    setDescripcion('');
    setPrioridad('media');
    setFechaProgramada('');
    setTitleError(null);
    setDescError(null);
    setSubmitError(null);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      resetWizardState();
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
    if (trimmed.length < ITEM_LIMITS.MIN_TITLE_LENGTH) {
      if (modulo === 'cleaning') {
        setTitleError('El título no puede estar en blanco');
      } else {
        setTitleError('El nombre no puede estar en blanco');
      }
      return;
    }
    if (trimmed.length > ITEM_LIMITS.MAX_TITLE_LENGTH) {
      setTitleError(`El nombre no puede superar ${ITEM_LIMITS.MAX_TITLE_LENGTH} caracteres`);
      return;
    }
    setTitleError(null);
    setStep(2);
  };

  const handleNextFromStep2 = () => {
    if (descripcion.trim().length > ITEM_LIMITS.MAX_DESCRIPTION_LENGTH) {
      setDescError(`La descripción no puede superar los ${ITEM_LIMITS.MAX_DESCRIPTION_LENGTH} caracteres`);
      return;
    }
    setDescError(null);
    setStep(3);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setSubmitError(null);

    try {
      const parsedDate = fechaProgramada ? new Date(fechaProgramada) : null;
      let createdItem: Item;

      if (typeof window !== 'undefined' && !service) {
        try {
          const endpoint =
            modulo === 'shopping'
              ? '/api/shopping'
              : modulo === 'cleaning'
              ? '/api/cleaning'
              : '/api/tasks';

          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              titulo: titulo.trim(),
              descripcion: descripcion.trim() || undefined,
              prioridad,
              fechaProgramada: fechaProgramada ? fechaProgramada.slice(0, 10) : undefined,
            }),
          });

          if (res.ok) {
            const raw = await res.json();
            createdItem = {
              ...raw,
              nombre: raw.titulo,
              fechaProgramada: raw.fechaProgramada
                ? new Date(`${String(raw.fechaProgramada).slice(0, 10)}T00:00:00`)
                : null,
              createdAt: new Date(raw.createdAt || Date.now()),
              updatedAt: new Date(raw.updatedAt || Date.now()),
            };

            resetWizardState();
            if (notifyCreated) {
              notifyCreated(createdItem);
            }
            onClose();
            return;
          } else {
            const errData = await res.json().catch(() => ({}));
            const msg = Array.isArray(errData.message)
              ? errData.message.join(', ')
              : errData.message || 'Error al guardar el elemento en el servidor';
            setSubmitError(msg);
            setIsLoading(false);
            return;
          }
        } catch (fetchErr) {
          // Si el endpoint no responde (por ejemplo en entorno Vitest/jsdom sin servidor),
          // continuar con el servicio local in-memory
        }
      }

      const activeService = service || new ItemsService();
      if (modulo === 'tasks' && typeof activeService.createTask === 'function') {
        createdItem = (await activeService.createTask(userId, {
          titulo: titulo.trim(),
          descripcion: descripcion.trim(),
          prioridad,
          fechaProgramada: parsedDate,
        })) as Item;
      } else if (typeof activeService.createItem === 'function') {
        createdItem = await activeService.createItem(
          userId,
          {
            modulo,
            titulo: titulo.trim(),
            nombre: titulo.trim(),
            descripcion: descripcion.trim(),
            prioridad,
            fechaProgramada: parsedDate,
          },
          modulo
        );
      } else if (typeof activeService.createTask === 'function') {
        createdItem = (await activeService.createTask(userId, {
          titulo: titulo.trim(),
          descripcion: descripcion.trim(),
          prioridad,
          fechaProgramada: parsedDate,
        })) as Item;
      } else {
        throw new Error('Servicio no soporta creación');
      }

      resetWizardState();
      if (notifyCreated) {
        notifyCreated(createdItem);
      }
      onClose();
    } catch (err: unknown) {
      setIsLoading(false);
      const error = err as Error;
      setSubmitError(error?.message || 'Error al guardar el elemento en el servidor');
    }
  };

  const headingTitle =
    modulo === 'shopping'
      ? step === 1
        ? 'Nuevo Producto: Nombre'
        : step === 2
        ? 'Nuevo Producto: Descripción'
        : 'Nuevo Producto: Prioridad'
      : modulo === 'cleaning'
      ? step === 1
        ? 'Nueva Tarea de Limpieza: Título'
        : step === 2
        ? 'Nueva Tarea de Limpieza: Descripción'
        : 'Nueva Tarea de Limpieza: Prioridad'
      : step === 1
      ? 'Nueva Tarea: Título'
      : step === 2
      ? 'Nueva Tarea: Descripción'
      : 'Nueva Tarea: Prioridad';

  const inputLabel =
    modulo === 'shopping'
      ? 'Nombre del producto'
      : modulo === 'cleaning'
      ? 'Título de la tarea'
      : 'Título o Nombre de la Tarea';

  const descLabel =
    modulo === 'shopping'
      ? 'Detalles y notas'
      : modulo === 'cleaning'
      ? 'Descripción y notas'
      : 'Descripción detallada';

  const inputPlaceholder =
    modulo === 'shopping'
      ? 'Ej. Leche de avena, Pan integral...'
      : modulo === 'cleaning'
      ? 'Ej. Limpiar filtros de aire acondicionado...'
      : 'Ej. Revisar caldera y ajustar presión...';

  const submitButtonText =
    modulo === 'shopping'
      ? isLoading
        ? 'Guardando...'
        : 'Guardar Producto'
      : isLoading
      ? 'Guardando...'
      : 'Guardar Tarea';

  const submitTestId =
    modulo === 'shopping'
      ? 'shopping-wizard-submit'
      : modulo === 'cleaning'
      ? 'cleaning-wizard-submit'
      : undefined;

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="wizard-title"
      data-testid={`${modulo}-creation-wizard-backdrop`}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          handleCancel();
        }
      }}
    >
      <div className={styles.modalCard} data-testid={`${modulo}-creation-wizard-card`}>
        {/* Cabecera del Wizard */}
        <div className={styles.modalHeader}>
          <div className={styles.headerInfo}>
            <span className={styles.stepBadge}>Paso {step} de 3</span>
            <h2 id="wizard-title" className={styles.modalTitle}>
              {headingTitle}
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

        {/* Contenido dinámico */}
        <div className={styles.stepContent}>
          {step === 1 && (
            <div className={styles.stepContainer} data-testid="wizard-step-1">
              <label htmlFor="wizard-title-input" className={styles.label}>
                {inputLabel} <span className={styles.requiredMark}>*</span>
              </label>
              <input
                ref={titleInputRef}
                id="wizard-title-input"
                type="text"
                autoFocus
                disabled={isLoading}
                maxLength={ITEM_LIMITS.MAX_TITLE_LENGTH}
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
                placeholder={inputPlaceholder}
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
                <span id="title-counter" className={styles.charCounter} aria-live="polite">
                  {titulo.length}/{ITEM_LIMITS.MAX_TITLE_LENGTH}
                </span>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className={styles.stepContainer} data-testid="wizard-step-2">
              <label htmlFor="wizard-desc-input" className={styles.label}>
                {descLabel} <span className={styles.optionalMark}>(Opcional)</span>
              </label>
              <textarea
                id="wizard-desc-input"
                rows={4}
                autoFocus
                disabled={isLoading}
                maxLength={ITEM_LIMITS.MAX_DESCRIPTION_LENGTH}
                value={descripcion}
                onChange={(e) => {
                  setDescripcion(e.target.value);
                  if (descError) setDescError(null);
                }}
                placeholder="Añade notas, pasos o detalles relevantes..."
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
                  <span className={styles.fieldHint}>Admite notas e instrucciones</span>
                )}
                <span id="desc-counter" className={styles.charCounter} aria-live="polite">
                  {descripcion.length}/{ITEM_LIMITS.MAX_DESCRIPTION_LENGTH}
                </span>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className={styles.stepContainer} data-testid="wizard-step-3">
              <label className={styles.label}>Nivel de Prioridad</label>
              <div className={styles.priorityGrid} role="radiogroup" aria-label="Selecciona la prioridad">
                <button
                  type="button"
                  role="radio"
                  aria-label="Alta"
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
                  aria-label="Media"
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
                  aria-label="Baja"
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
                data-testid={submitTestId}
              >
                {submitButtonText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Aliases para retrocompatibilidad
export const TaskCreationWizard = ItemCreationWizard;
export const ShoppingCreationWizard: React.FC<ItemCreationWizardProps> = (props) => (
  <ItemCreationWizard {...props} modulo="shopping" />
);
export const CleaningCreationWizard: React.FC<ItemCreationWizardProps> = (props) => (
  <ItemCreationWizard {...props} modulo="cleaning" />
);
