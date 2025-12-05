import nodemailer from "nodemailer";
//Function to sent mail using nodemailer

// to get SMTP data we use SMTP provider -- we are using Brevo
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});


//function to send email
const sendEmail = async ({to, subject, body}) => {
 
 const response = await transporter.sendMail({
  from: process.env.SENDER_EMAIL,
    to,
    subject,
    html:body, 
 })
 return response;
}

export default sendEmail
 

