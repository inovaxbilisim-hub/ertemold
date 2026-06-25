import { FAQ } from '@/core/types';

export function buildFaqSchema(faqs: FAQ[]) {
  if (!faqs || faqs.length === 0) return null;

  const activeFaqs = faqs.filter((faq) => {
    if (typeof faq.active === 'boolean') return faq.active;
    return String(faq.active) === '1' || String(faq.active) === 'true';
  });

  if (activeFaqs.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: activeFaqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };
}
