/**
 * Sends a sales email via Gmail SMTP using NodeMailer.
 * Uses an App Password (not your real Gmail password).
 *
 * Setup: Google Account → Security → 2-Step Verification ON
 *        → App passwords → Generate → copy the 16-char password
 */
import nodemailer from 'nodemailer';

export async function sendEmail({ to, bizName, pageUrl, city, phone, address, gmailUser, gmailAppPassword }) {
    if (!to) return 'no_email';

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: gmailUser,
            pass: gmailAppPassword,
        },
    });

    const { subject, html, text } = buildEmail(bizName, pageUrl, city, phone, address);

    const info = await transporter.sendMail({
        from:    `AUTOMAIL <${gmailUser}>`,
        to,
        subject,
        text,
        html,
    });

    return `sent:${info.messageId}`;
}

function buildEmail(bizName, pageUrl, city, phone, address) {
    const subject = `✅ Nueva web generada — ${bizName}`;
    const isMobile = isSpanishMobile(phone);

    const whatsappMessage = `Hola 👋 Soy Santiago. Cada mes miles de personas en ${city || 'tu ciudad'} buscan en Google negocios como *${bizName}* y no os encuentran porque no tenéis página web.

Os he preparado una de muestra para que veáis cómo podría quedar 👉 ${pageUrl}

En menos de una semana podría estar activa y empezar a traeros clientes nuevos por internet. ¿Os llamo para contaros más sin compromiso?`;

    const callScript = `Buenos días, ¿hablo con ${bizName}? Soy Santiago, le llamo porque he visto que su negocio no tiene página web y le he preparado una de muestra gratis. ¿Tiene un minuto para que le explique?`;

    const whatsappLink = (phone && isMobile)
        ? `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}`
        : null;

    const text = `
NUEVO LEAD GENERADO
===================
Negocio:   ${bizName}
Teléfono:  ${phone || 'No disponible'} ${phone ? (isMobile ? '(móvil)' : '(fijo)') : ''}
Dirección: ${address || 'No disponible'}
Web:       ${pageUrl}

${phone && isMobile ? `MENSAJE PARA COPIAR EN WHATSAPP:
---------------------------------
${whatsappMessage}` : phone ? `GUION PARA LLAMADA (número fijo, sin WhatsApp):
---------------------------------
${callScript}` : 'Sin teléfono disponible para este negocio'}
    `.trim();

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; color: #333; max-width: 620px; margin: 0 auto; padding: 20px; }
    .header { background: #0f172a; color: white; padding: 24px 32px; border-radius: 8px 8px 0 0; display: flex; justify-content: space-between; align-items: center; }
    .header h1 { margin: 0; font-size: 18px; letter-spacing: 1px; }
    .header span { background: #22c55e; color: white; padding: 4px 12px; border-radius: 100px; font-size: 12px; font-weight: 700; }
    .body { background: #f8fafc; padding: 32px; border-radius: 0 0 8px 8px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 28px; }
    .info-card { background: white; border-radius: 8px; padding: 16px; border: 1px solid #e2e8f0; }
    .info-label { font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #94a3b8; margin-bottom: 4px; }
    .info-value { font-size: 15px; font-weight: 600; color: #0f172a; word-break: break-word; }
    .web-btn { display: block; background: #0f172a; color: white; padding: 14px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; text-align: center; margin-bottom: 28px; font-size: 15px; }
    .wa-section { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 24px; margin-bottom: 16px; }
    .wa-section h3 { margin: 0 0 8px 0; font-size: 14px; color: #15803d; display: flex; align-items: center; gap: 8px; }
    .wa-message { background: white; border-radius: 8px; padding: 16px; font-size: 14px; line-height: 1.7; color: #333; border: 1px solid #dcfce7; white-space: pre-wrap; font-family: inherit; margin: 12px 0; }
    .wa-btn { display: block; background: #25D366; color: white; padding: 14px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; text-align: center; font-size: 15px; }
    .call-section { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 24px; margin-bottom: 16px; }
    .call-section h3 { margin: 0 0 8px 0; font-size: 14px; color: #92400e; display: flex; align-items: center; gap: 8px; }
    .call-btn { display: block; background: #f59e0b; color: white; padding: 14px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; text-align: center; font-size: 15px; }
    .footer { margin-top: 20px; font-size: 12px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <h1>AUTOMAIL</h1>
    <span>✅ Nueva web lista</span>
  </div>
  <div class="body">

    <div class="info-grid">
      <div class="info-card">
        <div class="info-label">Negocio</div>
        <div class="info-value">${bizName}</div>
      </div>
      <div class="info-card">
        <div class="info-label">Teléfono</div>
        <div class="info-value">${phone || '—'}</div>
      </div>
      <div class="info-card" style="grid-column: 1/-1">
        <div class="info-label">Dirección</div>
        <div class="info-value">${address || '—'}</div>
      </div>
    </div>

    <a href="${pageUrl}" class="web-btn">👀 Ver la web generada →</a>

    ${phone && isMobile ? `
    <div class="wa-section">
      <h3>💬 Mensaje listo para WhatsApp</h3>
      <p style="font-size:13px; color:#166534; margin:0 0 8px 0">Copia y pega este mensaje en WhatsApp al número de arriba:</p>
      <div class="wa-message">${whatsappMessage.replace(/\*(.+?)\*/g, '<strong>$1</strong>')}</div>
      <a href="${whatsappLink}" class="wa-btn">📱 Abrir WhatsApp directo →</a>
    </div>
    ` : phone ? `
    <div class="call-section">
      <h3>📞 Este número es fijo — toca para llamar</h3>
      <p style="font-size:13px; color:#92400e; margin:0 0 8px 0">Guion sugerido para la llamada:</p>
      <div class="wa-message">${callScript}</div>
      <a href="tel:${phone}" class="call-btn">📞 Llamar a ${phone} →</a>
    </div>
    ` : `
    <p style="font-size:13px;color:#94a3b8;text-align:center">Sin teléfono disponible para este negocio</p>
    `}

  </div>
  <div class="footer">Generado automáticamente por AUTOMAIL</div>
</body>
</html>
    `.trim();

    return { subject, html, text };
}

/**
 * Spanish mobile numbers start with 6 or 7 (after country code).
 * Landlines start with 8 or 9 and don't have WhatsApp.
 */
function isSpanishMobile(phone) {
    if (!phone) return false;
    const digits = phone.replace(/\D/g, '');
    // Strip country code 34 if present
    const local = digits.startsWith('34') ? digits.slice(2) : digits;
    return /^[67]/.test(local) && local.length === 9;
}
