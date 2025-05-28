export function MonthGrid(year: number, month: number, startOfWeek: number = 0): Date[] {
  const result: Date[] = [];

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const firstWeekday = firstDayOfMonth.getDay(); // 0 = Sunday
  const daysInMonth = lastDayOfMonth.getDate();

  const prevDays = (firstWeekday - startOfWeek + 7) % 7;

  const totalCells = 6 * 7; // 6 weeks, 7 days

  const startDate = new Date(year, month, 1 - prevDays);

  for (let i = 0; i < totalCells; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    result.push(date);
  }

  return result;
}
