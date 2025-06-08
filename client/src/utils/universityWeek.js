// --- Функция для расчета номера университетской недели ---


export const getUniversityWeekNumber = () => {
    const academicYearStart = "2024-09-01T00:00:00";
  const today = new Date();

  // Если учебный год еще не начался, по умолчанию 1 неделя
  if (today < academicYearStart) {
    return 1;
  }

  // Устанавливаем даты на начало недели (понедельник) для корректного расчета
  const getMonday = (d) => {
    d = new Date(d);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday (0)
    return new Date(d.getFullYear(), d.getMonth(), diff);
  };

  const startMonday = getMonday(academicYearStart);
  const currentMonday = getMonday(today);

  // Разница в днях
  const diffTime = Math.abs(currentMonday.getTime() - startMonday.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Каждые 7 дней - это новая неделя, плюс 1, так как первая неделя - это 1-я.
  const calculatedWeek = Math.floor(diffDays / 7) + 1;

  // Цикл 1-2-3-4
  return ((calculatedWeek - 1) % 4) + 1;
};