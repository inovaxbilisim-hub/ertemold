import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const pluginNames = ['service-calculator', 'project-timeline', 'seo-aeo', 'zemin-checkup', 'sektorler'];

describe('plugin entrypoints', () => {
  it('has an importable index file for each registered plugin folder', () => {
    const missing = pluginNames.filter((name) => {
      const entryTs = path.join(process.cwd(), 'src', 'plugins', name, 'index.ts');
      const entryTsx = path.join(process.cwd(), 'src', 'plugins', name, 'index.tsx');
      const entryJs = path.join(process.cwd(), 'src', 'plugins', name, 'index.js');
      return !(fs.existsSync(entryTs) || fs.existsSync(entryTsx) || fs.existsSync(entryJs));
    });

    expect(missing).toEqual([]);
  });
});
