// DEPRECATED — Migration 007: references tablosu tüm projeleri içerir.
// Bu endpoint artık yalnızca uyumluluk alias'ıdır.
// Lütfen /api/admin/references kullanın.

import { GET as RefGet, POST as RefPost, DELETE as RefDelete, PUT as RefPut, OPTIONS as RefOptions } from '@/app/api/admin/references/route';

export const GET = RefGet;
export const POST = RefPost;
export const PUT = RefPut;
export const DELETE = RefDelete;
export const OPTIONS = RefOptions;