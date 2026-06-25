import { NextResponse } from 'next/server';
import { getCoreSettings } from '@/modules/settings/lib/data-settings';
import { dbGet } from '@/core/database/db';
import { getSmtpFromEnv, createTransporter } from '@/core/mail/transporter';

function escapeHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function POST(request: Request) {
  try {
    // 1. Parse form data
    const formData = await request.json();
    const { name, email, phone, service, message, branchId } = formData;

    // Validation
    if (!name || name.length > 200 || !email || email.length > 200 || !phone || phone.length > 50) {
      return NextResponse.json({ error: 'Geçersiz form verisi.' }, { status: 400 });
    }

    // 2. Fetch global settings (cached 7-day)
    const settings = await getCoreSettings();

    if (!settings) {
      return NextResponse.json({ error: 'Ayarlar yüklenemedi.' }, { status: 500 });
    }

    // 3. Use the dedicated contact recipient email list from settings if available.
    // Branch-specific SMTP settings can override transport but not the global destination list.
    const targetEmails = (settings.contactEmails && settings.contactEmails.length > 0)
      ? settings.contactEmails.map((item) => String(item).trim()).filter(Boolean)
      : settings.contactEmail
        ? [settings.contactEmail.trim()]
        : settings.email
          ? [settings.email.trim()]
          : [];
    // SMTP: önce env, sonra DB (env'deki şifre DB'dekinden önceliklidir)
    const envSmtp = getSmtpFromEnv();
    let smtp = envSmtp || settings.smtp || {};

    if (!envSmtp && branchId) {
      const branch = await dbGet<Record<string, unknown>>(
        'SELECT * FROM business_branches WHERE id = ? LIMIT 1',
        [branchId]
      );

      if (branch && branch.smtp_settings) {
        const branchSmtp = JSON.parse(String(branch.smtp_settings));
        if (branchSmtp.host) {
          smtp = branchSmtp;
        }
      }
    }

    if (targetEmails.length === 0) {
      return NextResponse.json({ error: 'Genel ayarlarda alıcı e-posta adresi tanımlanmamış. Mail gönderilemiyor.' }, { status: 500 });
    }

    if (!smtp.host || !smtp.user || !smtp.pass) {
      return NextResponse.json({ error: 'SMTP ayarları eksik. Mail gönderilemiyor.' }, { status: 500 });
    }

    const transporter = createTransporter({
      host: smtp.host,
      port: smtp.port,
      user: smtp.user,
      pass: smtp.pass,
      secure: smtp.secure !== undefined ? smtp.secure : (smtp.port === 465),
    });

    const senderEmail = smtp.user || targetEmails[0];

    // 4. Send email (Sanitized)
    const mailOptions = {
      from: `"${settings.companyName}" <${senderEmail}>`,
      to: targetEmails,
      replyTo: email,
      subject: `Yeni İletişim Formu: ${escapeHtml(service) || 'Genel Bilgi'}`,
      text: `
        İsim: ${name}
        Email: ${email}
        Telefon: ${phone}
        Hizmet: ${service}
        Mesaj: ${message}
      `,
      html: `
        <div style="font-family: sans-serif; max-width: 600px;">
          <h3 style="color: #00d4aa;">Yeni İletişim Formu Talebi</h3>
          <p><strong>İsim:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Telefon:</strong> ${escapeHtml(phone)}</p>
          <p><strong>Hizmet:</strong> ${escapeHtml(service)}</p>
          <p><strong>Mesaj:</strong><br/>
          <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${escapeHtml(message)}</div></p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Email send error:', error);
    return NextResponse.json({ error: 'Mail gönderimi başarısız oldu. Lütfen daha sonra tekrar deneyin.' }, { status: 500 });
  }
}
