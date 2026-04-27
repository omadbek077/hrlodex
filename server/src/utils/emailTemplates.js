// Email template'lari 3 tilda
const emailTemplates = {
  uz: {
    verification: {
      subject: 'Tasdiqlash kodingiz - HR Lodex',
      greeting: 'Salom!',
      body: 'Sizning tasdiqlash kodingiz:',
      expiry: 'Bu kod 1 daqiqa ichida amal qiladi.',
      ignore: 'Agar bu siz emas bo\'lsangiz, bu xabarni e\'tiborsiz qoldiring.',
      footer: 'HR Lodex - Ish qidirish platformasi',
    },
    resetPassword: {
      subject: 'Parolni tiklash kodingiz - HR Lodex',
      greeting: 'Salom!',
      body: 'Parolni tiklash uchun kodingiz:',
      expiry: 'Bu kod 1 daqiqa ichida amal qiladi.',
      ignore: 'Agar bu siz emas bo\'lsangiz, bu xabarni e\'tiborsiz qoldiring.',
      footer: 'HR Lodex - Ish qidirish platformasi',
    },
  },
  ru: {
    verification: {
      subject: 'Ваш код подтверждения - HR Lodex',
      greeting: 'Здравствуйте!',
      body: 'Ваш код подтверждения:',
      expiry: 'Этот код действителен в течение 1 минуты.',
      ignore: 'Если это не вы, проигнорируйте это сообщение.',
      footer: 'HR Lodex - Платформа для поиска работы',
    },
    resetPassword: {
      subject: 'Код восстановления пароля - HR Lodex',
      greeting: 'Здравствуйте!',
      body: 'Ваш код для восстановления пароля:',
      expiry: 'Этот код действителен в течение 1 минуты.',
      ignore: 'Если это не вы, проигнорируйте это сообщение.',
      footer: 'HR Lodex - Платформа для поиска работы',
    },
  },
  en: {
    verification: {
      subject: 'Your Verification Code - HR Lodex',
      greeting: 'Hello!',
      body: 'Your verification code is:',
      expiry: 'This code is valid for 1 minute.',
      ignore: 'If this is not you, please ignore this message.',
      footer: 'HR Lodex - Job Search Platform',
    },
    resetPassword: {
      subject: 'Password Reset Code - HR Lodex',
      greeting: 'Hello!',
      body: 'Your password reset code is:',
      expiry: 'This code is valid for 1 minute.',
      ignore: 'If this is not you, please ignore this message.',
      footer: 'HR Lodex - Job Search Platform',
    },
  },
};

function getEmailTemplate(language = 'uz', type = 'verification') {
  const lang = language === 'ru' ? 'ru' : (language === 'en' ? 'en' : 'uz');
  return emailTemplates[lang][type] || emailTemplates.uz[type];
}

function generateEmailHTML(template, code) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
      <h2 style="color: #333;">${template.greeting}</h2>
      <p>${template.body}</p>
      <p style="font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #4F46E5;">${code}</p>
      <p style="color: #666;">${template.expiry}</p>
      <p>${template.ignore}</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="color: #999; font-size: 12px;">${template.footer}</p>
    </div>
  `;
}

module.exports = {
  emailTemplates,
  getEmailTemplate,
  generateEmailHTML,
};
