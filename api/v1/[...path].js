const BODY_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const FORWARDED_REQUEST_HEADERS = ['accept', 'content-type', 'cookie', 'authorization', 'x-requested-with'];

module.exports = async function proxyApi(req, res) {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) {
    return res.status(503).json({ error: 'API proxy is not configured. Set BACKEND_URL in Vercel.' });
  }

  try {
    const target = new URL(req.url, `${backendUrl.replace(/\/$/, '')}/`);
    const headers = new Headers();
    for (const name of FORWARDED_REQUEST_HEADERS) {
      const value = req.headers[name];
      if (value) headers.set(name, Array.isArray(value) ? value.join(', ') : value);
    }

    const options = { method: req.method, headers, redirect: 'manual' };
    if (BODY_METHODS.has(req.method)) {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      if (chunks.length) options.body = Buffer.concat(chunks);
    }

    const upstream = await fetch(target, options);
    const contentType = upstream.headers.get('content-type');
    const cacheControl = upstream.headers.get('cache-control');
    if (contentType) res.setHeader('content-type', contentType);
    if (cacheControl) res.setHeader('cache-control', cacheControl);

    const cookies = upstream.headers.getSetCookie?.() || [];
    if (cookies.length) res.setHeader('set-cookie', cookies);

    const body = Buffer.from(await upstream.arrayBuffer());
    return res.status(upstream.status).send(body);
  } catch (error) {
    console.error('[Vercel API proxy]', error);
    return res.status(502).json({ error: 'Could not reach the EMBLEM API.' });
  }
};
