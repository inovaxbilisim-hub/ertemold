
interface StructuredDataProps {
  id: string;
  data: Record<string, unknown> | Array<Record<string, unknown>>;
}

/**
 * StructuredData component for rendering JSON-LD.
 * Uses a plain script tag with dangerouslySetInnerHTML for maximum compatibility
 * with Server Components and to avoid React hydration warnings in newer versions.
 */
export default function StructuredData({ id, data }: StructuredDataProps) {
  if (!data) return null;
  
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
