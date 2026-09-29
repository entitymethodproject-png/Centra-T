import React, { useState, useEffect } from 'react';
import '../../theme/tokens.css';
import styles from './FilterModal.module.css';
import {
  FilterCriteria,
  FilterPriority,
  FilterStatus,
  DEFAULT_FILTER_CRITERIA,
} from '../types/filter.types';

export interface FilterModalProps {
  isOpen: boolean;
  initialCriteria?: FilterCriteria;
  onClose: () => void;
  onApply: (criteria: FilterCriteria) => void;
  onReset?: () => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  initialCriteria,
  onClose,
  onApply,
  onReset,
}) => {
  const [bufferCriteria, setBufferCriteria] = useState<FilterCriteria>(
    initialCriteria
      ? { ...initialCriteria, fecha: { ...initialCriteria.fecha } }
      : DEFAULT_FILTER_CRITERIA
  );

  // Sincronizar buffer al abrir el modal o cambiar initialCriteria
  useEffect(() => {
    if (isOpen) {
      setBufferCriteria(
        initialCriteria
          ? { ...initialCriteria, fecha: { ...initialCriteria.fecha } }
          : DEFAULT_FILTER_CRITERIA
      );
    }
  }, [isOpen, initialCriteria]);

  // Soporte de tecla Escape para descarte inofensivo
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handlePriorityChange = (prioridad: FilterPriority) => {
    setBufferCriteria((prev) => ({
      ...prev,
      prioridad,
    }));
  };

  const handleStatusChange = (estado: FilterStatus) => {
    setBufferCriteria((prev) => ({
      ...prev,
      estado,
    }));
  };

  const handleDateActiveToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const activo = e.target.checked;
    setBufferCriteria((prev) => ({
      ...prev,
      fecha: {
        ...prev.fecha,
        activo,
      },
    }));
  };

  const handleDateTypeChange = (tipo: 'PUNTUAL' | 'RANGO') => {
    setBufferCriteria((prev) => ({
      ...prev,
      fecha: {
        ...prev.fecha,
        tipo,
      },
    }));
  };

  const handleDateStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value || null;
    setBufferCriteria((prev) => ({
      ...prev,
      fecha: {
        ...prev.fecha,
        fechaInicio: val,
      },
    }));
  };

  const handleDateEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value || null;
    setBufferCriteria((prev) => ({
      ...prev,
      fecha: {
        ...prev.fecha,
        fechaFin: val,
      },
    }));
  };

  const isRangeInvalid = Boolean(
    bufferCriteria.fecha.activo &&
      bufferCriteria.fecha.tipo === 'RANGO' &&
      bufferCriteria.fecha.fechaInicio &&
      bufferCriteria.fecha.fechaFin &&
      bufferCriteria.fecha.fechaInicio > bufferCriteria.fecha.fechaFin
  );

  const handleReset = () => {
    setBufferCriteria(DEFAULT_FILTER_CRITERIA);
    if (onReset) {
      onReset();
    }
  };

  const handleApply = () => {
    if (isRangeInvalid) return;
    onApply(bufferCriteria);
    onClose();
  };

  return (
    <div
      className={styles.backdrop}
      data-testid="filter-modal-backdrop"
      onClick={handleBackdropClick}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-modal-title"
        className={styles.modalCard}
      >
        <div className={styles.modalHeader}>
          <h2 id="filter-modal-title" className={styles.title}>
            Filtros Combinados
          </h2>
          <button
            type="button"
            aria-label="Cerrar modal"
            className={styles.closeButton}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Sección de Prioridad */}
          <section className={styles.section}>
            <span className={styles.sectionLabel}>Prioridad</span>
            <div className={styles.buttonGroup}>
              {(
                [
                  { value: 'TODAS', label: 'Todas' },
                  { value: 'alta', label: 'Alta' },
                  { value: 'media', label: 'Media' },
                  { value: 'baja', label: 'Baja' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  aria-pressed={bufferCriteria.prioridad === opt.value}
                  className={styles.optionButton}
                  onClick={() => handlePriorityChange(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>

          {/* Sección de Estado */}
          <section className={styles.section}>
            <span className={styles.sectionLabel}>Estado</span>
            <div className={styles.buttonGroup}>
              {(
                [
                  { value: 'TODOS', label: 'Todos' },
                  { value: 'SOLO_PENDIENTES', label: 'Solo pendientes' },
                  { value: 'SOLO_COMPLETADAS', label: 'Solo completadas' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  aria-pressed={bufferCriteria.estado === opt.value}
                  className={styles.optionButton}
                  onClick={() => handleStatusChange(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>

          {/* Sección de Fecha */}
          <section className={styles.section}>
            <label className={styles.checkboxContainer}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={bufferCriteria.fecha.activo}
                onChange={handleDateActiveToggle}
              />
              <span>Filtrar por fecha</span>
            </label>

            {bufferCriteria.fecha.activo && (
              <div className={styles.dateControls}>
                <div className={styles.radioGroup}>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="filterDateType"
                      value="PUNTUAL"
                      className={styles.radioInput}
                      checked={bufferCriteria.fecha.tipo === 'PUNTUAL'}
                      onChange={() => handleDateTypeChange('PUNTUAL')}
                    />
                    <span>Puntual</span>
                  </label>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="filterDateType"
                      value="RANGO"
                      className={styles.radioInput}
                      checked={bufferCriteria.fecha.tipo === 'RANGO'}
                      onChange={() => handleDateTypeChange('RANGO')}
                    />
                    <span>Rango</span>
                  </label>
                </div>

                {bufferCriteria.fecha.tipo === 'PUNTUAL' ? (
                  <div className={styles.inputGroup}>
                    <label htmlFor="filter-date-puntual" className={styles.inputLabel}>
                      Fecha puntual
                    </label>
                    <input
                      id="filter-date-puntual"
                      aria-label="Fecha puntual"
                      type="date"
                      className={styles.dateInput}
                      value={bufferCriteria.fecha.fechaInicio || ''}
                      onChange={handleDateStartChange}
                    />
                  </div>
                ) : (
                  <div className={styles.inputRow}>
                    <div className={styles.inputGroup}>
                      <label htmlFor="filter-date-inicio" className={styles.inputLabel}>
                        Fecha desde
                      </label>
                      <input
                        id="filter-date-inicio"
                        aria-label="Fecha desde"
                        type="date"
                        className={styles.dateInput}
                        value={bufferCriteria.fecha.fechaInicio || ''}
                        onChange={handleDateStartChange}
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label htmlFor="filter-date-fin" className={styles.inputLabel}>
                        Fecha hasta
                      </label>
                      <input
                        id="filter-date-fin"
                        aria-label="Fecha hasta"
                        type="date"
                        className={styles.dateInput}
                        value={bufferCriteria.fecha.fechaFin || ''}
                        onChange={handleDateEndChange}
                      />
                    </div>
                  </div>
                )}

                {isRangeInvalid && (
                  <p className={styles.errorMessage} role="alert">
                    La fecha de inicio no puede ser posterior a la fecha de fin
                  </p>
                )}
              </div>
            )}
          </section>
        </div>

        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.btnReset}
            onClick={handleReset}
          >
            Limpiar Filtros
          </button>
          <div className={styles.footerActionsRight}>
            <button
              type="button"
              className={styles.btnCancel}
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="button"
              className={styles.btnApply}
              disabled={isRangeInvalid}
              onClick={handleApply}
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
