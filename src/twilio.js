/**
 * Sends a WhatsApp message via Twilio.
 *
 * Requirements:
 *   - Twilio account with WhatsApp sandbox OR approved WhatsApp Business sender
 *   - twilioFrom format: "whatsapp:+14155238886" (sandbox) or your approved number
 */
export async function sendWhatsApp({ to, bizName, pageUrl, twilioSid, twilioToken, twilioFrom }) {
    if (!to) return 'no_phone';

    const toFormatted   = `whatsapp:${to}`;
    const message       = buildMessage(bizName, pageUrl);

    const body = new URLSearchParams({
        From: twilioFrom,
        To:   toFormatted,
        Body: message,
    });

    const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
        {
            method:  'POST',
            headers: {
                Authorization: `Basic ${Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64')}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body,
        }
    );

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Twilio error ${res.status}: ${err}`);
    }

    const data = await res.json();
    return data.sid ? `sent:${data.sid}` : 'unknown';
}

function buildMessage(bizName, pageUrl) {
    return `Hola 👋 Te escribo porque he visto que *${bizName}* aún no tiene página web.

He diseñado una para vosotros como ejemplo — podéis verla aquí:
👉 ${pageUrl}

En menos de una semana podríais tenerla activa y empezar a recibir clientes por internet. ¿Os interesa? Con gusto os cuento cómo funciona sin compromiso 😊`;
}
