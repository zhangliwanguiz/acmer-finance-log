// /api/news.js  —  Vercel Serverless Function
// 用途：服务端代理东方财富资讯接口（绕过 referer 风控），缓存 60 秒。
// 备注：东财接口对来自非 *.eastmoney.com 的 referer 直接返回反爬验证 HTML；
//       通过 server-side fetch + 正确 Referer 才能拿到真实数据。

const NEWS_URL =
  'https://np-listapi.eastmoney.com/comm/web/getNewsByColumns' +
  '?client=web&biz=web_news_col&column=345&order=1&needInteractData=0' +
  '&page_index=1&page_size=60' +
  '&req_trace=vercel_' + Date.now() +
  '&fields=code,showTime,title,mediaName,summary,url,image';

const TTL_MS = 60 * 1000;        // 内存缓存：60s（防止流量爆 + Vercel 函数调用频率）
const FETCH_TIMEOUT_MS = 8000;   // 上游超时 8s
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

function jsonpWrap(payload) {
  // 大部分前端 JSONP loader 用 callback=window.__cb 模式；但 Vercel 函数可发普通 JSON
  // （CORS Access-Control-Allow-Origin: * 已设）。我们同时支持 JSONP：当 query 里有 callback=xxx，
  // 返回 jsonpCall(payload)，便于回退到老浏览器/兼容性场景。
  return payload;
}

function handler(req, res) {
  // CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  // CDN / 浏览器缓存：10 分钟生效 + 后台 30 分钟静默更新
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=600, stale-while-revalidate=300');
  if (req.method === 'OPTIONS') { res.statusCode = 204; return res.end(); }

  // 内存缓存
  const now = Date.now();
  const cache = global.__newsCache || (global.__newsCache = { ts: 0, body: null });

  const finish = (status, body, contentType) => {
    res.statusCode = status;
    res.setHeader('Content-Type', contentType);
    res.end(body);
  };

  // 支持 JSONP：当 ?callback=xxx 出现，返回 jsonpCall(json)
  const url = req.url || '';
  const cbMatch = /[?&]callback=([^&]+)/.exec(url);
  const cbName = cbMatch ? decodeURIComponent(cbMatch[1]) : null;

  const serveCache = () => {
    if (cbName) return finish(200, cbName + '(' + cache.body + ');', 'application/javascript; charset=utf-8');
    return finish(200, cache.body, 'application/json; charset=utf-8');
  };

  if (cache.body && now - cache.ts < TTL_MS) return serveCache();

  // 拉上游（带正确 Referer）
  const ctrl = new AbortController();
  const tid = setTimeout(function () { ctrl.abort(); }, FETCH_TIMEOUT_MS);

  fetch(NEWS_URL, {
    method: 'GET',
    headers: {
      'User-Agent': UA,
      'Referer': 'https://finance.eastmoney.com/',
      'Accept': 'application/json, text/javascript, */*; q=0.1',
      'Accept-Language': 'zh-CN,zh;q=0.9'
    },
    signal: ctrl.signal
  }).then(function (r) {
    clearTimeout(tid);
    return r.text();
  }).then(function (txt) {
    // 解析失败或反爬验证页（含 <!doctype>）视为失败
    var ok = txt && (txt[0] === '{' || txt[0] === '[');
    if (!ok) {
      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: 'upstream_unavailable', preview: txt.slice(0, 80) }));
      return;
    }
    cache.ts = Date.now();
    cache.body = txt;
    serveCache();
  }).catch(function (err) {
    clearTimeout(tid);
    res.statusCode = 502;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: String(err && err.message || err) }));
  });
}

module.exports = handler;