// Hub OS — Service Worker
// Gera ícones PNG dinamicamente via OffscreenCanvas (sem arquivos externos)

const _iconCache = {};

async function buildIcon(size) {
    if (_iconCache[size]) return _iconCache[size];
    try {
        const c = new OffscreenCanvas(size, size);
        const ctx = c.getContext('2d');

        // Fundo escuro
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, size, size);

        // Quadrado arredondado indigo
        const m = size * 0.1;
        const r = size * 0.2;
        ctx.fillStyle = '#4f46e5';
        ctx.beginPath();
        ctx.moveTo(m + r, m);
        ctx.lineTo(size - m - r, m);
        ctx.quadraticCurveTo(size - m, m, size - m, m + r);
        ctx.lineTo(size - m, size - m - r);
        ctx.quadraticCurveTo(size - m, size - m, size - m - r, size - m);
        ctx.lineTo(m + r, size - m);
        ctx.quadraticCurveTo(m, size - m, m, size - m - r);
        ctx.lineTo(m, m + r);
        ctx.quadraticCurveTo(m, m, m + r, m);
        ctx.closePath();
        ctx.fill();

        // Letra H
        ctx.fillStyle = '#ffffff';
        ctx.font = `900 ${Math.round(size * 0.52)}px Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('H', size / 2, size / 2);

        const blob = await c.convertToBlob({ type: 'image/png' });
        _iconCache[size] = blob;
        return blob;
    } catch (e) {
        return null;
    }
}

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    const path = url.pathname;

    if (path.endsWith('icon-192.png') || path.endsWith('icon-512.png')) {
        const size = path.includes('512') ? 512 : 192;
        event.respondWith(
            buildIcon(size).then(blob =>
                blob
                    ? new Response(blob, {
                        status: 200,
                        headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=86400' }
                      })
                    : fetch(event.request)
            )
        );
    }
});
