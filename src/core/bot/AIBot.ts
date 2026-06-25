/**
 * AIBot — DB Tabanlı Arka Plan Botu
 *
 * Çalışma Mantığı:
 * - Her tick'te DB'den ai_bot_enabled ve ai_bot_interval okunur
 * - ai_bot_enabled = false ise bot hiçbir şey yapmaz
 * - ai_bot_enabled = true ise eksik sektörü bulup işler
 * - Son çalışma zamanı memory'de tutulur, interval dolmadan tekrar işlem yapılmaz
 * - UI sadece DB'ye yazar/okur, polling yok
 */

import { dbAll, dbGet, dbRun } from '@/core/database/db';
import { Sector } from '@/core/types';

const TICK_INTERVAL_MS = 30_000; // 30 saniyede bir DB'yi kontrol et

class AIBotRunner {
  private timer: NodeJS.Timeout | null = null;
  private lastProcessedAt: number = 0;
  private pauseUntil: number = 0;
  public lastLog = 'Henüz çalışmadı.';
  private started = false;

  /** Next.js sunucusu ayağa kalktığında çağrılır (Artık devre dışı) */
  public init() {
    this.started = true;
    console.log('[AI-BOT] Cron moduna geçildi, otomatik arka plan tick devre dışı.');
  }

  public async runOnce() {
    this.started = true;
    await this.tick();
  }

  public forceTick() {
    this.runOnce();
  }

  private scheduleNextTick() {
    // Vercel ortamında setTimeout döngüsü kaynak sömürür, o yüzden kapattık.
    // Artık Cron Job (veya API) ile dışarıdan tetiklenecek.
  }

  private async tick() {
    try {
      // DB'den bot durumunu oku
      const row = await dbGet<{ ai_bot_enabled: unknown; ai_bot_interval: unknown }>(
        'SELECT ai_bot_enabled, ai_bot_interval FROM site_settings LIMIT 1'
      );

      const isEnabled = row?.ai_bot_enabled === true || row?.ai_bot_enabled === 1 || row?.ai_bot_enabled === 'true';
      const intervalMinutes = Math.max(1, Number(row?.ai_bot_interval ?? 5));

      if (!isEnabled) {
        // Bot kapalı, sessizce bekle
        this.scheduleNextTick();
        return;
      }

      // Kota dolumu nedeniyle zorunlu uyku modunda mı?
      if (this.pauseUntil > Date.now()) {
        const kalanDk = Math.ceil((this.pauseUntil - Date.now()) / 60000);
        this.lastLog = `[${new Date().toLocaleTimeString('tr-TR')}] Kota aşıldı. Uyku modunda, ${kalanDk} dakika sonra uyanacak...`;
        this.scheduleNextTick();
        return;
      }

      // Interval dolmadıysa atla
      const elapsedMs = Date.now() - this.lastProcessedAt;
      if (this.lastProcessedAt > 0 && elapsedMs < intervalMinutes * 60_000) {
        this.scheduleNextTick();
        return;
      }

      // Eksik sektör bul ve işle
      await this.process();
    } catch (err: any) {
      this.log(`Tick hatası: ${err.message}`);
    }

    this.scheduleNextTick();
  }

  private log(msg: string) {
    this.lastLog = `[${new Date().toLocaleTimeString('tr-TR')}] ${msg}`;
    console.log(`[AI-BOT] ${msg}`);
  }

