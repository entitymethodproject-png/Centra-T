import React, { useState, useMemo } from 'react';
import styles from './MonthlyCalendarGrid.module.css';
import {
  CalendarDay,
  generateCalendarMatrix,
  getMonthName,
} from '../utils/calendarMatrix';

export interface MonthlyCalendarGridProps {
  initialDate?: Date;
  onMonthChange?: (year: number, month: number) => void;
  onDayClick?: (day: CalendarDay) => void;
}

const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export const MonthlyCalendarGrid: React.FC<MonthlyCalendarGridProps> = ({
  initialDate,
  onMonthChange,
  onDayClick,
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
              <div className={styles.cellHeader}>
                <span className={badgeClasses}>{day.dayNumber}</span>
              </div>
              <div className={styles.cellContent} />
            </div>
          );
        })}
      </div>
    </section>
  );
};
