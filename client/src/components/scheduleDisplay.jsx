import { Typography, Space, AutoComplete, Spin, Alert, Collapse } from "antd";

import { LessonDisplay } from "../components/formatSchedule.jsx";
import { useEffect, useMemo, useState } from "react";
import { getBuildingNumber } from "../utils/getBuidingNumber.js";
import {
  fetchAllAuditories,
  fetchAuditorySchedule,
} from "../services/AuditoryService.js";

const { Title, Text } = Typography;
const { Panel } = Collapse; // Для аккордеона

export function DispaySchedule({
  searchValue,
  selectedBuildings,
  selectedAuditoryName,
  selectedWeeks,
  auditorySchedule,
  setSelectedAuditoryName,
  setSearchValue,
  setAuditorySchedule,
}) {
  const [filteredAuditories, setFilteredAuditories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allAuditories, setAllAuditories] = useState([]);
  const [error, setError] = useState(null);

  const autoCompleteOptions = useMemo(() => {
    if (!searchValue) {
      return filteredAuditories.slice(0, 220).map((aud) => ({ value: aud }));
    }
    return filteredAuditories
      .filter((aud) => aud.toLowerCase().includes(searchValue.toLowerCase()))
      .slice(0, 50)
      .map((aud) => ({ value: aud }));
  }, [searchValue, filteredAuditories]);

  const handleSelectAuditory = async (value) => {
    setSelectedAuditoryName(value);
    setSearchValue(value); // Устанавливаем значение в поле поиска
    setLoading(true);
    setError(null);
    setAuditorySchedule(null);
    try {
      const schedule = await fetchAuditorySchedule(value);
      setAuditorySchedule(schedule);
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError(`Не удалось загрузить расписание для аудитории "${value}".`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadAuditories = async () => {
      setLoading(true);
      setError(null);
      try {
        const auditories = await fetchAllAuditories();
        console.log(auditories.length);
        setAllAuditories(auditories);
        // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError("Не удалось загрузить список аудиторий.");
      } finally {
        setLoading(false);
      }
    };
    loadAuditories();
  }, []);

  useEffect(() => {
    if (selectedBuildings.length === 0) {
      setFilteredAuditories([]);
      return;
    }

    const newFiltered = allAuditories.filter((aud) => {
      const building = getBuildingNumber(aud);
      return selectedBuildings.includes(building);
    });
    setFilteredAuditories(newFiltered);
  }, [allAuditories, selectedBuildings]);

  // Фильтрация расписания по выбранным неделям
  const filteredSchedule = useMemo(() => {
    if (!auditorySchedule || selectedWeeks.length === 0) return null;

    const newSchedule = {
      ...auditorySchedule,
      schedule: auditorySchedule.schedule.map((dayEntry) => ({
        ...dayEntry,
        lessons: dayEntry.lessons.filter((lesson) =>
          lesson.weekNumbers.some((week) => selectedWeeks.includes(week))
        ),
      })),
    };
    return newSchedule;
  }, [auditorySchedule, selectedWeeks]);

  // --- Автодополнение для поля поиска ---
  const handleSearch = (value) => {
    setSearchValue(value);
    const newFilteredAuditorie = allAuditories.filter((aud) => {
      return aud.startsWith(value);
    });
    setFilteredAuditories(newFilteredAuditorie);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-xl w-full md:w-2/3 lg:w-3/4 order-2 md:order-1">
      {" "}
      {/* order-2/order-1 для мобильных/десктопных устройств */}
      <Title level={3} className="text-gray-800 !mb-6">
        Поиск расписания
      </Title>
      <Space direction="vertical" size="large" className="w-full mb-6">
        <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
          <Text className="text-blue-700 mb-2 block font-medium">
            Название аудитории:
          </Text>
          <AutoComplete
            value={searchValue}
            options={autoCompleteOptions}
            onSearch={handleSearch}
            onSelect={handleSelectAuditory}
            className="w-full"
            placeholder="Введите название аудитории, например: 111-4"
            notFoundContent={
              loading ? (
                <Spin size="small" />
              ) : (
                <Text type="secondary">Нет результатов</Text>
              )
            }
          />
          {loading && !selectedAuditoryName && (
            <Spin size="small" className="mt-2" />
          )}
          {error && (
            <Alert
              message="Ошибка"
              description={error}
              type="error"
              showIcon
              className="mt-2"
            />
          )}
        </div>
      </Space>
      <hr className="my-8 border-t border-gray-200" />
      {/* Заголовок для отображения расписания */}
      <Title level={3} className="text-gray-800 !mb-6">
        Расписание для аудитории:{" "}
        <span className="text-blue-600">
          {selectedAuditoryName || "-- Не выбрана --"}
        </span>
      </Title>
      {loading && selectedAuditoryName && (
        <div className="text-center py-8">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">Загрузка расписания...</p>
        </div>
      )}
      {error && selectedAuditoryName && !loading && (
        <Alert
          message="Ошибка загрузки"
          description={error}
          type="error"
          showIcon
        />
      )}
      {!selectedAuditoryName && !loading && !error && (
        <div className="bg-blue-50 p-4 rounded-md border border-blue-200 min-h-[200px] flex items-center justify-center">
          <Text className="text-blue-700">
            Введите название аудитории в поле поиска.
          </Text>
        </div>
      )}
      {selectedAuditoryName && !loading && !error && filteredSchedule && (
        <Collapse
          accordion // Позволяет открывать только одну панель одновременно
          bordered={false}
          defaultActiveKey={["0"]} // По умолчанию открываем первый день
          className="bg-white rounded-lg shadow-sm -mx-2" // Убираем стандартные границы Collapse и добавляем свои
        >
          {filteredSchedule.schedule.map((dayEntry, index) => {
            // Фильтруем уроки, чтобы показывать только те, что на выбранных неделях
            const lessonsForSelectedWeeks = dayEntry.lessons.filter((lesson) =>
              lesson.weekNumbers.some((week) => selectedWeeks.includes(week))
            );

            // Не показываем дни, если на выбранных неделях нет занятий
            if (lessonsForSelectedWeeks.length === 0) {
              return null;
            }

            return (
              <Panel
                header={
                  <Text className="font-semibold text-blue-700 text-lg">
                    {dayEntry.day} ({selectedWeeks.join(",")} нед.)
                  </Text>
                }
                key={index}
                className="!bg-white !rounded-lg !mb-2 !border !border-gray-200 overflow-hidden"
              >
                {lessonsForSelectedWeeks.map((lesson, lessonIndex) => (
                  <LessonDisplay
                    key={lessonIndex}
                    lesson={lesson}
                    selectedWeeks={selectedWeeks}
                  />
                ))}
              </Panel>
            );
          })}
          {/* Сообщение, если после фильтрации по неделям ничего не осталось */}
          {filteredSchedule.schedule.every(
            (dayEntry) =>
              dayEntry.lessons.filter((lesson) =>
                lesson.weekNumbers.some((week) => selectedWeeks.includes(week))
              ).length === 0
          ) &&
            selectedAuditoryName && (
              <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 text-yellow-800 text-center mt-4">
                <Text className="font-semibold">
                  Для аудитории "{selectedAuditoryName}" на выбранных неделях
                  нет занятий. Попробуйте другие недели или проверьте выбранные
                  корпуса.
                </Text>
              </div>
            )}
        </Collapse>
      )}
      {selectedAuditoryName &&
        !loading &&
        !error &&
        auditorySchedule &&
        !auditorySchedule.schedule.length && (
          <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 text-yellow-800 text-center">
            <Text className="font-semibold">
              Для аудитории "{selectedAuditoryName}" нет расписания. Возможно,
              она не используется или данные отсутствуют.
            </Text>
          </div>
        )}
    </div>
  );
}
