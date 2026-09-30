import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import '../../theme/tokens.css';
import styles from './ItemActionMenu.module.css';
import { Item, ItemPriority } from '../entities/item.entity';
import { type PolymorphicItemsService } from '../services/items.service';

export interface ItemActionMenuProps {
  item?: Item;
  task?: Item; // alias retrocompatible
  userId?: string;
  itemsService?: PolymorphicItemsService;
  tasksService?: PolymorphicItemsService; // alias retrocompatible
  shoppingService?: PolymorphicItemsService; // alias retrocompatible
  cleaningService?: PolymorphicItemsService; // alias retrocompatible
  onItemUpdated?: (updatedItem: Item) => void;
  onItemDeleted?: (itemId: string) => void;
  onTaskUpdated?: (updatedTask: Item) => void; // alias retrocompatible
  onTaskDeleted?: (taskId: string) => void; // alias retrocompatible
}

export const ItemActionMenu: React.FC<ItemActionMenuProps> = ({
  item: propItem,
  task: propTask,
  userId = 'usr-demo-elena-001',
  itemsService: propItemsService,
  tasksService,
  shoppingService,
  cleaningService,
  onItemUpdated,
  onItemDeleted,
  onTaskUpdated,
  onTaskDeleted,
}) => {
  const currentItem = propItem || propTask!;
  const service = propItemsService || tasksService || shoppingService || cleaningService;
  const notifyUpdated = onItemUpdated || onTaskUpdated;
  const notifyDeleted = onItemDeleted || onTaskDeleted;

  const [isMounted, setIsMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [descriptionText, setDescriptionText] = useState(currentItem?.descripcion || '');
  const [isSavingDesc, setIsSavingDesc] = useState(false);
  const [descError, setDescError] = useState<string | null>(null);
  const [isPrioritySubmenuOpen, setIsPrioritySubmenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [menuCoords, setMenuCoords] = useState<{
    top?: number;
    bottom?: number;
    right: number;
    openUpwards: boolean;
  } | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setDescriptionText(currentItem?.descripcion || '');
  }, [currentItem?.descripcion]);

  // Cierre al pulsar Escape
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

  // Cierre automático al hacer scroll o redimensionar para que el menú no quede desfasado
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleScrollOrResize = () => {
      setIsMenuOpen(false);
      setIsPrioritySubmenuOpen(false);
    };
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isMenuOpen]);

  // Foco accesible al botón cancelar en confirmación de borrado
  useEffect(() => {
    if (isConfirmOpen) {
      setTimeout(() => {
        cancelButtonRef.current?.focus();
      }, 50);
    }
  }, [isConfirmOpen]);

  if (!currentItem) return null;
  const modulo = currentItem.modulo || 'tasks';

  const handleToggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isMenuOpen) {
      if (triggerButtonRef.current && typeof window !== 'undefined') {
        const rect = triggerButtonRef.current.getBoundingClientRect();
        const menuWidth = 210;
        const menuHeight = 220;
        const margin = 12;

        const spaceBelow = window.innerHeight - rect.bottom;
        const shouldOpenUpwards = spaceBelow < menuHeight && rect.top > menuHeight;

        const topPos = shouldOpenUpwards
          ? undefined
          : Math.max(margin, Math.min(rect.bottom + 4, window.innerHeight - menuHeight - margin));

        const bottomPos = shouldOpenUpwards
          ? Math.max(
              margin,
              Math.min(window.innerHeight - rect.top + 4, window.innerHeight - margin)
            )
          : undefined;

        const targetRight = window.innerWidth - rect.right;
        const safeRight = Math.max(
          margin,
          Math.min(targetRight, window.innerWidth - menuWidth - margin)
        );

        setMenuCoords({
          top: topPos,
          bottom: bottomPos,
          right: safeRight,
          openUpwards: shouldOpenUpwards,
        });
      } else {
        setMenuCoords({
          top: 100,
          right: 16,
          openUpwards: false,
        });
      }
      setIsMenuOpen(true);
      setIsPrioritySubmenuOpen(false);
    } else {
      setIsMenuOpen(false);
      setIsPrioritySubmenuOpen(false);
    }
  };

  const handleOpenDescriptionModal = () => {
    setIsMenuOpen(false);
    setIsPrioritySubmenuOpen(false);
    setDescriptionText(currentItem.descripcion || '');
    setDescError(null);
    setIsDescriptionModalOpen(true);
  };

  const handleCloseDescriptionModal = () => {
    setIsDescriptionModalOpen(false);
    setDescError(null);
  };

  const handleSaveDescription = async () => {
    if (descriptionText.length > 1000) {
      setDescError('La descripción no puede superar los 1000 caracteres');
      return;
    }

    if (service && userId) {
      setIsSavingDesc(true);
      try {
        let updated: Item;
        if (modulo === 'tasks' && typeof service.updateTask === 'function') {
          updated = (await service.updateTask(userId, currentItem.id, {
            descripcion: descriptionText.trim(),
          })) as Item;
        } else if (typeof service.updateItem === 'function') {
          updated = await service.updateItem(userId, currentItem.id, {
            descripcion: descriptionText.trim(),
          });
        } else if (typeof service.updateTask === 'function') {
          updated = (await service.updateTask(userId, currentItem.id, {
            descripcion: descriptionText.trim(),
          })) as Item;
        } else {
          updated = {
            ...currentItem,
            descripcion: descriptionText.trim(),
            updatedAt: new Date(),
          };
        }
        setIsSavingDesc(false);
        setIsDescriptionModalOpen(false);
        if (notifyUpdated) {
          notifyUpdated(updated);
        }
      } catch (err: unknown) {
        setIsSavingDesc(false);
        const error = err as Error;
        setDescError(error?.message || 'Error al guardar la descripción');
      }
    } else {
      const updated: Item = {
        ...currentItem,
        descripcion: descriptionText.trim(),
        updatedAt: new Date(),
      };
      setIsDescriptionModalOpen(false);
      if (typeof window !== 'undefined') {
        fetch(`/api/${modulo}/${currentItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ descripcion: descriptionText.trim() }),
        }).catch(() => {});
      }
      if (notifyUpdated) {
        notifyUpdated(updated);
      }
    }
  };

  const handleClearDescription = async () => {
    if (isSavingDesc) return;
    setIsSavingDesc(true);
    setDescError(null);

    try {
      if (service && userId) {
        let updated: Item;
        if (modulo === 'tasks' && typeof service.updateTask === 'function') {
          updated = (await service.updateTask(userId, currentItem.id, {
            descripcion: '',
          })) as Item;
        } else if (typeof service.updateItem === 'function') {
          updated = await service.updateItem(userId, currentItem.id, {
            descripcion: '',
          });
        } else if (typeof service.updateTask === 'function') {
          updated = (await service.updateTask(userId, currentItem.id, {
            descripcion: '',
          })) as Item;
        } else {
          updated = {
            ...currentItem,
            descripcion: '',
            updatedAt: new Date(),
          };
        }
        setIsSavingDesc(false);
        setIsDescriptionModalOpen(false);
        if (notifyUpdated) {
          notifyUpdated(updated);
        }
      } else {
        const updated: Item = {
          ...currentItem,
          descripcion: '',
          updatedAt: new Date(),
        };
        setIsSavingDesc(false);
        setIsDescriptionModalOpen(false);
        if (typeof window !== 'undefined') {
          fetch(`/api/${modulo}/${currentItem.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ descripcion: '' }),
          }).catch(() => {});
        }
        if (notifyUpdated) {
          notifyUpdated(updated);
        }
      }
      setDescriptionText('');
    } catch (err: unknown) {
      setIsSavingDesc(false);
      const error = err as Error;
      setDescError(error?.message || 'No se pudo borrar la descripción');
    }
  };

  const handleSelectPriority = async (newPriority: ItemPriority) => {
    setIsMenuOpen(false);
    setIsPrioritySubmenuOpen(false);

    if (service && userId) {
      try {
        let updated: Item;
        if (modulo === 'tasks' && typeof service.updateTask === 'function') {
          updated = (await service.updateTask(userId, currentItem.id, {
            prioridad: newPriority,
          })) as Item;
        } else if (typeof service.updateItem === 'function') {
          updated = await service.updateItem(userId, currentItem.id, {
            prioridad: newPriority,
          });
        } else if (typeof service.updateTask === 'function') {
          updated = (await service.updateTask(userId, currentItem.id, {
            prioridad: newPriority,
          })) as Item;
        } else {
          updated = {
            ...currentItem,
            prioridad: newPriority,
            updatedAt: new Date(),
          };
        }
        if (notifyUpdated) {
          notifyUpdated(updated);
        }
      } catch (err: unknown) {
        console.error('Error al cambiar prioridad:', err);
      }
    } else {
      const updated: Item = {
        ...currentItem,
        prioridad: newPriority,
        updatedAt: new Date(),
      };
      if (typeof window !== 'undefined') {
        fetch(`/api/${modulo}/${currentItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ prioridad: newPriority }),
        }).catch(() => {});
      }
      if (notifyUpdated) {
        notifyUpdated(updated);
      }
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

  const handleConfirmDelete = async () => {
    if (service && userId) {
      setIsDeleting(true);
      try {
        if (modulo === 'tasks' && typeof service.deleteTask === 'function') {
          await service.deleteTask(userId, currentItem.id);
        } else if (typeof service.deleteItem === 'function') {
          await service.deleteItem(userId, currentItem.id);
        } else if (typeof service.deleteTask === 'function') {
          await service.deleteTask(userId, currentItem.id);
        }
        setIsDeleting(false);
        setIsConfirmOpen(false);
        if (notifyDeleted) {
          notifyDeleted(currentItem.id);
        }
      } catch (err: unknown) {
        setIsDeleting(false);
        const error = err as Error;
        setDeleteError(error?.message || 'Error al eliminar');
      }
    } else {
      setIsConfirmOpen(false);
      if (notifyDeleted) {
        notifyDeleted(currentItem.id);
      }
    }
  };

  const triggerTestId =
    modulo === 'shopping'
      ? 'shopping-action-trigger'
      : modulo === 'cleaning'
      ? 'cleaning-action-trigger'
      : 'action-menu-trigger';

  const dropdownTestId =
    modulo === 'shopping'
      ? 'shopping-action-dropdown'
      : modulo === 'cleaning'
      ? 'cleaning-action-dropdown'
      : 'action-menu-dropdown';

  const descActionTestId =
    modulo === 'shopping'
      ? 'action-shopping-description'
      : modulo === 'cleaning'
      ? 'action-cleaning-description'
      : 'action-menu-edit-desc';

  const deleteActionTestId =
    modulo === 'shopping'
      ? 'action-delete-shopping-item'
      : modulo === 'cleaning'
      ? 'action-delete-cleaning-item'
      : 'action-menu-delete';

  const confirmDeleteBtnTestId =
    modulo === 'cleaning' ? 'confirm-delete-cleaning-btn' : 'confirm-delete-btn';

  const deleteModalBackdropTestId =
    modulo === 'cleaning' ? 'delete-cleaning-modal-backdrop' : 'delete-modal-backdrop';

  const deleteModalCardTestId =
    modulo === 'cleaning' ? 'delete-cleaning-modal-card' : 'delete-modal-card';

  const ariaActionLabel =
    modulo === 'shopping'
      ? 'Acciones de producto'
      : modulo === 'cleaning'
      ? 'Acciones de tarea de limpieza'
      : 'Acciones de tarea';

  const ariaMenuLabel =
    modulo === 'shopping'
      ? 'Opciones de producto'
      : modulo === 'cleaning'
      ? 'Opciones de tarea de limpieza'
      : 'Opciones de tarea';

  const descModalTitle =
    modulo === 'shopping'
      ? 'Descripción del producto'
      : modulo === 'cleaning'
      ? 'Descripción de la tarea de limpieza'
      : 'Descripción de la tarea';

  const descTextareaLabel = descModalTitle;

  const deleteModalTitle =
    modulo === 'shopping'
      ? '¿Eliminar producto?'
      : modulo === 'cleaning'
      ? '¿Eliminar tarea de limpieza?'
      : '¿Eliminar tarea?';

  const deleteItemLabel =
    modulo === 'shopping'
      ? 'Eliminar producto'
      : modulo === 'cleaning'
      ? 'Eliminar tarea de limpieza'
      : 'Eliminar tarea';

  return (
    <div
      className={styles.container}
      data-testid={`action-menu-${currentItem.id}`}
    >
      <button
        ref={triggerButtonRef}
        type="button"
        className={styles.triggerButton}
        aria-label={ariaActionLabel}
        aria-haspopup="menu"
        aria-expanded={isMenuOpen}
        onClick={handleToggleMenu}
        data-testid={triggerTestId}
      >
        •••
      </button>

      {/* Menú Flotante Autónomo (Renderizado fuera del Hub por encima de la interfaz) */}
      {isMenuOpen && isMounted && typeof document !== 'undefined' && createPortal(
        <>
          <div
            className={styles.dropdownBackdrop}
            data-testid="action-menu-backdrop"
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(false);
              setIsPrioritySubmenuOpen(false);
            }}
          />
          <div
            ref={menuRef}
            className={`${styles.dropdownMenu} ${
              menuCoords?.openUpwards ? styles.dropdownMenuUpwards : ''
            }`}
            style={{
              position: 'fixed',
              top: menuCoords?.top !== undefined ? `${menuCoords.top}px` : 'auto',
              bottom: menuCoords?.bottom !== undefined ? `${menuCoords.bottom}px` : 'auto',
              right: `${menuCoords?.right ?? 16}px`,
              zIndex: 9999,
            }}
            role="menu"
            aria-label={ariaMenuLabel}
            data-testid={dropdownTestId}
          >
            <button
              type="button"
              className={styles.menuItem}
              role="menuitem"
              data-testid={descActionTestId}
              onClick={handleOpenDescriptionModal}
            >
              Descripción
            </button>

            <button
              type="button"
              className={styles.menuItem}
              role="menuitem"
              aria-haspopup="true"
              aria-expanded={isPrioritySubmenuOpen}
              data-testid="action-menu-change-priority"
              onClick={() => setIsPrioritySubmenuOpen((prev) => !prev)}
            >
              <span>Cambiar Prioridad</span>
              <span
                className={styles.menuChevron}
                style={{
                  transform: isPrioritySubmenuOpen ? 'rotate(90deg)' : 'none',
                }}
              >
                ▸
              </span>
            </button>

            {isPrioritySubmenuOpen && (
              <div
                className={styles.priorityChoices}
                data-testid="priority-submenu"
                role="menu"
                aria-label="Opciones de prioridad"
              >
                {(['alta', 'media', 'baja'] as ItemPriority[]).map((pri) => (
                  <button
                    key={pri}
                    type="button"
                    className={`${styles.prioritySubItem} ${
                      currentItem.prioridad === pri ? styles.prioritySelected : ''
                    }`}
                    role="menuitem"
                    data-testid={`priority-option-${pri}`}
                    onClick={() => handleSelectPriority(pri)}
                  >
                    <span className={`${styles.priorityDot} ${styles['dot_' + pri]}`} />
                    <span className={styles.priorityLabel}>
                      {pri.charAt(0).toUpperCase() + pri.slice(1)}
                    </span>
                    {currentItem.prioridad === pri && (
                      <span className={styles.checkIcon} aria-hidden="true">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className={styles.menuDivider} />

            <button
              type="button"
              className={`${styles.menuItem} ${styles.menuItemDelete}`}
              role="menuitem"
              data-testid={deleteActionTestId}
              onClick={handleOpenDeleteConfirm}
            >
              {deleteItemLabel}
            </button>
          </div>
        </>,
        document.body
      )}

      {/* Modal Preventivo de Descripción */}
      {isDescriptionModalOpen && isMounted && typeof document !== 'undefined' && createPortal(
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="desc-modal-heading"
          data-testid="description-modal-backdrop"
          onClick={handleCloseDescriptionModal}
        >
          <div
            className={styles.modalCard}
            data-testid="description-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3 id="desc-modal-heading" className={styles.modalTitle}>
                {descModalTitle}
              </h3>
              <button
                type="button"
                className={styles.modalCloseButton}
                aria-label="Cerrar modal"
                onClick={handleCloseDescriptionModal}
              >
                ✕
              </button>
            </div>

            <p className={styles.modalItemTitle}>{currentItem.titulo || currentItem.nombre}</p>

            <div className={styles.modalBody}>
              <label htmlFor="item-desc-input" className={styles.visuallyHidden}>
                {descTextareaLabel}
              </label>
              <textarea
                id="item-desc-input"
                className={styles.modalTextarea}
                rows={4}
                maxLength={1000}
                value={descriptionText}
                onChange={(e) => setDescriptionText(e.target.value)}
                placeholder="Escribe detalles adicionales..."
                data-testid="desc-textarea"
                aria-label={descTextareaLabel}
              />

              <div className={styles.counterRow}>
                {descError && (
                  <span role="alert" className={styles.modalError}>
                    {descError}
                  </span>
                )}
                <span className={styles.charCounter}>{descriptionText.length}/1000</span>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.clearButton}
                onClick={handleClearDescription}
                data-testid="clear-description-btn"
                aria-label="Borrar descripción"
              >
                Borrar descripción
              </button>
              <div className={styles.modalFooterRight}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={handleCloseDescriptionModal}
                  data-testid="desc-cancel-btn"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className={styles.saveButton}
                  onClick={handleSaveDescription}
                  disabled={isSavingDesc}
                  data-testid="save-description-btn"
                  aria-label="Guardar descripción"
                >
                  {isSavingDesc ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal Preventivo de Confirmación de Borrado */}
      {isConfirmOpen && isMounted && typeof document !== 'undefined' && createPortal(
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-confirm-title"
          data-testid={deleteModalBackdropTestId}
          onClick={handleCancelDelete}
        >
          <div
            className={styles.modalCard}
            data-testid={deleteModalCardTestId}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3 id="delete-confirm-title" className={styles.modalTitle}>
                {deleteModalTitle}
              </h3>
            </div>

            <div className={styles.modalBody}>
              <p className={styles.confirmText}>
                ¿Estás seguro de que deseas eliminar permanentemente &quot;
                <strong>{currentItem.titulo || currentItem.nombre}</strong>&quot;? Esta acción no
                se puede deshacer.
              </p>
              {deleteError && (
                <p role="alert" className={styles.modalError}>
                  {deleteError}
                </p>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                ref={cancelButtonRef}
                className={styles.cancelButton}
                onClick={handleCancelDelete}
                data-testid="cancel-delete-btn"
              >
                Cancelar
              </button>
              <button
                type="button"
                className={styles.deleteConfirmButton}
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                data-testid={confirmDeleteBtnTestId}
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar permanentemente'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

// Aliases para retrocompatibilidad
export const TaskActionMenu = ItemActionMenu;
export const ShoppingActionMenu = ItemActionMenu;
export const CleaningActionMenu = ItemActionMenu;
