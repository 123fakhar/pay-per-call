import nodemailer from "nodemailer";

export function smtpConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.MAIL_FROM,
  );
}

export function createMailTransport() {
  if (!smtpConfigured()) {
    throw new Error("SMTP is not configured");
  }
  const port = Number(process.env.SMTP_PORT);
  const secure =
    process.env.SMTP_SECURE === "true" || port === 465;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
}

export async function sendMail(options: {
  to: string;
  subject: string;
  text: string;
}) {
  const transport = createMailTransport();
  try {
    await transport.sendMail({
      from: process.env.MAIL_FROM,
      to: options.to,
      subject: options.subject,
      text: options.text,
    });
  } finally {
    transport.close();
  }
}
