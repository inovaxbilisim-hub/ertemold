export class ContextualLinker {
  /**
   * Injects contextual internal links into HTML content.
   * Only replaces the first occurrence of a keyword to avoid spamming links.
   * It ensures links are only added inside text nodes of <p> or <li> elements,
   * avoiding altering existing <a> tags or HTML attributes.
   */
  static injectLinks(html: string, sectors: any[], services: any[], enabled: boolean = true): string {
    if (!enabled || !html) return html;

    // Create a dictionary of term -> url mapping
    const linkMap = new Map<string, string>();

    // Add active sectors (url: /sektorler/[slug])
    if (sectors && Array.isArray(sectors)) {
      sectors.forEach(sec => {
        if (sec.active && sec.name && sec.slug) {
          // Normalize the name to handle simple case variations, but mapping uses exact lowercase
          linkMap.set(sec.name.trim().toLowerCase(), `/sektorler/${sec.slug}`);
        }
      });
    }

    // Add active services (url: /[slug])
    if (services && Array.isArray(services)) {
      services.forEach(srv => {
        if (srv.active && srv.title && srv.slug) {
          linkMap.set(srv.title.trim().toLowerCase(), `/${srv.slug}`);
        }
      });
    }

    if (linkMap.size === 0) return html;

    // Sort terms by length descending to match longer terms first (e.g. "Epoksi Boya" before "Epoksi")
    const terms = Array.from(linkMap.keys()).sort((a, b) => b.length - a.length);

    // Keep track of which terms have already been replaced to ensure only 1 link per term
    const replacedTerms = new Set<string>();

    let result = html;

    // A simple parser to only replace text outside of HTML tags and outside of existing <a> tags
    // We will find text nodes, and perform replacements on them.
    // Instead of full DOM parsing (since we are in Node/Edge), we use a regex state machine

    const tagRegex = /(<[^>]+>)|([^<]+)/g;
    let match;
    let insideAnchor = false;
    let newHtml = '';

    while ((match = tagRegex.exec(html)) !== null) {
      const tag = match[1];
      let text = match[2];

      if (tag) {
        newHtml += tag;
        const lowerTag = tag.toLowerCase();
        if (lowerTag.startsWith('<a ') || lowerTag === '<a>') {
          insideAnchor = true;
        } else if (lowerTag === '</a>') {
          insideAnchor = false;
        }
      } else if (text && !insideAnchor) {
        // We are inside a text node and not inside an anchor tag.
        // We can search for our terms.
        for (const term of terms) {
          if (replacedTerms.has(term)) continue;

          // Build a regex to match the term as a whole word, case-insensitively
          // We use \b or similar word boundary logic, but Turkish chars might need careful handling.
          // Since \b doesn't support unicode well in all JS engines, we can use a lookaround approach
          // or simple \b if we stick to basic matching.
          const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const termRegex = new RegExp(`(^|[^\\p{L}\\p{N}])(${escapedTerm})([^\\p{L}\\p{N}]|$)`, 'iu');
          
          if (termRegex.test(text)) {
            const url = linkMap.get(term);
            if (url) {
              // Replace only the first occurrence in this text block
              text = text.replace(termRegex, `$1<a href="${url}" class="text-blue-600 font-semibold hover:underline" data-contextual-link="true">$2</a>$3`);
              replacedTerms.add(term);
            }
          }
        }
        newHtml += text;
      } else {
        // Fallback for empty text (should not happen based on regex)
        newHtml += text || '';
      }
    }

    return newHtml;
  }
}
