
import "./index.css"

import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  Sparkles, 
  Terminal, 
  Activity, 
  ArrowLeft,
  ArrowRight, 
  KeyRound, 
  Search, 
  Globe, 
  Lock, 
  MoreVertical, 
  Edit3, 
  Pause, 
  Play, 
  Archive, 
  Trash2,
  Users,
  CheckCircle2,
  BarChart2,
  Languages,
  Fingerprint,
  Loader2,
  ShieldCheck,
  Trophy,
  Home,
  Copy,
  Check,
  Video,
  AlertTriangle,
  Briefcase,
  Sun,
  Moon,
  LayoutDashboard,
  XCircle,
  Share2,
  AlertCircle,
  ShoppingCart
} from 'lucide-react';
import { User, UserRole, Job, InterviewSession, InterviewType, InterviewMode, JobVisibility, JobStatus, Language, InterviewCategory, CandidateApplication, ChatMessage } from './types';
import * as authApi from './services/authService';
import * as jobsService from './services/jobsService';
import * as applicationsService from './services/applicationsService';
import * as sessionsService from './services/sessionsService';
import * as chatService from './services/chatService';
import * as publicService from './services/publicService';
import * as profileService from './services/profileService';
import Layout from './components/Layout';
import { buildCopyText } from './utils/copyLinkText';
import Landing from './views/Landing';
import Auth from './views/Auth';
import HRDashboard from './views/HR/Dashboard';
import HRAnalytics from './views/HR/Analytics';
import CreateJob from './views/HR/CreateJob';
import InterviewRoom from './views/Candidate/InterviewRoom';
import ApplicationForm from './views/Candidate/ApplicationForm';
import AdminDashboard from './views/Admin/Dashboard';
import Tariffs from './views/Admin/Tariffs';
import Payments from './views/Admin/Payments';
import PaymentPage from './views/Candidate/PaymentPage';
import Profile from './views/Candidate/Profile';
import MyApplications from './views/Candidate/MyApplications';
import Jobs from './views/Jobs';
import CandidateProfileView from './views/HR/CandidateProfileView';

