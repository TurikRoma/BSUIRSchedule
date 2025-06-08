// server/src/app.js
import express from 'express'; // Используем import
import cors from 'cors';       // Используем import
import { config } from './config/index.js';
import AuditorySchedule from './models/AuditorieSchedules.js';
import AuthRouter from './routes/auth.route.js';
import AuditorieRouter from './routes/auditorie.route.js';

const app = express(); // Создаем экземпляр Express-приложения

// --- Middleware ---
app.use(express.json());
app.use(cors({ origin: config.cors.origin })); // Используем значение из конфига

// --- Тестовый маршрут ---

app.use('/api', AuthRouter)
app.use("/api", AuditorieRouter)

// --- НОВЫЙ МАРШРУТ: для получения расписания по аудитории ---
app.get('/api/auditories/:auditoryName/schedule', async (req, res) => {
  const auditoryName = req.params.auditoryName;
  try {
    // Ищем расписание по названию аудитории
    const schedule = await AuditorySchedule.findOne({ name: auditoryName });
    if (schedule) {
      res.status(200).json(schedule);
    } else {
      // Если расписание не найдено, возвращаем 404
      res.status(404).send('Расписание для данной аудитории не найдено.');
    }
  } catch (error) {
    console.error('Ошибка при получении расписания аудитории:', error);
    res.status(500).send('Внутренняя ошибка сервера.');
  }
});

app.get('/api/auditories/list', async (req, res) => {
  try {
    // Ищем все уникальные названия аудиторий
    const auditories = await AuditorySchedule.distinct('name');
    res.status(200).json(auditories.sort()); // Отсортируем для удобства
  } catch (error) {
    console.error('Ошибка при получении списка аудиторий:', error);
    res.status(500).send('Внутренняя ошибка сервера при получении списка аудиторий.');
  }
});

// --- Экспортируем наше Express-приложение ---
export default app; // Используем export default