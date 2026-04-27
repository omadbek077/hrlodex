const mongoose = require('mongoose');

const resumeAnalysisSchema = new mongoose.Schema({
  skillsScore: { type: Number },
  experienceScore: { type: Number },
  relevanceScore: { type: Number },
  overallScore: { type: Number },
  detectedSkills: [{ type: String }],
  summary: { type: String },
  suitabilityLabel: { type: String, enum: ['High', 'Medium', 'Low'] },
}, { _id: false });

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: '' },
  experienceYears: { type: Number, default: 0 },
  resumeFileName: { type: String, default: '' },
  resumeMimeType: { type: String, default: '' },
  resumeBase64: { type: String, default: '' },
  analysis: resumeAnalysisSchema,
  status: {
    type: String,
    enum: ['Applied', 'Screened', 'Interviewing', 'Completed', 'Rejected'],
    default: 'Applied',
  },
}, { timestamps: true });

applicationSchema.index({ job: 1 });
applicationSchema.index({ email: 1, job: 1 });

module.exports = mongoose.model('Application', applicationSchema);