export const UI_STRINGS: Record<Language, any> = {
  [Language.RU]: {
    common: {
      logout: "Выйти",
      loading: "Загрузка...",
      error: "Ошибка",
      save: "Сохранить",
      back: "Назад",
      next: "Далее",
      cancel: "Отмена",
      delete: "Удалить",
      active: "Активен",
      paused: "Приостановлен",
      archived: "В архиве",
      public: "Публичный",
      private: "Приватный",
      started: "Начато",
      completed: "Завершено",
      share: "Поделиться",
      edit: "Изменить",
      closed: "Закрыто",
      backToHome: "На главную",
      lightMode: "Светлая тема",
      darkMode: "Темная тема"
    },
    validation: {
      titleRequired: "Название вакансии обязательно",
      descRequired: "Описание вакансии обязательно",
      skillsRequired: "Укажите хотя бы один навык",
      summaryError: "Пожалуйста, заполните все обязательные поля перед генерацией."
    },
    landing: {
      heroTitle: "Найм на основе ИИ с HR LODEX — AI recruitment platform",
      heroSub: "Отбирайте кандидатов быстрее с помощью видеоинтервью с ИИ, автоматической оценки ответов и умного анализа резюме — все на платформе HR LODEX для Uzbekistan jobs.",
      forEmployers: "Для работодателей",
      login: "Войти",
      startInterview: "Начать интервью",
      goToDashboard: "В панель управления",
      howItWorksTitle: "Как это работает",
      howItWorksSub: "Умный найм в 4 простых шага с нашей AI recruitment platform.",
      step1: "Создайте вакансию или форму",
      step1Desc: "HR создает ИИ-интервью или форму заявки в HR LODEX за считанные минуты.",
      step2: "Поделитесь ссылкой",
      step2Desc: "Отправьте приватную или публичную ссылку кандидатам.",
      step3: "ИИ проводит скрининг",
      step3Desc: "ИИ задает вопросы, анализирует ответы и автоматически проверяет резюме.",
      step4: "Обзор и выбор",
      step4Desc: "HR просматривает видео, проверяет оценки ИИ и выбирает лучших.",
      featuresTitle: "Ключевые особенности",
      f1: "Видео и голосовые ИИ-интервью",
      f1Desc: "Проводите AI интервью, где video interview AI задает вопросы по вакансии.",
      f2: "Автоматическая оценка ответов",
      f2Desc: "ИИ оценивает каждый ответ на основе релевантности и ясности.",
      f3: "Умный анализ резюме",
      f3Desc: "Загруженные CV анализируются с помощью CV analysis AI и ранжируются автоматически.",
      f4: "Мультиязычная платформа",
      f4Desc: "Полная поддержка английского, русского и узбекского языков.",
      f5: "Рейтинг кандидатов",
      f5Desc: "Лучшие кандидаты появляются первыми на основе баллов ИИ.",
      f6: "Приватные и публичные интервью",
      f6Desc: "Приглашайте конкретных людей или откройте доступ для всех.",
      employersTitle: "Для работодателей",
      employersSub: "Нанимайте быстрее с HR LODEX.",
      empPoint1: "Сократите время ручного скрининга",
      empPoint2: "Автоматически оценивайте кандидатов",
      empPoint3: "Смотрите записи интервью в любое время",
      empPoint4: "Сравнивайте апликантов по баллам ИИ",
      empPoint5: "Управляйте всем из одной панели",
      empBtn: "Создать ИИ-интервью",
      candidatesTitle: "Для кандидатов",
      candidatesSub: "Простой и современный опыт интервью",
      candPoint1: "Присоединяйтесь по безопасной ссылке",
      candPoint2: "Естественное общение с ИИ-интервьюером",
      candPoint3: "Отвечайте на вопросы на удобном языке",
      candPoint4: "Никаких сложных форм или долгих процессов",
      candBtn: "Ввести код интервью",
      whyAiTitle: "Почему HR LODEX?",
      whyAiSub: "Традиционный найм требует времени. ИИ помогает вам:",
      whyPoint1: "Проверять больше кандидатов за меньшее время",
      whyPoint2: "Принимать решения на основе данных",
      whyPoint3: "Обеспечить последовательную и честную оценку",
      whyPoint4: "Фокусироваться только на лучших талантах",
      securityTitle: "Безопасность и честность",
      securitySub: "Мы серьезно относимся к конфиденциальности.",
      secPoint1: "Безопасное хранение данных",
      secPoint2: "Защита информации кандидатов",
      secPoint3: "ИИ без предвзятости",
      secPoint4: "Полный контроль HR за решениями",
      ctaTitle: "Готовы трансформировать найм?",
      ctaSub: "Используйте HR LODEX, чтобы найти нужных людей — быстрее и умнее.",
      footerDesc: "Будущее интеллектуального рекрутинга. HR LODEX от Lochinbek Dehqonov экономит сотни часов на отборе талантов."
    },
    jobs: {
      title: "IT vakansiyalar",
      sub: "Ищите IT jobs Uzbekistan и developer jobs Uzbekistan. Выберите подходящую vakansiya и отправьте заявку.",
      empty: "Пока нет открытых вакансий.",
      apply: "Подать заявку",
      department: "Отдел",
      experience: "Опыт",
      deadline: "Срок",
      backToHome: "На главную"
    },
    auth: {
      title: "HR LODEX",
      subtitle: "Будущее интеллектуального рекрутинга",
      login: "Вход",
      register: "Регистрация",
      fullName: "Полное имя",
      email: "Email адрес",
      password: "Пароль",
      confirmPassword: "Подтвердите пароль",
      roleLabel: "Я...",
      employer: "Работодатель",
      candidate: "Кандидат",
      submitLogin: "Войти",
      submitRegister: "Создать аккаунт",
      forgotPassword: "Забыли пароль?",
      forgotPasswordTitle: "Восстановление пароля",
      forgotPasswordDesc: "Введите ваш email адрес. Мы отправим код для восстановления пароля.",
      resetPasswordTitle: "Создайте новый пароль",
      resetPasswordDesc: "Введите код из email и новый пароль",
      resetCode: "Код восстановления",
      newPassword: "Новый пароль",
      confirmNewPassword: "Подтвердите новый пароль",
      resetPassword: "Сбросить пароль",
      backToLogin: "Вернуться к входу",
      passwordMismatch: "Пароли не совпадают"
    },
    hr: {
      dashboard: "Панель управления",
      myJobs: "Мои вакансии",
      createJob: "Создать вакансию",
      analytics: "Аналитика",
      activeJobs: "Активные вакансии",
      totalCandidates: "Всего кандидатов",
      avgScore: "Средний балл",
      latestEvaluations: "Последние оценки",
      copyLink: "Копировать ссылку",
      copied: "Скопировано!",
      jobDetails: "Детали вакансии",
      interviewDesign: "Дизайн интервью",
      generateQuestions: "Сгенерировать вопросы ИИ",
      finalizeLaunch: "Запустить интервью",
      manageJobs: "Управление вакансиями",
      deleteForever: "Удалить навсегда",
      archive: "Архивировать",
      pause: "Приостановить",
      resume: "Возоновить",
      categories: {
        technical: "Техническое",
        career: "Карьерное",
        academic: "Академическое"
      },
      createJobForm: {
        title: "Создать вакансию",
        jobTitleLabel: "Название вакансии",
        jobTitleHelper: "Должность, на которую вы нанимаете",
        jobDescLabel: "Описание вакансии (Контекст ИИ)",
        jobDescHelper: "Подробное описание обязанностей и ожидаций",
        skillsLabel: "Требуемые навыки",
        skillsHelper: "Основные навыки, которыми должен обладать кандидат",
        numQuestionsLabel: "Количество вопросов",
        numQuestionsHelper: "Сколько вопросов ИИ должен задать кандидату",
        experienceLabel: "Уровень опыта",
        experienceHelper: "Требуемый уровень профессионализма",
        langLabel: "Язык интервью",
        focusLabel: "Направление интервью",
        generateBtn: "Сгенерировать профиль интервью",
        generateHelper: "ИИ автоматически создаст вопросы для интервью на основе вакансии",
        saveBtn: "Запустить интервью",
        saveHelper: "Сохранить вакансию и сделать её доступной для интервью",
        analyzing: "Анализ контекста...",
        step: "Шаг",
        of: "из",
        details: "Детали",
        design: "Дизайн",
        reviewTitle: "Просмотр умных вопросов",
        reviewSub: "ИИ оптимизировал их для этой роли",
        techMastery: "Техническое мастерство",
        cultureProjects: "Культура и проекты",
        theoryDepth: "Теория и глубина",
        addQuestionBtn: "Добавить вопрос",
        saveQuestionBtn: "Сохранить",
        newQuestionPlaceholder: "Введите текст вопроса здесь...",
        questionListTitle: "Список вопросов",
        directions: {
          technical: {
            title: "Техническое интервью",
            desc: "Оценивает технические знания кандидата, навыки решения задач и практический опыт."
          },
          behavioral: {
            title: "Поведенческое интервью",
            desc: "Оценивает стиль общения, работу в команде, ответственность и поведение в рабочих ситуациях."
          },
          hr: {
            title: "HR интервью",
            desc: "Включает мотивацию, карьерные цели, личностные качества и соответствие компании."
          }
        }
      },
      hiringDashboardTitle: "Панель найма HR LODEX",
      hiringDashboardSub: "ИИ-скрининг и интеллектуальное ранжирование кандидатов.",
      launchJob: "Запустить вакансию",
      recruitmentChannels: "Каналы рекрутинга",
      activePositionsCount: "Активных позиций",
      pipelineTitle: "Пайплайн кандидатов",
      filterByVacancy: "Вакансия",
      allVacancies: "Все вакансии",
      statsJobs: "Вакансий",
      statsInterviews: "Интервью",
      statsPassedWell: "Хорошо прошли",
      statsPassedPoorly: "Плохо прошли",
      statsAverage: "Средне",
      availableVacancies: "Доступные вакансии",
      selectVacancyHint: "Выберите вакансию — отобразятся кандидаты по этой позиции.",
      noVacanciesHint: "Нет вакансий. Создайте вакансию.",
      noCandidatesForJob: "По этой вакансии пока нет кандидатов.",
      tableCandidate: "Кандидат",
      tableStage: "Этап",
      tableResult: "Результат",
      tableInterview: "Интервью",
      statusAlo: "Отлично",
      statusYaxshi: "Хорошо",
      statusOrta: "Средне",
      statusYomon: "Плохо",
      tableActions: "Действия",
      profileAnalysis: "Анализ",
      profileInterview: "Интервью",
      profileChat: "Чат",
      profileRecording: "Запись интервью",
      scoreMatrix: "Матрица оценок",
      detectedSkills: "Выявленные навыки",
      closeDossier: "Закрыть досье",
      viewProfile: "Посмотреть профиль",
      chatPlaceholder: "Напишите сообщение кандидату...",
      formLink: "Ссылка на форму",
      liveRoom: "Live комната",
      statusLabel: "Статус",
      skillsMatch: "Соответствие навыков",
      relevance: "Релевантность",
      interviewPending: "Интервью ожидается",
      chatEmptyState: "Отправляйте инструкции или обновления статуса кандидату.",
      inviteCodeLabel: "Код инвайта",
      copyBlockFormTitle: "Ссылка на форму заявки",
      copyBlockInterviewTitle: "Ссылка на интервью",
      copyBlockInviteCode: "Код инвайта",
      copyBlockJob: "Вакансия",
      unknownPosition: "Неизвестная позиция",
      scoreLabel: "Балл",
      freeJobsRemaining: "Бесплатных вакансий осталось",
      freeJobsUsed: "Бесплатных вакансий использовано",
      freeTierTitle: "Бесплатный план",
      freeTierDesc: "Первые 3 вакансии бесплатны",
      creditsRequired: "Требуются собеседования",
      creditsRequiredDesc: "Бесплатные вакансии закончились. Для создания новых вакансий нужны собеседования.",
      technical: "Техническое",
      communication: "Коммуникация",
      overall: "Общее",
      strengths: "Сильные стороны",
      weaknesses: "Слабые стороны",
      strengthsWeaknesses: "Сильные стороны / Слабые стороны",
      interviewNotCompleted: "Интервью не завершено. Кандидат должен нажать кнопку \"Завершить интервью\". После этого появится оценка ИИ.",
      noEvaluation: "Оценки нет. После завершения интервью ИИ-анализ будет создан автоматически.",
      recordingNotLoaded: "Запись не загружена",
      questionLabel: "В:",
      answerLabel: "О:",
      previousInterviews: "Предыдущие собеседования",
      loading: "Загрузка…",
      noPreviousInterviews: "Нет предыдущих собеседований.",
      vacancyColumn: "Вакансия",
      dateColumn: "Дата",
      resultColumn: "Результат",
      statusColumn: "Статус",
      recommendationStrongHire: "Сильный найм",
      recommendationHire: "Нанять",
      recommendationMaybe: "Возможно",
      recommendationReject: "Отклонить",
      statusCompleted: "Завершено",
      statusStarted: "Начато",
      statusInProgress: "В процессе",
      statusNotStarted: "Не начато",
      statusTerminated: "Прервано"
    },
    admin: {
      title: "Админ-панель HR LODEX",
      stats: "Статистика платформы",
      hrAccounts: "HR аккаунты",
      totalInterviews: "Всего интервью",
      totalCandidates: "Всего кандидатов",
      visitors: "Посетители",
      settings: "Настройки аккаунта",
      changeEmail: "Изменить Email",
      changePass: "Изменить пароль",
      updateBtn: "Обновить данные"
    },
    candidate: {
      profile: "Профиль",
      profileTitle: "Мой профиль",
      profileDesc: "Управление данными аккаунта",
      nameLabel: "Имя",
      emailLabel: "Email",
      roleLabel: "Роль",
      interviewsLabel: "Доступно собеседований",
      saveProfile: "Сохранить изменения",
      profileSaved: "Данные сохранены.",
      emailReadOnlyHint: "Для смены email обратитесь в поддержку.",
      avatarLabel: "Фото",
      dateOfBirthLabel: "Дата рождения",
      addressLabel: "Адрес",
      genderLabel: "Пол",
      educationLabel: "Образование",
      workExperienceLabel: "Опыт работы",
      editProfile: "Редактировать профиль",
      cancelEdit: "Отмена",
      addEducation: "Добавить образование",
      addWork: "Добавить опыт",
      companyLabel: "Компания",
      positionLabel: "Должность",
      institutionLabel: "Учебное заведение",
      degreeLabel: "Степень",
      fieldLabel: "Специальность",
      startYearLabel: "Год начала",
      endYearLabel: "Год окончания",
      currentJob: "По настоящее время",
      descriptionLabel: "Описание",
      genderMale: "Мужской",
      genderFemale: "Женский",
      genderOther: "Другое",
      monthLabel: "Месяц",
      profileLoadError: "Не удалось загрузить профиль",
      profileSaveError: "Не удалось сохранить изменения",
      addEducationAndWorkHint: "Нажмите «Редактировать профиль», чтобы добавить образование и опыт работы.",
      roleCandidate: "Кандидат",
      interviewsUnit: "собеседований",
      myApplications: "Поданные вакансии и результаты",
      myApplicationsTitle: "Мои заявки",
      myApplicationsDesc: "Вакансии, на которые вы откликнулись, и результаты оценки.",
      noApplications: "У вас пока нет заявок.",
      welcome: "Добро пожаловать в HR LODEX!",
      dashDesc: "Присоединяйтесь к интервью мгновенно.",
      placeholder: "Код инвайта или ссылка...",
      enterRoom: "Войти в комнату",
      joinTitle: "Присоединиться к интервью",
      joinDesc: "Вставьте ваш инвайт-код или ссылку, чтобы начать сессию с ИИ.",
      validateBtn: "Проверить и начать",
      recommended: "Рекомендуемые вакансии",
      startAssessment: "Начать оценку",
      quietPlace: "Найдите тихое место",
      enableMedia: "Включите камеру и микрофон",
      voiceSession: "Это голосовая сессия",
      instructions: "Инструкции:",
      idAssigned: "ID кандидата:",
      privateIdentityNotice: "Для этого приватного интервью вам был присвоен уникальный системный идентификатор.",
      validating: "Проверка ссылки...",
      identifying: "Идентификация кандидата...",
      startNow: "Начать интервью",
      congrats: "Интервью завершено!",
      finishMessage: "Ваши ответы успешно сохранены. Наш ИИ приступил к анализу вашей сессии.",
      returnDash: "Вернуться в панель",
      returnHome: "На главную",
      errorInactive: "Интервью больше не активно.",
      errorExpired: "Срок действия ссылки истек.",
      errorInvalid: "Неверная ссылка или код."
    }
  },
  [Language.EN]: {
    common: {
      logout: "Logout",
      loading: "Loading...",
      error: "Error",
      save: "Save",
      back: "Back",
      next: "Next",
      cancel: "Cancel",
      delete: "Delete",
      active: "Active",
      paused: "Paused",
      archived: "Archived",
      public: "Public",
      private: "Private",
      started: "Started",
      completed: "Completed",
      share: "Share",
      edit: "Edit",
      closed: "Closed",
      backToHome: "Back to Home",
      lightMode: "Light Mode",
      darkMode: "Dark Mode"
    },
    validation: {
      titleRequired: "Job Title is required",
      descRequired: "Job Description is required",
      skillsRequired: "Provide at least one skill",
      summaryError: "Please fill in all required fields before generating."
    },
    landing: {
      heroTitle: "AI-Powered Hiring with HR LODEX - online interview platform",
      heroSub: "Screen candidates faster with AI video interviews, automatic answer scoring, and CV analysis AI — all in HR LODEX.",
      forEmployers: "For Employers",
      login: "Login",
      startInterview: "Start Interview",
      goToDashboard: "Go to Dashboard",
      howItWorksTitle: "How It Works",
      howItWorksSub: "Smarter hiring in 4 simple steps on our AI recruitment platform.",
      step1: "Create a Job or Interview",
      step1Desc: "HR creates an AI interview or resume application form in HR LODEX in minutes.",
      step2: "Share the Link",
      step2Desc: "Send a private or public link to candidates.",
      step3: "AI Conducts the Screening",
      step3Desc: "AI asks questions, analyzes answers, and reviews resumes automatically.",
      step4: "Review & Select",
      step4Desc: "HR watches interview videos, checks AI scores, and selects the best.",
      featuresTitle: "Key Features of our platform",
      f1: "AI Video & Voice Interviews",
      f1Desc: "Conduct AI interviews where candidates speak naturally while video interview AI asks job-specific questions.",
      f2: "Automatic Answer Evaluation",
      f2Desc: "AI scores each answer based on relevance, clarity, and knowledge.",
      f3: "Smart Resume Analysis",
      f3Desc: "Uploaded CVs are processed with our CV analysis AI and ranked automatically.",
      f4: "Multilingual Platform",
      f4Desc: "Full support for English, Russian, and Uzbek.",
      f5: "Candidate Ranking",
      f5Desc: "Top candidates appear first based on AI scoring.",
      f6: "Private & Public Interviews",
      f6Desc: "Invite specific candidates or open interviews to everyone.",
      employersTitle: "For Employers",
      employersSub: "Hire faster with HR LODEX.",
      empPoint1: "Reduce manual screening time",
      empPoint2: "Automatically evaluate candidates",
      empPoint3: "Watch interview recordings anytime",
      empPoint4: "Compare applicants using AI scores",
      empPoint5: "Manage everything from one dashboard",
      empBtn: "Create an AI Interview",
      candidatesTitle: "For Candidates",
      candidatesSub: "A simple and modern interview experience",
      candPoint1: "Join using a secure link",
      candPoint2: "Speak naturally with an AI interviewer",
      candPoint3: "Answer questions in your preferred language",
      candPoint4: "No complicated forms or long processes",
      candBtn: "Enter Interview Link",
      whyAiTitle: "Why HR LODEX?",
      whyAiSub: "Traditional hiring takes time. AI helps you:",
      whyPoint1: "Screen more candidates in less time",
      whyPoint2: "Make data-driven hiring decisions",
      whyPoint3: "Ensure consistent and fair evaluations",
      whyPoint4: "Focus only on the best applicants",
      securityTitle: "Security & Fairness",
      securitySub: "We take privacy and fairness seriously.",
      secPoint1: "Secure data storage",
      secPoint2: "Candidate information protection",
      secPoint3: "AI designed for unbiased evaluation",
      secPoint4: "Full control for HR decision-making",
      ctaTitle: "Ready to transform your hiring?",
      ctaSub: "Use HR LODEX to find the right talent — faster and smarter.",
      footerDesc: "The future of intelligent recruitment. HR LODEX by Lochinbek Dehqonov scales your hiring for IT jobs Uzbekistan and programmer jobs Uzbekistan without losing quality."
    },
    jobs: {
      title: "IT Jobs Uzbekistan",
      sub: "Browse IT jobs in Uzbekistan, including developer jobs and the latest vakansiyalar, using smart filtering.",
      empty: "No open positions at the moment.",
      apply: "Apply",
      department: "Department",
      experience: "Experience",
      deadline: "Deadline",
      backToHome: "Back to Home"
    },
    auth: {
      title: "HR LODEX",
      subtitle: "The future of intelligent recruitment",
      login: "Login",
      register: "Register",
      fullName: "Full Name",
      email: "Email Address",
      password: "Password",
      confirmPassword: "Confirm Password",
      roleLabel: "I am an...",
      employer: "Employer",
      candidate: "Candidate",
      submitLogin: "Sign In",
      submitRegister: "Create Account",
      forgotPassword: "Forgot password?",
      forgotPasswordTitle: "Password Recovery",
      forgotPasswordDesc: "Enter your email address. We will send a code to reset your password.",
      resetPasswordTitle: "Create New Password",
      resetPasswordDesc: "Enter the code from email and your new password",
      resetCode: "Reset Code",
      newPassword: "New Password",
      confirmNewPassword: "Confirm New Password",
      resetPassword: "Reset Password",
      backToLogin: "Back to Login",
      passwordMismatch: "Passwords do not match"
    },
    hr: {
      dashboard: "Dashboard",
      myJobs: "My Jobs",
      createJob: "Create Job",
      analytics: "Analytics",
      activeJobs: "Active Jobs",
      totalCandidates: "Total Candidates",
      avgScore: "Avg. Score",
      latestEvaluations: "Latest Evaluations",
      copyLink: "Copy Link",
      copied: "Copied!",
      jobDetails: "Job Details",
      interviewDesign: "Interview Design",
      generateQuestions: "Generate AI Questions",
      finalizeLaunch: "Launch Interview",
      manageJobs: "Manage Job Positions",
      deleteForever: "Delete Forever",
      archive: "Archive Job",
      pause: "Pause Interview",
      resume: "Resume Interview",
      categories: {
        technical: "Technical",
        career: "Career",
        academic: "Academic"
      },
      createJobForm: {
        title: "Create Job",
        jobTitleLabel: "Job Title",
        jobTitleHelper: "The position you are hiring for",
        jobDescLabel: "Job Description (AI Context)",
        jobDescHelper: "Detailed explanation of responsibilities and expectations",
        skillsLabel: "Required Skills",
        skillsHelper: "Key skills the candidate must have",
        numQuestionsLabel: "Number of Questions",
        numQuestionsHelper: "How many AI interview questions should be generated",
        experienceLabel: "Experience Level",
        experienceHelper: "Required seniority level",
        langLabel: "Interview Language",
        focusLabel: "Interview Direction",
        generateBtn: "Generate AI Interview Profile",
        generateHelper: "AI will automatically create interview questions based on job details",
        saveBtn: "Launch Interview Gateway",
        saveHelper: "Save this job position and make it available for interviews",
        analyzing: "Analyzing Job Context...",
        step: "Step",
        of: "of",
        details: "Details",
        design: "Design",
        reviewTitle: "Review Smart Questions",
        reviewSub: "AI has optimized these for this role",
        techMastery: "Technical Mastery",
        cultureProjects: "Culture & Projects",
        theoryDepth: "Theory & Depth",
        addQuestionBtn: "Add Question",
        saveQuestionBtn: "Save Question",
        newQuestionPlaceholder: "Enter question text here...",
        questionListTitle: "Question List",
        directions: {
          technical: {
            title: "Technical Interview",
            desc: "Focuses on evaluating the candidate’s technical knowledge, problem-solving ability, and practical skills."
          },
          behavioral: {
            title: "Behavioral Interview",
            desc: "Evaluates communication style, teamwork, responsibility, and real-life work behavior."
          },
          hr: {
            title: "HR Interview",
            desc: "Covers motivation, career goals, personality fit, and overall suitability for the company."
          }
        }
      },
      hiringDashboardTitle: "HR LODEX Dashboard",
      hiringDashboardSub: "Our platform offers AI screening and resume analysis intelligence.",
      launchJob: "Launch Job",
      recruitmentChannels: "Recruitment Channels",
      activePositionsCount: "Active Positions",
      pipelineTitle: "Candidate Pipeline",
      filterByVacancy: "Vacancy",
      allVacancies: "All vacancies",
      statsJobs: "Jobs",
      statsInterviews: "Interviews",
      statsPassedWell: "Passed well",
      statsPassedPoorly: "Passed poorly",
      statsAverage: "Average",
      availableVacancies: "Available vacancies",
      selectVacancyHint: "Select a vacancy to see candidates for this position.",
      noVacanciesHint: "No vacancies. Create a job first.",
      noCandidatesForJob: "No candidates for this vacancy yet.",
      tableCandidate: "Candidate",
      tableStage: "Stage",
      tableResult: "Result",
      tableInterview: "Interview",
      statusAlo: "Excellent",
      statusYaxshi: "Good",
      statusOrta: "Average",
      statusYomon: "Poor",
      tableActions: "Actions",
      profileAnalysis: "Analysis",
      profileInterview: "Interview",
      profileChat: "Chat",
      profileRecording: "Interview recording",
      scoreMatrix: "Score Matrix",
      detectedSkills: "Detected Skills",
      closeDossier: "Close Dossier",
      viewProfile: "View Profile",
      chatPlaceholder: "Type a message to the candidate...",
      formLink: "Form Link",
      liveRoom: "Live Room",
      statusLabel: "Status",
      skillsMatch: "Skills Match",
      relevance: "Relevance",
      interviewPending: "Interview Pending",
      chatEmptyState: "Send instructions or status updates directly to the candidate.",
      inviteCodeLabel: "Invite Code",
      copyBlockFormTitle: "Application form link",
      copyBlockInterviewTitle: "Interview link",
      copyBlockInviteCode: "Invite code",
      copyBlockJob: "Job",
      unknownPosition: "Unknown Position",
      scoreLabel: "Score",
      freeJobsRemaining: "Free jobs remaining",
      freeJobsUsed: "Free jobs used",
      freeTierTitle: "Free Tier",
      freeTierDesc: "First 3 jobs are free",
      creditsRequired: "Interviews Required",
      creditsRequiredDesc: "Free jobs exhausted. Interviews needed to create new jobs.",
      technical: "Technical",
      communication: "Communication",
      overall: "Overall",
      strengths: "Strengths",
      weaknesses: "Weaknesses",
      strengthsWeaknesses: "Strengths / Weaknesses",
      interviewNotCompleted: "Interview not completed. Candidate must click \"Complete Interview\" button. AI evaluation will appear after that.",
      noEvaluation: "No evaluation. After interview completion, AI analysis will be created automatically.",
      recordingNotLoaded: "Recording not loaded",
      questionLabel: "Q:",
      answerLabel: "A:",
      previousInterviews: "Previous interviews",
      loading: "Loading…",
      noPreviousInterviews: "No previous interviews.",
      vacancyColumn: "Vacancy",
      dateColumn: "Date",
      resultColumn: "Result",
      statusColumn: "Status",
      recommendationStrongHire: "Strong Hire",
      recommendationHire: "Hire",
      recommendationMaybe: "Maybe",
      recommendationReject: "Reject",
      statusCompleted: "Completed",
      statusStarted: "Started",
      statusInProgress: "In Progress",
      statusNotStarted: "Not Started",
      statusTerminated: "Terminated"
    },
    admin: {
      title: "HR LODEX Admin",
      stats: "Platform Statistics",
      hrAccounts: "HR Accounts",
      totalInterviews: "Total Interviews",
      totalCandidates: "Total Candidates",
      visitors: "Visitors",
      settings: "Account Settings",
      changeEmail: "Change Email",
      changePass: "Change Password",
      updateBtn: "Update Account"
    },
    candidate: {
      profile: "Profile",
      profileTitle: "My Profile",
      profileDesc: "Manage your account details and explore dasturchi ish o‘rinlari (developer jobs) and vakansiyalar (vacancies).",
      nameLabel: "Name",
      emailLabel: "Email",
      roleLabel: "Role",
      interviewsLabel: "Interviews available",
      saveProfile: "Save changes",
      profileSaved: "Profile saved.",
      emailReadOnlyHint: "Contact support to change email.",
      avatarLabel: "Photo",
      dateOfBirthLabel: "Date of birth",
      addressLabel: "Address",
      genderLabel: "Gender",
      educationLabel: "Education",
      workExperienceLabel: "Work experience",
      editProfile: "Edit profile",
      cancelEdit: "Cancel",
      addEducation: "Add education",
      addWork: "Add experience",
      companyLabel: "Company",
      positionLabel: "Position",
      institutionLabel: "Institution",
      degreeLabel: "Degree",
      fieldLabel: "Field",
      startYearLabel: "Start year",
      endYearLabel: "End year",
      currentJob: "Present",
      descriptionLabel: "Description",
      genderMale: "Male",
      genderFemale: "Female",
      genderOther: "Other",
      monthLabel: "Month",
      profileLoadError: "Failed to load profile",
      profileSaveError: "Failed to save changes",
      addEducationAndWorkHint: "Click «Edit profile» to add education and work experience.",
      roleCandidate: "Candidate",
      interviewsUnit: "interviews",
      myApplications: "Submitted vacancies & results",
      myApplicationsTitle: "My applications",
      myApplicationsDesc: "Vacancies you applied to and evaluation results.",
      noApplications: "You have no applications yet.",
      welcome: "Welcome to HR LODEX!",
      dashDesc: "Join an interview instantly.",
      placeholder: "INV-CODE or https://...",
      enterRoom: "Enter Room",
      joinTitle: "Join Interview",
      joinDesc: "Paste your invitation code or link to begin your AI session.",
      validateBtn: "Validate & Start",
      recommended: "Recommended Openings",
      startAssessment: "Start Assessment",
      quietPlace: "Find a quiet place",
      enableMedia: "Enable camera and microphone",
      voiceSession: "This is a voice-based session",
      instructions: "Instructions:",
      idAssigned: "Candidate ID:",
      privateIdentityNotice: "A unique system identifier has been assigned to you for this private interview.",
      validating: "Validating Link...",
      identifying: "Identifying Candidate...",
      startNow: "Start Interview",
      congrats: "Interview Completed!",
      finishMessage: "Your responses have been saved successfully. Our AI is now analyzing your performance.",
      returnDash: "Return to Dashboard",
      returnHome: "Back to Home",
      errorInactive: "Interview is no longer active.",
      errorExpired: "Link has expired.",
      errorInvalid: "Invalid interview link or code."
    }
  },
  [Language.UZ]: {
    common: {
      logout: "Chiqish",
      loading: "Yuklanmoqda...",
      error: "Xatolik",
      save: "Saqlash",
      back: "Orqaga",
      next: "Keyingi",
      cancel: "Bekor qilish",
      delete: "O'chirish",
      active: "Faol",
      paused: "To'xtatilgan",
      archived: "Arxivlangan",
      public: "Ochiq",
      private: "Yopiq",
      started: "Boshlandi",
      completed: "Tugallandi",
      share: "Ulashish",
      edit: "Tahrirlash",
      closed: "Yopilgan",
      backToHome: "Bosh sahifaga qaytish",
      lightMode: "Kunduzgi mavzu",
      darkMode: "Tungi mavzu"
    },
    validation: {
      titleRequired: "Ish nomi majburiy",
      descRequired: "Ish tavsifi majburiy",
      skillsRequired: "Kamida bitta ko'nikmani ko'rsating",
      summaryError: "Iltimos, yaratishdan oldin barcha majburiy maydonlarni to'ldiring."
    },
    landing: {
      heroTitle: "HR LODEX bilan AI-ga asoslangan ishga qabul qilish",
      heroSub: "Nomzodlarni video interview AI, avtomatik javob baholash va rezyume tahlil AI yordamida HR LODEX platformasida tezroq saralang.",
      forEmployers: "Ish beruvchilar uchun",
      login: "Kirish",
      startInterview: "Intervyuni boshlash",
      goToDashboard: "Dashboardga o'tish",
      howItWorksTitle: "Bu qanday ishlaydi",
      howItWorksSub: "AI recruitment platform orqali 4 ta oddiy qadamda aqlli ishga qabul qilish.",
      step1: "Ish yoki intervyu yarating",
      step1Desc: "HR bir necha daqiqada HR LODEX tizimida AI intervyu yoki rezyume arizasini yaratadi.",
      step2: "Havolani ulashing",
      step2Desc: "Nomzodlarga shaxsiy yoki ochiq havolani yuboring.",
      step3: "AI skrining o'tkazadi",
      step3Desc: "AI savollar beradi, javoblarni tahlil qiladi va rezyumelarni tekshiradi.",
      step4: "Ko'rib chiqish va tanlash",
      step4Desc: "HR videolarni ko'radi, ballarni tekshiradi va eng yaxshilarni tanlaydi.",
      featuresTitle: "Asosiy imkoniyatlar",
      f1: "AI Video va Ovozli intervyu",
      f1Desc: "Nomzodlar bilan AI interview o'tkazing, bu yerda video interview AI sohaga oid savollar beradi.",
      f2: "Javoblarni avtomatik baholash",
      f2Desc: "AI har bir javobni aniqlik va mazmun bo'yicha baholaydi.",
      f3: "Aqlli rezyume tahlili",
      f3Desc: "Yuklangan CV-lar CV analysis AI yordamida avtomatik tahlil qilinadi va reytinglanadi.",
      f4: "Ko'p tilli platforma",
      f4Desc: "Ingliz, Rus va O'zbek tillarini to'liq qo'llab-quvvatlash.",
      f5: "Nomzodlar reytingi",
      f5Desc: "Eng yaxshi nomzodlar AI ballari asosida birinchi bo'lib ko'rinadi.",
      f6: "Ochiq va yopiq intervyular",
      f6Desc: "Maxsus nomzodlarni taklif qiling yoki intervyuni hamma uchun oching.",
      employersTitle: "Ish beruvchilar uchun",
      employersSub: "HR LODEX bilan tezroq yollang.",
      empPoint1: "Qo'lda skrining qilish vaqtini tejang",
      empPoint2: "Nomzodlarni avtomatik baholang",
      empPoint3: "Intervyu yozuvlarini istalgan vaqtda ko'ring",
      empPoint4: "AI ballari yordamida nomzodlarni solishtiring",
      empPoint5: "Hamma narsani bitta paneldan boshqaring",
      empBtn: "AI intervyu yaratish",
      candidatesTitle: "Nomzodlar uchun",
      candidatesSub: "Oddiy va zamonaviy intervyu tajribasi",
      candPoint1: "Xavfsiz havola orqali qo'shiling",
      candPoint2: "AI intervyuer bilan erkin muloqot qiling",
      candPoint3: "Savollarga o'zingizga qulay tilda javob bering",
      candPoint4: "Murakkab formalar yoki uzoq jarayonlar yo'q",
      candBtn: "Intervyu kodini kiriting",
      whyAiTitle: "Nima uchun HR LODEX?",
      whyAiSub: "An'anaviy yollash vaqt talab etadi. AI sizga yordam beradi:",
      whyPoint1: "Kamroq vaqt ichida ko'proq nomzodlarni ko'rib chiqish",
      whyPoint2: "Ma'lumotlarga asoslangan qarorlar qabul qilish",
      whyPoint3: "Xolis va adolatli baholashni ta'minlash",
      whyPoint4: "Faqat eng yaxshi nomzodlarga e'tibor qaratish",
      securityTitle: "Xavfsizlik va adolat",
      securitySub: "Biz maxfiylikka jiddiy qaraymiz.",
      secPoint1: "Ma'lumotlarni xavfsiz saqlash",
      secPoint2: "Nomzodlar ma'lumotlarini himoya qilish",
      secPoint3: "Xolis baholash uchun mo'ljallangan AI",
      secPoint4: "HR qarorlari ustidan to'liq nazorat",
      ctaTitle: "Ishga qabul qilishni o'zgartirishga tayyormisiz?",
      ctaSub: "Kerakli iqtidorlarni tezroq va aqlliroq topish uchun HR LODEX-dan foylaning.",
      footerDesc: "Intellektual rekruting kelajagi. Lochinbek Dehqonov tomonidan yaratilgan HR LODEX saralash vaqtini tejaydi. Suniy intellekt intervyu."
    },
    jobs: {
      title: "IT ishlar Uzbekistan",
      sub: "O'zbekistondagi eng so'nggi vakansiya va IT ishlar tarmog'ini kashf eting.",
      empty: "Hozircha ochiq vakansiyalar yo'q.",
      apply: "Ariza yuborish",
      department: "Bo'lim",
      experience: "Tajriba",
      deadline: "Muddat",
      backToHome: "Bosh sahifaga"
    },
    auth: {
      title: "HR LODEX",
      subtitle: "Intellektual rekruting kelajagi",
      login: "Kirish",
      register: "Ro'yxatdan o'tish",
      fullName: "To'liq ism",
      email: "Email manzil",
      password: "Parol",
      confirmPassword: "Parolni tasdiqlang",
      roleLabel: "Men...",
      employer: "Ish beruvchi",
      candidate: "Nomzod",
      submitLogin: "Kirish",
      submitRegister: "Hisob yaratish",
      forgotPassword: "Parolni unutdingizmi?",
      forgotPasswordTitle: "Parolni tiklash",
      forgotPasswordDesc: "Email manzilingizni kiriting. Parolni tiklash uchun kod yuboramiz.",
      resetPasswordTitle: "Yangi parol yarating",
      resetPasswordDesc: "Email'dan kelgan kodni va yangi parolni kiriting",
      resetCode: "Tiklash kodi",
      newPassword: "Yangi parol",
      confirmNewPassword: "Yangi parolni tasdiqlang",
      resetPassword: "Parolni tiklash",
      backToLogin: "Kirishga qaytish",
      passwordMismatch: "Parollar mos kelmayapti"
    },
    hr: {
      dashboard: "Boshqaruv paneli",
      myJobs: "Mening ishlarim",
      createJob: "Ish yaratish",
      analytics: "Analitika",
      activeJobs: "Faol ishlar",
      totalCandidates: "Jami nomzodlar",
      avgScore: "O'rtacha ball",
      latestEvaluations: "So'nggi baholashlar",
      copyLink: "Havolani nusxalash",
      copied: "Nusxalandi!",
      jobDetails: "Ish tafsilotlari",
      interviewDesign: "Intervyu dizayni",
      generateQuestions: "AI savollarini yaratish",
      finalizeLaunch: "Intervyuni boshlash",
      manageJobs: "Ish o'rinlarini boshqarish",
      deleteForever: "Butunlay o'chirish",
      archive: "Arxivlash",
      pause: "To'xtatib turish",
      resume: "Davom ettirish",
      categories: {
        technical: "Texnik",
        career: "Karyera",
        academic: "Akademik"
      },
      createJobForm: {
        title: "Ish yaratish",
        jobTitleLabel: "Ish nomi",
        jobTitleHelper: "Qaysi lavozim uchun ishchi qidirilmoqda",
        jobDescLabel: "Ish tavsifi (AI konteksti)",
        jobDescHelper: "Vazifalar va talablar haqida batafsil ma’lumot",
        skillsLabel: "Kerakli ko'nikmalar",
        skillsHelper: "Nomzodda bo‘lishi shart bo‘lgan ko‘nikmalar",
        numQuestionsLabel: "Savollar soni",
        numQuestionsHelper: "AI nomzodga nechta savol berishi kerak",
        experienceLabel: "Tajriba darajasi",
        experienceHelper: "Kerakli ish tajribasi darajasi",
        langLabel: "Intervyu tili",
        focusLabel: "Intervyu yo'nalishi",
        generateBtn: "AI intervyu profilini yaratish",
        generateHelper: "AI ish ma’lumotlari asosida intervyu savollarini yaratadi",
        saveBtn: "Intervyu portalini ochish",
        saveHelper: "Ushbu ishni saqlash va intervyu uchun ochish",
        analyzing: "Kontekst tahlil qilinmoqda...",
        step: "Bosqich",
        of: "dan",
        details: "Tafsilotlar",
        design: "Dizayn",
        reviewTitle: "Aqlli savollarni ko'rib chiqish",
        reviewSub: "AI ushbu lavozim uchun ularni optimallashtirdi",
        techMastery: "Texnik mahorat",
        cultureProjects: "Madaniyat va loyihalar",
        theoryDepth: "Nazariya va chuqurlik",
        addQuestionBtn: "Savol qo'shish",
        saveQuestionBtn: "Savolni saqlash",
        newQuestionPlaceholder: "Savol matnini bu yerga kiriting...",
        questionListTitle: "Savollar ro'yxati",
        directions: {
          technical: {
            title: "Texnik intervyu",
            desc: "Nomzodning texnik bilimi, muammo yechish qobiliyati va amaliy ko‘nikmalarini baholaydi."
          },
          behavioral: {
            title: "Xulq-atvor intervyusi",
            desc: "Nomzodning muloqoti, jamoada ishlashi, mas’uliyati va ish jarayonidagi xatti-harakatlarini baholaydi."
          },
          hr: {
            title: "HR intervyu",
            desc: "Motivatsiya, karyera maqsadlari, shaxsiy moslik va kompaniyaga mos kelishini baholaydi."
          }
        }
      },
      hiringDashboardTitle: "HR LODEX Ishga qabul qilish paneli",
      hiringDashboardSub: "Bizning HR platforma O‘zbekiston (HR platform Uzbekistan) AI skriningi va rezyume tahlili (CV analysis) orqali nomzodlarni aqlli tartiblaydi.",
      launchJob: "Vakansiyani ochish",
      recruitmentChannels: "Rekruting kanallari",
      activePositionsCount: "Faol vakansiyalar",
      pipelineTitle: "Nomzodlar oqimi",
      filterByVacancy: "Vakansiya",
      allVacancies: "Barcha vakansiyalar",
      statsJobs: "Ishlar",
      statsInterviews: "Intervyular",
      statsPassedWell: "Yaxshi o'tganlar",
      statsPassedPoorly: "Yomon o'tganlar",
      statsAverage: "O'rta",
      availableVacancies: "Mavjud vakansiyalar",
      selectVacancyHint: "Vakansiyani tanlang — shu ish bo'yicha nomzodlar ko'rinadi.",
      noVacanciesHint: "Vakansiyalar yo'q. Avval ish yarating.",
      noCandidatesForJob: "Ushbu vakansiya bo'yicha nomzodlar yo'q.",
      tableCandidate: "Nomzod",
      tableStage: "Bosqich",
      tableResult: "Natija",
      tableInterview: "Intervyu",
      statusAlo: "A'lo",
      statusYaxshi: "Yaxshi",
      statusOrta: "O'rta",
      statusYomon: "Yomon",
      tableActions: "Amallar",
      profileAnalysis: "Tahlil",
      profileInterview: "Intervyu",
      profileChat: "Suhbat",
      profileRecording: "Intervyu yozuvi",
      scoreMatrix: "Baholar matritsasi",
      detectedSkills: "Aniqlangan ko'nikmalar",
      closeDossier: "Dosyeni yopish",
      viewProfile: "Profilni ko'rish",
      chatPlaceholder: "Nomzodga xabar yozing...",
      formLink: "Forma havolasi",
      liveRoom: "Live xona",
      statusLabel: "Holat",
      skillsMatch: "Ko'nikmalarga moslik",
      relevance: "Relevatlik",
      interviewPending: "Intervyu kutilmoqda",
      chatEmptyState: "Nomzodga ko'rsatmalar yoki holat yangilanishlarini yuboring.",
      inviteCodeLabel: "Taklif kodi",
      copyBlockFormTitle: "Ariza formasi havolasi",
      copyBlockInterviewTitle: "Intervyu havolasi",
      copyBlockInviteCode: "Taklif kodi",
      copyBlockJob: "Ish",
      unknownPosition: "Noma'lum lavozim",
      scoreLabel: "Ball",
      freeJobsRemaining: "Bepul ishlar qoldi",
      freeJobsUsed: "Bepul ishlar ishlatildi",
      freeTierTitle: "Bepul reja",
      freeTierDesc: "Dastlabki 3 ta ish bepul",
      creditsRequired: "Suhbatlar talab qilinadi",
      creditsRequiredDesc: "Bepul ishlar tugadi. Yangi ishlar yaratish uchun suhbatlar kerak.",
      technical: "Texnik",
      communication: "Muloqot",
      overall: "Umumiy",
      strengths: "Kuchli tomonlar",
      weaknesses: "Zaif tomonlar",
      strengthsWeaknesses: "Kuchli tomonlar / Zaif tomonlar",
      interviewNotCompleted: "Intervyu tugallanmagan. Nomzod \"Intervyuni yakunlash\" tugmasini bosishi kerak. Shundan keyin AI baholash ko'rinadi.",
      noEvaluation: "Baholash yo'q. Intervyu tugagach AI tahlil avtomatik yaratiladi.",
      recordingNotLoaded: "Yozuv yuklanmadi",
      questionLabel: "S:",
      answerLabel: "J:",
      previousInterviews: "Oldingi suhbatlar",
      loading: "Yuklanmoqda…",
      noPreviousInterviews: "Oldingi suhbatlar yo'q.",
      vacancyColumn: "Vakansiya",
      dateColumn: "Sana",
      resultColumn: "Natija",
      statusColumn: "Holat",
      recommendationStrongHire: "Kuchli ishga qabul",
      recommendationHire: "Ishga qabul",
      recommendationMaybe: "Ehtimol",
      recommendationReject: "Rad etish",
      statusCompleted: "Tugallandi",
      statusStarted: "Boshlandi",
      statusInProgress: "Jarayonda",
      statusNotStarted: "Boshlanmagan",
      statusTerminated: "To'xtatilgan"
    },
    admin: {
      title: "HR LODEX Admin paneli",
      stats: "Platforma statistikasi",
      hrAccounts: "HR hisoblar",
      totalInterviews: "Jami intervyular",
      totalCandidates: "Jami nomzodlar",
      visitors: "Tashrif buyuruvchilar",
      settings: "Hisob sozalamalari",
      changeEmail: "Emailni o'zgartirish",
      changePass: "Parolni o'zgartirish",
      updateBtn: "Ma'lumotlarni yangilash"
    },
    candidate: {
      profile: "Profil",
      profileTitle: "Mening profilim",
      profileDesc: "Hisob ma'lumotlarini boshqarish hamda IT ishlar (IT jobs Uzbekistan) va vakansiyalar (vacancies) ni kashf etish.",
      nameLabel: "Ism",
      emailLabel: "Email",
      roleLabel: "Rol",
      interviewsLabel: "Mavjud suhbatlar",
      saveProfile: "O'zgarishlarni saqlash",
      profileSaved: "Ma'lumotlar saqlandi.",
      emailReadOnlyHint: "Emailni o'zgartirish uchun qo'llab-quvvatlash xizmatiga murojaat qiling.",
      avatarLabel: "Rasm",
      dateOfBirthLabel: "Tug'ilgan sana",
      addressLabel: "Manzil",
      genderLabel: "Jins",
      educationLabel: "Ma'lumot",
      workExperienceLabel: "Ish tajribasi",
      editProfile: "Profilni tahrirlash",
      cancelEdit: "Bekor qilish",
      addEducation: "Ta'lim qo'shish",
      addWork: "Tajriba qo'shish",
      companyLabel: "Kompaniya",
      positionLabel: "Lavozim",
      institutionLabel: "O'quv muassasasi",
      degreeLabel: "Daraja",
      fieldLabel: "Mutaxassislik",
      startYearLabel: "Boshlanish yili",
      endYearLabel: "Tugash yili",
      currentJob: "Hozirgacha",
      descriptionLabel: "Tavsif",
      genderMale: "Erkak",
      genderFemale: "Ayol",
      genderOther: "Boshqa",
      monthLabel: "Oy",
      profileLoadError: "Profil yuklanmadi",
      profileSaveError: "O'zgarishlar saqlanmadi",
      addEducationAndWorkHint: "Ta'lim va ish tajribangizni qo'shish uchun «Profilni tahrirlash» tugmasini bosing.",
      roleCandidate: "Nomzod",
      interviewsUnit: "suhbat",
      myApplications: "Topshirgan vakansiyalar va natijalari",
      myApplicationsTitle: "Mening arizalarim",
      myApplicationsDesc: "Ariza topshirgan vakansiyalar va baholash natijalari.",
      noApplications: "Hali arizangiz yo'q.",
      welcome: "HR LODEX-ga xush kelibsiz!",
      dashDesc: "Intervyuga darhol qo'shiling.",
      placeholder: "Taklif kodi yoki havola...",
      enterRoom: "Xonaga kirish",
      joinTitle: "Intervyuga qo'shilish",
      joinDesc: "AI sessiyasini boshlash uchun taklif kodingizni yoki havolangizni kiriting.",
      validateBtn: "Tekshirish va boshlash",
      recommended: "Tavsiya etilgan ish o'rinlari",
      startAssessment: "Baholashni boshlash",
      quietPlace: "Tinch joy toping",
      enableMedia: "Kamera va mikrofonni yoqing",
      voiceSession: "Bu ovozli sessiya",
      instructions: "Ko'rsatmalar:",
      idAssigned: "Nomzod ID:",
      privateIdentityNotice: "Ushbu yopiq intervyu uchun sizga noyob tizim identifikatori tayinlandi.",
      validating: "Havolani tekshirish...",
      identifying: "Nomzodni aniqlash...",
      startNow: "Intervyuni boshlash",
      congrats: "Intervyu yakunlandi!",
      finishMessage: "Sizning javoblaringiz muvaffaqiyatli saqlandi. Bizning AI sessiyangizni tahlil qilishni boshladi.",
      returnDash: "Dashboardga qaytish",
      returnHome: "Bosh sahifaga",
      errorInactive: "Intervyu endi faol emas.",
      errorExpired: "Havola muddati o'tgan.",
      errorInvalid: "Noto'g'ri havola yoki kod."
    }
  }
};

