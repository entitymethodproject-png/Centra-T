export interface CalendarDay {
  date: Date;
  dateString: string; // Formato YYYY-MM-DD
  dayNumber: number;  // 1..31
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
}

const SPANISH_MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export function getMonthName(monthIndex: number): string {
  if (monthIndex < 0 || monthIndex > 11) return '';
  return SPANISH_MONTHS[monthIndex] || '';
}

export function formatDateToIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function normalizeDateToIso(input: Date | string | null | undefined): string {
  if (!input) return '';
  if (typeof input === 'string') {
    const match = input.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }
    const d = new Date(input);
    if (!isNaN(d.getTime())) {
      return formatDateToIso(d);
    }
    return '';
  }
  return formatDateToIso(input);
}


export function generateCalendarMatrix(year: number, month: number, referenceToday?: Date): CalendarDay[] {
  const today = referenceToday || new Date();
  const todayIso = formatDateToIso(today);

  // Primer día del mes
  const firstDay = new Date(year, month, 1);
  // getDay(): 0 = Domingo, 1 = Lunes ... 6 = Sábado
  // Ajuste canónico: Lunes = 0 .. Domingo = 6
  let dayOfWeek = firstDay.getDay() - 1;
  if (dayOfWeek === -1) dayOfWeek = 6;

  // Días totales en el mes en curso
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Días en el mes anterior
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const days: CalendarDay[] = [];

  // 1. Días adyacentes del mes anterior
  for (let i = dayOfWeek - 1; i >= 0; i--) {
    const prevDayNum = daysInPrevMonth - i;
    const date = new Date(year, month - 1, prevDayNum);
    const dateString = formatDateToIso(date);
    days.push({
      date,
      dateString,
      dayNumber: prevDayNum,
      isCurrentMonth: false,
      isToday: dateString === todayIso,
      isPast: dateString < todayIso,
    });
  }

  // 2. Días del mes en curso
  for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
    const date = new Date(year, month, dayNum);
    const dateString = formatDateToIso(date);
    days.push({
      date,
      dateString,
      dayNumber: dayNum,
      isCurrentMonth: true,
      isToday: dateString === todayIso,
      isPast: dateString < todayIso,
    });
  }

  // 3. Días adyacentes del mes siguiente (para completar múltiplo de 7: 35 o 42 casillas)
  const totalSlots = days.length > 35 ? 42 : 35;
  const remainingSlots = totalSlots - days.length;
  for (let dayNum = 1; dayNum <= remainingSlots; dayNum++) {
    const date = new Date(year, month + 1, dayNum);
    const dateString = formatDateToIso(date);
    days.push({
      date,
      dateString,
      dayNumber: dayNum,
      isCurrentMonth: false,
      isToday: dateString === todayIso,
      isPast: dateString < todayIso,
    });
  }

  return days;
}
