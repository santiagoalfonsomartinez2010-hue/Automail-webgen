/**
 * Publishes an HTML file to a GitHub Pages repository.
 *
 * FIX 1: GitHub API returns 404 (not an exception) for missing files —
 *         the old try/catch was silently swallowing real errors too.
 *         Now we check res.status explicitly.
 * FIX 2: Added User-Agent header (GitHub API requires it, rejects without it)
 * FIX 3: Better error message when the repo doesn't exist or Pages isn't enabled
 * FIX 4: Small delay after publish so GitHub CDN has time to propagate
 */
export async function publishToGitHub({ html, bizName, githubToken, githubUser, githubRepo }) {
    const slug    = toSlug(bizName);
    const path    = `${slug}/index.html`;
    const content = Buffer.from(html).toString('base64');
    const apiBase = `https://api.github.com/repos/${githubUser}/${githubRepo}/contents/${path}`;

    const headers = {
        Authorization:        `Bearer ${githubToken}`,
        Accept:               'application/vnd.github+json',
        'Content-Type':       'application/json',
        'User-Agent':         'automail-webgen/1.0',   // FIX 2
        'X-GitHub-Api-Version': '2022-11-28',
    };

    // FIX 1: check status code, not catch — 404 = file doesn't exist (ok), anything else = real error
    let sha;
    const checkRes = await fetch(apiBase, { headers });

    if (checkRes.ok) {
        const existing = await checkRes.json();
        sha = existing.sha;
    } else if (checkRes.status === 404) {
        // File doesn't exist yet — that's fine, we'll create it
        sha = undefined;
    } else {
        // FIX 3: surface real GitHub errors (wrong token, repo doesn't exist, etc.)
        const errBody = await checkRes.text();
        throw new Error(`GitHub check failed ${checkRes.status}: ${errBody} — ¿El repo "${githubRepo}" existe y el token tiene permisos de escritura?`);
    }

    const body = {
        message: `automail: landing page para ${bizName}`,
        content,
        ...(sha ? { sha } : {}),
    };

    const putRes = await fetch(apiBase, {
        method:  'PUT',
        headers,
        body:    JSON.stringify(body),
    });

    if (!putRes.ok) {
        const err = await putRes.text();
        throw new Error(`GitHub PUT error ${putRes.status}: ${err}`);
    }

    // FIX 4: small pause so GitHub Pages CDN starts propagating
    await new Promise(r => setTimeout(r, 1000));

    return `https://${githubUser}.github.io/${githubRepo}/${slug}/`;
}

/** Converts a business name to a URL-safe slug */
function toSlug(name) {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')   // strip accents (á→a, ñ→n, etc.)
        .replace(/[^a-z0-9\s-]/g, '')      // remove special chars
        .trim()
        .replace(/\s+/g, '-')              // spaces to hyphens
        .replace(/-+/g, '-')               // collapse double hyphens
        .substring(0, 60);
}