function restoreUser(): User | null {
  const auth = authApi.getAuth();
  if (!auth?.user || typeof auth.user !== 'object') return null;
  const u = auth.user as { id: string; fullName: string; email: string; role: string; interviews?: number; freeJobsUsed?: number };
  const role =
    u.role === 'admin' ? UserRole.ADMIN
    : u.role === 'employer' ? UserRole.HR
    : UserRole.CANDIDATE;
  return {
    id: u.id,
    name: u.fullName,
    email: u.email,
    role,
    interviews: u.interviews || 0,
    freeJobsUsed: u.freeJobsUsed || 0,
  };
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(restoreUser);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    if (saved === 'ru') return Language.RU;
    if (saved === 'en') return Language.EN;
    if (saved === 'uz') return Language.UZ;
    return Language.RU; // default
  });
  
  // Language ni localStorage'ga saqlash
  useEffect(() => {
    const langCode = language === Language.RU ? 'ru' : (language === Language.EN ? 'en' : 'uz');
    localStorage.setItem('language', langCode);
  }, [language]);
  const [visitorCount, setVisitorCount] = useState(1240);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Subdomen asosida routing
  useEffect(() => {
    const hostname = window.location.hostname;
    const baseDomain = 'hrlodex.uz'; // O'zingizning domeningizni qo'ying, masalan 'hrlodex.com'
    
    if (hostname === baseDomain || hostname === 'www.' + baseDomain) {
      // Asosiy domain: landing yoki auth
      return;
    }
    
    if (hostname.startsWith('admin.')) {
      if (!user) {
        window.location.hash = '/auth';
      } else if (user.role !== UserRole.ADMIN) {
        // Agar admin bo'lmasa, auth ga
        window.location.hash = '/auth';
      } else {
        window.location.hash = '/admin-dashboard';
      }
    } else if (hostname.startsWith('hr.')) {
      if (!user) {
        window.location.hash = '/auth';
      } else if (user.role !== UserRole.HR) {
        window.location.hash = '/auth';
      } else {
        window.location.hash = '/hr-dashboard';
      }
    } else if (hostname.startsWith('candidate.')) {
      if (!user) {
        window.location.hash = '/auth';
      } else if (user.role !== UserRole.CANDIDATE) {
        window.location.hash = '/auth';
      } else {
        window.location.hash = '/candidate-dashboard';
      }
    }
  }, [user]);

  // Dark mode ni qo'llash
  useEffect(() => {
    const root = document.documentElement;
    // Barcha mavjud dark class'larni olib tashlash
    root.classList.remove('dark');
    
    if (theme === 'dark') {
      root.classList.add('dark');
    }
    
    // Body elementga ham qo'llash
    document.body.classList.toggle('dark', theme === 'dark');
    
    localStorage.setItem('theme', theme);
  }, [theme]);

  // User interviews va freeJobsUsed ni yangilash (to'lovlar tasdiqlanganda)
  useEffect(() => {
    if (!user || user.role !== UserRole.HR) return;
    const interval = setInterval(async () => {
      try {
        const profile = await profileService.getProfile();
        const nextInterviews = profile.user.interviews ?? 0;
        const nextFreeJobsUsed = profile.user.freeJobsUsed ?? 0;
        setUser(prev => {
          if (!prev) return prev;
          if (
            (prev.interviews ?? 0) === nextInterviews &&
            (prev.freeJobsUsed ?? 0) === nextFreeJobsUsed
          ) {
            return prev;
          }
          return {
            ...prev,
            interviews: nextInterviews,
            freeJobsUsed: nextFreeJobsUsed,
          };
        });
      } catch (error) {
        // Ignore
      }
    }, 30000); // 30 soniyada bir marta tekshirish

    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== UserRole.HR) return;
    let cancelled = false;

    (async () => {
      try {
        const profile = await profileService.getProfile();
        if (cancelled) return;
        setUser(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            interviews: profile.user.interviews ?? prev.interviews ?? 0,
            freeJobsUsed: profile.user.freeJobsUsed ?? prev.freeJobsUsed ?? 0,
          };
        });
      } catch {
        // Ignore
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.role]);

  useEffect(() => {
    if (!user || (user.role !== UserRole.HR && user.role !== UserRole.ADMIN)) return;
    setDataLoading(true);
    Promise.all([
      jobsService.getJobs(),
      applicationsService.getApplications(),
      chatService.getChat(),
      sessionsService.getSessions(),
    ])
      .then(([jobsList, appsList, chatList, sessionsList]) => {
        setJobs(jobsList);
        setApplications(appsList);
        setMessages(chatList);
        setSessions(sessionsList);
      })
      .catch(() => {})
      .finally(() => setDataLoading(false));
  }, [user?.id, user?.role]);

  const toggleTheme = () => {
    setTheme(prev => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      // Darhol qo'llash (state o'zgarguncha kutmaslik uchun)
      const root = document.documentElement;
      if (newTheme === 'dark') {
        root.classList.add('dark');
        document.body.classList.add('dark');
      } else {
        root.classList.remove('dark');
        document.body.classList.remove('dark');
      }
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  };

  const handleJobCreate = async (job: Job) => {
    try {
      const created = await jobsService.createJob({
      title: job.title,
      department: job.department,
      role: job.role,
      description: job.description,
      experienceLevel: job.experienceLevel,
      requiredSkills: job.requiredSkills,
      interviewType: job.interviewType,
      interviewCategory: job.interviewCategory,
      interviewMode: job.interviewMode,
      visibility: job.visibility,
      sourceLanguage: job.sourceLanguage,
      resumeRequired: job.resumeRequired,
      questions: job.questions,
      deadline: job.deadline,
      status: job.status,
    });
      setJobs(prev => [created, ...prev]);
      // Interviews va freeJobsUsed yangilandi bo'lsa, user ni yangilash
      if (user && user.role === UserRole.HR) {
        const response = created as any;
        setUser(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            interviews: response.interviews !== undefined ? response.interviews : prev.interviews ?? 0,
            freeJobsUsed: response.freeJobsUsed !== undefined ? response.freeJobsUsed : prev.freeJobsUsed ?? 0,
          };
        });
      }
      return created;
    } catch (error: any) {
      // Backend'dan kelgan error message ni to'g'ridan-to'g'ri ko'rsatish (backend allaqachon tarjima qilgan)
      if (error.message) {
        throw error; // Backend'dan kelgan message ni qaytarish
      }
      throw error;
    }
  };

  const handleJobUpdate = async (updatedJob: Job) => {
    await jobsService.updateJob(updatedJob.id, {
      title: updatedJob.title,
      department: updatedJob.department,
      role: updatedJob.role,
      description: updatedJob.description,
      experienceLevel: updatedJob.experienceLevel,
      requiredSkills: updatedJob.requiredSkills,
      interviewType: updatedJob.interviewType,
      interviewCategory: updatedJob.interviewCategory,
      interviewMode: updatedJob.interviewMode,
      visibility: updatedJob.visibility,
      sourceLanguage: updatedJob.sourceLanguage,
      resumeRequired: updatedJob.resumeRequired,
      questions: updatedJob.questions,
      deadline: updatedJob.deadline,
      status: updatedJob.status,
    });
    setJobs(prev => prev.map(j => (j.id === updatedJob.id ? updatedJob : j)));
  };

  const handleJobDelete = async (id: string) => {
    await jobsService.deleteJob(id);
    setJobs(prev => prev.filter(j => j.id !== id));
  };

  const handleApply = (app: CandidateApplication) => setApplications(prev => [app, ...prev]);

  const handleSendMessage = async (applicationId: string, text: string) => {
    const msg = await chatService.sendMessage(applicationId, text);
    setMessages(prev => [...prev, msg]);
  };

  type StartParams = { code?: string; token?: string; applicationId?: string; language: Language };
  const handleStartSession = async (params: StartParams): Promise<{ job: Job; session: InterviewSession }> => {
    const candidateName = user?.role === UserRole.CANDIDATE && user?.name ? user.name : undefined;
    try {
      if (params.token) {
        const job = await publicService.getJobByToken(params.token);
        if (!job) throw new Error('Invalid link');
        const session = await publicService.startSession({
          jobId: job.id,
          applicationId: params.applicationId,
          language: params.language,
          candidateName,
        });
        return { job, session };
      }
      if (params.code) {
        const job = await publicService.validateInvite(params.code);
        if (!job) throw new Error('Invalid code');
        const session = await publicService.startSession({
          code: params.code,
          language: params.language,
          candidateName,
        });
        // Interviews va freeJobsUsed yangilandi bo'lsa, user ni yangilash
        if (user && user.role === UserRole.HR) {
          const response = session as any;
          setUser({ 
            ...user, 
            interviews: response.interviewsRemaining !== undefined ? response.interviewsRemaining : user.interviews || 0,
            freeJobsUsed: response.freeJobsUsed !== undefined ? response.freeJobsUsed : user.freeJobsUsed || 0,
          });
        }
        return { job, session };
      }
      throw new Error('Missing code or token');
    } catch (error: any) {
      // Backend'dan kelgan error message ni to'g'ridan-to'g'ri ko'rsatish (backend allaqachon tarjima qilgan)
      if (error.requiresPayment && error.message) {
        throw error; // Backend'dan kelgan message ni qaytarish
      }
      throw error;
    }
  };

  const handleInterviewComplete = async (session: InterviewSession) => {
    const completed = await publicService.completeSession(session.id, {
      answers: session.answers.map((a) => ({ questionId: a.questionId, questionText: a.questionText, text: a.text })),
      skipAiEvaluation: false,
    });
    setSessions(prev =>
      prev.map(s => (s.id === session.id ? { ...completed, applicationId: session.applicationId } : s))
    );
    if (session.applicationId) {
      setApplications(prev =>
        prev.map(app => (app.id === session.applicationId ? { ...app, status: 'Completed' } : app))
      );
    }
  };

  const handleUpdateApplicationStatus = async (
    applicationId: string,
    status: applicationsService.ApplicationStatus
  ) => {
    await applicationsService.updateApplicationStatus(applicationId, status);
    setApplications(prev =>
      prev.map(app => (app.id === applicationId ? { ...app, status } : app))
    );
  };

  const logout = () => {
    authApi.clearAuth();
    setUser(null);
  };
  const incrementVisitors = () => setVisitorCount(prev => prev + 1);

  return (
    <HashRouter>
      <Routes>
        <Route path="/invite" element={<InviteEntry language={language} setLanguage={setLanguage} onStart={handleStartSession} onComplete={handleInterviewComplete} messages={messages} theme={theme} toggleTheme={toggleTheme} />} />
        <Route path="/i/:token" element={<InstantLanding language={language} setLanguage={setLanguage} onStart={handleStartSession} onComplete={handleInterviewComplete} messages={messages} theme={theme} toggleTheme={toggleTheme} />} />
        <Route path="/apply/:jobId" element={<ApplicationForm jobs={jobs} language={language} onApply={handleApply} theme={theme} toggleTheme={toggleTheme} />} />
        <Route path="/jobs" element={<Jobs language={language} setLanguage={setLanguage} theme={theme} toggleTheme={toggleTheme} />} />
        <Route path="/auth" element={!user ? <Auth onLogin={setUser} language={language} theme={theme} toggleTheme={toggleTheme} /> : <Navigate to={user.role === UserRole.ADMIN ? "/admin-dashboard" : (user.role === UserRole.HR ? "/hr-dashboard" : "/candidate-dashboard")} />} />
        <Route path="/" element={<Landing user={user} language={language} setLanguage={setLanguage} onVisit={incrementVisitors} theme={theme} toggleTheme={toggleTheme} />} />
        <Route path="/*" element={
          user ? (
            <Layout user={user} onLogout={logout} language={language} setLanguage={setLanguage} theme={theme} toggleTheme={toggleTheme}>
              <Routes>
                {user.role === UserRole.ADMIN && (
                   <>
                    <Route path="/admin-dashboard" element={<AdminDashboard jobsCount={jobs.length} hrCount={32} candidateCount={applications.length} visitorCount={visitorCount} language={language} />} />
                    <Route path="/admin-tariffs" element={<Tariffs language={language} />} />
                    <Route path="/admin-payments" element={<Payments language={language} />} />
                    <Route path="*" element={<Navigate to="/admin-dashboard" />} />
                   </>
                )}
                {user.role === UserRole.HR && (
                  <>
                    <Route path="/hr-dashboard" element={<HRDashboard jobs={jobs} sessions={sessions} applications={applications} language={language} messages={messages} onSendMessage={handleSendMessage} onUpdateJob={handleJobUpdate} onUpdateApplicationStatus={handleUpdateApplicationStatus} dataLoading={dataLoading} user={user} />} />
                    <Route path="/hr-analytics" element={<HRAnalytics jobs={jobs} sessions={sessions} applications={applications} messages={messages} onSendMessage={handleSendMessage} language={language} />} />
                    <Route path="/create-job" element={<CreateJob onJobCreate={handleJobCreate} language={language} user={user} />} />
                    <Route path="/hr-jobs" element={<JobList jobs={jobs} language={language} onUpdate={handleJobUpdate} onDelete={handleJobDelete} />} />
                    <Route path="/candidate-profile/:applicationId" element={<CandidateProfileView language={language} />} />
                    <Route path="/buy-credits" element={<PaymentPage language={language} user={user} onPaymentSuccess={async () => { 
                      // User state ni yangilash - profile'dan yangi ma'lumotlarni olish
                      try {
                        const profile = await profileService.getProfile();
                        setUser(prev => prev ? { ...prev, interviews: profile.user.interviews, freeJobsUsed: profile.user.freeJobsUsed } : prev);
                      } catch (e) {
                        console.error('Failed to refresh user profile:', e);
                      }
                      window.location.hash = '/hr-dashboard';
                    }} />} />
                    <Route path="*" element={<Navigate to="/hr-dashboard" />} />
                  </>
                )}
                {user.role === UserRole.CANDIDATE && (
                  <>
                    <Route path="/candidate-dashboard" element={<CandidateDashboard jobs={jobs} language={language} onStart={handleStartSession} onComplete={handleInterviewComplete} messages={messages} user={user} />} />
                    <Route path="/my-applications" element={<MyApplications language={language} />} />
                    <Route path="/profile" element={<Profile user={user!} language={language} onUpdateUser={setUser} />} />
                    <Route path="/buy-credits" element={<PaymentPage language={language} user={user!} onPaymentSuccess={async () => { 
                      // User state ni yangilash - profile'dan yangi ma'lumotlarni olish
                      try {
                        const profile = await profileService.getProfile();
                        setUser(prev => prev ? { ...prev, interviews: profile.user.interviews, freeJobsUsed: profile.user.freeJobsUsed } : prev);
                      } catch (e) {
                        console.error('Failed to refresh user profile:', e);
                      }
                      window.location.hash = '/candidate-dashboard';
                    }} />} />
                    <Route path="*" element={<Navigate to="/candidate-dashboard" />} />
                  </>
                )}
              </Routes>
            </Layout>
          ) : <Navigate to="/auth" />
        } />
      </Routes>
    </HashRouter>
  );
};

