
export interface SEOData {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'book' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}

export const defaultSEO: SEOData = {
  title: 'Million Dollar eBooks - Discover Fresh Voices & Support Rising Authors',
  description: 'Discover amazing eBooks for just $1 and support rising authors. Read daily stories, connect with writers, and find your next great read.',
  keywords: ['ebooks', 'authors', 'reading', 'books', 'stories', 'writers', 'literature'],
  image: 'https://dollarebooks.app/lovable-uploads/41d6c92c-08df-42d6-abd8-bf3735f498ca.png',
  url: 'https://dollarebooks.app',
  type: 'website'
};

export const generateMetaTags = (seo: SEOData) => {
  const meta = { ...defaultSEO, ...seo };
  
  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords?.join(', '),
    'og:title': meta.title,
    'og:description': meta.description,
    'og:image': meta.image,
    'og:url': meta.url,
    'og:type': meta.type,
    'twitter:card': 'summary_large_image',
    'twitter:title': meta.title,
    'twitter:description': meta.description,
    'twitter:image': meta.image,
    ...(meta.author && { 'article:author': meta.author }),
    ...(meta.publishedTime && { 'article:published_time': meta.publishedTime }),
    ...(meta.modifiedTime && { 'article:modified_time': meta.modifiedTime }),
    ...(meta.section && { 'article:section': meta.section }),
    ...(meta.tags && { 'article:tag': meta.tags.join(',') })
  };
};

export const generateStructuredData = (type: string, data: any) => {
  const baseData = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data
  };

  return JSON.stringify(baseData);
};

export const organizationStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Million Dollar eBooks',
  description: 'Discover Fresh Voices & Support Rising Authors for Just $1',
  url: 'https://dollarebooks.app',
  logo: 'https://dollarebooks.app/lovable-uploads/41d6c92c-08df-42d6-abd8-bf3735f498ca.png',
  sameAs: [
    'https://www.producthunt.com/products/million-dollar-ebooks'
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    url: 'https://dollarebooks.app/support'
  }
};

export const websiteStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Million Dollar eBooks',
  url: 'https://dollarebooks.app',
  description: 'Discover Fresh Voices & Support Rising Authors for Just $1',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://dollarebooks.app/discover?search={search_term_string}',
    'query-input': 'required name=search_term_string'
  }
};
