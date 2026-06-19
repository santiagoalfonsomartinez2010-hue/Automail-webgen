import { Actor } from 'apify';

const STORE_NAME = 'automail-processed-businesses';
const RECORD_KEY = 'processed-list';

/**
 * Loads the list of business identifiers already processed in previous runs.
 * Uses a NAMED Key-Value Store, which persists across runs (unlike the
 * default store, which is tied to a single run and gets cleaned up).
 */
export async function loadProcessedSet() {
    const store = await Actor.openKeyValueStore(STORE_NAME);
    const existing = await store.getValue(RECORD_KEY);
    return new Set(existing || []);
}

/**
 * Saves the updated list of processed business identifiers back to the store.
 */
export async function saveProcessedSet(processedSet) {
    const store = await Actor.openKeyValueStore(STORE_NAME);
    await store.setValue(RECORD_KEY, [...processedSet]);
}

/**
 * Builds a stable identifier for a business so the same place isn't
 * processed twice, even if scraped again in a future run.
 * Combines normalised name + normalised address for uniqueness.
 */
export function businessId(biz) {
    const norm = (s) =>
        (s || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // strip accents
            .replace(/[^a-z0-9]/g, '');       // keep only alphanumerics

    return `${norm(biz.name)}|${norm(biz.address)}`;
}
