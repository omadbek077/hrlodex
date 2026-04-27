const nodemailer = require('nodemailer');
const { getEmailTemplate, generateEmailHTML } = require('../utils/emailTemplates');

let transporter;

// Development: Ethereal test pochta (hech qanday sozlash kerak emas)
// .env da EMAIL_USE_ETHEREAL=true yozing yoki EMAIL_USER/EMAIL_PASS bo'sh qoldiring
async function getTransporter() {
  if (transporter) return transporter;

  if (process.env.EMAIL_USE_ETHEREAL === 'true' || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('Ethereal test pochta ishlatilmoqda. Kodlar haqiqiy emailga yuborilmaydi.');
    console.log('Preview: https://ethereal.email');
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  return transporter;
}

const sendVerificationEmail = async (email, code, language = 'uz', type = 'verification') => {
  const transport = await getTransporter();
  const fromEmail = process.env.EMAIL_USER || 'noreply@hrlodex.com';
  const template = getEmailTemplate(language, type);
  
  const mailOptions = {
    from: `"HR Lodex" <${fromEmail}>`,
    to: email,
    subject: template.subject,
    html: generateEmailHTML(template, code),
  };

  const info = await transport.sendMail(mailOptions);
  // Ethereal rejimida - console da preview link
  if (process.env.EMAIL_USE_ETHEREAL === 'true' || !process.env.EMAIL_USER) {
    console.log('Email yuborildi:', nodemailer.getTestMessageUrl(info));
  }
};

module.exports = { transporter, sendVerificationEmail };
