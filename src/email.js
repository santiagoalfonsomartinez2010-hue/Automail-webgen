/**
 * Sends a sales email via Gmail SMTP using NodeMailer.
 * Uses an App Password (not your real Gmail password).
 *
 * Setup: Google Account → Security → 2-Step Verification ON
 *        → App passwords → Generate → copy the 16-char password
 */
import nodemailer from 'nodemailer';

export async function sendEmail({ to, bizName, pageUrl, gmailUser, gmailAppPassword }) {
    if (!to) return 'no_email';

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: gmailUser,
            pass: gmailAppPassword,
        },
    });

    const { subject, html, text } = buildEmail(bizName, pageUrl);

    const info = await transporter.sendMail({
        from:    `AUTOMAIL <${gmailUser}>`,
        to,
        subject,
        text,
        html,
    });

    return `sent:${info.messageId}`;
}

function buildEmail(bizName, pageUrl) {
    const subject = `Hemos diseñado una página web para ${bizName}`;

    const text = `
Hola,

He visto que ${bizName} aún no tiene página web y he querido diseñaros una de muestra.

Podéis verla aquí: ${pageUrl}

En menos de una semana podríais tenerla activa y empezar a recibir clientes por internet.

¿Os interesa? Respondedme a este email o escribidme sin compromiso.

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
    .header { background: #0f172a; color: white; padding: 24px; border-radius: 8px 8px 0 0; text-align: center; }
    .header h1 { margin: 0; font-size: 22px; }
    .body { background: #f8fafc; padding: 32px; border-radius: 0 0 8px 8px; }
    .cta { display: inline-block; background: #2563eb; color: white; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 20px 0; }
    .footer { margin-top: 32px; font-size: 12px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <h1>AUTOMAIL</h1>
  </div>
  <div class="body">
    <p>Hola,</p>
    <p>He visto que <strong>${bizName}</strong> aún no tiene página web y he querido diseñaros una de muestra.</p>
    <p>Le hemos dado un diseño profesional adaptado a vuestro sector, con información de contacto, servicios y llamada a la acción:</p>
    <p style="text-align:center">
      <a class="cta" href="${pageUrl}">👉 Ver vuestra página web</a>
    </p>
    <p>En menos de una semana podríais tenerla activa y empezar a recibir clientes por internet.</p>
    <p>¿Os interesa? Respondedme a este email sin compromiso y os cuento cómo funciona.</p>
    <p>Un saludo,<br><strong>Santiago</strong><br>AUTOMAIL</p>
  </div>
  <div class="footer">Has recibido este email porque tu negocio aparece en Google Maps sin página web.</div>
</body>
</html>
    `.trim();

    return { subject, html, text };
}
