import { ApifyClient } from 'apify-client';

/**
 * Scrape Google Maps for businesses without a website.
 * Uses compass/crawler-google-places — the most reliable Google Maps Actor on Apify.
 * Then filters results to only keep businesses that match the requested category.
 */
export async function scrapeBusinesses({ ciudad, categoria, cantidad }) {
    const token = process.env.APIFY_TOKEN;
    if (!token) throw new Error('APIFY_TOKEN no está disponible');

    const client = new ApifyClient({ token });

    // Request more than needed so filtering doesn't leave us short
    const fetchQuantity = Math.min(cantidad * 3, 150);

    console.log(`🗺️  Buscando "${categoria}" en "${ciudad}" (solicitando ${fetchQuantity} para filtrar)...`);

    const run = await client
        .actor('compass/crawler-google-places')
        .call(
            {
                searchStringsArray: [`${categoria} ${ciudad}`],
                maxCrawledPlacesPerSearch: fetchQuantity,
                language: 'es',
                countryCode: 'es',
            },
            { waitSecs: 600 }
        );

    if (run.status !== 'SUCCEEDED') {
        throw new Error(`Actor de Google Maps terminó con estado: ${run.status}`);
    }

    const { items } = await client
        .dataset(run.defaultDatasetId)
        .listItems({ limit: fetchQuantity });

    if (!items || items.length === 0) {
        console.warn('⚠️  El scraper no devolvió resultados.');
        return [];
    }

    console.log(`📦 ${items.length} negocios encontrados antes de filtrar`);

    // ── FILTER 1: must not have a website ────────────────────────────────
    const noWebsite = items.filter(item => {
        const url = item.website || item.url || item.websiteUrl || '';
        return !url || url.trim() === '';
    });

    console.log(`🔍 ${noWebsite.length} negocios sin web`);

    // ── FILTER 2: category must match what was requested ─────────────────
    const keywords = buildKeywords(categoria);
    const matched = noWebsite.filter(item => {
        const cat = (item.categoryName || item.category || item.type || '').toLowerCase();
        const name = (item.title || item.name || '').toLowerCase();
        // Accept if category OR name contains any of our keywords
        return keywords.some(kw => cat.includes(kw) || name.includes(kw));
    });

    console.log(`✅ ${matched.length} negocios coinciden con "${categoria}"`);

    // If strict filtering left us with nothing, fall back to no-website only
    const pool = matched.length > 0 ? matched : noWebsite;
    if (matched.length === 0) {
        console.warn(`⚠️  Filtro de categoría muy estricto — usando todos los negocios sin web`);
    }

    // Return up to the requested quantity
    return pool.slice(0, cantidad).map(item => ({
        name:     item.title        || item.name        || 'Negocio sin nombre',
        email:    item.email        || item.emailAddress || '',
        phone:    item.phone        || item.phoneNumber  || item.phoneUnformatted || '',
        address:  item.address      || item.location     || item.street || '',
        category: item.categoryName || item.category     || item.type  || categoria,
        rating:   item.totalScore   || item.rating       || null,
        reviews:  item.reviewsCount || item.reviews      || null,
    }));
}

/**
 * Build a list of keywords from the search string to use for category matching.
 * e.g. "clinica fisioterapia" → ["clinica", "fisioterapia", "fisio", "physiotherapy"]
 */
function buildKeywords(categoria) {
    const base = categoria.toLowerCase().split(/\s+/).filter(w => w.length > 3);

    // Add common Spanish synonyms / abbreviations per sector
    const synonyms = {
        'fisioterapia':  ['fisio', 'rehabilitacion', 'physiotherapy', 'terapia'],
        'peluqueria':    ['peluquer', 'salon', 'barberia', 'barbero', 'estilista', 'hair'],
        'restaurante':   ['restaur', 'bar', 'cafeteria', 'bistro', 'comida', 'gastro'],
        'dentista':      ['dental', 'odontolog', 'clinica dental', 'dent'],
        'gimnasio':      ['gym', 'fitness', 'sport', 'entrenamiento'],
        'academia':      ['academ', 'escuela', 'clases', 'formacion'],
        'inmobiliaria':  ['inmobiliar', 'agencia inmobil', 'pisos', 'real estate'],
        'fontanero':     ['fontan', 'plomero', 'instalaciones'],
        'electricista':  ['electric', 'instalador'],
        'taller':        ['taller', 'mecanico', 'automovil', 'garaje'],
        'clinica':       ['clinic', 'centro medico', 'medico', 'salud'],
    };

    const extra = [];
    for (const [key, syns] of Object.entries(synonyms)) {
        if (categoria.toLowerCase().includes(key)) {
            extra.push(...syns);
        }
    }

    return [...new Set([...base, ...extra])];
}
