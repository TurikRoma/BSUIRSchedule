
// // --- Вспомогательная функция для извлечения номера корпуса ---
export const getBuildingNumber = (auditoryName) => {
  const parts = auditoryName.split("-");
  if (parts.length > 1) {
    // Берем последнюю часть, которая обычно содержит номер корпуса
    const lastPart = parts[parts.length - 1].trim();
    // Если в конце есть " к.", убираем его. Если остальное не число - считаем 'Другие'.
    const numPart = lastPart.replace(/ к\.$/, "");
    if (!isNaN(parseInt(numPart)) && parseInt(numPart) > 0) {
      // Проверяем, что это число > 0
      return numPart;
    }
  }
  return "Другие"; // Для всех, что не подошли под числовой корпус (включая "ФизК", если он без дефиса)
};