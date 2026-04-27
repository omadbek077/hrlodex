const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  questionText: { type: String, required: true },
  text: { type: String, required: true },
  score: { type: Number },
  feedback: { type: String },
  timestamp: { type: Date, default: Date.now },
  isFollowUp: { type: Boolean, default: false },
}, { _id: false });

const evaluationSchema = new mongoose.Schema({
  technicalScore: { type: Number },
  communicationScore: { type: Number },
  problemSolvingScore: { type: Number },
  overallScore: { type: Number },
  overallRecommendation: { type: String },
  summary: { type: String },
  strengths: [{ type: String }],
  weaknesses: [{ type: String }],
}, { _id: false });

const sessionSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    default: null,
  },
  candidateId: { type: String, required: true },
  /** Ism-familiya (tizimga kirgan nomzod uchun, ariza bo‘lmaganda) */
  candidateName: { type: String, default: null },
  status: {
    type: String,
    enum: ['Not Started', 'Started', 'In Progress', 'Completed', 'Terminated'],
    default: 'Started',
  },
  answers: [answerSchema],
  evaluation: evaluationSchema,
  language: { type: String, enum: ['en', 'ru', 'uz'], default: 'ru' },
  completedAt: { type: Date },
  recordingPath: { type: String, default: null },
}, { timestamps: true });

sessionSchema.index({ job: 1 });
sessionSchema.index({ application: 1 });

module.exports = mongoose.model('InterviewSession', sessionSchema);
