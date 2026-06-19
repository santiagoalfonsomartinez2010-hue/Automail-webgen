import { Actor } from 'apify';
import { generateLandingPage } from './claude.js';
import { publishToGitHub } from './github.js';
import { sendEmail } from './email.js';
import { scrapeBusinesses } from './scraper.js';
import { loadProcessedSet, saveProcessedSet, businessId } from './processed.js';

await Actor.init();

const input = await Actor.getInput();
if (!input) throw new Error('No se proporcionó ningún input. Rellena el formulario antes de ejecutar.');

const {
    ciudad        = 'Madrid',
    categoria     = 'clinica fisioterapia',
    cantidad      = 10,
    anthropicKey,
    githubToken,
    githubUser,
    githubRepo,
    gmailUser,
    gmailAppPassword,
} = input;

// Validar campos obligatorios
const missing = [];
if (!anthropicKey)    missing.push('anthropicKey');
if (!githubToken)     missing.push('githubToken');
if (!githubUser)      missing.push('githubUser');
if (!githubRepo)      missing.push('githubRepo');
if (!gmailUser)       missing.push('gmailUser');
if (!gmailAppPassword) missing.push('gmailAppPassword');
if (missing.length > 0) {
    throw new Error(`Faltan campos obligatorios: ${missing.join(', ')}`);
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

// ── 1b. FILTRAR NEGOCIOS YA PROCESADOS EN EJECUCIONES ANTERIORES ──────────
const processedSet = await loadProcessedSet();
console.log(`📋 ${processedSet.size} negocios procesados históricamente`);

const newBusinesses = businesses.filter(biz => !processedSet.has(businessId(biz)));
const skipped = businesses.length - newBusinesses.length;

if (skipped > 0) {
    console.log(`⏭️  ${skipped} negocios omitidos (ya procesados antes)`);
}

if (newBusinesses.length === 0) {
    console.log('⚠️  Todos los negocios encontrados ya fueron procesados antes. Prueba otra ciudad o categoría.');
    await Actor.exit();
}

console.log(`🆕 ${newBusinesses.length} negocios nuevos a procesar`);

// ── 2. GENERAR + PUBLICAR + CONTACTAR ─────────────────────────────────────
const results = [];

for (const biz of newBusinesses) {
    console.log(`\n🔄 Procesando: ${biz.name}`);

    try {
        // 2a. Generar landing page con Claude
        const photoCount = biz.images?.length || 0;
        console.log(`  📸 ${photoCount > 0 ? photoCount + ' fotos reales encontradas' : 'Sin fotos — usando diseño CSS'}`);
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

        // 2c. Enviar email (solo si hay email disponible)
        let emailStatus = 'no_email';
        if (true) { // Always send lead email to Santiago
            emailStatus = await sendEmail({
                to: gmailUser,
                bizName: biz.name,
                pageUrl,
                city: ciudad,
                phone: biz.phone,
                address: biz.address,
                gmailUser,
                gmailAppPassword,
            });
            console.log(`  📧 Email: ${emailStatus}`);
        } else {
            console.log(`  📧 Email: sin email, omitido`);
        }

        results.push({
            name:        biz.name,
            email:       biz.email || '—',
            phone:       biz.phone || '—',
            address:     biz.address || '—',
            category:    biz.category || categoria,
            rating:      biz.rating || '—',
            pageUrl,
            emailStatus,
            status:      'completado',
            timestamp:   new Date().toISOString(),
        });

        // Marcar como procesado SOLO si todo salió bien, y guardar de
        // inmediato para no perder progreso si el Actor se cae a mitad.
        processedSet.add(businessId(biz));
        await saveProcessedSet(processedSet);

    } catch (err) {
        console.error(`  ❌ Error con ${biz.name}: ${err.message}`);
        results.push({
            name:      biz.name,
            status:    'error',
            error:     err.message,
            timestamp: new Date().toISOString(),
        });
        // No se marca como procesado — se reintentará en la próxima ejecución.
    }

    await new Promise(r => setTimeout(r, 2000));
}

// ── 3. OUTPUT ──────────────────────────────────────────────────────────────
await Actor.pushData(results);

const completed = results.filter(r => r.status === 'completado').length;
const errors    = results.filter(r => r.status === 'error').length;
const noEmail   = results.filter(r => r.emailStatus === 'no_email').length;

console.log(`\n🎯 RESUMEN FINAL`);
console.log(`   ✅ Completados:      ${completed}`);
console.log(`   ❌ Errores:          ${errors}`);
console.log(`   ⏭️  Omitidos (repetidos): ${skipped}`);
console.log(`   📵 Sin email:        ${noEmail}`);
console.log(`   📊 Total procesados: ${results.length}`);

await Actor.exit();
