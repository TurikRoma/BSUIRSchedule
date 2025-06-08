import { config } from './config/index.js';
import app from './app.js';
import connectDB from './config/db.js'; // <-- Импортируем нашу функцию подключения к БД
import { processAndSaveSchedules } from './services/scheduleService.js';
import { createUser } from './services/UserServices.js';

const PORT = config.port; // Берем порт из нашего конфига



// Подключаемся к базе данных
connectDB().then(() => {
  app.listen(PORT, async () => { // Делаем функцию асинхронной
    console.log(`Сервер запущен и слушает на порту ${PORT}`);
    console.log(`Для доступа к серверу используй: http://localhost:${PORT}`);
    console.log(`DB URI: ${config.db.uri}`);

    // Запускаем процесс обновления расписания после успешного запуска сервера
    // await processAndSaveSchedules();
    // await createUser()
  });
}).catch(err => {
  console.error('Не удалось запустить сервер из-за ошибки подключения к БД:', err);
  process.exit(1);
});
