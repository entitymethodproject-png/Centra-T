import { describe, it, expect } from 'vitest';
import {
  generateCalendarMatrix,
  formatDateToIso,
  getMonthName,
} from './calendarMatrix';

describe('calendarMatrix utility', () => {
  describe('getMonthName', () => {
    it('debería devolver el nombre en español para cada mes', () => {
      expect(getMonthName(0)).toBe('Enero');
      expect(getMonthName(8)).toBe('Septiembre');
      expect(getMonthName(11)).toBe('Diciembre');
    });

    it('debería devolver cadena vacía para índices fuera de rango', () => {
      expect(getMonthName(-1)).toBe('');
      expect(getMonthName(12)).toBe('');
    });
  });

  describe('formatDateToIso', () => {
    it('debería formatear correctamente la fecha en formato YYYY-MM-DD con ceros a la izquierda', () => {
      const date = new Date(2026, 8, 5); // 5 de Septiembre de 2026
      expect(formatDateToIso(date)).toBe('2026-09-05');
    });

    it('debería formatear correctamente fechas de fin de año', () => {
      const date = new Date(2026, 11, 31);
      expect(formatDateToIso(date)).toBe('2026-12-31');
    });
  });

  describe('generateCalendarMatrix', () => {
    it('debería alinear el primer día en Lunes con los días adyacentes correspondientes', () => {
      // Septiembre 2026: el día 1 es Martes. El Lunes debe ser 31 de Agosto
      const matrix = generateCalendarMatrix(2026, 8, new Date(2026, 8, 15));
      expect(matrix.length).toBeGreaterThanOrEqual(35);
      
      const firstCell = matrix[0];
      expect(firstCell.dayNumber).toBe(31);
      expect(firstCell.isCurrentMonth).toBe(false);
      expect(firstCell.dateString).toBe('2026-08-31');

      const secondCell = matrix[1];
      expect(secondCell.dayNumber).toBe(1);
      expect(secondCell.isCurrentMonth).toBe(true);
      expect(secondCell.dateString).toBe('2026-09-01');
    });

    it('debería generar 35 casillas para meses estándar de 5 semanas', () => {
      // Septiembre 2026: 1 día de agosto + 30 días de septiembre + 4 días de octubre = 35 casillas
      const matrix = generateCalendarMatrix(2026, 8, new Date(2026, 8, 15));
      expect(matrix).toHaveLength(35);
    });

    it('debería generar 42 casillas para meses que abarcan 6 semanas', () => {
      // Agosto 2026: empieza en Sábado (5 días de julio) + 31 días de agosto = 36 días -> requiere 42 casillas
      const matrix = generateCalendarMatrix(2026, 7, new Date(2026, 7, 15));
      expect(matrix).toHaveLength(42);
    });

    it('debería marcar correctamente isToday cuando coincide con la fecha de referencia', () => {
      const referenceToday = new Date(2026, 8, 29);
      const matrix = generateCalendarMatrix(2026, 8, referenceToday);

      const todayCell = matrix.find((day) => day.dateString === '2026-09-29');
      expect(todayCell).toBeDefined();
      expect(todayCell?.isToday).toBe(true);

      const otherCell = matrix.find((day) => day.dateString === '2026-09-28');
      expect(otherCell?.isToday).toBe(false);
    });

    it('debería marcar correctamente isPast respecto a la fecha de referencia', () => {
      const referenceToday = new Date(2026, 8, 29);
      const matrix = generateCalendarMatrix(2026, 8, referenceToday);

      const pastCell = matrix.find((day) => day.dateString === '2026-09-28');
      expect(pastCell?.isPast).toBe(true);

      const futureCell = matrix.find((day) => day.dateString === '2026-09-30');
      expect(futureCell?.isPast).toBe(false);

      const todayCell = matrix.find((day) => day.dateString === '2026-09-29');
      expect(todayCell?.isPast).toBe(false);
    });

    it('debería garantizar que el primer día es Lunes y el último es Domingo', () => {
      const matrix = generateCalendarMatrix(2026, 8, new Date(2026, 8, 1));
      // getDay(): 1 = Lunes, 0 = Domingo
      expect(matrix[0].date.getDay()).toBe(1);
      expect(matrix[matrix.length - 1].date.getDay()).toBe(0);
    });

    it('debería manejar correctamente el cambio de año en Enero incluyendo días de Diciembre del año anterior', () => {
      // Enero 2027: 1 de Enero es Viernes. Días de Dic 2026: 28, 29, 30, 31
      const matrix = generateCalendarMatrix(2027, 0, new Date(2027, 0, 15));
      expect(matrix[0].dateString).toBe('2026-12-28');
      expect(matrix[0].isCurrentMonth).toBe(false);
      expect(matrix[4].dateString).toBe('2027-01-01');
      expect(matrix[4].isCurrentMonth).toBe(true);
    });

    it('debería calcular correctamente días para Febrero ordinario y bisiesto', () => {
      const matrix2026 = generateCalendarMatrix(2026, 1);
      const feb2026Days = matrix2026.filter((d) => d.isCurrentMonth);
      expect(feb2026Days).toHaveLength(28);

      const matrix2024 = generateCalendarMatrix(2024, 1);
      const feb2024Days = matrix2024.filter((d) => d.isCurrentMonth);
      expect(feb2024Days).toHaveLength(29);
    });
  });
});
