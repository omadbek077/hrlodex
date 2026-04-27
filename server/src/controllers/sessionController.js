const InterviewSession = require('../models/InterviewSession');
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const { createErrorResponse } = require('../utils/errorMessages');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const { sessionToResponse } = require('../utils/transform');
const geminiService = require('../utils/geminiService');

const RECORDINGS_DIR = path.join(__dirname, '../../uploads/recordings');
if (!fs.existsSync(RECORDINGS_DIR)) {
  fs.mkdirSync(RECORDINGS_DIR, { recursive: true });
}

const recordingStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(RECORDINGS_DIR)) fs.mkdirSync(RECORDINGS_DIR, { recursive: true });
    cb(null, RECORDINGS_DIR);
  },
  filename: (req, file, cb) => cb(null, (req.params.id || '') + '.webm'),
});
const uploadRecordingFile = multer({
  storage: recordingStorage,
  limits: { fileSize: 500 * 1024 * 1024 },
}).single('recording');

// Optional auth - token bo'lsa user ni topadi, bo'lmasa null
const getOptionalUser = async (req) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return null;

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'hr-lodex-secret-key-2024'
    );
    const user = await User.findById(decoded.id);
    return user;
  } catch (error) {
    return null;
  }
};

exports.startSession = async (req, res) => {
  try {
    const { jobId, applicationId, code } = req.body;

    let job;
    if (code && (code + '').trim()) {
      const cleanCode = (code + '').trim();
      job = await Job.findOne({
        $or: [{ inviteCode: cleanCode }, { shareToken: cleanCode }],
        status: 'Active',
      });
    } else if (jobId) {
      job = await Job.findOne({ _id: jobId, status: 'Active' });
    }

    if (!job) {
      return res.status(404).json(createErrorResponse(req, 'JOB_INACTIVE', 404));
    }

    // Credits tekshiruvi - faqat HR (employer) role uchun
    const user = await getOptionalUser(req);
    if (user && user.role === 'employer') {
      const userInterviews = user.interviews || 0;
      if (userInterviews < 1) {
        return res.status(402).json(createErrorResponse(req, 'SESSION_INSUFFICIENT_CREDITS', 402, {
          requiresPayment: true,
          interviews: userInterviews,
        }));
      }

      // 1 suhbat ishlatiladi
      user.interviews = userInterviews - 1;
      await user.save();
    }

    const candidateId = 'CAND-' + crypto.randomBytes(3).toString('hex').toUpperCase();
    const candidateName = (req.body.candidateName && String(req.body.candidateName).trim()) || null;

    let application = null;
    if (applicationId) {
      application = await Application.findOne({
        _id: applicationId,
        job: job._id,
      });
      if (application) {
        application.status = 'Interviewing';
        await application.save();
      }
    }

    const session = await InterviewSession.create({
      job: job._id,
      application: application?._id,
      candidateId,
      candidateName,
      status: 'Started',
      answers: [],
      language: req.body.language || 'ru',
    });

    res.status(201).json({
      success: true,
      data: sessionToResponse(session),
      interviewsRemaining: user && user.role === 'employer' ? user.interviews : null,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.completeSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers, skipAiEvaluation } = req.body;

    const session = await InterviewSession.findById(id).populate('job');
    if (!session) {
      return res.status(404).json({ success: false, message: 'Sessiya topilmadi' });
    }

    // Javoblar mavjud bo'lsa, AI baholash qilish
    if (answers && Array.isArray(answers)) {
      session.answers = answers;
    }
    if (answers && Array.isArray(answers) && answers.length > 0 && !skipAiEvaluation) {
      try {
        const formattedAnswers = answers.map(a => ({
          questionId: a.questionId,
          questionText: a.questionText,
          answerText: a.text || a.answerText || ''
        }));

        const { evaluation, gradedAnswers } = await geminiService.evaluateInterview(
          session.job?.title || 'Unknown Position',
          formattedAnswers,
          session.language || 'ru'
        );

        session.answers = gradedAnswers;
        session.evaluation = evaluation;
      } catch (aiError) {
        console.error('AI evaluation failed:', aiError);
        session.answers = answers;
        const isQuotaError = aiError?.status === 429 || (aiError?.message && aiError.message.includes('429'));
        session.evaluation = {
          technicalScore: 0,
          communicationScore: 0,
          problemSolvingScore: 0,
          overallScore: 0,
          overallRecommendation: 'Maybe',
          summary: isQuotaError
            ? 'Evaluation could not be completed: Gemini API quota exceeded (429). Please try again later or check your API plan/billing. Answers were saved — you can review the transcript below.'
            : `Evaluation could not be completed: ${aiError?.message || 'AI error'}. Answers were saved.`,
          strengths: [],
          weaknesses: []
        };
      }
    } else if (!skipAiEvaluation) {
      // Javoblar bo'sh bo'lsa ham HR uchun placeholder evaluation (sessiya tugagan bo'lsin)
      session.evaluation = {
        technicalScore: 0,
        communicationScore: 0,
        problemSolvingScore: 0,
        overallScore: 0,
        overallRecommendation: 'Maybe',
        summary: 'No answers were recorded for this session. The candidate may have ended the interview before answering, or voice capture did not register.',
        strengths: [],
        weaknesses: []
      };
    }

    session.status = 'Completed';
    session.completedAt = new Date();
    await session.save();

    if (session.application) {
      await Application.findByIdAndUpdate(session.application, { status: 'Completed' });
    }

    res.status(200).json({
      success: true,
      data: sessionToResponse(session),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSessionsByJob = async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.jobId,
      createdBy: req.user._id,
    });
    if (!job) {
      return res.status(404).json(createErrorResponse(req, 'JOB_NOT_FOUND', 404));
    }

    const sessions = await InterviewSession.find({ job: job._id })
      .populate('application', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: sessions.map(s => sessionToResponse(s)),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSessionById = async (req, res) => {
  try {
    const session = await InterviewSession.findById(req.params.id).populate('job application');
    if (!session) {
      return res.status(404).json(createErrorResponse(req, 'SESSION_NOT_FOUND', 404));
    }
    res.status(200).json({
      success: true,
      data: sessionToResponse(session),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// HR uchun barcha sessiyalarni olish (barcha ishlar bo'yicha)
exports.getAllSessions = async (req, res) => {
  try {
    const { status, jobId } = req.query;
    const jobs = await Job.find({ createdBy: req.user._id }).select('_id');
    const jobIds = jobs.map(j => j._id);

    const filter = { job: { $in: jobIds } };
    if (status) filter.status = status;
    if (jobId) filter.job = jobId;

    const sessions = await InterviewSession.find(filter)
      .populate('job', 'title department status inviteCode')
      .populate('application', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: sessions.map(s => sessionToResponse(s)),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Nomzod intervyu yozuvini yuklash (ochiq – sessiya id orqali)
exports.uploadRecording = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file || !req.file.filename) {
      return res.status(400).json({ success: false, message: 'Recording fayl yuborilmadi' });
    }
    const session = await InterviewSession.findById(id);
    if (!session) {
      const p = path.join(RECORDINGS_DIR, req.file.filename);
      if (fs.existsSync(p)) fs.unlinkSync(p);
      return res.status(404).json({ success: false, message: 'Sessiya topilmadi' });
    }
    if (session.recordingPath) {
      const oldPath = path.join(RECORDINGS_DIR, session.recordingPath);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    session.recordingPath = req.file.filename;
    await session.save();
    res.status(200).json({ success: true, message: 'Recording saqlandi' });
  } catch (error) {
    if (req.file && req.file.filename) {
      const p = path.join(RECORDINGS_DIR, req.file.filename);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// HR uchun sessiya yozuvini olish (himoyalangan)
exports.uploadRecordingFile = uploadRecordingFile;

exports.getRecording = async (req, res) => {
  try {
    const jobs = await Job.find({ createdBy: req.user._id }).select('_id');
    const jobIds = jobs.map(j => j._id);
    const session = await InterviewSession.findOne({
      _id: req.params.id,
      job: { $in: jobIds },
      recordingPath: { $exists: true, $ne: null, $ne: '' }
    });
    if (!session || !session.recordingPath) {
      return res.status(404).json({ success: false, message: 'Recording topilmadi' });
    }
    const filePath = path.join(RECORDINGS_DIR, session.recordingPath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Fayl topilmadi' });
    }
    res.setHeader('Content-Type', 'video/webm');
    res.sendFile(path.resolve(filePath));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// HR: kandidatning barcha suhbatlari (oldingi intervyular va natijalar)
exports.getCandidateHistory = async (req, res) => {
  try {
    const { applicationId, sessionId } = req.query;
    const jobs = await Job.find({ createdBy: req.user._id }).select('_id');
    const jobIds = jobs.map(j => j._id);

    let sessions = [];

    if (applicationId) {
      const app = await Application.findOne({
        _id: applicationId,
        job: { $in: jobIds },
      }).lean();
      if (!app) {
        return res.status(404).json(createErrorResponse(req, 'NOT_FOUND', 404));
      }
      const candidateEmail = (app.email || '').trim().toLowerCase();
      const appIds = await Application.find({
        job: { $in: jobIds },
        email: new RegExp(`^${candidateEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
      })
        .select('_id')
        .lean();
      const ids = appIds.map(a => a._id);
      sessions = await InterviewSession.find({ application: { $in: ids } })
        .populate('job', 'title department')
        .populate('application', 'name email')
        .sort({ completedAt: -1, createdAt: -1 })
        .lean();
    } else if (sessionId) {
      const session = await InterviewSession.findOne({
        _id: sessionId,
        job: { $in: jobIds },
      }).lean();
      if (!session) {
        return res.status(404).json(createErrorResponse(req, 'NOT_FOUND', 404));
      }
      sessions = await InterviewSession.find({
        job: { $in: jobIds },
        candidateId: session.candidateId,
      })
        .populate('job', 'title department')
        .populate('application', 'name email')
        .sort({ completedAt: -1, createdAt: -1 })
        .lean();
    } else {
      return res.status(400).json({
        success: false,
        message: 'applicationId yoki sessionId kiritilishi shart',
      });
    }

    res.status(200).json({
      success: true,
      data: sessions.map(s => {
        const base = sessionToResponse(s);
        const job = s.job;
        return {
          ...base,
          jobTitle: job?.title,
          jobDepartment: job?.department,
        };
      }),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// HR uchun sessiya to'liq ma'lumotlari (javoblar va baholash bilan)
exports.getSessionDetails = async (req, res) => {
  try {
    const jobs = await Job.find({ createdBy: req.user._id }).select('_id');
    const jobIds = jobs.map(j => j._id);

    const session = await InterviewSession.findOne({
      _id: req.params.id,
      job: { $in: jobIds }
    })
      .populate('job')
      .populate('application');

    if (!session) {
      return res.status(404).json({ success: false, message: 'Sessiya topilmadi' });
    }

    const candidateName = (session.application && session.application.name)
      ? session.application.name
      : session.candidateId;
    // To'liq ma'lumotlar qaytarish
    const response = {
      id: session._id.toString(),
      candidateId: session.candidateId,
      candidateName,
      status: session.status,
      language: session.language,
      startedAt: session.createdAt,
      completedAt: session.completedAt,
      job: session.job ? {
        id: session.job._id.toString(),
        title: session.job.title,
        department: session.job.department,
        experienceLevel: session.job.experienceLevel,
        questions: session.job.questions
      } : null,
      application: session.application ? {
        id: session.application._id.toString(),
        name: session.application.name,
        email: session.application.email,
        phone: session.application.phone,
        experienceYears: session.application.experienceYears,
        resumeFileName: session.application.resumeFileName,
        analysis: session.application.analysis
      } : null,
      answers: session.answers || [],
      evaluation: session.evaluation || null
    };

    res.status(200).json({ success: true, data: response });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// HR uchun statistika
exports.getStats = async (req, res) => {
  try {
    const jobs = await Job.find({ createdBy: req.user._id }).select('_id');
    const jobIds = jobs.map(j => j._id);

    const totalSessions = await InterviewSession.countDocuments({ job: { $in: jobIds } });
    const completedSessions = await InterviewSession.countDocuments({
      job: { $in: jobIds },
      status: 'Completed'
    });

    // O'rtacha ball
    const sessions = await InterviewSession.find({
      job: { $in: jobIds },
      status: 'Completed',
      'evaluation.overallScore': { $exists: true }
    }).select('evaluation.overallScore');

    const avgScore = sessions.length > 0
      ? sessions.reduce((sum, s) => sum + (s.evaluation?.overallScore || 0), 0) / sessions.length
      : 0;

    // Recommendation bo'yicha statistika
    const recommendations = await InterviewSession.aggregate([
      { $match: { job: { $in: jobIds }, status: 'Completed' } },
      { $group: { _id: '$evaluation.overallRecommendation', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalSessions,
        completedSessions,
        pendingSessions: totalSessions - completedSessions,
        averageScore: Math.round(avgScore * 10) / 10,
        recommendations: recommendations.reduce((acc, r) => {
          if (r._id) acc[r._id] = r.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
