// Jedno źródło bazy ścieżki publicznych assetów. Layout (preload fontów, favicon, og:image)
// i scripts/prefix-base-assets.mjs (url() w CSS, ścieżki w HTML) muszą liczyć ją tą samą funkcją.
// Why: gdy liczyły ją osobno, preload wskazywał /preview/nova/fonts, a @font-face szukał /fonts.
// Zwraca ścieżkę bez wiodącego i końcowego ukośnika, pusty string dla katalogu głównego.
export function normalizePublicBasePath(value) {
  return String(value ?? '').trim().replace(/^\/+|\/+$/g, '');
}

export function resolvePublicBasePath({ publicBasePath, publicSiteUrl }) {
  const explicitBasePath = normalizePublicBasePath(publicBasePath);
  if (explicitBasePath) return explicitBasePath;

  if (!publicSiteUrl) return '';

  try {
    const raw = String(publicSiteUrl).trim();
    const valid = raw.startsWith('http') ? raw : `https://${raw.replace(/^\/+/, '')}`;
    return normalizePublicBasePath(new URL(valid).pathname);
  } catch {
    return '';
  }
}
