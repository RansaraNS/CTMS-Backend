import nodemailer from "nodemailer";
import path from "path";

const sendEmail = async (to, subject, text, html) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Add attachments for inline images
  const attachments = [
    {
      filename: "GR.jpg",
      path: path.join("src/public/GR.jpg"), // path to your image
      cid: "companylogo" // same as referenced in HTML
    }
  ];

  await transporter.sendMail({
    from: `"Support" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
    attachments
  });
};

export default sendEmail;
