const mongoose = require('mongoose');

const verificationCodeSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  code: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 6,
  },
  type: {
    type: String,
    enum: ['register', 'login', 'reset-password'],
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 60 * 1000), // 1 daqiqa
  },
}, {
  timestamps: true,
});

// Muddati o'tgan kodlarni avtomatik o'chirish
verificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Bir xil email va type uchun faqat bitta kod bo'lishi kerak
verificationCodeSchema.index({ email: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('VerificationCode', verificationCodeSchema);