type StartSessionFn = (params: { code?: string; token?: string; applicationId?: string; language: Language }) => Promise<{ job: Job; session: InterviewSession }>;

const InviteEntry: React.FC<{ language: Language; setLanguage: (l: Language) => void; onStart: StartSessionFn; onComplete: (s: InterviewSession) => void | Promise<void>; messages: ChatMessage[]; theme: 'light' | 'dark'; toggleTheme: () => void }> = ({ language, setLanguage, onStart, onComplete, messages, theme, toggleTheme }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const [currentSession, setCurrentSession] = useState<InterviewSession | null>(null);
  const [isDone, setIsDone] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [completeError, setCompleteError] = useState('');
  const t = UI_STRINGS[language].candidate;
  const navigate = useNavigate();

  const handleEnter = async () => {
    setError('');
    const cleanCode = code.includes('/i/') ? code.split('/i/').pop()?.split('/')[0]?.split('?')[0] || '' : code.trim();
    if (!cleanCode) {
      setError(t.errorInvalid);
      return;
    }
    setIsValidating(true);
    try {
      const { job, session } = await onStart({ code: cleanCode, language });
      if (job.status === 'Archived' || job.status === 'Paused' || job.status === 'Closed') {
        setError(t.errorInactive);
        return;
      }
      if (job.deadline && new Date(job.deadline) < new Date()) {
        setError(t.errorExpired);
        return;
      }
      setCurrentJob(job);
      setCurrentSession(session);
    } catch {
      setError(t.errorInvalid);
    } finally {
      setIsValidating(false);
    }
  };

  if (isDone && currentSession) return <SuccessScreen candidateId={currentSession.candidateId} language={language} />;
  if (isCompleting) return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 space-y-6 text-center text-white bg-slate-950">
      <Loader2 className="text-indigo-500 animate-spin" size={64} />
      <h2 className="text-2xl font-bold">Saving interview & running AI evaluation...</h2>
    </div>
  );
  if (completeError) return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 space-y-6 text-center text-white bg-slate-950">
      <div className="max-w-md bg-slate-900 p-10 rounded-[2rem] border border-red-500/20 space-y-6">
        <h2 className="text-xl font-bold text-red-400">Could not save interview</h2>
        <p className="text-sm text-slate-400">{completeError}</p>
        <div className="flex gap-3">
          <button onClick={() => navigate('/')} className="flex-1 py-4 font-bold bg-slate-800 rounded-2xl hover:bg-slate-700">Home</button>
          <button onClick={() => setCompleteError('')} className="flex-1 py-4 font-bold bg-indigo-600 rounded-2xl hover:bg-indigo-700">Try again</button>
        </div>
      </div>
    </div>
  );
  if (isValidating) return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 space-y-6 text-center text-white bg-slate-950">
      <Loader2 className="text-indigo-500 animate-spin" size={64} />
      <h2 className="text-2xl font-bold">{t.validating}</h2>
    </div>
  );
  if (currentJob && currentSession) return (
    <InterviewRoom
      job={currentJob}
      initialLanguage={language}
      onComplete={async (s) => {
        setCompleteError('');
        setIsCompleting(true);
        try {
          await onComplete(s);
          setIsDone(true);
        } catch (e) {
          setCompleteError((e as Error)?.message ?? 'Failed to save interview');
        } finally {
          setIsCompleting(false);
        }
      }}
      session={currentSession}
      messages={messages.filter(m => m.applicationId === currentSession.applicationId)}
      theme={theme}
      toggleTheme={toggleTheme}
    />
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 space-y-6 text-white bg-slate-950">
      <button 
        onClick={() => navigate('/')}
        className="absolute flex items-center gap-2 p-3 text-white transition-all border top-8 left-8 bg-white/10 backdrop-blur-xl border-white/20 rounded-2xl hover:bg-white/20 active:scale-95"
      >
        <ArrowLeft size={20} />
      </button>

      <div className="max-w-md w-full bg-slate-900 p-12 rounded-[3rem] shadow-2xl border border-slate-800 text-center">
        <KeyRound className="mx-auto mb-10 text-indigo-500" size={48} />
        <h1 className="mb-4 text-4xl font-black">{t.joinTitle}</h1>
        <div className="space-y-4">
          <input 
            type="text" 
            value={code} 
            onChange={e => setCode(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && handleEnter()} 
            placeholder={t.placeholder} 
            className="w-full p-6 text-xl font-bold text-center transition-all border outline-none bg-slate-800 border-slate-700 rounded-3xl focus:ring-4 focus:ring-indigo-600/20 focus:border-indigo-600" 
          />
          {error && (
            <div className="flex items-center gap-2 p-4 text-sm font-bold text-red-400 border bg-red-500/10 border-red-500/20 rounded-2xl animate-in slide-in-from-top-2">
              <AlertTriangle size={18} />
              {error}
            </div>
          )}
          <button 
            onClick={handleEnter} 
            className="w-full py-6 text-xl font-black transition-all bg-indigo-600 shadow-xl rounded-3xl hover:bg-indigo-700 shadow-indigo-100 dark:shadow-none active:scale-95"
          >
            {t.validateBtn}
          </button>
        </div>
      </div>
    </div>
  );
};

