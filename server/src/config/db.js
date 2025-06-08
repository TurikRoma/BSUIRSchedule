// server/src/config/db.js
import mongoose from 'mongoose'; // Импортируем библиотеку Mongoose
import {config} from './index.js'; // Импортируем наш файл конфигурации

// Асинхронная функция для подключения к базе данных
const connectDB = async () => {
  try {
    // Используем URI из нашего конфига
    const conn = await mongoose.connect(config.db.uri);

    console.log(`MongoDB подключена: ${conn.connection.host}`);
    return mongoose;
  } catch (error) {
    console.error(`Ошибка подключения к MongoDB: ${error.message}`);
    // Завершаем процесс Node.js с ошибкой
    process.exit(1);
  }
};

export default connectDB; // Экспортируем функцию подключения