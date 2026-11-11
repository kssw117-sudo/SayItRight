// api/generate.js
// Один код доступа хранится в переменной окружения ACCESS_CODE на Vercel.
// AppSumo-коды (SIR-XXXX-XXXX) проверяются отдельно через GitHub-хранилище кодов.
// trial: true — одна бесплатная генерация без кода, чтобы модераторы
// маркетплейсов могли реально попробовать продукт.
// ===================================================================
// Защита доступа и лимитов -- на сервере, очисткой кэша не обходится.
// - Код доступа проверяется: общий (ACCESS_CODE) или уникальный из списка
//   ../appsumo/codes.json (выдуманный код не пройдёт).
// - Пробные генерации: 1 на IP-адрес на 30 дней.
// - Лимит: 50 генераций в день на уникальный код; для общего кода --
//   50 в день на каждый IP-адрес (покупатели не делят один лимит).
// - Неудачная генерация не списывается.
// - Лимиты работают, когда к проекту подключена база Upstash Redis
//   (переменные UPSTASH_REDIS_REST_KV_REST_API_URL / _TOKEN). Без неё
//   проверка кода всё равно работает, а лимиты просто не считаются.
// ===================================================================
import { createRequire } from 'module';
const __require = createRequire(import.meta.url);

const GUARD = { product: 'sir', daily: 50, trialMax: 1 };
const TRIAL_TTL = 30 * 24 * 3600;
const REDIS_URL = process.env.UPSTASH_REDIS_REST_KV_REST_API_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN;

async function redis(commands) {
  const r = await fetch(`${REDIS_URL}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands)
  });
  if (!r.ok) throw new Error(`redis http ${r.status}`);
  const data = await r.json();
  return data.map(item => { if (item.error) throw new Error(item.error); return item.result; });
}

let codeSet = null;
function knownCodes() {
  if (codeSet) return codeSet;
  try {
    const list = __require('../appsumo/codes.json');
    const arr = Array.isArray(list) ? list : Object.values(list).flat();
    codeSet = new Set(arr.map(c => String(c && typeof c === 'object' ? c.code : c).trim().toUpperCase()));
  } catch (e) {
    console.error('Could not load codes list:', e.message);
    codeSet = new Set();
  }
  return codeSet;
}

function clientIp(req) {
  const fwd = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return fwd || String(req.headers['x-real-ip'] || '') || 'unknown';
}

// Счётчик с лимитом: +1, если превышен -- откат. Возвращает { ok, used, refund }.
async function takeOne(key, max, ttl) {
  const [n] = await redis([['INCR', key]]);
  if (n === 1) await redis([['EXPIRE', key, ttl]]);
  if (n > max) {
    await redis([['DECR', key]]);
    return { ok: false, used: max };
  }
  return { ok: true, used: n, refund: async () => { try { await redis([['DECR', key]]); } catch (e) {} } };
}

const noRefund = async () => {};

async function guard(req, licenseCode, wantsTrial) {
  const code = typeof licenseCode === 'string' ? licenseCode.trim().toUpperCase() : '';
  const sharedCode = String(process.env.ACCESS_CODE || '').trim().toUpperCase();
  const shared = Boolean(code) && Boolean(sharedCode) && code === sharedCode;
  const unique = !shared && Boolean(code) && knownCodes().has(code);
  const redisOn = Boolean(REDIS_URL && REDIS_TOKEN);
  const ip = clientIp(req);
  const p = GUARD.product;

  if (!shared && !unique) {
    if (code || !wantsTrial) {
      return { ok: false, status: 403, body: { error: 'Invalid access code.', code: 'invalid_code' } };
    }
    if (!redisOn) return { ok: true, refund: noRefund };
    try {
      const t = await takeOne(`${p}:trial:${ip}`, GUARD.trialMax, TRIAL_TTL);
      if (!t.ok) {
        return { ok: false, status: 403, body: { error: 'Your free preview is used. Enter your access code to continue.', code: 'trial_used' } };
      }
      return { ok: true, refund: t.refund };
    } catch (e) {
      console.error('Trial check failed, allowing request:', e.message);
      return { ok: true, refund: noRefund };
    }
  }

  if (!redisOn) return { ok: true, refund: noRefund };
  try {
    const today = new Date().toISOString().slice(0, 10);
    const who = shared ? `shared:${ip}` : code;
    const l = await takeOne(`${p}:limit:${who}:${today}`, GUARD.daily, 93600);
    if (!l.ok) {
      return { ok: false, status: 429, body: { error: `Daily limit of ${GUARD.daily} generations reached. Come back tomorrow.`, code: 'limit_reached' } };
    }
    return { ok: true, refund: l.refund };
  } catch (e) {
    console.error('Limit check failed, allowing request:', e.message);
    return { ok: true, refund: noRefund };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return innerHandler(req, res);
  const body = req.body || {};
  const g = await guard(req, body.licenseCode, body.trial === true);
  if (!g.ok) return res.status(g.status).json(g.body);

  // Если генерация не удалась (ответ с ошибкой) -- возвращаем списанное.
  let status = 200;
  const origStatus = res.status.bind(res);
  res.status = (s) => { status = s; return origStatus(s); };
  try {
    const out = await innerHandler(req, res);
    if (status >= 400) await g.refund();
    return out;
  } catch (e) {
    await g.refund();
    throw e;
  }
}
// ============================ конец защиты ============================


async function innerHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { licenseCode, content, trial } = req.body || {};

  const normalizedCode = licenseCode ? licenseCode.trim().toUpperCase() : '';
  const isSharedCode = normalizedCode && normalizedCode === process.env.ACCESS_CODE;
  const isAppSumoCode = normalizedCode && normalizedCode.startsWith('SIR-');
  const isFreeTrial = trial === true;

  // Код доступа и лимиты уже проверены в handler (см. защиту выше).


  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{ role: 'user', content }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {

      console.error('Anthropic error:', response.status);

      return res.status(502).json({ error: 'Generation failed. Please try again.' });

    }
    const text = data.content?.[0]?.text || '';
    const clean = text.replace(/```json|```/g, '').trim();

    return res.status(200).json({ result: clean });
  } catch (err) {
    return res.status(500).json({ error: 'Generation failed. Please try again.' });
  }
}
