const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('route.ts')) {
      results.push(file);
    }
  });
  return results;
}

const routes = walk(path.join(__dirname, 'src', 'app', 'api'));
const analysis = [];

routes.forEach((route) => {
  const content = fs.readFileSync(route, 'utf-8');
  
  const hasDbImport = content.includes('@/core/database') || content.includes('dbGet') || content.includes('dbAll') || content.includes('dbRun') || content.includes('pool.query');
  
  // Basic heuristics for hardcoded data
  const hasMockArray = /\[\s*\{\s*["'](?:id|name|title)["']\s*:/i.test(content);
  const hasMockWord = /mock[a-z0-9A-Z_]*\s*=|dummy|staticData/i.test(content);
  const hasMockResponse = /NextResponse\.json\(\s*\[\s*\{/i.test(content);

  // Exclude init/route.ts from hardcoded check if it's just initializing tables
  const isInit = route.includes('init\\route.ts');
  
  if (!hasDbImport || hasMockArray || hasMockWord || hasMockResponse) {
    analysis.push({
      route: route.replace(__dirname, ''),
      hasDbImport,
      hasHardcodedData: hasMockArray || hasMockWord || hasMockResponse
    });
  }
});

console.log(JSON.stringify(analysis, null, 2));
