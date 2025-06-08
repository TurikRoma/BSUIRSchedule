// models/AuditorySchedule.js
import mongoose from 'mongoose';

const scheduleEntrySchema = new mongoose.Schema({
  weekNumbers: [Number],
  startLessonTime: String,
  endLessonTime: String,
  subject: String,
  lessonTypeAbbrev: String,
  note: String,
  employees: [{
    firstName: String,
    lastName: String,
    middleName: String,
    id: Number,
  }],
  studentGroups: [{
    name: String,
    id: Number,
  }],
  numSubgroup: { type: Number, default: 0 } // <-- Добавили это поле
});

const dayScheduleSchema = new mongoose.Schema({
  day: String,
  lessons: [scheduleEntrySchema]
});

const auditoryScheduleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  schedule: [dayScheduleSchema]
});

const AuditorySchedule = mongoose.model('AuditorySchedule', auditoryScheduleSchema);

export default AuditorySchedule;