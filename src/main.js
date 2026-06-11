import { Actor } from 'apify';
import { generateLandingPage } from './claude.js';
import { publishToGitHub } from './github.js';
import { sendWhatsApp } from './twilio.js';
import { scrapeBusinesses } from './scraper.js';

await Actor.init();

// FIX 1: Guard against null input (Actor.getInput() returns null if nothing was passed)
const input = await Actor.getInput();
if (!input) throw new Error('No se proporcionó ningún input. Rellena el formulario antes de ejecutar.');

const {
    ciudad       = 'Madrid',
    categoria    = 'clinica fisioterapia',
    cantidad     = 10,
    anthropicKey,
    githubToken,
    githubUser,
    githubRepo,
    twilioSid,
    twilioToken,
    twilioFrom,
} = input;

// FIX 2: Validate required secrets up front so the run fails fast with a clear message
const missing = [];
if (!anthropicKey) missing.push('anthropicKey');
if (!githubToken)  missing.push('githubToken');
if (!githubUser)   missing.push('githubUser');
if (!githubRepo)   missing.push('githubRepo');
if (!twilioSid)    missing.push('twilioSid');
if (!twilioToken)  missing.push('twilioToken');
if (!twilioFrom)   missing.push('twilioFrom');
if (missing.length > 0) {
    throw new Error(`Faltan campos obligatorios en el input: ${missing.join(', ')}`);
}

console.log(`🚀 Iniciando AUTOMAIL WebGen`);
console.log(`📍 Ciudad: ${ciudad} | Categoría: ${categoria} | Cantidad: ${cantidad}`);

// ── 1. SCRAPE ──────────────────────────────────────────────────────────────
const businesses = await scrapeBusinesses({ ciudad, categoria, cantidad });

if (businesses.length === 0) {
    console.log('⚠️  No se encontraron negocios. Prueba con otra ciudad o categoría.');
    await Actor.exit();
}

console.log(`✅ ${businesses.length} negocios sin web encontrados`);

// ── 2. GENERAR + PUBLICAR + CONTACTAR ─────────────────────────────────────
const results = [];

for (const biz of businesses) {
    console.log(`\n🔄 Procesando: ${biz.name}`);

    try {
        // 2a. Generar landing page con Claude
        const html = await generateLandingPage(biz, anthropicKey);
        console.log(`  ✏️  Landing page generada (${Math.round(html.length / 1024)}KB)`);

        // 2b. Publicar en GitHub Pages
        const pageUrl = await publishToGitHub({
            html,
            bizName: biz.name,
            githubToken,
            githubUser,
            githubRepo,
        });
        console.log(`  🌐 Publicada en: ${pageUrl}`);

        // 2c. Enviar WhatsApp (solo si hay teléfono válido)
        let whatsappStatus = 'no_phone';
        if (biz.phone) {
            whatsappStatus = await sendWhatsApp({
                to: biz.phone,
                bizName: biz.name,
                pageUrl,
                twilioSid,
                twilioToken,
                twilioFrom,
            });
            console.log(`  📱 WhatsApp: ${whatsappStatus}`);
        } else {
            console.log(`  📱 WhatsApp: sin teléfono, omitido`);
        }

        results.push({
            name:           biz.name,
            phone:          biz.phone || '—',
            address:        biz.address || '—',
            category:       biz.category || categoria,
            rating:         biz.rating || '—',
            pageUrl,
            whatsappStatus,
            status:         'completado',
            timestamp:      new Date().toISOString(),
        });

    } catch (err) {
        console.error(`  ❌ Error con ${biz.name}: ${err.message}`);
        results.push({
            name:      biz.name,
            phone:     biz.phone || '—',
            status:    'error',
            error:     err.message,
            timestamp: new Date().toISOString(),
        });
    }

    // Pausa entre negocios para no saturar APIs (2s)
    await new Promise(r => setTimeout(r, 2000));
}

// ── 3. OUTPUT ──────────────────────────────────────────────────────────────
await Actor.pushData(results);

const completed = results.filter(r => r.status === 'completado').length;
const errors    = results.filter(r => r.status === 'error').length;
const noPhone   = results.filter(r => r.whatsappStatus === 'no_phone').length;

console.log(`\n🎯 RESUMEN FINAL`);
console.log(`   ✅ Completados:       ${completed}`);
console.log(`   ❌ Errores:           ${errors}`);
console.log(`   📵 Sin teléfono:      ${noPhone}`);
console.log(`   📊 Total procesados:  ${results.length}`);

await Actor.exit();
