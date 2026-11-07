import copy from '@data/i18n/nova.json';

export type NovaLocale = 'pl' | 'en';

// Why: lista języków jest w jednym miejscu, żeby dropdown i ścieżki nie rozjechały się przy dodaniu języka.
export const novaLocaleMeta: Record<NovaLocale, { label: string; short: string }> = {
  en: { label: '简体中文', short: 'CN' },
  pl: { label: 'Polski', short: 'PL' },
};

export const novaLocales: NovaLocale[] = ['en'];

export function getNovaCopy(locale: NovaLocale = 'pl') {
  return copy[locale] ?? copy.pl;
}

export function getNovaSectionCopy(locale: NovaLocale, dataKey?: string) {
  if (!dataKey) return undefined;
  return getNovaCopy(locale).sections[dataKey as keyof typeof copy.pl.sections];
}

function withNovaBase(path: string): string {
  const configuredBase = process.env.PUBLIC_BASE_PATH || import.meta.env.BASE_URL;
  const base = configuredBase === '/'
    ? ''
    : `/${configuredBase.replace(/^\/+|\/+$/g, '')}`;
  return `${base}${path}` || '/';
}

export function getNovaLocalePath(locale: NovaLocale): string {
  return withNovaBase('/');
}

export function getNovaNavigationPath(href: string, locale: NovaLocale): string {
  if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return href;
  }

  if (href.startsWith('/#') || href.startsWith('#')) {
    const hash = href.startsWith('/#') ? href.slice(1) : href;
    const base = withNovaBase('/');
    const cleanBase = base.endsWith('/') ? base : `${base}/`;
    return `${cleanBase}${hash}`;
  }

  const normalized = href.startsWith('/') ? href : `/${href}`;
  return withNovaBase(normalized);
}
