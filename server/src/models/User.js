// models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'; // Импортируем bcrypt для хеширования паролей

const UserSchema = new mongoose.Schema({
    id:{
        type: Number
    },
  name: { // Добавляем поле для имени пользователя (не путать с username/login)
    type: String,
    required: true,
    trim: true,
    minlength: 2 // Минимальная длина имени
  },
  email: { // Используем email как уникальный логин
    type: String,
    required: true,
    unique: true, // Email должен быть уникальным для каждого пользователя
    trim: true,
    lowercase: true, // Храним email в нижнем регистре для удобства сравнения
    match: /^\S+@\S+\.\S+$/ // Простая валидация формата email
  },
  password: { // Пароль, будет храниться в хешированном виде
    type: String,
    required: true,
    minlength: 6
  },
  refreshToken: { // Пароль, будет храниться в хешированном виде
    type: String,
  },
  favoriteAuditories: [{ // Массив для хранения избранных аудиторий
    type: String, // Предполагаем, что это будет массив строк с названиями аудиторий
    trim: true
  }],
  // Можно добавить другие поля, например для ролей, если понадобится в будущем
  // role: {
  //   type: String,
  //   enum: ['user', 'admin'],
  //   default: 'user'
  // }
}, {
  timestamps: true // Добавляет поля createdAt и updatedAt автоматически
});

// --- Хук Mongoose: Хеширование пароля перед сохранением ---

// --- Метод для сравнения введенного пароля с хешированным ---
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', UserSchema);

export default User;