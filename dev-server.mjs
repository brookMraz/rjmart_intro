import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, relative, sep } from 'node:path';

const root = process.cwd();
const port = Number(process.env.PORT || 8001);
const gatewayOrigin = process.env.GATEWAY_ORIGIN || 'https://gateway.test.rj-info.com';
const proxyOrigin = process.env.PROXY_ORIGIN || 'https://srm.test.rj-info.com';
const defaultRjkSeed = {
  version: 'x231',
  refererHash: '-1100140939',
  timestamp: '01777285066606',
  tokenLength: '0',
  browserId: 'db3ed27b595d4c6db0925722c4338f25',
  tokenFlag: '0'
};

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mp4': 'video/mp4',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp'
};

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(data));
}

function javaStringHash(text) {
  let hash = 0;
  for (const char of text) {
    hash = Math.imul(hash, 31) + char.charCodeAt(0);
    hash |= 0;
  }
  return String(hash);
}

function createDevRjk(bodyText) {
  const signatureParts = [
    process.env.BIZ_CLUE_RJK_VERSION || defaultRjkSeed.version,
    process.env.BIZ_CLUE_RJK_REFERER_HASH || defaultRjkSeed.refererHash,
    process.env.BIZ_CLUE_RJK_TIMESTAMP || defaultRjkSeed.timestamp,
    javaStringHash(bodyText),
    process.env.BIZ_CLUE_RJK_TOKEN_LENGTH || defaultRjkSeed.tokenLength,
    process.env.BIZ_CLUE_RJK_BROWSER_ID || defaultRjkSeed.browserId,
    process.env.BIZ_CLUE_RJK_TOKEN_FLAG || defaultRjkSeed.tokenFlag
  ];
  const signature = signatureParts.join('.');
  const signatureLength = process.env.BIZ_CLUE_RJK_TOTAL_LENGTH || String(signature.length);
  return `${signature}.${signatureLength}`;
}

async function proxyGatewayRequest(req, res) {
  const body = await readRequestBody(req);
  const bodyText = body.toString('utf8');
  const targetUrl = new URL(req.url, gatewayOrigin);
  const isBizClueSubmit = targetUrl.pathname === '/store/oms/bizClue/submit';
  const isAnonymousFooterConfig =
    targetUrl.pathname === '/store/config/anonymous/getWebsiteBottomConfigs';
  const headers = {
    Accept: req.headers.accept || 'application/json, text/plain, */*',
    'Accept-Language': req.headers['accept-language'] || 'zh-CN,zh;q=0.9',
    'Content-Type': req.headers['content-type'] || 'application/json',
    Origin: proxyOrigin,
    Referer: `${proxyOrigin}/`,
    'User-Agent': req.headers['user-agent'] || ''
  };

  ['authorization', 'rjk', 'x-router-rule-data'].forEach(headerName => {
    if (
      (headerName === 'rjk' && (isBizClueSubmit || isAnonymousFooterConfig)) ||
      (headerName === 'x-router-rule-data' && isAnonymousFooterConfig)
    ) {
      return;
    }
    if (req.headers[headerName]) {
      headers[headerName] = req.headers[headerName];
    }
  });

  if (isBizClueSubmit) {
    headers.Rjk = process.env.BIZ_CLUE_RJK || createDevRjk(bodyText);
  }

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : body
    });
    const responseBody = await response.arrayBuffer();

    res.writeHead(response.status, {
      'Content-Type': response.headers.get('content-type') || 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    });
    res.end(Buffer.from(responseBody));
  } catch (error) {
    sendJson(res, 502, {
      code: 502,
      success: false,
      msg: error.message || '本地代理转发失败'
    });
  }
}

async function serveStatic(req, res) {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = decodeURIComponent(requestUrl.pathname);
  const relativePath = pathname === '/' ? 'index.html' : pathname.slice(1);
  const filePath = normalize(join(root, relativePath));

  const rel = relative(root, filePath);
  if (rel.startsWith('..') || rel === '..' || rel.split(sep).includes('..')) {
    sendJson(res, 403, { code: 403, success: false, msg: 'Forbidden' });
    return;
  }

  try {
    const body = await readFile(filePath);
    res.writeHead(200, {
      'Content-Type': mimeTypes[extname(filePath)] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    });
    res.end(body);
  } catch {
    sendJson(res, 404, { code: 404, success: false, msg: 'Not found' });
  }
}

const server = createServer(async (req, res) => {
  if (req.url?.startsWith('/store/')) {
    await proxyGatewayRequest(req, res);
    return;
  }

  if (req.method === 'GET' || req.method === 'HEAD') {
    await serveStatic(req, res);
    return;
  }

  sendJson(res, 405, { code: 405, success: false, msg: 'Method not allowed' });
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Preview server: http://127.0.0.1:${port}/`);
  console.log(`Gateway proxy: /store/* -> ${gatewayOrigin}`);
  console.log(`Proxy Origin/Referer: ${proxyOrigin}`);
});
