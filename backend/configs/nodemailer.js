import nodemailer from "nodemailer";

// Function to send mail using nodemailer

// using GMAIL service directly

const transporter = nodemailer.createTransport({
  service: "gmail", 
  auth: {
    user: process.env.SMTP_USER, 
    pass: process.env.SMTP_PASS, 
  },
});

// Function to send email
const sendEmail = async ({ to, subject, body }) => {
  
  const response = await transporter.sendMail({
    from: process.env.SMTP_USER, 
    to,
    subject,
    html: body,
  });

  return response;
};

export default sendEmail;