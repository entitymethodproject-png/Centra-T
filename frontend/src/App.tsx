import React from 'react';
import { WorkspaceLayout } from './workspace/components/WorkspaceLayout';
import { LoginPage } from './authentication/views/LoginPage';
import { TopNavbar } from './workspace/components/TopNavbar';
import { HubContainer } from './hub/components/HubContainer';
import { TasksAccordion } from './hub/components/TasksAccordion';
import { ShoppingAccordion } from './hub/components/ShoppingAccordion';
import { CleaningAccordion } from './hub/components/CleaningAccordion';
import { FilterModal } from './filters/components/FilterModal';
import { SortMenu } from './filters/components/SortMenu';
import { MonthlyCalendarGrid } from './workspace/components/MonthlyCalendarGrid';
import { ReassignmentConfirmModal } from './calendar-sync/components/ReassignmentConfirmModal';
import { BulkShoppingConfirmModal } from './calendar-sync/components/BulkShoppingConfirmModal';
import { CalendarItemContextMenu } from './calendar-sync/components/CalendarItemContextMenu';
import { OfflineBanner } from './workspace/components/OfflineBanner';
import { Toast } from './workspace/components/Toast';
import {
  useWorkspaceController,
  UseWorkspaceControllerProps as AppProps,
} from './workspace/hooks/useWorkspaceController';

export type { AppProps };

/**
 * App View Component (Root Presentation Shell).
 * Implementa una arquitectura MVC estricta:
 * - View: Renderizado puramente declarativo de layout, slots y modales.
 * - Controller: Orquestación de estado, lógica de negocio y DnD desacoplada en `useWorkspaceController`.
 */
export const App: React.FC<AppProps> = (props) => {
  const {
    // Sesión y Red
    isAuthenticated,
    currentUser,
    isOffline,
    handleLoginSuccess,
    handleLogout,

    // Colecciones procesadas en tiempo real
    processedTasks,
    processedShopping,
    processedCleaning,
    allScheduledItems,

    // Acciones de ciclo de vida de ítems
    handleTaskCreated,
    handleTaskUpdated,
    handleTaskDeleted,
    handleTaskToggle,

    handleShoppingCreated,
    handleShoppingUpdated,
    handleShoppingDeleted,
    handleShoppingToggle,

    handleCleaningCreated,
    handleCleaningUpdated,
    handleCleaningDeleted,
    handleCleaningToggle,

    // Filtrado y Ordenación
    criteria,
    isFiltered,
    activeFilterCount,
    isFilterModalOpen,
    openFilterModal,
    closeFilterModal,
    setCriteria,
    resetFilters,
    isSortMenuOpen,
    sortConfig,
    openSortMenu,
    closeSortMenu,
    setSortConfig,

    // Drag & Drop y Calendario
    handleScheduleItem,
    applySchedule,
    handleUnscheduleItem,

    // Modales de Conflicto y Menús
    reassignConflict,
    setReassignConflict,
    bulkShoppingConflict,
    setBulkShoppingConflict,
    handleConfirmBulkShopping,
    contextMenuState,
    handleItemContextMenu,
    closeContextMenu,

    // Notificaciones Toast empáticas
    toastState,
    closeToast,
  } = useWorkspaceController(props);

  // Vista de Acceso (Login / Registro)
  if (!isAuthenticated) {
    return (
      <LoginPage
        onNavigateToWorkspace={handleLoginSuccess}
        onSuccess={handleLoginSuccess}
      />
    );
  }

  // Vista de Espacio de Trabajo Principal (Workspace)
  return (
    <>
      <WorkspaceLayout
        bannerSlot={<OfflineBanner isOffline={isOffline} />}
        navbarSlot={
          <TopNavbar
            user={{ name: currentUser?.name || 'Usuario Centra-T' }}
            onLogout={handleLogout}
          />
        }
        hubSlot={
          <HubContainer
            onFilterClick={openFilterModal}
            onSortClick={openSortMenu}
            isFilterActive={isFiltered}
            activeFilterCount={activeFilterCount}
            onClearFilters={resetFilters}
          >
            <TasksAccordion
              tasks={processedTasks}
              isOffline={isOffline}
              onTaskCreated={handleTaskCreated}
              onTaskUpdated={handleTaskUpdated}
              onTaskDeleted={handleTaskDeleted}
              onTaskToggle={handleTaskToggle}
            />
            <ShoppingAccordion
              items={processedShopping}
              isOffline={isOffline}
              onItemCreated={handleShoppingCreated}
              onItemUpdated={handleShoppingUpdated}
              onItemDeleted={handleShoppingDeleted}
              onItemToggle={handleShoppingToggle}
            />
            <CleaningAccordion
              items={processedCleaning}
              isOffline={isOffline}
              onItemCreated={handleCleaningCreated}
              onItemUpdated={handleCleaningUpdated}
              onItemDeleted={handleCleaningDeleted}
              onItemToggle={handleCleaningToggle}
            />
          </HubContainer>
        }
        workbenchSlot={
          <MonthlyCalendarGrid
            scheduledItems={allScheduledItems}
            onItemDrop={handleScheduleItem}
            onItemContextMenu={handleItemContextMenu}
          />
        }
      />

      {/* Modales de Filtrado y Ordenación */}
      <FilterModal
        isOpen={isFilterModalOpen}
        initialCriteria={criteria}
        onClose={closeFilterModal}
        onApply={(newCriteria) => {
          setCriteria(newCriteria);
          closeFilterModal();
        }}
        onReset={resetFilters}
      />

      <SortMenu
        isOpen={isSortMenuOpen}
        activeConfig={sortConfig}
        onClose={closeSortMenu}
        onSelectOption={(newConfig) => {
          setSortConfig(newConfig);
          closeSortMenu();
        }}
      />

      {/* Modales de Conflicto y Asignación Temporal */}
      <ReassignmentConfirmModal
        isOpen={Boolean(reassignConflict)}
        itemTitle={reassignConflict?.item.titulo || ''}
        originDate={reassignConflict?.originDate || ''}
        targetDate={reassignConflict?.targetDate || ''}
        onConfirm={() => {
          if (reassignConflict) {
            applySchedule(reassignConflict.item, reassignConflict.targetDate);
            setReassignConflict(null);
          }
        }}
        onCancel={() => setReassignConflict(null)}
      />

      <BulkShoppingConfirmModal
        isOpen={Boolean(bulkShoppingConflict)}
        pendingCount={bulkShoppingConflict?.pendingCount || 0}
        targetDate={bulkShoppingConflict?.targetDate || ''}
        onConfirm={handleConfirmBulkShopping}
        onCancel={() => setBulkShoppingConflict(null)}
      />

      {/* Menú Contextual de Ítem en Calendario */}
      <CalendarItemContextMenu
        isOpen={Boolean(contextMenuState)}
        position={contextMenuState?.position || { x: 0, y: 0 }}
        itemId={contextMenuState?.item.id || ''}
        modulo={contextMenuState?.item.modulo || 'tasks'}
        itemTitle={contextMenuState?.item.titulo || ''}
        onUnschedule={handleUnscheduleItem}
        onClose={closeContextMenu}
      />

      {/* Sistema de Notificaciones Toast Empático */}
      <Toast
        isOpen={Boolean(toastState?.isOpen)}
        what={toastState?.message.what || ''}
        why={toastState?.message.why || ''}
        action={toastState?.message.action || ''}
        type={toastState?.type || 'error'}
        onClose={closeToast}
      />
    </>
  );
};
