import React, { useState, useEffect, useRef } from 'react';
import styles from './ShoppingActionMenu.module.css';
import { ShoppingItem, ShoppingPriority } from '../entities/shopping-item.entity';
import { ShoppingService } from '../services/shopping.service';

export interface ShoppingActionMenuProps {
  item: ShoppingItem;
  userId?: string;
  shoppingService?: ShoppingService;
  onItemUpdated?: (updatedItem: ShoppingItem) => void;
  onItemDeleted?: (itemId: string) => void;
}

export const ShoppingActionMenu: React.FC<ShoppingActionMenuProps> = ({
  item,
  userId = 'usr-demo-elena-001',
  shoppingService,
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
      if (shoppingService && userId) {
        const updated = await shoppingService.updateItem(userId, item.id, {
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
      if (shoppingService && userId) {
        const updated = await shoppingService.updateItem(userId, item.id, {
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

  const handleChangePriority = async (newPriority: ShoppingPriority) => {
    setIsMenuOpen(false);
    setIsPrioritySubmenuOpen(false);

    if (shoppingService && userId) {
      try {
        const updated = await shoppingService.updateItem(userId, item.id, {
          prioridad: newPriority,
        });
        if (onItemUpdated) onItemUpdated(updated);
      } catch {
        // En caso de fallo se preserva el estado
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
      if (shoppingService && userId) {
        await shoppingService.deleteItem(userId, item.id);
      }
      setIsDeleting(false);
      setIsConfirmOpen(false);
      if (onItemDeleted) {
        onItemDeleted(item.id);
      }
    } catch (err: any) {
      setIsDeleting(false);
      setDeleteError(err?.message || 'No se pudo eliminar el producto del servidor');
    }
  };

  const displayName = item.titulo || item.nombre || 'este producto';

  return (
    <div className={styles.container} ref={menuRef}>
      {/* Botón Disparador (...) */}
      <button
        type="button"
        className={styles.triggerButton}
        onClick={handleToggleMenu}
        aria-label="Acciones de producto"
        aria-haspopup="menu"
        aria-expanded={isMenuOpen}
        data-testid="shopping-action-trigger"
      >
        •••
      </button>

      {/* Menú Desplegable Flotante */}
      {isMenuOpen && (
        <div
          role="menu"
          className={`${styles.dropdownMenu} ${openUpwards ? styles.dropdownMenuUpwards : ''}`}
          data-testid="shopping-action-dropdown"
          aria-label="Opciones de producto"
        >
          {/* Opción Descripción */}
          <button
            type="button"
            role="menuitem"
            className={styles.menuItem}
            onClick={handleOpenDescriptionModal}
            data-testid="action-shopping-description"
          >
            <span>Descripción</span>
          </button>

          <div className={styles.menuDivider} />

          {/* Submenú / Opciones de Prioridad */}
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
            data-testid="action-delete-shopping-item"
          >
            Eliminar producto
          </button>
        </div>
      )}

      {/* Modal de Lectura, Edición y Borrado de Descripción */}
      {isDescriptionModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="shopping-description-title"
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
              <h3 id="shopping-description-title" className={styles.modalTitle}>
                Descripción del producto
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
                Producto: <strong>"{displayName}"</strong>
              </p>

              <label htmlFor="shopping-description-input" className={styles.inputLabel}>
                Detalles y notas adicionales:
              </label>
              <textarea
                id="shopping-description-input"
                aria-label="Descripción del producto"
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
          aria-labelledby="confirm-delete-title"
          className={styles.backdrop}
          data-testid="delete-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isDeleting) {
              handleCancelDelete();
            }
          }}
        >
          <div className={styles.modalCard} data-testid="delete-modal-card">
            <div className={styles.modalHeader}>
              <h3 id="confirm-delete-title" className={styles.modalTitle}>
                ¿Eliminar producto?
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
                <strong>"{displayName}"</strong> de tu lista de la compra.
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
                  data-testid="confirm-delete-btn"
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
