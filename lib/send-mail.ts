import nodemailer from "nodemailer";
import * as dotenv from "dotenv";

interface EmailOptions {
  from?: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", // Gunakan SMTP server yang sesuai
      auth: {
        user: process.env.EMAIL, // Ganti dengan email Anda
        pass: process.env.EMAIL_PASS, // Ganti dengan password aplikasi atau password Anda
      },
    });

    const mailOptions = {
      from: process.env.EMAIL, // Default pengirim jika tidak disediakan
      to: options.to,
      subject: options.subject,
      text: options.text || "",
      html: options.html || "",
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
