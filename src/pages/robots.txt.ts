import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const base = (site ? site.toString() : 'https://jichangcesu.blog/').replace(/\/+$/, '');
  const sitemapIndexUrl = `${base}/sitemap-index.xml`;
  const sitemapXmlUrl = `${base}/sitemap.xml`;

  const robotsTxt = [
    '# Robots.txt for jichangcesu.blog',
    '# All legitimate crawlers are welcome.',
    '',
    'User-agent: *',
    'Allow: /',
    'Disallow: /dev/',
    'Disallow: /qa/',
    '',
    '# Major Search Engines Explicit Rules',
    'User-agent: Googlebot',
    'Allow: /',
    '',
    'User-agent: bingbot',
    'Allow: /',
    '',
    'User-agent: Baiduspider',
    'Allow: /',
    '',
    'User-agent: yisouspider',
    'Allow: /',
    '',
    `Sitemap: ${sitemapIndexUrl}`,
    `Sitemap: ${sitemapXmlUrl}`,
  ].join('\n');

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
