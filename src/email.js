/**
 * Sends a sales email via Gmail SMTP using NodeMailer.
 * Uses an App Password (not your real Gmail password).
 *
 * Setup: Google Account → Security → 2-Step Verification ON
 *        → App passwords → Generate → copy the 16-char password
 */
import nodemailer from 'nodemailer';

export async function sendEmail({ to, bizName, pageUrl, city, gmailUser, gmailAppPassword }) {
    if (!to) return 'no_email';

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: gmailUser,
            pass: gmailAppPassword,
        },
    });

    const { subject, html, text } = buildEmail(bizName, pageUrl, city);

    const info = await transporter.sendMail({
        from:    `AUTOMAIL <${gmailUser}>`,
        to,
        subject,
        text,
        html,
    });

    return `sent:${info.messageId}`;
}

function buildEmail(bizName, pageUrl, city) {
    const subject = `${bizName} — cada mes pierdes clientes por no tener web`;

    const text = `
Hola,

Cada mes miles de personas en ${city || 'tu ciudad'} buscan en Google negocios como ${bizName} y no os encuentran porque no tenéis página web.

Os he preparado una de muestra para que veáis cómo podría quedar:
${pageUrl}

En menos de una semana podría estar activa y empezar a traeros clientes nuevos por internet.

¿Os llamo para contaros más sin compromiso?

Un saludo,
Santiago
AUTOMAIL
    `.trim();

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #0f172a; color: white; padding: 28px 32px; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 20px; letter-spacing: 1px; }
    .body { background: #f8fafc; padding: 36px 32px; border-radius: 0 0 8px 8px; line-height: 1.7; }
    .highlight { background: #fff7ed; border-left: 4px solid #f97316; padding: 16px 20px; margin: 24px 0; border-radius: 0 8px 8px 0; font-size: 15px; }
    .cta { display: inline-block; background: #0f172a; color: white; padding: 16px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 24px 0; font-size: 15px; }
    .cta:hover { background: #1e293b; }
    .footer { margin-top: 32px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>AUTOMAIL</h1>
  </div>
  <div class="body">
    <p>Hola,</p>
    <div class="highlight">
      Cada mes miles de personas en <strong>${city || 'vuestra ciudad'}</strong> buscan en Google negocios como <strong>${bizName}</strong> y no os encuentran — porque no tenéis página web.
    </div>
    <p>Os he preparado una de muestra para que veáis cómo podría quedar:</p>
    <p style="text-align:center">
      <a class="cta" href="${pageUrl}">👉 Ver vuestra página web</a>
    </p>
    <p>En menos de una semana podría estar activa y empezar a traeros clientes nuevos por internet.</p>
    <p><strong>¿Os llamo para contaros más sin compromiso?</strong></p>
    <p>Un saludo,<br><strong>Santiago</strong><br>AUTOMAIL</p>
  </div>
  <div class="footer">Has recibido este email porque tu negocio aparece en Google Maps sin página web.</div>
</body>
</html>
    `.trim();

    return { subject, html, text };
}
