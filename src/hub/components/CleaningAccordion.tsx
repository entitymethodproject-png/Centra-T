import React, { useState, useEffect } from 'react';
import styles from './CleaningAccordion.module.css';
import { CleaningItem } from '../../cleaning/entities/cleaning-item.entity';
import { CleaningService } from '../../cleaning/services/cleaning.service';
import { CleaningCreationModal } from '../../cleaning/components/CleaningCreationModal';
import { CreateCleaningItemDto } from '../../cleaning/dto/create-cleaning-item.dto';

export interface CleaningAccordionProps {
  items?: CleaningItem[];
  cleaningService?: CleaningService;
  userId?: string;
  initialExpanded?: boolean;
  isLoading?: boolean;
  error?: string | null;
  onToggleExpand?: (expanded: boolean) => void;
  onItemCreated?: (item: CleaningItem) => void;
  onItemToggle?: (itemId: string) => void;
  onRetry?: () => void;
}

export const CleaningAccordion: React.FC<CleaningAccordionProps> = ({
  items: propItems,
  cleaningService,
  userId = 'usr-demo-elena-001',
  initialExpanded = true,
  isLoading: propLoading = false,
  error: propError = null,
  onToggleExpand,
  onItemCreated,
  onItemToggle,
  onRetry,
}) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [items, setItems] = useState<CleaningItem[]>(propItems || []);
  const [isLoading, setIsLoading] = useState(propLoading);
  const [error, setError] = useState<string | null>(propError);
  const [activeZone, setActiveZone] = useState<string>('todas');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (propItems !== undefined) {
      setItems(propItems);
    }
  }, [propItems]);

  useEffect(() => {
    setIsLoading(propLoading);
  }, [propLoading]);

  useEffect(() => {
    setError(propError);
  }, [propError]);

  useEffect(() => {
    if (cleaningService && userId && propItems === undefined) {
      setIsLoading(true);
      setError(null);
      cleaningService
        .findAllByUser(userId)
        .then((data) => setItems(data))
        .catch(() => setError('Error al cargar tareas de limpieza'))
        .finally(() => setIsLoading(false));
    }
  }, [cleaningService, userId, propItems]);

  const total = items.length;
  const pendientes = items.filter((i) => !i.completado).length;

  const filteredItems = items.filter((item) => {
    if (activeZone === 'todas') return true;
    return item.zona === activeZone;
  });

  const handleHeaderClick = () => {
    const next = !isExpanded;
    setIsExpanded(next);
    if (onToggleExpand) onToggleExpand(next);
  };

  const handleOpenModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleToggleItem = async (itemId: string) => {
    if (onItemToggle) onItemToggle(itemId);

    if (cleaningService && userId) {
      try {
        const target = items.find((i) => i.id === itemId);
        if (target && !target.completado) {
          const updated = await cleaningService.completeTask(userId, itemId);
          setItems((prev) => prev.map((i) => (i.id === itemId ? updated : i)));
        } else {
          const updated = await cleaningService.updateItem(userId, itemId, { completado: false });
          setItems((prev) => prev.map((i) => (i.id === itemId ? updated : i)));
        }
      } catch {
        // Preservar estado en caso de fallo
      }
    } else {
      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, completado: !i.completado } : i))
      );
    }
  };

  const handleCreateTask = async (dto: CreateCleaningItemDto) => {
    if (cleaningService && userId) {
      const newItem = await cleaningService.createItem(userId, dto);
      setItems((prev) => [...prev, newItem]);
      if (onItemCreated) onItemCreated(newItem);
    } else {
      const now = new Date();
      const daysMap: Record<string, number> = { diaria: 1, semanal: 7, quincenal: 14, mensual: 30 };
      const days = daysMap[dto.frecuencia] || 7;
      const suggested = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

      const mockItem: CleaningItem = {
        id: crypto.randomUUID(),
        userId,
        modulo: 'cleaning',
        nombre: dto.nombre,
        zona: dto.zona,
        frecuencia: dto.frecuencia,
        completado: false,
        lastCompletedAt: null,
        proximaFechaSugerida: suggested,
        fechaProgramada: dto.fechaProgramada ? new Date(dto.fechaProgramada) : null,
        createdAt: now,
        updatedAt: now,
      };
      setItems((prev) => [...prev, mockItem]);
      if (onItemCreated) onItemCreated(mockItem);
    }
  };

  return (
    <div className={styles.accordionContainer} data-testid="cleaning-accordion">
      {/* Cabecera */}
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
        data-testid="cleaning-accordion-header"
      >
        <div className={styles.titleSection}>
          <span
            className={`${styles.chevron} ${isExpanded ? styles.chevronOpen : ''}`}
            aria-hidden="true"
          >
            ▶
          </span>
          <h3 className={styles.title}>
            Limpieza ({pendientes} pend / {total} tot)
          </h3>
        </div>

        <div className={styles.headerRight}>
          {pendientes > 0 && (
            <span className={styles.pendingBadge} data-testid="cleaning-pending-badge">
              {pendientes} pendientes
            </span>
          )}
          <button
            type="button"
            onClick={handleOpenModal}
            className={styles.createButton}
            data-testid="cleaning-create-button"
            aria-label="Nueva tarea de limpieza"
          >
            + Nueva Limpieza
          </button>
        </div>
      </div>

      {/* Cuerpo del Acordeón */}
      {isExpanded && (
        <div className={styles.contentArea}>
          {/* Barra de Chips Semánticos por Zona */}
          <div className={styles.chipsBar} role="group" aria-label="Filtrar por zona">
            {['todas', 'cocina', 'baño', 'salon', 'general'].map((z) => (
              <button
                key={z}
                type="button"
                onClick={() => setActiveZone(z)}
                className={`${styles.chip} ${activeZone === z ? styles.chipActive : ''} ${
                  z !== 'todas' ? styles[`chip_${z}`] : ''
                }`}
                data-testid={`cleaning-chip-${z}`}
              >
                {z.charAt(0).toUpperCase() + z.slice(1)}
              </button>
            ))}
          </div>

          {/* Skeleton Screen */}
          {isLoading && (
            <div className={styles.skeletonContainer} data-testid="cleaning-skeleton">
              <div className={styles.skeletonItem} />
              <div className={styles.skeletonItem} />
              <div className={styles.skeletonItem} />
            </div>
          )}

          {/* Error State */}
          {!isLoading && error && (
            <div role="alert" className={styles.errorContainer} data-testid="cleaning-error-state">
              <span className={styles.errorMessage}>{error}</span>
              {onRetry && (
                <button type="button" onClick={onRetry} className={styles.retryButton}>
                  Reintentar
                </button>
              )}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && filteredItems.length === 0 && (
            <div className={styles.emptyContainer} data-testid="cleaning-empty-state">
              <div className={styles.emptyIcon} aria-hidden="true">🧹</div>
              <p className={styles.emptyTitle}>No hay tareas de limpieza</p>
              <p className={styles.emptySubtitle}>
                {activeZone === 'todas'
                  ? 'Pulsa [+ Nueva Limpieza] para programar el cuidado del hogar'
                  : `No hay tareas registradas en la zona "${activeZone}"`}
              </p>
            </div>
          )}

          {/* Populated List */}
          {!isLoading && !error && filteredItems.length > 0 && (
            <ul className={styles.cleaningList} role="list" data-testid="cleaning-populated-list">
              {filteredItems.map((item) => (
                <li
                  key={item.id}
                  className={`${styles.cleaningItem} ${item.completado ? styles.itemCompleted : ''}`}
                  data-testid={`cleaning-item-${item.id}`}
                >
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={item.completado}
                      onChange={() => handleToggleItem(item.id)}
                      className={styles.checkbox}
                      aria-label={`Completar limpieza ${item.nombre}`}
                    />
                  </label>

                  <div className={styles.itemInfo}>
                    <span className={`${styles.itemName} ${item.completado ? styles.nameCompleted : ''}`}>
                      {item.nombre}
                    </span>
                    <div className={styles.badgesRow}>
                      <span className={`${styles.zoneBadge} ${styles[`zone_${item.zona}`]}`}>
                        {item.zona}
                      </span>
                      <span className={styles.frequencyBadge}>{item.frecuencia}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Modal de Creación */}
      <CleaningCreationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTask}
      />
    </div>
  );
};