  private async process() {
    this.lastProcessedAt = Date.now();

    const sectors = await dbAll<Sector>('SELECT * FROM sectors WHERE active = true ORDER BY sort_order ASC');

    // Eksik sektör bul: açıklaması ya da SSS'i olmayan
    let targetSector: Sector | null = null;
    for (const s of sectors) {
      const meta = (() => { try { return JSON.parse(s.ui_metadata || '{}'); } catch { return {}; } })();
      const faqs: unknown[] = Array.isArray(meta.faqs) ? meta.faqs : [];
      const hasDesc = s.description && String(s.description).length > 50;
      const hasFaq = faqs.length > 0;

      if (!hasDesc || !hasFaq) {
        if (!meta._bot_failed) {
          targetSector = s;
          break;
        }
      }
    }

    if (!targetSector) {
      // Bütün hepsi bitti veya kalanların hepsi hata verdi.
      // Eğer hiç başarılı işlem yoksa botu kapatabiliriz,
      // ancak hatalıları sıfırlayıp bir şans daha da verebiliriz. Biz şimdilik botu kapatalım.
      this.log('İşlenecek sektör kalmadı veya hepsi hata verdi. Bot kapandı.');
      await dbRun('UPDATE site_settings SET ai_bot_enabled = false WHERE id = 1');
      // Tüm hatalıları bir sonraki çalıştırma için temizle
      for (const s of sectors) {
        const meta = (() => { try { return JSON.parse(s.ui_metadata || '{}'); } catch { return {}; } })();
        if (meta._bot_failed) {
          delete meta._bot_failed;
          await dbRun('UPDATE sectors SET ui_metadata = $1 WHERE id = $2', [JSON.stringify(meta), s.id]);
        }
      }
      return;
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    this.log(`"${targetSector.name}" için içerik üretiliyor...`);

    const markFailed = async (errorMsg: string) => {
      // Kota aşıldıysa sektörü hatalı işaretleme, direkt uykuya geç
      if (errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('429') || errorMsg.includes('Quota exceeded') || errorMsg.includes('quota_exceeded')) {
        this.log(`API Kotası doldu! Bot 5 saatliğine uyku moduna geçiyor...`);
        this.pauseUntil = Date.now() + (5 * 60 * 60 * 1000); // 5 saat
        return;
      }

      this.log(`"${targetSector!.name}" hata aldı: ${errorMsg}. Sektör atlanıyor.`);
      const currentMeta = (() => { try { return JSON.parse(targetSector!.ui_metadata || '{}'); } catch { return {}; } })();
      currentMeta._bot_failed = true;
      await dbRun('UPDATE sectors SET ui_metadata = $1 WHERE id = $2', [JSON.stringify(currentMeta), targetSector!.id]);
      
      // Hata aldıysak botun hemen diğerine geçmesi için beklemeyi 1 dakikaya indirelim
      this.lastProcessedAt = Date.now() - (30 * 60_000); // Sanki 30 dk önce çalışmış gibi göster ki tick hemen başlasın
    };

    try {
      // 1. İçerik üret
      const res1 = await fetch(`${baseUrl}/api/admin/ai-generate?bot=ertem-bot-internal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: targetSector.name, type: 'pseo_sector' })
      });
      const data1 = await res1.json();

      if (!data1.success) {
        await markFailed(data1.details || data1.error || 'İçerik üretilemedi');
        return;
      }

      const finalDescription: string = data1.data?.description || '';
      this.log(`"${targetSector.name}" için SSS üretiliyor...`);

      // 2. SSS üret
      const res2 = await fetch(`${baseUrl}/api/admin/ai-generate-faq?bot=ertem-bot-internal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceTitle: targetSector.name,
          serviceDescription: finalDescription,
          existingFaqCount: 0,
          type: 'sector'
        })
      });
      const data2 = await res2.json();
      
      if (!data2.success && !finalDescription) {
        // SSS başarısız olursa sorun yok, ama description da gelmediyse tam başarısızdır.
        await markFailed(data2.details || data2.error || 'SSS üretilemedi');
        return;
      }

      // 3. DB'ye kaydet
      const currentMeta = (() => { try { return JSON.parse(targetSector!.ui_metadata || '{}'); } catch { return {}; } })();
      const finalFaqs = (data2.success && Array.isArray(data2.data?.faqs)) ? data2.data.faqs : (currentMeta.faqs || []);
      
      // Başarılı olduğunda hata bayrağını temizle
      delete currentMeta._bot_failed;

      const newMeta = JSON.stringify({
        ...currentMeta,
        action_verb: data1.data?.action_verb || currentMeta.action_verb,
        service_suffix: data1.data?.service_suffix || currentMeta.service_suffix,
        value_prop: data1.data?.value_prop || currentMeta.value_prop,
        seo_title: data1.data?.seo_title || currentMeta.seo_title,
        seo_description: data1.data?.seo_description || currentMeta.seo_description,
        hero_description: data1.data?.hero_description || currentMeta.hero_description,
        faqs: finalFaqs
      });

      await dbRun(
        'UPDATE sectors SET description = $1, ui_metadata = $2 WHERE id = $3',
        [finalDescription, newMeta, targetSector!.id]
      );

      this.log(`"${targetSector.name}" başarıyla tamamlandı!`);

    } catch (err: any) {
      this.log(`"${targetSector.name}" işlem hatası: ${err.message}`);
    }
  }

  public getStatus() {
    if (this.pauseUntil > Date.now()) {
      const kalanDk = Math.ceil((this.pauseUntil - Date.now()) / 60000);
      return { lastLog: `Kota aşıldı. Uyku modunda, ${kalanDk} dakika sonra uyanacak...` };
    }
    return { lastLog: this.lastLog };
  }
}

// Tek instance — Next.js hot-reload'da yeniden oluşturma
const globalForBot = globalThis as unknown as { aiBotRunner?: AIBotRunner };

// Eğer eski bir instance varsa (önceki derlemeden kalma) ve yeni metodlara sahip değilse, yenisini oluştur
if (!globalForBot.aiBotRunner || typeof globalForBot.aiBotRunner.forceTick !== 'function') {
  globalForBot.aiBotRunner = new AIBotRunner();
}

export const aiBotRunner = globalForBot.aiBotRunner;
if (process.env.NODE_ENV !== 'production') globalForBot.aiBotRunner = aiBotRunner;
