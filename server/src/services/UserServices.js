import User from "../models/User.js";



// Дождись подключения к БД (может занять секунду)
// Затем создай пользователя
export async function createUser() {
  try {
    const newUser = new User({
      name: 'Тестовый Пользователь',
      email: 'test@example.com',
      password: 'password123' // Пароль будет автоматически хеширован
    });
    const savedUser = await newUser.save();
  } catch (error) {
    console.error('Ошибка при создании пользователя:', error.message);
  } finally {
    // process.exit(); // Выйти из Node.js консоли после создания
  }
}