const InstantLanding: React.FC<{ language: Language; setLanguage: (l: Language) => void; onStart: StartSessionFn; onComplete: (s: InterviewSession) => void | Promise<void>; messages: ChatMessage[]; theme: 'light' | 'dark'; toggleTheme: () => void }> = ({ language, setLanguage, onStart, onComplete, messages, theme, toggleTheme }) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const applicationId = queryParams.get('appId') || undefined;
  const params = useParams();
  const token = params.token;
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [currentSession, setCurrentSession] = useState<InterviewSession | null>(null);
  const [isDone, setIsDone] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [completeError, setCompleteError] = useState('');
  const t = UI_STRINGS[language].candidate;
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setError(t.errorInvalid);
      return;
    }
    publicService.getJobByToken(token).then((j) => {
      if (!j) setError(t.errorInvalid);
      else if (j.status !== 'Active') setError(t.errorInactive);
      else if (j.deadline && new Date(j.deadline) < new Date()) setError(t.errorExpired);
      else setJob(j);
    }).catch(() => setError(t.errorInvalid));
  }, [token, t.errorInvalid, t.errorInactive, t.errorExpired]);

  const handleStart = async () => {
    if (!token) return;
    setIsValidating(true);
    try {
      const { job: j, session } = await onStart({ token, applicationId, language });
      setJob(j);
      setCurrentSession(session);
    } catch {
      setError(t.errorInvalid);
    } finally {
      setIsValidating(false);
    }
  };

  if (error) return (
    <div className="flex items-center justify-center min-h-screen p-6 text-center text-white bg-slate-950">
      <div className="max-w-md w-full bg-slate-900 p-12 rounded-[3rem] border border-red-500/20 space-y-6">
        <AlertTriangle size={64} className="mx-auto mb-4 text-red-500" />
        <h1 className="text-3xl font-black">{error}</h1>
        <p className="font-medium text-slate-500">Please contact HR if you believe this is an error.</p>
        <button onClick={() => navigate('/')} className="w-full py-4 font-bold transition-all bg-slate-800 rounded-2xl hover:bg-slate-700">Go Back Home</button>
      </div>
    </div>
  );

  if (!job) return <div className="flex items-center justify-center min-h-screen text-white bg-slate-950"><Loader2 className="animate-spin" size={48} /></div>;
  if (isDone && currentSession) return <SuccessScreen candidateId={currentSession.candidateId} language={language} />;
  if (isCompleting) return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 space-y-6 text-center text-white bg-slate-950">
      <Loader2 className="text-indigo-500 animate-spin" size={64} />
      <h2 className="text-2xl font-bold">Saving interview & running AI evaluation...</h2>
    </div>
  );
  if (completeError) return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 space-y-6 text-center text-white bg-slate-950">
      <div className="max-w-md bg-slate-900 p-10 rounded-[2rem] border border-red-500/20 space-y-6">
        <h2 className="text-xl font-bold text-red-400">Could not save interview</h2>
        <p className="text-sm text-slate-400">{completeError}</p>
        <div className="flex gap-3">
          <button onClick={() => navigate('/')} className="flex-1 py-4 font-bold bg-slate-800 rounded-2xl hover:bg-slate-700">Home</button>
          <button onClick={() => setCompleteError('')} className="flex-1 py-4 font-bold bg-indigo-600 rounded-2xl hover:bg-indigo-700">Try again</button>
        </div>
      </div>
    </div>
  );
  if (currentSession) return (
    <InterviewRoom
      job={job}
      initialLanguage={language}
      onComplete={async (s) => {
        setCompleteError('');
        setIsCompleting(true);
        try {
          await onComplete(s);
          setIsDone(true);
        } catch (e) {
          setCompleteError((e as Error)?.message ?? 'Failed to save interview');
        } finally {
          setIsCompleting(false);
        }
      }}
      session={currentSession}
      messages={messages.filter(m => m.applicationId === applicationId)}
      theme={theme}
      toggleTheme={toggleTheme}
    />
  );

  return (
    <div className="flex items-center justify-center min-h-screen p-6 text-white bg-slate-950">
      <button 
        onClick={() => navigate('/')}
        className="absolute flex items-center gap-2 p-3 text-white transition-all border top-8 left-8 bg-white/10 backdrop-blur-xl border-white/20 rounded-2xl hover:bg-white/20 active:scale-95"
      >
        <ArrowLeft size={20} />
      </button>

      <div className="max-w-md w-full bg-slate-900 p-12 rounded-[3rem] shadow-2xl text-center border border-slate-800 space-y-8 animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-indigo-600 rounded-[1.5rem] mx-auto flex items-center justify-center shadow-2xl shadow-indigo-600/20">
          <Video size={40} />
        </div>
        <div>
          <h1 className="mb-2 text-3xl font-black tracking-tight">{job.title}</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">{job.department} • Live Session</p>
        </div>
        <button 
          onClick={handleStart}
          disabled={isValidating}
          className="flex items-center justify-center w-full py-6 text-xl font-black transition-all bg-indigo-600 shadow-xl rounded-3xl hover:bg-indigo-700 shadow-indigo-100 dark:shadow-none active:scale-95 disabled:opacity-70"
        >
          {isValidating ? <Loader2 className="animate-spin" size={24} /> : 'Start Interview'}
        </button>
      </div>
    </div>
  );
};

