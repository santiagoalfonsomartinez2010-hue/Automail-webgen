import { ApifyClient } from 'apify-client';

export async function scrapeBusinesses({ ciudad, categoria, cantidad }) {
    const token = process.env.APIFY_TOKEN;
    if (!token) throw new Error('APIFY_TOKEN no está disponible');

    const client = new ApifyClient({ token });

    // Fetch 5x more than needed since we'll filter out those with websites
    const fetchQuantity = Math.min(cantidad * 5, 200);

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

    // ── FILTER: no website ────────────────────────────────────────────────
    // The Actor returns the website field when a business has one registered.
    // We keep only those where website is missing or empty.
    const noWebsite = items.filter(item => {
        const w = (item.website || item.url || item.websiteUrl || '').trim();
        return w === '' || w === 'N/A';
    });

    console.log(`🔍 ${noWebsite.length} negocios sin web`);

    if (noWebsite.length === 0) {
        console.warn('⚠️  Todos los negocios encontrados tienen web. Aumentando búsqueda...');
        // Last resort: return items with the least-complete profiles
        // (more likely to be small local businesses)
        return items
            .sort((a, b) => (a.reviewsCount || 0) - (b.reviewsCount || 0))
            .slice(0, cantidad)
            .map(normalise(categoria));
    }

    return noWebsite
        .slice(0, cantidad)
        .map(normalise(categoria));
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
    });
}
