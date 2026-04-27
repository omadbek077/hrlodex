const mongoose = require('mongoose');
const crypto = require('crypto');

const questionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  category: { type: String, required: true },
  answerType: { type: String, enum: ['TEXT', 'VIDEO', 'VOICE'], required: true },
  difficulty: { type: String, required: true },
});

const jobSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: { type: String, required: true },
  department: { type: String, default: 'IT' },
  role: { type: String, required: true },
  description: { type: String, required: true },
  experienceLevel: {
    type: String,
    enum: ['Junior', 'Mid', 'Senior', 'Lead'],
    default: 'Mid',
  },
  requiredSkills: [{ type: String }],
  interviewType: {
    type: String,
    enum: ['TEXT', 'VIDEO', 'VOICE'],
    default: 'VOICE',
  },
  interviewCategory: {
    type: String,
    enum: ['TECHNICAL', 'CAREER', 'ACADEMIC'],
    default: 'TECHNICAL',
  },
  interviewMode: {
    type: String,
    enum: ['ASYNC', 'SCHEDULED', 'INSTANT'],
    default: 'INSTANT',
  },
  visibility: {
    type: String,
    enum: ['PUBLIC', 'PRIVATE'],
    default: 'PUBLIC',
  },
  sourceLanguage: {
    type: String,
    enum: ['en', 'ru', 'uz'],
    default: 'ru',
  },
  resumeRequired: { type: Boolean, default: true },
  questions: [questionSchema],
  deadline: { type: Date },
  startTime: { type: Date },
  endTime: { type: Date },
  status: {
    type: String,
    enum: ['Active', 'Paused', 'Archived', 'Closed'],
    default: 'Active',
  },
  shareToken: { type: String },
  inviteCode: { type: String },
}, { timestamps: true });

jobSchema.pre('save', function (next) {
  if (!this.shareToken) {
    this.shareToken = crypto.randomBytes(12).toString('hex');
  }
  if (!this.inviteCode) {
    this.inviteCode = 'INV-' + crypto.randomBytes(2).toString('hex').toUpperCase();
  }
  next();
});

jobSchema.index({ createdBy: 1 });
jobSchema.index({ status: 1, visibility: 1 });
jobSchema.index({ shareToken: 1 }, { unique: true });
jobSchema.index({ inviteCode: 1 });

module.exports = mongoose.model('Job', jobSchema);
