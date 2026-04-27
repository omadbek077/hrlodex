const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const applicationController = require('../controllers/applicationController');
const sessionController = require('../controllers/sessionController');

// Ochiq endpointlar - token talab qilinmaydi

// Barcha ochiq ishlar (Jobs bo'limi)
router.get('/jobs', jobController.getPublicJobs);

// Ishni token orqali olish (intervyu linki uchun)
router.get('/jobs/token/:token', jobController.getPublicJobByToken);

// Bitta ish id bo'yicha (ariza formasi uchun)
router.get('/jobs/:jobId', jobController.getPublicJobById);

// Taklif kodini tekshirish
router.post('/validate-invite', jobController.validateInviteCode);

// Ishga ariza yuborish (nomzodlar uchun)
router.post('/jobs/:jobId/apply', applicationController.applyToJob);

// Intervyu sessiyasini boshlash (body: jobId, applicationId?, code?, language?)
router.post('/sessions/start', sessionController.startSession);

// Sessiyani tugatish (javoblar yuboriladi)
router.patch('/sessions/:id/complete', sessionController.completeSession);

// Intervyu yozuvini yuklash (nomzod tomonidan)
router.post('/sessions/:id/recording', sessionController.uploadRecordingFile, sessionController.uploadRecording);

module.exports = router;
