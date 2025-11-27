import { useEffect } from 'react';
import { Campaign, Chapter } from '../types';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  campaign?: Campaign;
  chapter?: Chapter;
}

/**
 * Hook pour gérer dynamiquement les meta tags SEO
 * Utilise directement le DOM pour React 19 compatibilité
 */
const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  image,
  url,
  type = 'website',
  campaign,
  chapter,
}) => {
  const siteTitle = 'Chroniques de Valthera';
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const defaultImage = `${siteUrl}/og-image.png`;
  const defaultDescription = 'Explorez les chroniques épiques de nos campagnes de jeu de rôle dans l\'univers de Valthera et au-delà.';

  useEffect(() => {
    // Construire les méta depuis la campagne si fournie
    let pageTitle = title;
    let pageDescription = description;
    let pageImage = image;
    let pageUrl = url;

    if (campaign) {
      pageTitle = chapter 
        ? `${chapter.title} - ${campaign.title}` 
        : campaign.title;
      pageDescription = chapter 
        ? chapter.summary.replace(/[#*_]/g, '').slice(0, 160) 
        : campaign.pitch;
      pageImage = campaign.imageUrl || defaultImage;
      pageUrl = chapter 
        ? `${siteUrl}/campagne/${campaign.id}#chapitre-${chapter.id}` 
        : `${siteUrl}/campagne/${campaign.id}`;
    }

    const finalTitle = pageTitle ? `${pageTitle} | ${siteTitle}` : siteTitle;
    const finalDescription = pageDescription || defaultDescription;
    const finalImage = pageImage || defaultImage;
    const finalUrl = pageUrl || siteUrl;

    // Mettre à jour le titre
    document.title = finalTitle;

    // Helper pour créer ou mettre à jour une meta tag
    const setMetaTag = (property: string, content: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${property}"]` : `meta[name="${property}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        if (isProperty) {
          meta.setAttribute('property', property);
        } else {
          meta.setAttribute('name', property);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Meta basiques
    setMetaTag('description', finalDescription);
    setMetaTag('robots', 'index, follow');

    // Open Graph (Facebook, Discord, etc.)
    setMetaTag('og:type', type, true);
    setMetaTag('og:title', finalTitle, true);
    setMetaTag('og:description', finalDescription, true);
    setMetaTag('og:image', finalImage, true);
    setMetaTag('og:url', finalUrl, true);
    setMetaTag('og:site_name', siteTitle, true);
    setMetaTag('og:locale', 'fr_FR', true);

    // Twitter Card
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', finalTitle);
    setMetaTag('twitter:description', finalDescription);
    setMetaTag('twitter:image', finalImage);

    // Couleur thème
    setMetaTag('theme-color', '#14b8a6');

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', finalUrl);

    // JSON-LD structured data
    const existingJsonLd = document.querySelector('script[type="application/ld+json"]');
    if (existingJsonLd) {
      existingJsonLd.remove();
    }

    if (campaign) {
      const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: pageTitle,
        description: pageDescription,
        image: finalImage,
        author: {
          '@type': 'Organization',
          name: siteTitle,
        },
        publisher: {
          '@type': 'Organization',
          name: siteTitle,
          logo: {
            '@type': 'ImageObject',
            url: defaultImage,
          },
        },
        datePublished: new Date(campaign.createdAt).toISOString(),
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': finalUrl,
        },
      };

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
  }, [title, description, image, url, type, campaign, chapter, siteUrl, defaultImage, defaultDescription]);

  return null; // Ce composant ne rend rien visuellement
};

export default SEOHead;
