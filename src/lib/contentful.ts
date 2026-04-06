import { createClient } from 'contentful';

const client = createClient({
  space: import.meta.env.VITE_CONTENTFUL_SPACE_ID || '',
  accessToken: import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN || '',
});

export interface HeroContent {
  headingLine1: string;
  headingLine2: string;
  subtitle: string;
  bookCtaText: string;
  estimateCtaText: string;
}

export interface AboutContent {
  heading: string;
  tagline: string;
  bio: string;
  instagramReelUrl?: string;
}

export interface ServiceContent {
  title: string;
  description: string;
  ctaText: string;
  order: number;
}

export interface TestimonialContent {
  name: string;
  label: string;
  quote: string;
  order: number;
}

export interface FaqContent {
  question: string;
  answer: string;
  order: number;
}

export interface SiteSettingsContent {
  siteName: string;
  tagline: string;
  phone: string;
  email: string;
  instagramUrl?: string;
  location?: string;
  footerTagline?: string;
}

export interface SiteContent {
  hero: HeroContent;
  about: AboutContent;
  services: ServiceContent[];
  testimonials: TestimonialContent[];
  faqs: FaqContent[];
  settings: SiteSettingsContent;
}

export async function fetchSiteContent(): Promise<SiteContent | null> {
  if (!import.meta.env.VITE_CONTENTFUL_SPACE_ID || !import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN) {
    return null;
  }

  try {
    const entries = await client.getEntries({ limit: 100 });

    let hero: HeroContent | null = null;
    let about: AboutContent | null = null;
    let settings: SiteSettingsContent | null = null;
    const services: ServiceContent[] = [];
    const testimonials: TestimonialContent[] = [];
    const faqs: FaqContent[] = [];

    for (const entry of entries.items) {
      const type = entry.sys.contentType.sys.id;
      const f = entry.fields as Record<string, any>;

      switch (type) {
        case 'hero':
          hero = {
            headingLine1: f.headingLine1 || '',
            headingLine2: f.headingLine2 || '',
            subtitle: f.subtitle || '',
            bookCtaText: f.bookCtaText || '',
            estimateCtaText: f.estimateCtaText || '',
          };
          break;
        case 'about':
          about = {
            heading: f.heading || '',
            tagline: f.tagline || '',
            bio: f.bio || '',
            instagramReelUrl: f.instagramReelUrl || undefined,
          };
          break;
        case 'siteSettings':
          settings = {
            siteName: f.siteName || '',
            tagline: f.tagline || '',
            phone: f.phone || '',
            email: f.email || '',
            instagramUrl: f.instagramUrl || undefined,
            location: f.location || undefined,
            footerTagline: f.footerTagline || undefined,
          };
          break;
        case 'service':
          services.push({
            title: f.title || '',
            description: f.description || '',
            ctaText: f.ctaText || '',
            order: f.order || 0,
          });
          break;
        case 'testimonial':
          testimonials.push({
            name: f.name || '',
            label: f.label || '',
            quote: f.quote || '',
            order: f.order || 0,
          });
          break;
        case 'faq':
          faqs.push({
            question: f.question || '',
            answer: f.answer || '',
            order: f.order || 0,
          });
          break;
      }
    }

    if (!hero || !about || !settings) return null;

    services.sort((a, b) => a.order - b.order);
    testimonials.sort((a, b) => a.order - b.order);
    faqs.sort((a, b) => a.order - b.order);

    return { hero, about, services, testimonials, faqs, settings };
  } catch (error) {
    console.error('Contentful fetch failed:', error);
    return null;
  }
}
