import { ApifyClient } from 'apify-client';

export async function scrapeBusinesses({ ciudad, categoria, cantidad }) {
    const token = process.env.APIFY_TOKEN;
    if (!token) throw new Error('APIFY_TOKEN no está disponible');

    const client = new ApifyClient({ token });

    // Fetch more than needed since we'll filter by website, phone type, and category
    const fetchQuantity = Math.min(cantidad * 8, 200);

    console.log(`🗺️  Buscando "${categoria}" en "${ciudad}"...`);

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

    console.log(`📦 ${items.length} negocios encontrados en total`);

    // ── FILTER 1: no website ────────────────────────────────────────────────
    const noWebsite = items.filter(item => {
        const w = (item.website || item.url || item.websiteUrl || '').trim();
        return w === '' || w === 'N/A';
    });
    console.log(`🔍 ${noWebsite.length} negocios sin web`);

    // ── FILTER 2: mobile phone only (so we can contact via WhatsApp) ────────
    const mobileOnly = noWebsite.filter(item => {
        const raw = item.phone || item.phoneNumber || item.phoneUnformatted || '';
        return isSpanishMobile(raw);
    });
    console.log(`📱 ${mobileOnly.length} negocios con móvil (sin fijo)`);

    // ── FILTER 3: male grooming only (barbería) ──────────────────────────────
    const maleGrooming = mobileOnly.filter(item => isMaleGrooming(item, categoria));
    console.log(`💈 ${maleGrooming.length} negocios de barbería/peluquería masculina`);

    if (maleGrooming.length === 0) {
        console.warn('⚠️  No se encontraron barberías con móvil sin web. Prueba aumentando "cantidad" o cambia la ciudad.');
        return [];
    }

    return maleGrooming
        .slice(0, cantidad)
        .map(normalise(categoria));
}

/**
 * Spanish mobile numbers start with 6 or 7 (after country code).
 * Landlines start with 8 or 9 and can't receive WhatsApp messages.
 */
function isSpanishMobile(phone) {
    if (!phone) return false;
    const digits = phone.replace(/\D/g, '');
    const local = digits.startsWith('34') ? digits.slice(2) : digits;
    return /^[67]/.test(local) && local.length === 9;
}

/**
 * Detect male-oriented hair salons / barbershops by name or category keywords.
 */
function isMaleGrooming(item, categoria) {
    const name = (item.title || item.name || '').toLowerCase();
    const cat  = (item.categoryName || item.category || item.type || '').toLowerCase();
    const text = `${name} ${cat}`;

    const maleKeywords = [
        'barber', 'barbería', 'barberia', 'caballero', 'caballeros',
        'gentlemen', 'gentleman', 'men\'s', 'mens', 'hombre', 'hombres',
        'classic cuts', 'old school',
    ];

    return maleKeywords.some(kw => text.includes(kw));
}

function normalise(categoria) {
    return item => ({
        name:     item.title        || item.name        || 'Negocio sin nombre',
        email:    item.email        || item.emailAddress || '',
        phone:    item.phone        || item.phoneNumber  || item.phoneUnformatted || '',
        address:  item.address      || item.location     || item.street || '',
        category: item.categoryName || item.category     || item.type  || categoria,
        rating:   item.totalScore   || item.rating       || null,
        reviews:  item.reviewsCount || item.reviews      || null,
        images:   extractImages(item),
    });
}

/**
 * Extract up to 5 real photo URLs from the Google Maps result.
 * The compass Actor stores images in several possible fields.
 */
function extractImages(item) {
    const imgs = [];

    // Field 1: imageUrls — array of direct URLs
    if (Array.isArray(item.imageUrls)) {
        imgs.push(...item.imageUrls);
    }

    // Field 2: images — array of objects with {url} or {imageUrl}
    if (Array.isArray(item.images)) {
        for (const img of item.images) {
            const url = img.url || img.imageUrl || img.src || '';
            if (url) imgs.push(url);
        }
    }

    // Field 3: photos — same pattern
    if (Array.isArray(item.photos)) {
        for (const p of item.photos) {
            const url = p.url || p.imageUrl || p.src || p;
            if (typeof url === 'string' && url.startsWith('http')) imgs.push(url);
        }
    }

    // Field 4: featuredImage — single cover photo
    if (item.featuredImage) imgs.push(item.featuredImage);

    // Deduplicate and return up to 5
    return [...new Set(imgs)].slice(0, 5);
}
