import { ApifyClient } from 'apify-client';

/**
 * Scrape Google Maps for businesses without a website.
 * Uses the xmiso_scrapers/businesses-without-websites-leads-scraper-google-maps Actor.
 *
 * FIX 1: Removed unused `Actor` import
 * FIX 2: Added `waitSecs` to `.call()` so it polls until the sub-Actor finishes
 *         (default has no guarantee of waiting long enough for large scrapes)
 * FIX 3: Robust field normalisation — the Actor returns `title` not `name`
 */
export async function scrapeBusinesses({ ciudad, categoria, cantidad }) {
    const token = process.env.APIFY_TOKEN;

    if (!token) throw new Error('APIFY_TOKEN env var not set — Apify injects this automatically in production');

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
            {
                // FIX 2: poll until the sub-Actor finishes (up to 10 min)
                waitSecs: 600,
            }
        );

    if (run.status !== 'SUCCEEDED') {
        throw new Error(`Sub-Actor terminó con estado: ${run.status}`);
    }

    const { items } = await client
        .dataset(run.defaultDatasetId)
        .listItems({ limit: cantidad });

    if (!items || items.length === 0) {
        console.warn('⚠️  El scraper no devolvió resultados. Prueba con otra ciudad o categoría.');
        return [];
    }

    // FIX 3: normalise all possible field names the Actor might return
    return items.map(item => ({
        name:     item.title       || item.name        || 'Negocio sin nombre',
        phone:    normalizePhone(item.phone || item.phoneNumber || item.phoneUnformatted || ''),
        address:  item.address     || item.location    || item.street || '',
        category: item.categoryName || item.category   || item.type  || categoria,
        rating:   item.totalScore  || item.rating      || null,
        reviews:  item.reviewsCount || item.reviews    || null,
    }));
}

/**
 * Convert Spanish local numbers to E.164 (+34XXXXXXXXX) for Twilio.
 * FIX 4: Handle numbers with spaces and dashes (common in Spanish data)
 */
function normalizePhone(raw) {
    if (!raw) return '';
    const digits = raw.replace(/\D/g, '');
    if (!digits) return '';
    if (digits.startsWith('34') && digits.length === 11) return `+${digits}`;
    if (digits.length === 9 && /^[6789]/.test(digits)) return `+34${digits}`;
    if (digits.startsWith('+')) return raw.replace(/\s/g, '');
    if (digits.length > 9) return `+${digits}`;
    return ''; // unrecognisable — return empty so we skip WhatsApp
}
