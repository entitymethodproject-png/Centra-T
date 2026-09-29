import React, { useState, useEffect, useRef } from 'react';
import styles from './CleaningActionMenu.module.css';
import { CleaningItem, CleaningPriority } from '../entities/cleaning-item.entity';
import { CleaningService } from '../services/cleaning.service';

export interface CleaningActionMenuProps {
  item: CleaningItem;
  userId?: string;
  cleaningService?: CleaningService;
  onItemUpdated?: (updatedItem: CleaningItem) => void;
  onItemDeleted?: (itemId: string) => void;
}

export const CleaningActionMenu: React.FC<CleaningActionMenuProps> = ({
  item,
  userId = 'usr-demo-elena-001',
  cleaningService,
  onItemUpdated,
  onItemDeleted,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [descriptionText, setDescriptionText] = useState(item.descripcion || '');
  const [isSavingDesc, setIsSavingDesc] = useState(false);
  const [descError, setDescError] = useState<string | null>(null);
  const [isPrioritySubmenuOpen, setIsPrioritySubmenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [openUpwards, setOpenUpwards] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Sincronizar texto de descripción si el prop cambia
  useEffect(() => {
    setDescriptionText(item.descripcion || '');
  }, [item.descripcion]);

  // Cerrar al hacer clic fuera del menú
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
        setIsPrioritySubmenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Manejo de foco seguro al abrir el modal de confirmación
  useEffect(() => {
    if (isConfirmOpen) {
      setTimeout(() => {
        cancelButtonRef.current?.focus();
      }, 50);
    }
  }, [isConfirmOpen]);

  // Captura de tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isConfirmOpen && !isDeleting) {
          handleCancelDelete();
        } else if (isDescriptionModalOpen && !isSavingDesc) {
          handleCloseDescriptionModal();
        } else if (isMenuOpen) {
          setIsMenuOpen(false);
          setIsPrioritySubmenuOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isConfirmOpen, isDeleting, isDescriptionModalOpen, isSavingDesc, isMenuOpen]);

  const handleToggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isMenuOpen && menuRef.current && typeof window !== 'undefined') {
      const rect = menuRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUpwards(spaceBelow < 180);
    }
    setIsMenuOpen((prev) => !prev);
    setIsPrioritySubmenuOpen(false);
  };

  const handleOpenDescriptionModal = () => {
    setIsMenuOpen(false);
    setIsPrioritySubmenuOpen(false);
    setDescriptionText(item.descripcion || '');
    setDescError(null);
    setIsDescriptionModalOpen(true);
  };

  const handleCloseDescriptionModal = () => {
    setIsDescriptionModalOpen(false);
    setDescriptionText(item.descripcion || '');
    setDescError(null);
  };

  const handleSaveDescription = async () => {
    if (isSavingDesc) return;
    setIsSavingDesc(true);
    setDescError(null);

    const newDesc = descriptionText.trim();
    try {
      if (cleaningService && userId) {
        const updated = await cleaningService.updateItem(userId, item.id, {
          descripcion: newDesc,
        });
        if (onItemUpdated) onItemUpdated(updated);
      } else {
        if (onItemUpdated) {
          onItemUpdated({ ...item, descripcion: newDesc });
        }
      }
      setIsSavingDesc(false);
      setIsDescriptionModalOpen(false);
    } catch (err: any) {
      setIsSavingDesc(false);
      setDescError(err?.message || 'No se pudo guardar la descripción');
    }
  };

  const handleClearDescription = async () => {
    if (isSavingDesc) return;
    setIsSavingDesc(true);
    setDescError(null);

    try {
      if (cleaningService && userId) {
        const updated = await cleaningService.updateItem(userId, item.id, {
          descripcion: '',
        });
        if (onItemUpdated) onItemUpdated(updated);
      } else {
        if (onItemUpdated) {
          onItemUpdated({ ...item, descripcion: '' });
        }
      }
      setDescriptionText('');
      setIsSavingDesc(false);
      setIsDescriptionModalOpen(false);
    } catch (err: any) {
      setIsSavingDesc(false);
      setDescError(err?.message || 'No se pudo borrar la descripción');
    }
  };

  const handleOpenDeleteConfirm = () => {
    setIsMenuOpen(false);
    setIsPrioritySubmenuOpen(false);
    setDeleteError(null);
    setIsConfirmOpen(true);
  };

  const handleCancelDelete = () => {
    setIsConfirmOpen(false);
    setDeleteError(null);
  };

  const handleChangePriority = async (newPriority: CleaningPriority) => {
    setIsMenuOpen(false);
    setIsPrioritySubmenuOpen(false);

    if (cleaningService && userId) {
      try {
        const updated = await cleaningService.updateItem(userId, item.id, {
          prioridad: newPriority,
        });
        if (onItemUpdated) onItemUpdated(updated);
      } catch {
        // Preservar estado
      }
    } else {
      if (onItemUpdated) {
        onItemUpdated({ ...item, prioridad: newPriority });
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      if (cleaningService && userId) {
        await cleaningService.deleteItem(userId, item.id);
      }
      setIsDeleting(false);
      setIsConfirmOpen(false);
      if (onItemDeleted) {
        onItemDeleted(item.id);
      }
    } catch (err: any) {
      setIsDeleting(false);
      setDeleteError(err?.message || 'No se pudo eliminar la tarea de limpieza del servidor');
    }
  };

  const displayName = item.titulo || item.nombre || 'esta tarea de limpieza';

  return (
    <div className={styles.container} ref={menuRef}>
      {/* Botón Disparador (...) */}
      <button
        type="button"
        className={styles.triggerButton}
        onClick={handleToggleMenu}
        aria-label="Acciones de tarea de limpieza"
        aria-haspopup="menu"
        aria-expanded={isMenuOpen}
        data-testid="cleaning-action-trigger"
      >
        •••
      </button>

      {/* Menú Desplegable Flotante */}
      {isMenuOpen && (
        <div
          role="menu"
          className={`${styles.dropdownMenu} ${openUpwards ? styles.dropdownMenuUpwards : ''}`}
          data-testid="cleaning-action-dropdown"
          aria-label="Opciones de tarea de limpieza"
        >
          {/* Opción Descripción */}
          <button
            type="button"
            role="menuitem"
            className={styles.menuItem}
            onClick={handleOpenDescriptionModal}
            data-testid="action-cleaning-description"
          >
            <span>Descripción</span>
          </button>

          <div className={styles.menuDivider} />

          {/* Submenú de Prioridad */}
          <div className={styles.prioritySubmenuSection}>
            <button
              type="button"
              role="menuitem"
              className={styles.menuItem}
              onClick={() => setIsPrioritySubmenuOpen((prev) => !prev)}
            >
              <span>Cambiar prioridad</span>
              <span className={styles.menuChevron}>{isPrioritySubmenuOpen ? '▲' : '▼'}</span>
            </button>

            {isPrioritySubmenuOpen && (
              <div className={styles.priorityChoices}>
                <button
                  type="button"
                  role="menuitem"
                  className={`${styles.priorityChoice} ${styles.priorityAlta}`}
                  onClick={() => handleChangePriority('alta')}
                >
                  <span className={styles.dot} /> Alta
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className={`${styles.priorityChoice} ${styles.priorityMedia}`}
                  onClick={() => handleChangePriority('media')}
                >
                  <span className={styles.dot} /> Media
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className={`${styles.priorityChoice} ${styles.priorityBaja}`}
                  onClick={() => handleChangePriority('baja')}
                >
                  <span className={styles.dot} /> Baja
                </button>
              </div>
            )}
          </div>

          <div className={styles.menuDivider} />

          {/* Opción Destructiva: Eliminar */}
          <button
            type="button"
            role="menuitem"
            className={`${styles.menuItem} ${styles.deleteItem}`}
            onClick={handleOpenDeleteConfirm}
            data-testid="action-delete-cleaning-item"
          >
            Eliminar tarea
          </button>
        </div>
      )}

      {/* Modal de Lectura, Edición y Borrado de Descripción */}
      {isDescriptionModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cleaning-description-title"
          className={styles.backdrop}
          data-testid="description-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSavingDesc) {
              handleCloseDescriptionModal();
            }
          }}
        >
          <div className={styles.modalCard} data-testid="description-modal-card">
            <div className={styles.modalHeader}>
              <h3 id="cleaning-description-title" className={styles.modalTitle}>
                Descripción de la tarea de limpieza
              </h3>
              <button
                type="button"
                className={styles.closeButton}
                onClick={handleCloseDescriptionModal}
                disabled={isSavingDesc}
                aria-label="Cerrar modal de descripción"
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <p className={styles.descriptionItemTitle}>
                Limpieza: <strong>"{displayName}"</strong>
              </p>

              <label htmlFor="cleaning-description-input" className={styles.inputLabel}>
                Detalles y notas adicionales:
              </label>
              <textarea
                id="cleaning-description-input"
                aria-label="Descripción de la tarea de limpieza"
                className={styles.descriptionTextarea}
                rows={4}
                maxLength={1000}
                placeholder="Sin descripción. Escribe aquí para añadir una..."
                value={descriptionText}
                onChange={(e) => setDescriptionText(e.target.value)}
                disabled={isSavingDesc}
              />
              <span className={styles.charCount}>
                {descriptionText.length} / 1000 caracteres
              </span>

              {descError && (
                <div role="alert" className={styles.errorAlert}>
                  {descError}
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.deleteDescButton}
                onClick={handleClearDescription}
                disabled={isSavingDesc || (!item.descripcion && !descriptionText)}
                aria-label="Borrar descripción"
                data-testid="clear-description-btn"
              >
                Borrar descripción
              </button>
              <div className={styles.footerActionsRight}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={handleCloseDescriptionModal}
                  disabled={isSavingDesc}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className={styles.confirmSaveButton}
                  onClick={handleSaveDescription}
                  disabled={isSavingDesc}
                  data-testid="save-description-btn"
                >
                  {isSavingDesc ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Diálogo Modal Preventivo de Confirmación */}
      {isConfirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-delete-cleaning-title"
          className={styles.backdrop}
          data-testid="delete-cleaning-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isDeleting) {
              handleCancelDelete();
            }
          }}
        >
          <div className={styles.modalCard} data-testid="delete-cleaning-modal-card">
            <div className={styles.modalHeader}>
              <h3 id="confirm-delete-cleaning-title" className={styles.modalTitle}>
                ¿Eliminar tarea de limpieza?
              </h3>
              <button
                type="button"
                className={styles.closeButton}
                onClick={handleCancelDelete}
                disabled={isDeleting}
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <p className={styles.modalText}>
                Esta acción no se puede deshacer. Se eliminará permanentemente{' '}
                <strong>"{displayName}"</strong> de tus tareas de limpieza.
              </p>
              {deleteError && (
                <div role="alert" className={styles.errorAlert}>
                  {deleteError}
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <div className={styles.footerActionsRight}>
                <button
                  ref={cancelButtonRef}
                  type="button"
                  className={styles.cancelButton}
                  onClick={handleCancelDelete}
                  disabled={isDeleting}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className={styles.confirmDeleteButton}
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  data-testid="confirm-delete-cleaning-btn"
                >
                  {isDeleting ? 'Eliminando...' : 'Eliminar Definitivamente'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
