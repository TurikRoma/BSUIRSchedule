// src/pages/App.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Layout, Typography, Collapse } from "antd";

import { getUniversityWeekNumber } from "../utils/universityWeek";
import { ScheduleFilters } from "../components/scheduleFilters.jsx";
import { DispaySchedule } from "../components/scheduleDisplay.jsx";

const { Header, Content } = Layout;

function App() {
  const [searchValue, setSearchValue] = useState("");
  const [selectedAuditoryName, setSelectedAuditoryName] = useState("");
  const [auditorySchedule, setAuditorySchedule] = useState(null);

  // Состояния для фильтрации недель (теперь чекбоксы)
  const [selectedWeeks, setSelectedWeeks] = useState([]); // Выбранные недели (например, [1, 3])

  // Состояния для фильтра корпусов
  const buildingOptions = [
    {
      label: "1 Корпус",
      value: "1",
    },
    {
      label: "2 Корпус",
      value: "2",
    },
    {
      label: "3 Корпус",
      value: "3",
    },
    {
      label: "4 Корпус",
      value: "4",
    },
    {
      label: "5 Корпус",
      value: "5",
    },
  ];
  const [selectedBuildings, setSelectedBuildings] = useState([
    "1",
    "2",
    "3",
    "4",
    "5",
  ]);

  // Расчет текущей "университетской" недели
  const universityWeek = useMemo(() => getUniversityWeekNumber(), []);
  useEffect(() => {
    setSelectedWeeks([universityWeek]); // По умолчанию выбираем только текущую неделю
  }, [universityWeek]);

  // --- Обработчик изменения выбранных корпусов ---
  const handleBuildingChange = (checkedValues) => {
    console.log(selectedBuildings);
    setSelectedBuildings(checkedValues);
    setSearchValue("");
    setSelectedAuditoryName("");
    setAuditorySchedule(null);
  };

  // --- Обработчик изменения выбранных недель ---
  const handleWeekChange = (checkedValues) => {
    setSelectedWeeks(checkedValues);
    // Если расписание уже загружено, не нужно перезагружать, просто обновится отображение
  };

  return (
    <Layout className="min-h-screen bg-gray-50 font-sans">
      {" "}
      {/* Светлый фон для всей страницы */}
      {/* Хедер (шапка) - используем более насыщенный синий */}
      <Header className="bg-blue-700 text-white flex items-center justify-center shadow-lg">
        <h1 className="text-white text-2xl !mb-0 py-4">Расписание Аудиторий</h1>
      </Header>
      {/* Основное содержимое страницы */}
      <Content className="p-4 md:p-8 flex justify-center">
        <div className="flex flex-col md:flex-row w-full max-w-6xl gap-8">
          {/* Левая/Верхняя часть: Поиск аудитории */}
          <DispaySchedule
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            selectedBuildings={selectedBuildings}
            selectedAuditoryName={selectedAuditoryName}
            setSelectedAuditoryName={setSelectedAuditoryName}
            selectedWeeks={selectedWeeks}
            auditorySchedule={auditorySchedule}
            setAuditorySchedule={setAuditorySchedule}
          ></DispaySchedule>
          <ScheduleFilters
            buildingOptions={buildingOptions}
            selectedBuildings={selectedBuildings}
            selectedWeeks={selectedWeeks}
            handleBuildingChange={handleBuildingChange}
            handleWeekChange={handleWeekChange}
            universityWeek={universityWeek}
          ></ScheduleFilters>
          {/* Правая/Нижняя часть: Фильтры */}
        </div>
      </Content>
    </Layout>
  );
}

export default App;
