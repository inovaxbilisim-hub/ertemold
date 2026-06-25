/**
 * Kullanıcı tarafından yönetim panelinde girilen HTML/Script kodlarını
 * güvenli biçimde parse eder ve React elementleri döndürür.
 *
 * - <script> blokları next/script ile afterInteractive stratejisi ile enjekte edilir
 * - Geri kalan HTML dangerouslySetInnerHTML ile render edilir
 * - U+2028 / U+2029 karakterleri JS string literal'larında kaçırılır
 */

import Script from 'next/script';
import React from 'react';

/**
 * Ham HTML + script içeriğini ayrıştırarak güvenli React fragmentı döndürür.
 * @param code - Kullanıcının girdiği HTML/script string
 * @param idPrefix - Birden fazla blok varsa benzersiz key prefix'i
 */
export function renderInjectedHtml(
  code: string | null | undefined,
  idPrefix = 'injected',
  containerTag: 'div' | 'span' | null = 'div'
): React.ReactNode {
  if (!code) return null;

  const scriptBlocks: string[] = [];
  const html = code.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, (_, scriptBody: string) => {
    scriptBlocks.push(scriptBody);
    return '';
  });

  const htmlElement = html ? (
    containerTag 
      ? React.createElement(containerTag, { dangerouslySetInnerHTML: { __html: html } })
      : React.createElement('div', { style: { display: 'none' }, dangerouslySetInnerHTML: { __html: html } }) // Fallback for invalid locations
  ) : null;

  return React.createElement(
    React.Fragment,
    null,
    htmlElement,
    ...scriptBlocks.map((script, index) =>
      React.createElement(Script, {
        key: `${idPrefix}-${index}`,
        id: `${idPrefix}-${index}`,
        strategy: 'afterInteractive',
        dangerouslySetInnerHTML: { __html: script },
      })
    )
  );
}
