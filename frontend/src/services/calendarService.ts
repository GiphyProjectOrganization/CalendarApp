export function MonthGrid(year: number, month: number, startOfWeek: number = 0): Date[] {
  const result: Date[] = [];

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const firstWeekday = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday
  const daysInMonth = lastDayOfMonth.getDate();

  const prevDays = (firstWeekday - startOfWeek + 7) % 7;

  const WEEKS_SHOWN = 6;
  const DAYS_IN_WEEK = 7;

  const totalCells = WEEKS_SHOWN * DAYS_IN_WEEK;

  const startDate = new Date(year, month, 1 - prevDays);

  for (let i = 0; i < totalCells; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    result.push(date);
  }

  return result;
}

export const generateHours = () => {
  const hours = [];
  for (let i = 0; i < 24; i++) {
    hours.push(`${i.toString().padStart(2, '0')}:00`);
  }
  return hours;
};
