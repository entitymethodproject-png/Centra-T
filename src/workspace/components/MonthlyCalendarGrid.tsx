import React, { useState, useMemo } from 'react';
import styles from './MonthlyCalendarGrid.module.css';
import {
  CalendarDay,
  generateCalendarMatrix,
  getMonthName,
  formatDateToIso,
} from '../utils/calendarMatrix';
import { CalendarDropZone } from '../../calendar-sync/components/CalendarDropZone';
import { CalendarTaskPill } from '../../calendar-sync/components/CalendarTaskPill';
import {
  CalendarSchedulableItem,
  DragItemPayload,
} from '../../calendar-sync/types/drag-drop.types';

export interface MonthlyCalendarGridProps {
  initialDate?: Date;
  scheduledItems?: CalendarSchedulableItem[];
  onMonthChange?: (year: number, month: number) => void;
  onDayClick?: (day: CalendarDay) => void;
  onItemDrop?: (item: DragItemPayload, targetDate: string) => void;
}

const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export const MonthlyCalendarGrid: React.FC<MonthlyCalendarGridProps> = ({
  initialDate,
  scheduledItems = [],
  onMonthChange,
  onDayClick,
  onItemDrop,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(() => initialDate || new Date());

  const referenceToday = useMemo(() => initialDate || new Date(), [initialDate]);

  const days = useMemo(
    () =>
      generateCalendarMatrix(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        referenceToday
      ),
    [currentDate, referenceToday]
  );

  const itemsForDay = useMemo(() => {
    if (!scheduledItems || scheduledItems.length === 0) return {};
    const map: Record<string, CalendarSchedulableItem[]> = {};
    for (const item of scheduledItems) {
      if (!item.fechaProgramada) continue;
      const dateStr =
        item.fechaProgramada instanceof Date
          ? formatDateToIso(item.fechaProgramada)
          : String(item.fechaProgramada).slice(0, 10);
      if (!map[dateStr]) {
        map[dateStr] = [];
      }
      map[dateStr].push(item);
    }
    return map;
  }, [scheduledItems]);

  const handlePrevMonth = () => {
    const nextDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    setCurrentDate(nextDate);
    onMonthChange?.(nextDate.getFullYear(), nextDate.getMonth());
  };

  const handleNextMonth = () => {
    const nextDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    setCurrentDate(nextDate);
    onMonthChange?.(nextDate.getFullYear(), nextDate.getMonth());
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(now);
    onMonthChange?.(now.getFullYear(), now.getMonth());
  };

  return (
    <section className={styles.calendarContainer} aria-label="Calendario mensual">
      <header className={styles.calendarHeader}>
        <h2 className={styles.monthTitle}>
          {getMonthName(currentDate.getMonth())} {currentDate.getFullYear()}
        </h2>
        <div className={styles.navigationGroup}>
          <button
            type="button"
            className={styles.navButton}
            onClick={handlePrevMonth}
            aria-label="Mes anterior"
          >
            &lt;
          </button>
          <button
            type="button"
            className={`${styles.navButton} ${styles.todayButton}`}
            onClick={handleToday}
            aria-label="Ir al mes actual"
          >
            Hoy
          </button>
          <button
            type="button"
            className={styles.navButton}
            onClick={handleNextMonth}
            aria-label="Mes siguiente"
          >
            &gt;
          </button>
        </div>
      </header>

      <div className={styles.weekdayRow} role="row">
        {WEEKDAYS.map((day) => (
          <div key={day} className={styles.weekdayHeader} role="columnheader">
            {day}
          </div>
        ))}
      </div>

      <div className={styles.grid} role="grid" aria-label="Cuadrícula del mes">
        {days.map((day) => {
          const isAdjacent = !day.isCurrentMonth;
          const isToday = day.isToday;
          const dayItems = itemsForDay[day.dateString] || [];

          const cellClasses = [
            styles.cell,
            isAdjacent ? styles.adjacentMonth : '',
            isToday ? styles.todayCell : '',
          ]
            .filter(Boolean)
            .join(' ');

          const badgeClasses = [
            styles.dayNumber,
            isToday ? styles.todayBadge : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <div
              key={day.dateString}
              role="gridcell"
              tabIndex={0}
              data-date={day.dateString}
              data-testid={`calendar-cell-${day.dateString}`}
              className={cellClasses}
              onClick={() => onDayClick?.(day)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onDayClick?.(day);
                }
              }}
            >
              <CalendarDropZone
                dateString={day.dateString}
                isPast={day.isPast}
                isCurrentMonth={day.isCurrentMonth}
                onItemDrop={onItemDrop}
              >
                <div className={styles.cellHeader}>
                  <span className={badgeClasses}>{day.dayNumber}</span>
                </div>
                <div className={styles.cellContent}>
                  {dayItems.map((item) => (
                    <CalendarTaskPill
                      key={item.id}
                      id={item.id}
                      titulo={item.titulo}
                      prioridad={item.prioridad}
                      modulo={item.modulo}
                      completado={item.completado}
                    />
                  ))}
                </div>
              </CalendarDropZone>
            </div>
          );
        })}
      </div>
    </section>
  );
};
