import { Sparkles } from 'lucide-react';

interface AeoSummaryItem {
  label: string;
  value: string;
}

interface AeoSummaryBlockProps {
  eyebrow?: string;
  title: string;
  summary: string;
  items: AeoSummaryItem[];
  note?: string;
  schema?: string;
  className?: string;
}

export type { AeoSummaryItem, AeoSummaryBlockProps };

function AeoSummaryBlock({
  eyebrow = '',
  title,
  summary,
  items,
  note,
  schema,
  className = '',
}: AeoSummaryBlockProps) {
  if (!title || !summary || !items.length) return null;

  return (
    <section
      data-geo-summary="true"
      className={`border-y border-[var(--border-subtle)] bg-[#fbfcff]/80 ${className}`}
      aria-label="Kısa cevap özeti"
    >
      <div className="px-6 md:px-12 py-8 md:py-10">
        {eyebrow ? (
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-[2px] bg-blue-600" />
            <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] text-blue-600">
              {eyebrow}
            </span>
            <Sparkles size={14} className="text-blue-600/70" />
          </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-8 items-start">
          <div>
            <h2 className="text-lg md:text-xl font-black text-black italic tracking-tight leading-tight mb-3">
              {title}
            </h2>
            <p className="text-black/70 text-sm md:text-base font-medium leading-relaxed max-w-4xl">
              {summary}
            </p>
            {note ? (
              <p className="mt-4 text-[11px] md:text-[12px] font-bold uppercase tracking-wider text-black/40">
                {note}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <div
                key={item.label}
                className="flex flex-col gap-3 rounded-2xl border border-blue-600/10 bg-white px-5 py-5 shadow-sm"
              >
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600/70">
                  {item.label}
                </div>
                <div className="text-sm font-bold leading-relaxed text-black text-left break-words">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schema }}
        />
      )}
    </section>
  );
}
