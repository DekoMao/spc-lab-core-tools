import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, sep, extname } from 'node:path';

// Local development only: deliberately binds to loopback, without external access.
const root = fileURLToPath(new URL('../dist/', import.meta.url));
const port = Number(process.env.PORT || 8080);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error('PORT deve ser um inteiro entre 1 e 65535.');
  process.exit(1);
}
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json' };
const server = createServer(async (req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return;
  }
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
    const path = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!path.startsWith(root.endsWith(sep) ? root : root + sep)) {
      res.writeHead(403); res.end('Acesso negado.'); return;
    }
    const content = await readFile(path);
    res.writeHead(200, { 'Content-Type': (mime[extname(path)] || 'application/octet-stream') + '; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    res.end(req.method === 'HEAD' ? undefined : content);
  } catch (error) {
    res.writeHead(error.code === 'ENOENT' || error.code === 'EISDIR' ? 404 : 400);
    res.end('Recurso não encontrado ou endereço inválido.');
  }
});
server.on('error', error => { console.error('Não foi possível iniciar o servidor:', error.message); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => console.log(`SPC Lab disponível em http://127.0.0.1:${port}`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close());
