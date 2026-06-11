import { ApifyClient } from 'apify-client';

export async function scrapeBusinesses({ ciudad, categoria, cantidad }) {
    const token = process.env.APIFY_TOKEN;
    if (!token) throw new Error('APIFY_TOKEN no está disponible');

    const client = new ApifyClient({ token });
    console.log(`🗺️  Buscando "${categoria}" en "${ciudad}"...`);

    const run = await client
        .actor('xmiso_scrapers/businesses-without-websites-leads-scraper-google-maps')
        .call(
            {
                searchQuery: `${categoria} en ${ciudad}`,
                maxResults: cantidad,
                countryCode: 'ES',
            },
            { waitSecs: 600 }
        );

    if (run.status !== 'SUCCEEDED') {
        throw new Error(`Sub-Actor terminó con estado: ${run.status}`);
    }

    const { items } = await client
        .dataset(run.defaultDatasetId)
        .listItems({ limit: cantidad });

    if (!items || items.length === 0) {
        console.warn('⚠️  El scraper no devolvió resultados.');
        return [];
    }

    return items.map(item => ({
        name:     item.title        || item.name        || 'Negocio sin nombre',
        email:    item.email        || item.emailAddress || '',
        phone:    item.phone        || item.phoneNumber  || '',
        address:  item.address      || item.location     || '',
        category: item.categoryName || item.category     || categoria,
        rating:   item.totalScore   || item.rating       || null,
        reviews:  item.reviewsCount || item.reviews      || null,
    }));
}
