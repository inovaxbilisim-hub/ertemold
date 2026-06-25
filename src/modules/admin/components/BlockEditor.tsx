'use client';

import { useRef } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Layout, Maximize2 } from 'lucide-react';
import AdminImagePicker from '@/modules/admin/components/AdminImagePicker';

export interface BlockData {
  title?: string;
  text?: string;
  image?: string;
  layout?: 'left' | 'right' | 'full' | string;
  url?: string;
  height?: string;
  pageId?: string | number;
  component?: string;
  visual_type?: string;
  visual_data?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface Block {
  id: string;
  type: 'text_image' | 'iframe' | 'component_ref' | 'page_ref' | 'checkup' | 'technical_table' | 'localized_cta' | 'faq_section';
  data: BlockData;
}

interface BlockEditorProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
  availablePages?: { id: number; title: string; slug: string; template_name: string }[];
}

const BLOCK_TYPES = [
  { id: 'text_image', label: 'Metin & Görsel', icon: Layout },
  { id: 'iframe', label: 'Video / Harita (Iframe)', icon: Maximize2 },
  { id: 'page_ref', label: 'Sayfa Çağır (Modül)', icon: Plus },
];



export default function BlockEditor({ blocks = [], onChange, availablePages = [] }: BlockEditorProps) {
  
  const blockIdRef = useRef(0);

  const addBlock = (type: Block['type']) => {
    const newBlock: Block = {
      id: `block_${blockIdRef.current++}`,
      type,
      data: type === 'text_image' 
        ? { title: '', text: '', image: '', layout: 'right' }
        : type === 'page_ref'
        ? { pageId: availablePages[0]?.id || '' }
        : { title: '', text: '' }
    };
    onChange([...blocks, newBlock]);
  };

  const removeBlock = (id: string) => {
    onChange(blocks.filter(b => b.id !== id));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newBlocks.length) return;
    
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    onChange(newBlocks);
  };

  const updateBlockData = (id: string, field: keyof BlockData, value: unknown) => {
    onChange(blocks.map(b => b.id === id ? { ...b, data: { ...b.data, [field]: value } } : b));
  };

  return (
    <div className="block-editor">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>Sayfa Blokları</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          {BLOCK_TYPES.map(bt => (
            <button 
              key={bt.id}
              onClick={() => addBlock(bt.id as Block['type'])}
              className="admin-btn admin-btn-secondary"
              style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}
            >
              <bt.icon size={14} /> {bt.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {blocks.map((block, index) => (
          <div 
            key={block.id} 
            className="admin-card block-item" 
            style={{ 
              padding: '24px', 
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-tertiary)',
              position: 'relative'
            }}
          >
            {/* Block Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '6px', background: 'var(--accent-blue-10)', color: 'var(--accent-blue)', borderRadius: '6px' }}>
                  {block.type === 'text_image' && <Layout size={16} />}
                  {block.type === 'iframe' && <Maximize2 size={16} />}
                  {block.type === 'page_ref' && <Plus size={16} />}
                </div>
                <span style={{ fontWeight: 700, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {BLOCK_TYPES.find(bt => bt.id === block.type)?.label}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => moveBlock(index, 'up')} disabled={index === 0} className="icon-btn-small"><ArrowUp size={14} /></button>
                <button onClick={() => moveBlock(index, 'down')} disabled={index === blocks.length - 1} className="icon-btn-small"><ArrowDown size={14} /></button>
                <button onClick={() => removeBlock(block.id)} className="icon-btn-small delete"><Trash2 size={14} /></button>
              </div>
            </div>

            {/* Block Content */}
            {block.type === 'text_image' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
                <div>
                  <div className="admin-form-group">
                    <label className="admin-label">Başlık (Opsiyonel)</label>
                    <input 
                      className="admin-input" 
                      value={block.data.title || ''} 
                      onChange={e => updateBlockData(block.id, 'title', e.target.value)}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Metin İçeriği</label>
                    <textarea 
                      className="admin-textarea" 
                      rows={6} 
                      value={block.data.text || ''} 
                      onChange={e => updateBlockData(block.id, 'text', e.target.value)}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Görsel Yerleşimi</label>
                    <select 
                      className="admin-input" 
                      value={block.data.layout || 'right'} 
                      onChange={e => updateBlockData(block.id, 'layout', e.target.value)}
                    >
                      <option value="left">Görsel Solda</option>
                      <option value="right">Görsel Sağda</option>
                      <option value="full">Görsel Üstte (Full Genişlik)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="admin-label">Görsel</label>
                  <AdminImagePicker 
                    value={block.data.image || ''} 
                    onChange={val => updateBlockData(block.id, 'image', val)}
                  />
                </div>
              </div>
            )}

            {block.type === 'iframe' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px', gap: '16px' }}>
                <div className="admin-form-group">
                  <label className="admin-label">Iframe URL (YouTube/Maps embed linki)</label>
                  <input 
                    className="admin-input" 
                    placeholder="https://www.youtube.com/embed/..."
                    value={block.data.url || ''} 
                    onChange={e => updateBlockData(block.id, 'url', e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Yükseklik (px)</label>
                  <input 
                    className="admin-input" 
                    value={block.data.height || '450px'} 
                    onChange={e => updateBlockData(block.id, 'height', e.target.value)}
                  />
                </div>
              </div>
            )}



            {block.type === 'page_ref' && (
              <div className="admin-form-group">
                <label className="admin-label">Çağrılacak Sayfa / Modül</label>
                <select 
                  className="admin-input" 
                  value={block.data.pageId || ''} 
                  onChange={e => updateBlockData(block.id, 'pageId', e.target.value)}
                >
                  <option value="">Lütfen sayfa seçin...</option>
                  {availablePages.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.template_name})
                    </option>
                  ))}
                </select>
                <small style={{ color: 'var(--accent-blue)', marginTop: '8px', display: 'block', fontWeight: 600 }}>
                  💡 Modülerlik: Seçtiğiniz sayfanın içeriği bu noktada render edilecektir. İçeriği değiştirmek için "Sayfa Yönetimi"nden ilgili sayfayı düzenleyin.
                </small>
              </div>
            )}
          </div>
        ))}

        {blocks.length === 0 && (
          <div style={{ padding: '60px', textAlign: 'center', border: '2px dashed var(--border-subtle)', borderRadius: '16px', color: 'var(--text-muted)' }}>
            <Layout size={40} style={{ marginBottom: '16px', opacity: 0.3 }} />
            <p style={{ fontWeight: 500 }}>Henüz dinamik blok eklenmedi. Yukarıdaki butonları kullanarak başlayın.</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .icon-btn-small {
          width: 28px; height: 28px; border-radius: 6px; border: 1px solid var(--border-subtle);
          background: var(--bg-secondary); color: var(--text-muted); display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s;
        }
        .icon-btn-small:hover:not(:disabled) { border-color: var(--accent-blue-40); color: var(--accent-blue); }
        .icon-btn-small.delete:hover { border-color: #ef444440; color: #ef4444; }
        .icon-btn-small:disabled { opacity: 0.3; cursor: not-allowed; }
      `}</style>
    </div>
  );
}