const SuccessScreen: React.FC<{ candidateId: string, language: Language, onReturn?: () => void }> = ({ candidateId, language, onReturn }) => {
  const t = UI_STRINGS[language].candidate;
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center text-white duration-700 bg-slate-950 animate-in fade-in">
      <Trophy size={80} className="text-emerald-500 mb-10 drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]" />
      <h2 className="mb-4 text-5xl font-black tracking-tighter">{t.congrats}</h2>
      <p className="max-w-sm mb-12 text-lg font-medium leading-relaxed text-slate-400">{t.finishMessage}</p>
      <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 mb-12 shadow-inner">
        <p className="text-xs text-slate-500 uppercase font-black tracking-[0.3em] mb-3">{t.idAssigned}</p>
        <p className="text-3xl font-black tracking-widest text-indigo-400">{candidateId}</p>
      </div>
      
      <div className="flex flex-col w-full max-w-md gap-4 sm:flex-row">
        <button onClick={() => navigate('/')} className="flex items-center justify-center flex-1 gap-3 px-8 py-5 text-lg font-black transition-all bg-indigo-600 shadow-2xl rounded-3xl hover:bg-indigo-700 active:scale-95">
          <Home size={24} />
          {t.returnHome}
        </button>
        {onReturn && (
          <button onClick={onReturn} className="flex items-center justify-center flex-1 gap-3 px-8 py-5 text-lg font-black transition-all border bg-white/10 border-white/20 rounded-3xl hover:bg-white/20 active:scale-95">
            <LayoutDashboard size={24} />
            {t.returnDash}
          </button>
        )}
      </div>
    </div>
  );
};

