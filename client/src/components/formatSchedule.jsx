import { UserOutlined } from "@ant-design/icons"; // Импортируем иконку для подгруппы
import { Typography, Space } from "antd";

const { Text } = Typography;

// --- Компонент для отображения одного занятия ---
export function LessonDisplay({ lesson, selectedWeeks }) {
  // Проверяем, проходит ли занятие хотя бы на одной из выбранных недель
  const isOnSelectedWeek = lesson.weekNumbers.some((week) =>
    selectedWeeks.includes(week)
  );

  // Если ни одна неделя не выбрана (чекбоксы сняты), или занятие не попадает ни на одну из выбранных
  if (selectedWeeks.length === 0 || !isOnSelectedWeek) {
    return null;
  }

  // Форматирование имени преподавателя (можно перенести в utils или использовать из бэкенда)
  const formatEmployeeName = (employee) => {
    if (!employee) return "Неизвестный преподаватель";
    let name = employee.lastName || "";
    if (employee.firstName) name += ` ${employee.firstName[0]}.`;
    if (employee.middleName) name += ` ${employee.middleName[0]}.`;
    return name.trim();
  };

  const employeeNames = lesson.employees.map(formatEmployeeName).join(", ");
  const groupNames = lesson.studentGroups.map((g) => g.name).join(", ");
  const weekNumbersText =
    lesson.weekNumbers.length === 4
      ? "Каждую нед." // или '1, 2, 3, 4 нед.' если предпочитаешь
      : `${lesson.weekNumbers.join(", ")} нед.`;

  return (
    <div className="border-b border-gray-200 py-3 last:border-b-0">
      <div className="flex justify-between items-center mb-1">
        <Text strong className="text-base text-gray-800">
          {lesson.startLessonTime}
        </Text>{" "}
        {/* Только время начала */}
        <Text className="text-sm text-blue-600">{weekNumbersText}</Text>
      </div>
      <Text className="block text-blue-800 font-semibold text-lg">
        {lesson.subject} ({lesson.lessonTypeAbbrev})
        {lesson.numSubgroup !== 0 && (
          <Space size="small" className="ml-2 text-base text-gray-700">
            <UserOutlined /> {lesson.numSubgroup}
          </Space>
        )}
      </Text>
      <Text className="block text-gray-600 text-sm">
        Группы: {groupNames || "Неизвестно"}
      </Text>
      <Text className="block text-gray-700 text-sm">
        Преподаватель: {employeeNames || "Неизвестно"}
        {lesson.note && (
          <span className="ml-2 text-gray-500 italic text-xs">
            ({lesson.note})
          </span>
        )}
      </Text>
    </div>
  );
}
