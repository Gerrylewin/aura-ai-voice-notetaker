
import React from 'react';
import { SEOData, generateMetaTags, generateStructuredData } from '@/utils/seo';

interface SEOHeadProps {
  seo?: SEOData;
  structuredData?: any[];
}

export function SEOHead({ seo = {}, structuredData = [] }: SEOHeadProps) {
  const metaTags = generateMetaTags(seo);

  React.useEffect(() => {
    // Update document title
    if (metaTags.title) {
      document.title = metaTags.title;
    }

    // Update or create meta tags
    Object.entries(metaTags).forEach(([name, content]) => {
      if (!content || name === 'title') return;

      const isProperty = name.startsWith('og:') || name.startsWith('article:') || name.startsWith('twitter:');
      const attribute = isProperty ? 'property' : 'name';
      
      let metaTag = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      
      if (!metaTag) {
        metaTag = document.createElement('meta') as HTMLMetaElement;
        metaTag.setAttribute(attribute, name);
        document.head.appendChild(metaTag);
      }
      
      metaTag.setAttribute('content', String(content));
    });

    // Add structured data
    structuredData.forEach((data, index) => {
      const scriptId = `structured-data-${index}`;
      let script = document.getElementById(scriptId) as HTMLScriptElement;
      
      if (!script) {
        script = document.createElement('script') as HTMLScriptElement;
        script.id = scriptId;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      
      script.textContent = typeof data === 'string' ? data : JSON.stringify(data);
    });

    // Cleanup function to remove old structured data when component unmounts
    return () => {
      structuredData.forEach((_, index) => {
        const scriptId = `structured-data-${index}`;
        const script = document.getElementById(scriptId);
        if (script) {
          script.remove();
        }
      });
    };
  }, [metaTags, structuredData]);

  return null;
}
