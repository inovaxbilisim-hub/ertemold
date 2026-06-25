import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  secure: boolean;
};

export function getSmtpFromEnv(): SmtpConfig | null {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  return { host, port, user, pass, secure: port === 465 };
}

export function createTransporter(config: SmtpConfig): Transporter {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
  });
}
