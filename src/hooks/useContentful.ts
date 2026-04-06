import { useState, useEffect } from 'react';
import { fetchSiteContent, type SiteContent } from '../lib/contentful';

export function useContentful() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchSiteContent().then((data) => {
      if (!cancelled) {
        setContent(data);
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, []);

  return { content, loading };
}
