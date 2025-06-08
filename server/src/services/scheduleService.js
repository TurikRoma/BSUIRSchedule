// services/scheduleService.js
import axios from 'axios';
import pLimit from 'p-limit';
import { config } from '../config/index.js';
import AuditorySchedule from '../models/AuditorieSchedules.js';

// --- Конфигурация API и лимит запросов ---
const UNIVERSITY_API_BASE_URL = config.universityApi.baseUrl;
const limit = pLimit(1);

// --- Вспомогательные данные ---
const DAYS_OF_WEEK = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];

// --- Вспомогательные функции ---

/**
 * Форматирует имя преподавателя в краткий вид (Фамилия И. О.).
 * @param {object} employee - Объект преподавателя из API.
 * @returns {string} Отформатированное имя.
 */
function formatEmployeeName(employee) {
  if (!employee) return "Неизвестный преподаватель";
  let name = employee.lastName || '';
  if (employee.firstName) name += ` ${employee.firstName[0]}.`;
  if (employee.middleName) name += ` ${employee.middleName[0]}.`;
  return name.trim();
}

/**
 * Нормализует название аудитории, убирая суффиксы и заменяя символы.
 * @param {string} auditory - Название аудитории из API.
 * @returns {string | null} Нормализованное название или null, если не удалось нормализовать.
 */
function normalizeAuditoryName(auditory) {
  if (!auditory) return null;
  let normalized = auditory.trim();

  // Удаляем суффиксы типа " к."
  
  if (normalized.endsWith(' к.')) {
    normalized = normalized.slice(0, -3).trim(); // Обрезаем " к."
  }

  // Замена 'a' на 'а' для конкретных случаев
  if (normalized.toLowerCase() === "310a-4") {
    normalized = "310а-4";
  } else if (normalized.toLowerCase() === "410a-4") {
    normalized = "410а-4";
  }
  
  if (!normalized) return null;
  if (auditory.toLowerCase() === "физк") return "ФизК";

  return normalized;
}

/**
 * Получает список всех студенческих групп из API универа.
 * @returns {Promise<Array>} Массив объектов групп.
 */
async function getAllGroups() {
  try {
    const response = await axios.get(`${UNIVERSITY_API_BASE_URL}/student-groups`);
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении списка групп:', error.message);
    return [];
  }
}

/**
 * Получает расписание для конкретной студенческой группы.
 * @param {string} groupName - Название группы (например, "053503").
 * @returns {Promise<object | null>} Объект расписания группы или null в случае ошибки.
 */
async function getGroupSchedule(groupName) {
  try {
    const response = await axios.get(`${UNIVERSITY_API_BASE_URL}/schedule?studentGroup=${groupName}`);
    return response.data;
  } catch (error) {
    console.error(`Ошибка при получении расписания для группы ${groupName}:`, error.message);
    return null;
  }
}

// --- Основная функция обработки и сохранения расписания ---

/**
 * Получает расписание всех групп, агрегирует его по аудиториям
 * и сохраняет в базе данных MongoDB в соответствии с AuditoryScheduleSchema.
 */
