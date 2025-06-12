// utils/mail.js
const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,       // e.g. smtp.gmail.com
  port: Number(process.env.MAIL_PORT), // e.g. 587
  secure: false,                      // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USER,     // your SMTP username
    pass: process.env.MAIL_PASS,     // your SMTP password or app-specific password
  },
});

async function sendMail({ to, subject, html }) {
  await transporter.sendMail({
    from: `"GRN System" <${process.env.MAIL_USER}>`,
    to,
    subject,
    html,
  });
}

module.exports = sendMail;
