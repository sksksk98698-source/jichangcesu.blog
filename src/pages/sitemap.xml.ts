import type { APIRoute } from 'astro';

const pages = [
  { url: '/', priority: '1.0', changefreq: 'daily' },
  { url: '/brands/', priority: '0.9', changefreq: 'daily' },
  { url: '/clients/', priority: '0.8', changefreq: 'weekly' },
  { url: '/faq/', priority: '0.9', changefreq: 'weekly' },
  { url: '/warning/', priority: '0.8', changefreq: 'weekly' },
  { url: '/free/', priority: '0.8', changefreq: 'weekly' },
  { url: '/about/', priority: '0.7', changefreq: 'monthly' },
  { url: '/cookies/', priority: '0.3', changefreq: 'yearly' },
  { url: '/polityka-prywatnosci/', priority: '0.3', changefreq: 'yearly' }
];

export const GET: APIRoute = ({ site }) => {
  const base = (site ? site.toString() : 'https://jichangcesu.blog/').replace(/\/+$/, '');
  const now = new Date().toISOString();

  const xmlUrls = pages.map(p => `  <url>
    <loc>${base}${p.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
