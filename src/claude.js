/**
 * Calls the Claude API to generate a professional, unique landing page.
 *
 * FIX 1: Model name corrected to current production model
 * FIX 2: max_tokens raised to 8096 — 4096 was often not enough for full HTML pages
 * FIX 3: More robust markdown fence stripping (multiline regex with `s` flag)
 * FIX 4: Retry once on 529 (overloaded) before throwing
 */
export async function generateLandingPage(biz, apiKey) {
    if (!apiKey) throw new Error('Anthropic API key no proporcionada');

    const prompt = buildPrompt(biz);

    for (let attempt = 1; attempt <= 2; attempt++) {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key':         apiKey,
                'anthropic-version': '2023-06-01',
                'content-type':      'application/json',
            },
            body: JSON.stringify({
                model:      'claude-sonnet-4-20250514',
                max_tokens: 8096,
                messages:   [{ role: 'user', content: prompt }],
            }),
        });

        // Retry once on 529 (API overloaded)
        if (res.status === 529 && attempt === 1) {
            console.warn('  ⏳ Claude sobrecargado, reintentando en 10s...');
            await new Promise(r => setTimeout(r, 10_000));
            continue;
        }

        if (!res.ok) {
            const err = await res.text();
            throw new Error(`Claude API error ${res.status}: ${err}`);
        }

        const data = await res.json();

        if (!data.content?.[0]?.text) {
            throw new Error('Claude devolvió una respuesta vacía');
        }

        const raw = data.content[0].text;

        // FIX 3: strip markdown fences robustly
        return raw
            .replace(/^```html\s*/is, '')
            .replace(/^```\s*/is,    '')
            .replace(/\s*```\s*$/is, '')
            .trim();
    }
}

function buildPrompt(biz) {
    const { name, category, address, phone, rating, reviews } = biz;

    const ratingLine = rating
        ? `- Valoración actual en Google Maps: ${rating}/5 (${reviews ?? '?'} reseñas)`
        : '';

    return `Eres un diseñador web profesional español. Crea una landing page HTML completa, moderna y de alta conversión para este negocio local.

DATOS DEL NEGOCIO:
- Nombre: ${name}
- Sector: ${category}
- Dirección: ${address || 'No disponible'}
- Teléfono: ${phone || 'No disponible'}
${ratingLine}

REQUISITOS TÉCNICOS:
- Un único archivo HTML autocontenido (CSS y JS inline, sin dependencias externas excepto Google Fonts)
- Totalmente responsive (mobile-first)
- Carga rápida: sin librerías pesadas

REQUISITOS DE DISEÑO:
- Diseño profesional con identidad visual coherente al sector (${category})
- Paleta de colores específica para el sector, no genérica
- Tipografía de Google Fonts apropiada (importar en el <head>)
- Hero section potente con headline y CTA
- Sección de servicios (infiere 4-6 servicios típicos del sector)
- Sección "Por qué elegirnos" con 3-4 puntos de valor
- Sección de contacto con el teléfono y dirección reales
- Footer profesional
- Micro-animaciones sutiles en scroll (vanilla JS, sin jQuery)
${phone ? '- Botón de WhatsApp flotante con el número real del negocio' : ''}

REQUISITOS DE COPY:
- Todo en español
- Tono cercano y profesional
- Copy persuasivo orientado a conversión
- Título SEO relevante en el <title>

Devuelve ÚNICAMENTE el código HTML completo, empezando por <!DOCTYPE html>. Sin explicaciones, sin markdown, sin bloques de código.`;
}
