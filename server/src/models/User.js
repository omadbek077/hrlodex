const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Kandidat profilida: o'qigan joylar
const educationSchema = new mongoose.Schema({
  institution: { type: String, trim: true, default: '' },
  degree: { type: String, trim: true, default: '' },
  field: { type: String, trim: true, default: '' },
  startYear: { type: Number, default: null },
  endYear: { type: Number, default: null },
  description: { type: String, trim: true, default: '' },
}, { _id: true });

// Kandidat profilida: ish tajribalari
const workExperienceSchema = new mongoose.Schema({
  company: { type: String, trim: true, default: '' },
  position: { type: String, trim: true, default: '' },
  startYear: { type: Number, default: null },
  startMonth: { type: Number, default: null },
  endYear: { type: Number, default: null },
  endMonth: { type: Number, default: null },
  current: { type: Boolean, default: false },
  description: { type: String, trim: true, default: '' },
}, { _id: true });

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "To'liq ism kiritilishi shart"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Elektron pochta kiritilishi shart'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'To\'g\'ri elektron pochta kiriting'],
  },
  password: {
    type: String,
    required: [true, 'Parol kiritilishi shart'],
    minlength: [6, 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak'],
    select: false,
  },
  role: {
    type: String,
    enum: ['employer', 'candidate', 'admin', null],
    default: null,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  interviews: {
    type: Number,
    default: 0,
    min: 0,
  },
  freeJobsUsed: {
    type: Number,
    default: 0,
    min: 0,
  },
  // ——— Profil (asosan kandidat uchun) ———
  avatar: { type: String, default: null }, // base64 yoki URL
  dateOfBirth: { type: Date, default: null },
  address: { type: String, trim: true, default: '' },
  gender: { type: String, enum: ['male', 'female', 'other', ''], default: '' },
  education: [educationSchema],
  workExperience: [workExperienceSchema],
}, {
  timestamps: true,
});

// Parolni saqlashdan oldin hash qilish
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
