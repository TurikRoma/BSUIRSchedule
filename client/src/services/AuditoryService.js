// src/services/AuditoryService.js
import axios from 'axios';

// Базовый URL нашего бэкенда (убедись, что он правильный)
// Если твой бэкенд запущен на другом порту или домене, измени эту строку
const API_BASE_URL = 'https://bsuirschedule.onrender.com/api'; // Предполагаемый адрес твоего бэкенда

/**
 * Получает список всех уникальных аудиторий с бэкенда.
 * @returns {Promise<string[]>} Массив строк с названиями аудиторий.
 */
export const fetchAllAuditories = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/auditories/list`);
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении списка аудиторий:', error);
    // В случае ошибки возвращаем пустой массив, чтобы приложение не упало
    return [];
  }
};

/**
 * Получает расписание для конкретной аудитории с бэкенда.
 * @param {string} auditoryName - Название аудитории, для которой нужно получить расписание.
 * @returns {Promise<object | null>} Объект расписания аудитории или null в случае ошибки.
 */
export const fetchAuditorySchedule = async (auditoryName) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/auditories/${auditoryName}/schedule`);
    return response.data;
  } catch (error) {
    console.error(`Ошибка при получении расписания для аудитории ${auditoryName}:`, error);
    return null;
  }
};