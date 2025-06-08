import dotenv from 'dotenv'; // Используем import
dotenv.config(); // Загружаем переменные окружения

console.log(process.env.DB_URI);

export const config = {
  // Настройки сервера
  port: process.env.PORT || 5000, // Порт, на котором будет работать сервер.
                                  // Используем 5000, если PORT не задан в .env

  // Настройки базы данных (MongoDB)
  db: {
    uri: process.env.DB_URI || 'mongodb://localhost:27017/myproject_dev', // URI для подключения к БД
  },
  universityApi:{
    baseUrl: process.env.UNIVERSITY_API_BASE_URL
  },
  // Настройки безопасности (JWT)
 
  // Настройки CORS (могут быть более сложными, чем просто true)
  cors: {
    origin: process.env.CORS_ORIGIN || '*', // Разрешенные домены для запросов.
                                            // '*' означает все домены (для разработки удобно, но для продакшена опасно!)
  },

  jwt_secret: process.env.JWT_SECRET

  // Другие настройки...
};

