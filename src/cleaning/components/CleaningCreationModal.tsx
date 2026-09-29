import React, { useState, useEffect } from 'react';
import styles from './CleaningCreationModal.module.css';
import { CreateCleaningItemDto } from '../dto/create-cleaning-item.dto';
import { CleaningZone, CleaningFrequency } from '../entities/cleaning-item.entity';

export interface CleaningCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dto: CreateCleaningItemDto) => void | Promise<void>;
  isLoading?: boolean;
}

export const CleaningCreationModal: React.FC<CleaningCreationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [nombre, setNombre] = useState('');
  const [zona, setZona] = useState<CleaningZone>('general');
  const [frecuencia, setFrecuencia] = useState<CleaningFrequency>('semanal');
  const [fechaProgramada, setFechaProgramada] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setNombre('');
      setZona('general');
      setFrecuencia('semanal');
      setFechaProgramada('');
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nombre.trim();
    if (!trimmed) {
      setError('El nombre de la tarea es obligatorio');
      return;
    }
    if (trimmed.length > 120) {
      setError('El nombre no puede exceder los 120 caracteres');
      return;
    }

    setError(null);
    try {
      await onSubmit({
        nombre: trimmed,
        zona,
        frecuencia,
        fechaProgramada: fechaProgramada ? new Date(fechaProgramada) : null,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al crear la tarea de limpieza');
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose} data-testid="cleaning-modal-backdrop">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cleaning-modal-title"
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        data-testid="cleaning-creation-modal"
      >
        <div className={styles.header}>
          <h3 id="cleaning-modal-title" className={styles.title}>
            Nueva Tarea de Limpieza
          </h3>
          <button
            type="button"
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div role="alert" className={styles.errorMessage} data-testid="cleaning-modal-error">
              {error}
            </div>
          )}

          <div className={styles.fieldGroup}>
            <label htmlFor="cleaning-name" className={styles.label}>
              Nombre de la Tarea <span className={styles.required}>*</span>
            </label>
            <input
              id="cleaning-name"
              type="text"
              value={nombre}
              maxLength={120}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Fregar suelo, Limpiar campana..."
              className={styles.input}
              autoFocus
              disabled={isLoading}
              data-testid="cleaning-name-input"
            />
            <span className={styles.charCount}>{nombre.length}/120</span>
          </div>

          <div className={styles.row}>
            <div className={styles.fieldGroup}>
              <label htmlFor="cleaning-zone" className={styles.label}>
                Zona del Hogar <span className={styles.required}>*</span>
              </label>
              <select
                id="cleaning-zone"
                value={zona}
                onChange={(e) => setZona(e.target.value as CleaningZone)}
                className={styles.select}
                disabled={isLoading}
                data-testid="cleaning-zone-select"
              >
                <option value="cocina">Cocina</option>
                <option value="baño">Baño</option>
                <option value="salon">Salón</option>
                <option value="general">General</option>
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="cleaning-frequency" className={styles.label}>
                Frecuencia <span className={styles.required}>*</span>
              </label>
              <select
                id="cleaning-frequency"
                value={frecuencia}
                onChange={(e) => setFrecuencia(e.target.value as CleaningFrequency)}
                className={styles.select}
                disabled={isLoading}
                data-testid="cleaning-frequency-select"
              >
                <option value="diaria">Diaria (+1 día)</option>
                <option value="semanal">Semanal (+7 días)</option>
                <option value="quincenal">Quincenal (+14 días)</option>
                <option value="mensual">Mensual (+30 días)</option>
              </select>
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="cleaning-schedule-date" className={styles.label}>
              Fecha Programada (Opcional)
            </label>
            <input
              id="cleaning-schedule-date"
              type="date"
              value={fechaProgramada}
              onChange={(e) => setFechaProgramada(e.target.value)}
              className={styles.input}
              disabled={isLoading}
              data-testid="cleaning-date-input"
            />
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
              data-testid="cleaning-submit-button"
            >
              {isLoading ? 'Guardando...' : 'Guardar Tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
