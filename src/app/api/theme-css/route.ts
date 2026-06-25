import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const theme = searchParams.get('theme');
  
  if (!theme || theme === 'default') {
    return new Response('', { headers: { 'Content-Type': 'text/css' } });
  }

  const cssPath = path.join(process.cwd(), 'src', 'themes', theme, 'theme.css');
  
  try {
    if (fs.existsSync(cssPath)) {
      const css = fs.readFileSync(cssPath, 'utf8');
      return new Response(css, { 
        headers: { 
          'Content-Type': 'text/css',
          'Cache-Control': 'public, max-age=3600'
        } 
      });
    }
    return new Response('', { headers: { 'Content-Type': 'text/css' } });
  } catch {
    return new Response('', { headers: { 'Content-Type': 'text/css' } });
  }
}
