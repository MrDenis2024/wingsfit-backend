export const sortScheduleDays = (days: string[]): string[] => {
  const dayOrder = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];
  return days.sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
};
