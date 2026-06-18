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
                model:      'claude-sonnet-4-5',
                max_tokens: 8096,
                messages:   [{ role: 'user', content: prompt }],
            }),
        });

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
        if (!data.content?.[0]?.text) throw new Error('Claude devolvió una respuesta vacía');

        const raw = data.content[0].text;
        return raw
            .replace(/^```html\s*/is, '')
            .replace(/^```\s*/is,    '')
            .replace(/\s*```\s*$/is, '')
            .trim();
    }
}

function buildPrompt(biz) {
    const { name, category, address, phone, rating, reviews, images } = biz;

    const ratingLine = rating
        ? `- Valoración actual en Google Maps: ${rating}/5 (${reviews ?? '?'} reseñas)`
        : '';

    // Generate 5 fake but realistic reviews for the sector
    const reviewsSection = `
SECCIÓN DE RESEÑAS — Genera 5 reseñas ficticias pero realistas y creíbles de clientes satisfechos.
Cada reseña debe tener:
- Nombre real español (nombre + apellido)
- Valoración de 5 estrellas (★★★★★)
- Texto de 2-3 frases específico al sector ${category}, que mencione el trato personal, resultados concretos o un servicio específico
- Diseño tipo tarjetas en grid con foto de avatar generada con iniciales del nombre sobre fondo de color
- Las reseñas deben parecer reales, no genéricas`;

    return `Eres un diseñador web profesional español. Crea una landing page HTML completa, moderna y de alta conversión para este negocio local.

DATOS DEL NEGOCIO:
- Nombre: ${name}
- Sector: ${category}
- Dirección: ${address || 'No disponible'}
- Teléfono: ${phone || 'No disponible'}
${ratingLine}
${images && images.length > 0 ? `- Fotos reales del negocio disponibles (${images.length} imágenes): ${images.join(', ')}` : '- Sin fotos reales disponibles'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REQUISITOS TÉCNICOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Un único archivo HTML autocontenido (CSS y JS inline, sin dependencias externas excepto Google Fonts)
- Totalmente responsive (mobile-first)
- Sin librerías externas pesadas

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECCIONES OBLIGATORIAS (en este orden)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. NAV fijo con logo y botón CTA de llamada

2. HERO — MUY IMPORTANTE:
   ${images && images.length > 0 ? `- Usa la primera foto real del negocio como imagen de fondo del hero con overlay oscuro semitransparente: ${images[0]}` : '- Sin foto real, usa gradiente CSS como fondo'}
   - El nombre del negocio "${name}" debe ser el elemento más prominente visualmente
   - Tamaño de fuente del nombre: mínimo 80px en desktop, 52px en móvil (usar clamp(52px, 10vw, 96px))
   - Usar la tipografía display más característica y dramática de Google Fonts para el nombre
   - El nombre puede ocupar 2-3 líneas si es necesario, con mucho peso visual
   - Subtítulo descriptivo debajo, más pequeño
   - Dos botones CTA: "Pedir cita" y "Ver servicios"
   - Elemento visual flotante con animación (tarjeta con stats del negocio)

3. BARRA DE ESTADÍSTICAS — 3 números impactantes del negocio

4. GALERÍA DE FOTOS (solo si hay imágenes reales disponibles):
   - Si hay imágenes reales, añade una sección galería ANTES de servicios
   - Grid de fotos del negocio real con efecto hover de zoom
   - Máximo 4 fotos en grid 2x2
   - Título: "Nuestras instalaciones" o similar según el sector
   - Si NO hay imágenes reales, omite esta sección completamente

5. SERVICIOS — Grid de 6 tarjetas con icono emoji, título y descripción
   Infiere los servicios más típicos del sector ${category}

6. POR QUÉ ELEGIRNOS — 4 puntos de valor sobre fondo oscuro

7. RESEÑAS DE CLIENTES:
${reviewsSection}

8. FORMULARIO DE CITA:
   - Campos: Nombre completo, Teléfono, Email, Tipo de servicio (select con los servicios del negocio), Fecha preferida (date picker), Mensaje opcional
   - Botón de envío prominente con el color principal del diseño
   - Al hacer submit (preventDefault): mostrar mensaje de confirmación "¡Solicitud recibida! Te llamaremos en menos de 24h" con animación
   - Diseño limpio, sin backend real necesario

9. SECCIÓN "CÓMO LLEGAR":
   - SIN mapa ni iframe de ningún tipo
   - Grid de 4 tarjetas con icono, label en mayúsculas y valor: Dirección, Teléfono, Horario (inferido para el sector), Transporte público cercano (inferido)
   - Diseño limpio sobre fondo claro con sombra suave en cada tarjeta

10. FOOTER con logo, dirección, teléfono y copyright

11. BOTÓN WHATSAPP FLOTANTE${phone ? ` con href="https://wa.me/${phone.replace(/\D/g,'')}"` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REQUISITOS DE DISEÑO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Identidad visual específica al sector ${category} (colores, iconografía, tono)
- Paleta coherente de 4-5 colores, NO genérica
- Google Fonts: una tipografía display dramática para títulos + una sans-serif limpia para el cuerpo
- Micro-animaciones en scroll con IntersectionObserver (vanilla JS)
- Transiciones suaves en hover de tarjetas y botones
- Sombras y bordes redondeados modernos

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REQUISITOS DE LINKS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REGLAS DE LINKS — MUY IMPORTANTE, SEGUIR AL PIE DE LA LETRA:

SOLO se permiten estos 3 tipos de links en toda la página:
1. href="tel:${phone || ''}" — para botones de llamada al teléfono del negocio
2. href="https://wa.me/${phone ? phone.replace(/[^0-9]/g, '') : ''}" — SOLO para el botón flotante de WhatsApp
3. href="#seccion" — para anclas internas de navegación dentro de la misma página

ESTÁ TERMINANTEMENTE PROHIBIDO incluir:
- Cualquier link a redes sociales (Facebook, Instagram, Twitter, LinkedIn, TikTok, YouTube, etc.)
- Cualquier href="#" vacío o sin destino real
- Cualquier link externo a otro sitio web
- Links en el footer a servicios, páginas o secciones
- Links a Google Maps, Tripadvisor, Yelp o cualquier plataforma externa
- Botones o iconos de redes sociales aunque no tengan link

REGLA DE ORO: Si un elemento no tiene una URL real de las 3 permitidas arriba, se escribe como texto plano <span> o <p>, NUNCA como <a>. Esto incluye servicios en el footer, datos de contacto adicionales, y cualquier otro elemento.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INSTRUCCIONES ESPECÍFICAS POR SECTOR:
- Si el sector es "floristería" o similar: NO incluir servicios de coronas fúnebres ni suscripción semanal. Servicios típicos: ramos artesanales, bodas y eventos, decoración de espacios, entrega a domicilio, plantas de interior, ramos de regalo.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REQUISITOS DE COPY Y GÉNERO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Todo en español
- Tono cercano, profesional y persuasivo
- Copy orientado a conversión, no genérico
- Título SEO relevante en el <title>: "${name} | ${category} en ${address?.split(',').pop()?.trim() || 'Madrid'}"

IMPORTANTE — GÉNERO DEL PÚBLICO:
Analiza el nombre del negocio ("${name}") y la categoría ("${category}") para determinar el público:
- Si contiene palabras como "barbería", "barber", "barbero", "caballeros", "gentlemen" → público MASCULINO: usa "clientes", servicios de barba, degradados, afeitado, etc.
- Si contiene "peluquería", "salón", "beauty", "estudio" sin indicación de género → público MIXTO: usa lenguaje neutro ("clientes", "personas"), incluye servicios para todos
- Si contiene "mujer", "dama", "ella", "femme" → público FEMENINO
- En caso de duda → usa siempre lenguaje NEUTRO e incluye servicios para todo tipo de clientes

Devuelve ÚNICAMENTE el código HTML completo empezando por <!DOCTYPE html>. Sin explicaciones, sin markdown, sin bloques de código.`;
}
