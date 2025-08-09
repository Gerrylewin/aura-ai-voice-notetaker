
export interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export const generateSitemap = (entries: SitemapEntry[]): string => {
  const baseUrl = 'https://dollarebooks.app';
  
  const header = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  const footer = `</urlset>`;

  const urls = entries.map(entry => {
    const url = entry.url.startsWith('http') ? entry.url : `${baseUrl}${entry.url}`;
    
    return `  <url>
    <loc>${url}</loc>
    ${entry.lastmod ? `    <lastmod>${entry.lastmod}</lastmod>` : ''}
    ${entry.changefreq ? `    <changefreq>${entry.changefreq}</changefreq>` : ''}
    ${entry.priority ? `    <priority>${entry.priority}</priority>` : ''}
  </url>`;
  }).join('\n');

  return `${header}\n${urls}\n${footer}`;
};

export const staticPages: SitemapEntry[] = [
  {
    url: '/',
    changefreq: 'daily',
    priority: 1.0
  },
  {
    url: '/discover',
    changefreq: 'daily',
    priority: 0.9
  },
  {
    url: '/stories',
    changefreq: 'daily',
    priority: 0.9
  },
  {
    url: '/library',
    changefreq: 'weekly',
    priority: 0.7
  },
  {
    url: '/dashboard',
    changefreq: 'daily',
    priority: 0.8
  },
  {
    url: '/support',
    changefreq: 'monthly',
    priority: 0.5
  },
  {
    url: '/terms',
    changefreq: 'yearly',
    priority: 0.3
  },
  {
    url: '/privacy',
    changefreq: 'yearly',
    priority: 0.3
  }
];
