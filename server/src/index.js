require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const chatRoutes = require('./routes/chatRoutes');
const publicRoutes = require('./routes/publicRoutes');
const tariffRoutes = require('./routes/tariffRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const profileRoutes = require('./routes/profileRoutes');
const { seedDefaultTariffs } = require('./config/seedTariffs');
const requestLogger = require('./middlewares/requestLogger');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

seedDefaultTariffs().catch((error) => {
  logger.error('Default tariffs seeding failed', { error: error.message });
});

app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/tariffs', tariffRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/profile', profileRoutes);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'HR Lodex Backend API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      jobs: '/api/jobs',
      applications: '/api/applications',
      sessions: '/api/sessions',
      chat: '/api/chat',
      public: '/api/public',
      tariffs: '/api/tariffs',
      payments: '/api/payments',
      profile: '/api/profile',
    },
  });
});

app.listen(PORT, () => {
  logger.info(`Server ${PORT} portda ishlayapti`);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', { reason: reason?.message || reason });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error: error?.message, stack: error?.stack });
});
