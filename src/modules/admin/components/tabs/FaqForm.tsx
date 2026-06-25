'use client';

import type { FAQ } from '@/core/types';

interface FaqFormProps {
  item: FAQ;
  onUpdate: (item: FAQ) => void;
}

export default function FaqForm({ item, onUpdate }: FaqFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    onUpdate({
      ...item,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
             type === 'number' ? Number(value) : value
    });
  };

  return (
    <div className="space-y-6">
      <div className="admin-form-group">
        <label className="admin-label">Soru</label>
        <input
          type="text"
          name="question"
          value={item.question}
          onChange={handleChange}
          className="admin-input"
          placeholder="Örn: Hizmetleriniz neleri kapsıyor?"
          required
        />
      </div>

      <div className="admin-form-group">
        <label className="admin-label">Kategori</label>
        <input
          type="text"
          name="category"
          value={item.category || ''}
          onChange={handleChange}
          className="admin-input"
          placeholder="Örn: GENEL & TEKNİK BİLGİ"
        />
      </div>

      <div className="admin-form-group">
        <label className="admin-label">
          Cevap
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 400, marginLeft: '8px' }}>
            (HTML etiketleri desteklenir: &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;li&gt;, &lt;br&gt;)
          </span>
        </label>
        <textarea
          name="answer"
          value={item.answer}
          onChange={handleChange}
          className="admin-input min-h-[150px]"
          placeholder="HTML etiketleri ile formatlanmış cevap yazabilirsiniz. Örnek: <p>Bu bir paragraf.</p><strong>Kalın metin</strong><br/><ul><li>Liste öğesi 1</li><li>Liste öğesi 2</li></ul>"
          style={{ fontFamily: 'monospace', fontSize: '13px' }}
          required
        />
        <div style={{ marginTop: '12px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <p style={{ margin: '0 0 12px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>📋 Önizleme:</p>
          <div 
            style={{ fontSize: '14px', lineHeight: '1.6', color: '#334155' }}
            dangerouslySetInnerHTML={{ __html: item.answer || '<p style="color: #94a3b8; font-style: italic;">Cevap yazıldığında önizleme burada görünecek...</p>' }}
          />
        </div>
      </div>

      <div className="admin-form-group">
        <label className="admin-label">Sıralama</label>
        <input
          type="number"
          name="sort_order"
          value={item.sort_order}
          onChange={handleChange}
          className="admin-input"
        />
      </div>
    </div>
  );
}
