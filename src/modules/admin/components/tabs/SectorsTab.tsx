'use client';

import CloudinaryImage from '@/shared/components/CloudinaryImage';
import { Edit2, Plus, Trash2, Box, AlertTriangle, Sparkles, CheckCircle2, Loader2, Settings, Filter, Play, Square, Clock, Bot } from 'lucide-react';
import { Sector } from '@/core/types';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import SectorAIPromptModal from '@/modules/admin/components/modals/SectorAIPromptModal';

interface SectorsTabProps {
  sectors?: Sector[];
  onEdit: (sector: Sector) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
  onRefresh?: () => void;
}

interface SectorStatus {
  id: string;
  name: string;
  hasDescription: boolean;
  hasFaq?: boolean;
}

type BulkState = 'idle' | 'running' | 'done';

export default function SectorsTab({ sectors = [], onEdit, onDelete, onCreate, onRefresh }: SectorsTabProps) {
  const [sectorStatuses, setSectorStatuses] = useState<Record<string, { hasDescription: boolean, hasFaq: boolean }>>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkState, setBulkState] = useState<BulkState>('idle');
  const [progress, setProgress] = useState({ current: 0, total: 0, currentName: '' });
  const [promptModalOpen, setPromptModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'missing_desc' | 'missing_img' | 'inactive' | 'missing_faq' | 'missing_services'>('all');
  const abortRef = useRef(false);

  // Bot States
  const [botRunning, setBotRunning] = useState(false);
  const [botInterval, setBotInterval] = useState(5); // sunucudan gelen gerçek değer
  const [localInterval, setLocalInterval] = useState(5); // input için yerel değer
  const localIntervalRef = useRef(5); // polling closure'da kullanmak için
  const [botStatus, setBotStatus] = useState<string>('Yükleniyor...');
  const [isProcessing, setIsProcessing] = useState(false);
  const dataRef = useRef({ sectors, sectorStatuses, onRefresh });

  useEffect(() => {
    dataRef.current = { sectors, sectorStatuses, onRefresh };
  }, [sectors, sectorStatuses, onRefresh]);

  // Sadece sayfa açıldığında botun güncel durumunu 1 kez çek (Polling YOK)
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/admin/bot');
        const data = await res.json();
        if (data.success) {
          setBotRunning(data.data.isRunning);
          setBotInterval(data.data.intervalMinutes);
          setLocalInterval(data.data.intervalMinutes);
          setBotStatus(data.data.lastLog || (data.data.isRunning ? 'Bot çalışıyor...' : 'Kapalı'));
          setIsProcessing(data.data.isRunning && (data.data.lastLog?.includes('üretiliyor') || data.data.lastLog?.includes('aranıyor')));
        }
      } catch (err) {}
    };

    fetchStatus();
  }, []);

  const handleToggleBot = async () => {
    const action = botRunning ? 'stop' : 'start';
    
    setBotRunning(action === 'start');
    if (action === 'start') setBotStatus('Başlatılıyor...');
    
    try {
      const res = await fetch('/api/admin/bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, interval: localInterval })
      });
      const data = await res.json();
      if (data.success) {
        setBotStatus(data.data.lastLog || (data.data.isRunning ? 'Bot başlatıldı...' : 'Durduruldu'));
      } else {
        toast.error('Bot başlatılamadı: ' + data.error);
        setBotStatus('Hata: ' + data.error);
        setBotRunning(!botRunning);
      }
    } catch (err: any) {
      toast.error('Ağ hatası: ' + err.message);
      setBotStatus('Ağ hatası');
      setBotRunning(!botRunning);
    }
  };

  const handleIntervalChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value) || 1;
    setLocalInterval(val);
    if (botRunning) {
      await fetch('/api/admin/bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_interval', interval: val })
      });
    }
  };

  const handleRefreshStatus = async () => {
    try {
      const res = await fetch('/api/admin/bot');
      const data = await res.json();
      if (data.success) {
        setBotStatus(data.data.lastLog || (data.data.isRunning ? 'Bot çalışıyor...' : 'Kapalı'));
        setIsProcessing(data.data.isRunning && (data.data.lastLog?.includes('üretiliyor') || data.data.lastLog?.includes('aranıyor')));
        if (dataRef.current.onRefresh && data.data.lastLog?.includes('başarıyla tamamlandı')) {
           dataRef.current.onRefresh();
        }
      }
    } catch (err) {}
  };

  // Fetch description status
  useEffect(() => {
    fetch('/api/admin/bulk-ai-sectors')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data?.sectors) {
          const map: Record<string, { hasDescription: boolean, hasFaq: boolean }> = {};
          (data.data.sectors as SectorStatus[]).forEach(s => {
            map[s.id] = { hasDescription: s.hasDescription, hasFaq: s.hasFaq || false };
          });
          setSectorStatuses(map);
        }
      })
      .catch(() => {});
  }, []);

  const filteredSectors = sectors.filter(item => {
    if (filter === 'missing_desc') return sectorStatuses[item.id]?.hasDescription === false;
    if (filter === 'missing_faq') return sectorStatuses[item.id]?.hasFaq === false;
    if (filter === 'missing_services') return !item.recommended_service_ids || item.recommended_service_ids.length === 0;
    if (filter === 'missing_img') return !item.image_path;
    if (filter === 'inactive') return !item.active;
    return true;
  });

  const isAllSelected = filteredSectors.length > 0 && filteredSectors.every(s => selectedIds.has(s.id));

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        filteredSectors.forEach(s => next.delete(s.id));
        return next;
      });
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev);
        filteredSectors.forEach(s => next.add(s.id));
        return next;
      });
    }
  };

  const handleBulkGenerate = async () => {
    const targets = Array.from(selectedIds);
    if (targets.length === 0) {
      toast.warning('Lütfen önce sektör seçin.');
      return;
    }

    abortRef.current = false;
    setBulkState('running');
    setProgress({ current: 0, total: targets.length, currentName: '' });

    let successCount = 0;

    for (let i = 0; i < targets.length; i++) {
      if (abortRef.current) break;

      const id = targets[i];
      const sector = sectors.find(s => s.id === id);
      setProgress({ current: i + 1, total: targets.length, currentName: sector?.name || '' });

      try {
        const res = await fetch('/api/admin/bulk-ai-sectors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sectorId: id }),
        });
        const data = await res.json();
        if (data.success && data.data?.success) {
          setSectorStatuses(prev => ({ ...prev, [id]: { ...prev[id], hasDescription: true } }));
          successCount++;
        } else {
          toast.error(`${sector?.name}: ${data.data?.error || 'Hata'}`);
        }
      } catch {
        toast.error(`${sector?.name}: Bağlantı hatası`);
      }

      // Wait between requests to respect rate limits (Gemini: 5/min, OpenRouter: faster)
      if (i < targets.length - 1 && !abortRef.current) {
        await new Promise(resolve => setTimeout(resolve, 13000));
      }
    }

    setBulkState('done');
    setSelectedIds(new Set());
    if (successCount > 0) toast.success(`${successCount} sektör için açıklama oluşturuldu!`);
  };

  const handleStop = () => {
    abortRef.current = true;
    setBulkState('idle');
    toast.info('İşlem durduruldu.');
  };

  const handleBulkDelete = async () => {
    if (!confirm(`${selectedIds.size} sektörü silmek istediğinize emin misiniz?`)) return;
    const targets = Array.from(selectedIds);
    setBulkState('running');
    let successCount = 0;
    for (const id of targets) {
      try {
        const res = await fetch(`/api/admin/sectors?id=${id}`, { method: 'DELETE' });
        if (res.ok) successCount++;
      } catch (err) {}
    }
    setBulkState('idle');
    setSelectedIds(new Set());
    if (successCount > 0) {
      toast.success(`${successCount} sektör silindi.`);
      if (onRefresh) onRefresh();
    }
  };

  const handleBulkStatus = async (isActive: boolean) => {
    const targets = Array.from(selectedIds);
    setBulkState('running');
    let successCount = 0;
    for (const id of targets) {
      const sector = sectors.find(s => s.id === id);
      if (!sector) continue;
      try {
        const res = await fetch('/api/admin/sectors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...sector, active: isActive })
        });
        if (res.ok) successCount++;
      } catch (err) {}
    }
    setBulkState('idle');
    setSelectedIds(new Set());
    if (successCount > 0) {
      toast.success(`${successCount} sektör ${isActive ? 'aktif' : 'pasif'} yapıldı.`);
      if (onRefresh) onRefresh();
    }
  };

  return (
    <div className="admin-card-list-stack">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Top actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button onClick={onCreate} className="admin-btn admin-btn-primary">
            <Plus size={16} /> Yeni Sektör Ekle
          </button>
          
          <button onClick={() => setPromptModalOpen(true)} className="admin-btn" style={{ backgroundColor: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' }}>
            <Settings size={16} /> Yapay Zeka Prompt Ayarları
          </button>
        </div>

        {/* AI Bot Panel */}
        <div style={{ padding: '16px', backgroundColor: botRunning ? '#f0fdf4' : '#fff', borderRadius: '12px', border: `1px solid ${botRunning ? '#bbf7d0' : '#e2e8f0'}`, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: botRunning ? '#22c55e' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: botRunning ? 'white' : '#64748b' }}>
                <Bot size={24} />
              </div>
              <div>
                <h3 style={{ margin: '0', fontSize: '15px', fontWeight: 'bold', color: '#0f172a' }}>Otomatik Yapay Zeka Botu</h3>
                <p style={{ margin: '0', fontSize: '13px', color: '#64748b' }}>Eksik sektörleri belirli zaman aralıklarıyla otomatik doldurur.</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f8fafc', padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <Clock size={16} color="#64748b" />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Bekleme:</span>
                <input 
                  type="number" 
                  min="1" 
                  max="60" 
                  value={localInterval} 
                  onChange={handleIntervalChange}
                  disabled={botRunning}
                  style={{ width: '50px', border: 'none', backgroundColor: 'transparent', fontWeight: 'bold', fontSize: '14px', outline: 'none' }}
                />
                <span style={{ fontSize: '13px', color: '#64748b' }}>dk</span>
              </div>
              
              <button
                onClick={handleToggleBot}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 16px', borderRadius: '8px',
                  backgroundColor: botRunning ? '#ef4444' : '#22c55e', color: 'white',
                  border: 'none', fontSize: '13px', fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                {botRunning ? <><Square size={16} /> Botu Durdur</> : <><Play size={16} /> Botu Başlat</>}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: botRunning ? '#dcfce7' : '#f8fafc', padding: '8px 12px', borderRadius: '8px', fontSize: '13px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isProcessing && <Loader2 size={14} className="animate-spin" color="#22c55e" />}
              <span style={{ fontWeight: 600, color: botRunning ? '#166534' : '#64748b' }}>Sunucu Günlüğü:</span>
              <span style={{ color: botRunning ? '#166534' : '#64748b' }}>{botStatus}</span>
            </div>
            {botRunning && (
              <button 
                onClick={handleRefreshStatus}
                style={{ fontSize: '12px', color: '#166534', background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Yenile
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #e2e8f0', padding: '4px', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
            <Filter size={14} color="#64748b" style={{ marginLeft: '4px' }} />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              style={{ border: 'none', backgroundColor: 'transparent', fontSize: '12px', fontWeight: 600, color: '#475569', outline: 'none', cursor: 'pointer', paddingRight: '8px' }}
            >
              <option value="all">Tümü</option>
              <option value="missing_desc">Açıklaması Eksik Olanlar</option>
              <option value="missing_faq">SSS (FAQ) Eksik Olanlar</option>
              <option value="missing_services">Önerilen Hizmeti Olmayanlar</option>
              <option value="missing_img">Görseli Olmayanlar</option>
              <option value="inactive">Pasif Olanlar</option>
            </select>
          </div>

          {filteredSectors.length > 0 && bulkState === 'idle' && (
            <button
              onClick={toggleSelectAll}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', borderRadius: '8px',
                backgroundColor: isAllSelected ? '#f1f5f9' : '#e0e7ff', 
                color: isAllSelected ? '#475569' : '#4338ca',
                border: `1px solid ${isAllSelected ? '#cbd5e1' : '#c7d2fe'}`, 
                fontSize: '12px', fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <CheckCircle2 size={14} />
              {isAllSelected ? 'Seçimi Kaldır' : 'Tümünü Seç'} ({filteredSectors.length})
            </button>
          )}

          {selectedIds.size > 0 && bulkState === 'idle' && (
            <div style={{ display: 'flex', gap: '6px', borderLeft: '1px solid #e2e8f0', paddingLeft: '12px' }}>
              <button
                onClick={handleBulkGenerate}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 14px', borderRadius: '8px',
                  backgroundColor: '#6366f1', color: 'white',
                  border: 'none', fontSize: '12px', fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Sparkles size={14} /> AI Doldur
              </button>
              <button
                onClick={() => handleBulkStatus(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 14px', borderRadius: '8px',
                  backgroundColor: '#10b981', color: 'white',
                  border: 'none', fontSize: '12px', fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Aktif Yap
              </button>
              <button
                onClick={() => handleBulkStatus(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 14px', borderRadius: '8px',
                  backgroundColor: '#f59e0b', color: 'white',
                  border: 'none', fontSize: '12px', fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Pasif Yap
              </button>
              <button
                onClick={handleBulkDelete}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 14px', borderRadius: '8px',
                  backgroundColor: '#ef4444', color: 'white',
                  border: 'none', fontSize: '12px', fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Trash2 size={14} /> Sil ({selectedIds.size})
              </button>
            </div>
          )}

          {bulkState === 'idle' && (
            <button
              onClick={() => setPromptModalOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', borderRadius: '10px',
                backgroundColor: '#f1f5f9', color: '#475569',
                border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 700,
                cursor: 'pointer', marginLeft: 'auto'
              }}
            >
              <Settings size={14} />
              AI Prompt Ayarları
            </button>
          )}

          {bulkState === 'running' && (
            <button
              onClick={handleStop}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', borderRadius: '10px',
                backgroundColor: '#ef4444', color: 'white',
                border: 'none', fontSize: '12px', fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Durdur
            </button>
          )}
        </div>

        {/* Progress bar */}
        {bulkState === 'running' && (
          <div style={{
            padding: '14px 16px', borderRadius: '12px',
            backgroundColor: '#f0f4ff', border: '1px solid #c7d2fe',
            display: 'flex', flexDirection: 'column', gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: '#4338ca' }}>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                İşleniyor: <em>{progress.currentName}</em>
              </div>
              <span style={{ fontSize: '12px', color: '#6366f1', fontWeight: 700 }}>
                {progress.current} / {progress.total}
              </span>
            </div>
            <div style={{ height: '6px', borderRadius: '3px', backgroundColor: '#c7d2fe', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: '3px', backgroundColor: '#6366f1',
                width: `${(progress.current / progress.total) * 100}%`,
                transition: 'width 0.4s ease'
              }} />
            </div>
            <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>
              ⏱ Rate limit koruması: Her istek arasında 13 saniye bekleniyor.
            </p>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filteredSectors.map((item) => {
          const loadedAndMissingDesc = sectorStatuses[item.id]?.hasDescription === false;
          const loadedAndMissingFaq = sectorStatuses[item.id]?.hasFaq === false;
          const loadedAndMissingServices = !item.recommended_service_ids || item.recommended_service_ids.length === 0;
          const isSelected = selectedIds.has(item.id);

          return (
            <article
              key={item.id}
              onClick={() => bulkState === 'idle' && toggleSelect(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 16px',
                backgroundColor: '#fff',
                border: `1px solid ${isSelected ? '#6366f1' : (loadedAndMissingDesc || loadedAndMissingFaq || loadedAndMissingServices) ? '#fcd34d' : '#e2e8f0'}`,
                borderRadius: '8px',
                gap: '16px',
                cursor: bulkState === 'idle' ? 'pointer' : 'default',
                opacity: bulkState === 'running' && isSelected && sectorStatuses[item.id]?.hasDescription === true ? 0.5 : 1,
                transition: 'border-color 0.15s, opacity 0.3s, box-shadow 0.15s',
                boxShadow: isSelected ? '0 0 0 1px #6366f1' : '0 1px 2px rgba(0,0,0,0.02)'
              }}
            >
              {/* Checkbox or Success Icon */}
              <div style={{ width: '20px', display: 'flex', justifyContent: 'center' }}>
                {bulkState === 'idle' ? (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(item.id)}
                    onClick={e => e.stopPropagation()}
                    style={{ width: '16px', height: '16px', cursor: 'pointer', margin: 0 }}
                  />
                ) : isSelected && sectorStatuses[item.id]?.hasDescription === true && bulkState === 'running' ? (
                  <CheckCircle2 size={16} color="#166534" />
                ) : (
                  <div style={{ width: '16px' }} />
                )}
              </div>

              {/* Logo / Icon */}
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#f8fafc', overflow: 'hidden', flexShrink: 0, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.image_path ? (
                  <CloudinaryImage src={item.image_path} alt={item.name} fill sizes="40px" style={{ objectFit: 'cover' }} />
                ) : (
                  <Box size={20} color="#94a3b8" />
                )}
              </div>

              {/* Text Content */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.name}
                  </h3>
                  {loadedAndMissingDesc && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      backgroundColor: '#fef3c7', color: '#92400e',
                      borderRadius: '6px', padding: '2px 6px', fontSize: '10px', fontWeight: 600
                    }}>
                      <AlertTriangle size={10} /> Açıklama Yok
                    </span>
                  )}
                  {loadedAndMissingFaq && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      backgroundColor: '#fee2e2', color: '#991b1b',
                      borderRadius: '6px', padding: '2px 6px', fontSize: '10px', fontWeight: 600
                    }}>
                      <AlertTriangle size={10} /> SSS Yok
                    </span>
                  )}
                  {loadedAndMissingServices && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      backgroundColor: '#f3e8ff', color: '#7e22ce',
                      borderRadius: '6px', padding: '2px 6px', fontSize: '10px', fontWeight: 600
                    }}>
                      <AlertTriangle size={10} /> Hizmet Yok
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '12px', color: '#64748b' }}>{item.slug}</span>
              </div>

              {/* Meta & Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <span className={item.active ? 'admin-status-active' : 'admin-status-inactive'} style={{ padding: '2px 8px', fontSize: '10px' }}>
                    {item.active ? 'Aktif' : 'Pasif'}
                  </span>
                  <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>Sıra: {item.sort_order}</span>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={e => { e.stopPropagation(); onEdit(item); }} className="admin-btn admin-btn-sm" title="Düzenle" style={{ padding: '6px', height: 'auto' }}>
                    <Edit2 size={16} />
                  </button>
                  <button onClick={e => { e.stopPropagation(); onDelete(item.id); }} className="admin-btn admin-btn-sm admin-btn-danger" title="Sil" style={{ padding: '6px', height: 'auto' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* CSS for spinner */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      
      <SectorAIPromptModal 
        isOpen={promptModalOpen} 
        onClose={() => setPromptModalOpen(false)} 
      />
    </div>
  );
}
