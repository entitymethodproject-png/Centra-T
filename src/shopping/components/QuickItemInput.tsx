import React, { useState, useRef } from 'react';
import styles from './QuickItemInput.module.css';

export interface QuickItemInputProps {
  onAddItem: (dto: { nombre: string; cantidad: number; unidad: string }) => Promise<void> | void;
  disabled?: boolean;
  autoFocus?: boolean;
}

export const QuickItemInput: React.FC<QuickItemInputProps> = ({
  onAddItem,
  disabled = false,
  autoFocus = false,
}) => {
  const [nombre, setNombre] = useState('');
  const [cantidad, setCantidad] = useState<number | ''>(1);
  const [unidad, setUnidad] = useState('ud');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = nombre.trim();
    if (!trimmed || isSubmitting || disabled) return;

    setIsSubmitting(true);
    try {
      const finalCantidad = typeof cantidad === 'number' && cantidad >= 1 ? cantidad : 1;
      await onAddItem({
        nombre: trimmed,
        cantidad: finalCantidad,
        unidad: unidad.trim() || 'ud',
      });
      setNombre('');
      setCantidad(1);
      setUnidad('ud');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      setCantidad('');
      return;
    }
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed)) {
      setCantidad(Math.max(1, parsed));
    }
  };

  return (
    <form className={styles.quickInputForm} onSubmit={handleSubmit} data-testid="quick-item-form">
      <div className={styles.inputRow}>
        <input
          ref={inputRef}
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Añadir producto... (Enter)"
          maxLength={120}
          disabled={disabled || isSubmitting}
          autoFocus={autoFocus}
          className={styles.nameInput}
          aria-label="Nombre del producto"
        />

        <div className={styles.metaInputs}>
          <input
            type="number"
            value={cantidad}
            min={1}
            step={1}
            onChange={handleQuantityChange}
            disabled={disabled || isSubmitting}
            className={styles.quantityInput}
            aria-label="Cantidad"
          />

          <select
            value={unidad}
            onChange={(e) => setUnidad(e.target.value)}
            disabled={disabled || isSubmitting}
            className={styles.unitSelect}
            aria-label="Unidad"
          >
            <option value="ud">ud</option>
            <option value="kg">kg</option>
            <option value="g">g</option>
            <option value="l">l</option>
            <option value="pack">pack</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={disabled || isSubmitting || !nombre.trim()}
          className={styles.addButton}
          aria-label="Añadir ítem a la lista de compra"
        >
          +
        </button>
      </div>
    </form>
  );
};
