import { test, expect } from '@playwright/test';

test.describe('Public Site Smoke Tests', () => {
  test('Ana sayfa yüklenmeli ve başlık içermeli', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/.*/);
    // Sayfanın başarıyla yüklendiğini doğrula
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('İletişim sayfası yüklenmeli', async ({ page }) => {
    await page.goto('/iletisim');
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('Hizmetler sayfası yüklenmeli', async ({ page }) => {
    await page.goto('/hizmetler');
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('SSS sayfası yüklenmeli', async ({ page }) => {
    await page.goto('/sss');
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('404 sayfası düzgün çalışmalı', async ({ page }) => {
    const response = await page.goto('/olmayan-sayfa');
    expect(response?.status()).toBe(404);
  });
});

test.describe('Admin Panel Smoke Tests', () => {
  test('Giriş sayfası yüklenmeli', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('Admin sayfaları yönlendirme yapmalı (giriş yokken)', async ({ page }) => {
    await page.goto('/admin');
    // Login sayfasına yönlendirilmeli veya giriş istemeli
    await page.waitForURL(/\/admin\/login/);
  });
});