const CandidateDashboard: React.FC<{ jobs: Job[]; language: Language; onStart: StartSessionFn; onComplete: (s: InterviewSession) => void | Promise<void>; messages: ChatMessage[]; user?: User }> = ({ jobs, language, onStart, onComplete, messages, user }) => {
  const [activeSession, setActiveSession] = useState<InterviewSession | null>(null);
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [isDone, setIsDone] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [completeError, setCompleteError] = useState('');
  const [inviteInput, setInviteInput] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const navigate = useNavigate();
  const t = UI_STRINGS[language].candidate;

  const handleJoin = async () => {
    const cleanCode = inviteInput.includes('/i/') ? inviteInput.split('/i/').pop()?.split('/')[0]?.split('?')[0] || '' : inviteInput.trim();
    if (!cleanCode) {
      setJoinError(t.errorInvalid);
      return;
    }
    setJoinError('');
    setJoinLoading(true);
    try {
      const { job, session } = await onStart({ code: cleanCode, language });
      if (job.status !== 'Active') {
        setJoinError(t.errorInactive);
        return;
      }
      setActiveJob(job);
      setActiveSession(session);
    } catch (error: any) {
      setJoinError(error.message || t.errorInvalid);
    } finally {
      setJoinLoading(false);
    }
  };

  if (isDone && activeSession) return <SuccessScreen candidateId={activeSession.candidateId} language={language} onReturn={() => { setIsDone(false); setActiveSession(null); setActiveJob(null); }} />;
  if (isCompleting) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
      <Loader2 className="text-indigo-600 animate-spin" size={48} />
      <p className="font-bold text-slate-600 dark:text-slate-400">Saving interview & running AI evaluation...</p>
    </div>
  );
  if (completeError) return (
    <div className="space-y-6">
      <div className="p-6 border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 rounded-2xl">
        <p className="font-bold text-red-700 dark:text-red-400">Could not save interview</p>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{completeError}</p>
        <button onClick={() => { setCompleteError(''); setActiveSession(null); setActiveJob(null); }} className="px-6 py-3 mt-4 font-bold bg-slate-200 dark:bg-slate-700 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600">Back to dashboard</button>
      </div>
    </div>
  );
  if (activeJob && activeSession) return (
    <InterviewRoom
      job={activeJob}
      initialLanguage={language}
      onComplete={async (s) => {
        setCompleteError('');
        setIsCompleting(true);
        try {
          await onComplete(s);
          setIsDone(true);
        } catch (e) {
          setCompleteError((e as Error)?.message ?? 'Failed to save interview');
        } finally {
          setIsCompleting(false);
        }
      }}
      session={activeSession}
      messages={messages.filter(m => m.applicationId === activeSession.applicationId)}
      theme="light"
      toggleTheme={() => {}}
    />
  );

  return (
    <div className="space-y-8">
      <div className="bg-indigo-600 p-12 rounded-[3rem] text-white shadow-2xl shadow-indigo-100 relative overflow-hidden">
        <div className="relative z-10">
          <div>
            <h2 className="mb-4 text-4xl font-black tracking-tight">{t.welcome}</h2>
            <p className="mb-10 text-lg text-indigo-100 opacity-80">{t.dashDesc}</p>
          </div>
          {joinError && <p className="mb-2 text-sm font-bold text-red-400">{joinError}</p>}
          <div className="flex max-w-md gap-3">
            <input 
              type="text" 
              value={inviteInput} 
              onChange={e => { setInviteInput(e.target.value); setJoinError(''); }} 
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
              placeholder={t.placeholder} 
              className="flex-1 px-6 py-5 font-bold text-white transition-all border outline-none bg-white/10 border-white/20 rounded-2xl placeholder:text-indigo-200 focus:bg-white/20" 
            />
            <button onClick={handleJoin} disabled={joinLoading} className="flex items-center justify-center px-10 py-5 font-black text-indigo-600 transition-all bg-white shadow-xl rounded-2xl hover:bg-indigo-50 active:scale-95 disabled:opacity-70">
              {joinLoading ? <Loader2 size={20} className="animate-spin" /> : t.enterRoom}
            </button>
          </div>
        </div>
      </div>
      <div className="space-y-6">
        <h3 className="flex items-center gap-2 text-xl font-black text-slate-900 dark:text-white">
           <BarChart2 className="text-indigo-600" />
           {t.recommended}
        </h3>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {jobs.filter(j => j.visibility === JobVisibility.PUBLIC && j.status === 'Active').map(job => (
            <div key={job.id} className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex flex-col justify-between hover:shadow-xl transition-all group">
              <div>
                <h4 className="mb-1 text-2xl font-black text-slate-900 dark:text-white">{job.title}</h4>
                <p className="mb-8 text-xs font-black tracking-widest uppercase text-slate-500">{job.department}</p>
              </div>
              <button 
                onClick={() => navigate(`/apply/${job.id}`)} 
                className="flex items-center justify-center w-full gap-3 py-5 font-black text-white transition-all bg-slate-900 dark:bg-indigo-600 rounded-2xl hover:bg-indigo-600"
              >
                Apply Now <ArrowRight size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const JobList: React.FC<{ jobs: Job[], language: Language, onUpdate: (j: Job) => void, onDelete: (id: string) => void }> = ({ jobs, onDelete, onUpdate, language }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedShareId, setExpandedShareId] = useState<string | null>(null);
  const strings = UI_STRINGS[language];
  const t = strings.hr;
  
  const handleCopyLink = (job: Job, type: 'interview' | 'apply') => {
    const token = type === 'interview' ? job.shareToken! : job.id;
    const url = type === 'interview' ? `${window.location.origin}/#/i/${token}` : `${window.location.origin}/#/apply/${token}`;
    const text = buildCopyText(type, url, job.title, job.inviteCode || '', t);
    navigator.clipboard.writeText(text);
    setCopiedId(token + type);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStatusChange = (job: Job, newStatus: JobStatus) => {
    onUpdate({ ...job, status: newStatus });
  };

  const toggleShare = (id: string) => {
    setExpandedShareId(expandedShareId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-black text-slate-900 dark:text-white">{t.recruitmentChannels}</h2>
      <div className="space-y-4">
        {jobs.map(job => (
          <div key={job.id} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-6 hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 text-white bg-indigo-600 shadow-lg rounded-2xl">
                  <Briefcase size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">{job.title}</h3>
                  <p className="text-xs font-bold tracking-widest uppercase text-slate-400">{job.department} • {t.inviteCodeLabel}: <span className="text-indigo-600">{job.inviteCode}</span></p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => toggleShare(job.id)}
                  title={strings.common.share}
                  className={`p-3 rounded-xl transition-all border flex items-center gap-2 font-black uppercase text-[10px] ${
                    expandedShareId === job.id 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' 
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-indigo-600'
                  }`}
                >
                  <Share2 size={18} />
                  <span className="hidden sm:inline">{strings.common.share}</span>
                </button>
                <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  {[
                    { s: 'Active', icon: Play, color: 'text-emerald-500', label: strings.common.active },
                    { s: 'Paused', icon: Pause, color: 'text-orange-500', label: strings.common.paused },
                    { s: 'Archived', icon: Archive, color: 'text-slate-500', label: strings.common.archived },
                    { s: 'Closed', icon: XCircle, color: 'text-red-500', label: strings.common.closed }
                  ].map(({ s, icon: Icon, color, label }) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(job, s as JobStatus)}
                      title={label}
                      className={`p-2 rounded-lg transition-all ${
                        job.status === s 
                          ? 'bg-white dark:bg-slate-700 shadow-sm ' + color 
                          : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                      }`}
                    >
                      <Icon size={16} />
                    </button>
                  ))}
                </div>
                <button onClick={() => onDelete(job.id)} className="p-3 text-red-500 transition-all hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl"><Trash2 size={20} /></button>
              </div>
            </div>
            
            {expandedShareId === job.id && (
              <div className="grid grid-cols-1 gap-4 duration-300 md:grid-cols-2 animate-in slide-in-from-top-2">
                <div className="p-5 space-y-3 border bg-slate-50 dark:bg-slate-800 rounded-2xl border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.formLink}</p>
                  <div className="flex gap-2">
                     <input type="text" readOnly value={`${window.location.origin}/#/apply/${job.id}`} className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-[10px] font-mono outline-none text-slate-600 dark:text-slate-300" />
                     <button onClick={() => handleCopyLink(job, 'apply')} className={`p-3 rounded-xl transition-all ${copiedId === job.id + 'apply' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-indigo-600'}`}>{copiedId === job.id + 'apply' ? <Check size={18}/> : <Copy size={18}/>}</button>
                  </div>
                </div>
                <div className="p-5 space-y-3 border border-indigo-100 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-2xl dark:border-indigo-900">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{t.liveRoom}</p>
                  <div className="flex gap-2">
                     <input type="text" readOnly value={`${window.location.origin}/#/i/${job.shareToken}`} className="flex-1 bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900 rounded-xl px-4 py-2.5 text-[10px] font-mono outline-none text-slate-600 dark:text-slate-300" />
                     <button onClick={() => handleCopyLink(job, 'interview')} className={`p-3 rounded-xl transition-all ${copiedId === job.shareToken + 'interview' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900 text-indigo-400 hover:text-indigo-600'}`}>{copiedId === job.shareToken + 'interview' ? <Check size={18}/> : <Video size={18}/>}</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
