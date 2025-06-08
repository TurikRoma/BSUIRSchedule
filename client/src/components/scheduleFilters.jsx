// src/pages/App.jsx
import { Layout, Typography, Checkbox, Collapse } from "antd";

const { Title, Text } = Typography;

export function ScheduleFilters({
  buildingOptions,
  selectedBuildings,
  selectedWeeks,
  handleBuildingChange,
  handleWeekChange,
  universityWeek,
}) {
  return (
    <div className="w-full md:w-1/3 lg:w-1/4 order-1 md:order-2">
      {" "}
      {/* order-1/order-2 для мобильных/десктопных устройств */}
      <div className="bg-white p-6 rounded-lg shadow-xl mb-6">
        <Title level={4} className="text-gray-800 !mb-4">
          Фильтры
        </Title>

        {/* Фильтр по корпусам */}
        <div className="mb-6">
          <Text className="text-gray-600 mb-2 block font-medium">Корпус:</Text>
          <Checkbox.Group
            options={buildingOptions}
            value={selectedBuildings}
            onChange={handleBuildingChange}
            className="flex flex-col gap-y-2" // Чекбоксы в столбик
          />
        </div>

        {/* Фильтр по неделям */}
        <div>
          <Text className="text-gray-600 mb-2 block font-medium">Неделя:</Text>
          <Checkbox.Group
            options={[
              { label: "1", value: 1 },
              { label: "2", value: 2 },
              { label: "3", value: 3 },
              { label: "4", value: 4 },
            ]}
            value={selectedWeeks}
            onChange={handleWeekChange}
            className="flex flex-wrap gap-x-4 gap-y-2 text-sm" // Чекбоксы компактно
          />
          <Text className="block text-gray-500 text-xs mt-2">
            (Текущая университетская неделя: {universityWeek})
          </Text>
        </div>
      </div>
    </div>
  );
}