export async function processAndSaveSchedules() {
  console.log('Начинаем процесс обновления расписания...');

  const groups = await getAllGroups();
  if (!groups || groups.length === 0) {
    console.log('Не удалось получить список групп или список пуст. Процесс обновления отменен.');
    return;
  }

  const aggregatedAuditoryLessons = {};

  const tasks = groups.map(group => limit(async () => {
    const groupSchedule = await getGroupSchedule(group.name);

    if (groupSchedule && groupSchedule.schedules) {
      for (const day of Object.keys(groupSchedule.schedules)) {
        const lessonsInDay = groupSchedule.schedules[day];

        for (const lesson of lessonsInDay) {
          if (lesson.lessonTypeAbbrev === "Экзамен" || lesson.lessonTypeAbbrev === "Консультация") {
            continue;
          }

          if (lesson.auditories && lesson.auditories.length > 0) {
            for (const auditory of lesson.auditories) {
              const normalizedAuditoryName = normalizeAuditoryName(auditory);

              if (!normalizedAuditoryName) {
                continue;
              }

              if (!aggregatedAuditoryLessons[normalizedAuditoryName]) {
                aggregatedAuditoryLessons[normalizedAuditoryName] = {};
              }
              if (!aggregatedAuditoryLessons[normalizedAuditoryName][day]) {
                aggregatedAuditoryLessons[normalizedAuditoryName][day] = {};
              }

              const lessonWeeks = (lesson.weekNumber && lesson.weekNumber.length > 0 && !lesson.weekNumber.includes(0))
                ? lesson.weekNumber
                : [1, 2, 3, 4];

              // Уникальный хэш теперь может включать номер подгруппы, если он важен для уникальности занятия
              // Например, если в одно время в одной аудитории, но в разных подгруппах, идут разные лабы.
              // Если numSubgroup == 0 означает, что подгруппы нет, то можно его не включать в хэш.
              const lessonHash = `${lesson.startLessonTime}-${lesson.endLessonTime}-${lesson.subject}-${lesson.lessonTypeAbbrev}-${formatEmployeeName(lesson.employees?.[0])}-${lesson.numSubgroup || 0}`;

              if (!aggregatedAuditoryLessons[normalizedAuditoryName][day][lessonHash]) {
                // Если это новое уникальное занятие для этой аудитории и дня, добавляем его
                aggregatedAuditoryLessons[normalizedAuditoryName][day][lessonHash] = {
                  startLessonTime: lesson.startLessonTime,
                  endLessonTime: lesson.endLessonTime,
                  subject: lesson.subject,
                  // subjectFullName: lesson.subjectFullName, // <-- Убрали это поле
                  lessonTypeAbbrev: lesson.lessonTypeAbbrev,
                  note: lesson.note,
                  employees: lesson.employees?.map(emp => ({
                      firstName: emp.firstName,
                      lastName: emp.lastName,
                      middleName: emp.middleName,
                      id: emp.id
                  })) || [],
                  // <-- Исправлено: теперь берем ВСЕ группы, а не только первую
                  studentGroups: lesson.studentGroups?.map(sg => ({
                      name: sg.name,
                      id: sg.id
                  })) || [],
                  numSubgroup: lesson.numSubgroup || 0, // <-- Добавили numSubgroup с дефолтом 0
                  weekNumbers: new Set()
                };
              }

              lessonWeeks.forEach(week => aggregatedAuditoryLessons[normalizedAuditoryName][day][lessonHash].weekNumbers.add(week));
            }
          }
        }
      }
    }
  }));

  await Promise.all(tasks);
  console.log('Все расписания групп обработаны и агрегированы.');

  await AuditorySchedule.deleteMany({});
  console.log('Старые данные расписания удалены из MongoDB.');

  for (const auditoryName in aggregatedAuditoryLessons) {
    const auditoryScheduleData = {
      name: auditoryName,
      schedule: []
    };

    for (const day of DAYS_OF_WEEK) {
      const lessonsForDay = aggregatedAuditoryLessons[auditoryName][day];
      
      if (lessonsForDay && Object.keys(lessonsForDay).length > 0) {
        const lessons = Object.values(lessonsForDay).map(lessonEntry => ({
            ...lessonEntry,
            weekNumbers: Array.from(lessonEntry.weekNumbers).sort((a, b) => a - b)
        }));

        lessons.sort((a, b) => {
          const timeA = a.startLessonTime.split(":").map(Number);
          const timeB = b.startLessonTime.split(":").map(Number);
          return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
        });

        auditoryScheduleData.schedule.push({
          day: day,
          lessons: lessons
        });
      }
    }

    const newAuditorySchedule = new AuditorySchedule(auditoryScheduleData);
    try {
      await newAuditorySchedule.save();
      console.log(`Расписание для аудитории ${auditoryName} сохранено.`);
    } catch (error) {
      console.error(`Ошибка при сохранении расписания для ${auditoryName}:`, error.message);
    }
  }
  console.log('Процесс сохранения расписания в MongoDB завершен.');
}