import React, { useState } from 'react';

const BG = '#0E0B26';
const BG_DEEP = '#080619';
const CARD = 'rgba(255,255,255,0.05)';
const LINE = 'rgba(255,255,255,0.12)';
const INK = '#F3F1FF';
const INK_SOFT = '#A9A3D9';
const BLUE = '#4FA0FF';
const INDIGO = '#7C6FEA';
const INDIGO_DEEP = '#4C3B8C';

const FREE_TRIAL_LIMIT = 0;
const DAILY_GEN_LIMIT = 50;
const DAILY_GEN_KEY = 'sir_daily_gens';

function checkAndUseDailyLimit() {
  const today = new Date().toISOString().slice(0, 10);
  let record;
  try {
    record = JSON.parse(localStorage.getItem(DAILY_GEN_KEY) || 'null');
  } catch (e) {
    record = null;
  }
  if (!record || record.date !== today) {
    record = { date: today, count: 0 };
  }
  if (record.count >= DAILY_GEN_LIMIT) return false;
  record.count += 1;
  localStorage.setItem(DAILY_GEN_KEY, JSON.stringify(record));
  return true;
}

const NATIVE_LANGS = [
  { code: 'es', label: 'Espa\u00f1ol' },
  { code: 'zh', label: '\u4e2d\u6587' },
  { code: 'ru', label: '\u0420\u0443\u0441\u0441\u043a\u0438\u0439' },
  { code: 'ar', label: '\u0627\u0644\u0639\u0631\u0628\u064a\u0629' },
  { code: 'pt', label: 'Portugu\u00eas' },
  { code: 'hi', label: '\u0939\u093f\u0928\u094d\u0926\u0940' },
  { code: 'fr', label: 'Fran\u00e7ais' },
  { code: 'vi', label: 'Ti\u1ebfng Vi\u1ec7t' },
  { code: 'ko', label: '\ud55c\uad6d\uc5b4' },
  { code: 'tr', label: 'T\u00fcrk\u00e7e' },
  { code: 'de', label: 'Deutsch' },
  { code: 'ja', label: '\u65e5\u672c\u8a9e' },
  { code: 'it', label: 'Italiano' },
  { code: 'pl', label: 'Polski' },
  { code: 'fa', label: '\u0641\u0627\u0631\u0633\u06cc' },
  { code: 'other', label: 'Other / Другой' },
];

const MESSAGE_TYPES = [
  { value: 'email', label: 'Email to a client' },
  { value: 'supplier', label: 'Message to a supplier' },
  { value: 'social', label: 'Social media post' },
  { value: 'formal', label: 'Formal document paragraph' },
  { value: 'quick', label: 'Quick reply' },
];

function TalkingPerson({ size = 150 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id="personGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={BLUE} />
          <stop offset="100%" stopColor={INDIGO_DEEP} />
        </linearGradient>
        <radialGradient id="glowGrad" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor={BLUE} stopOpacity="0.35" />
          <stop offset="100%" stopColor={BLUE} stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle className="glow-pulse" cx="80" cy="78" r="70" fill="url(#glowGrad)" />
      <path d="M30 158 Q30 112 80 112 Q130 112 130 158 Z" fill="url(#personGrad)" opacity="0.9" />
      <ellipse cx="80" cy="66" rx="34" ry="38" fill="url(#personGrad)" />
      <path d="M46 58 Q46 28 80 26 Q114 28 114 58 Q114 40 80 38 Q46 40 46 58 Z" fill={INDIGO_DEEP} opacity="0.8" />
      <ellipse cx="68" cy="64" rx="3.2" ry="4.2" fill="#FFFFFF" />
      <ellipse cx="92" cy="64" rx="3.2" ry="4.2" fill="#FFFFFF" />
      <path d="M62 56 Q68 53 74 56" stroke="#FFFFFF" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
      <path d="M86 56 Q92 53 98 56" stroke="#FFFFFF" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
      <path d="M80 66 L78 76 Q80 78 82 76" stroke="#FFFFFF" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.35" />
      <ellipse className="talking-mouth" cx="80" cy="86" rx="10" ry="3.5" fill="#FFFFFF" />
      <g transform="translate(122, 60)">
        <rect className="eq-bar eq-1" x="0" y="10" width="4" height="10" rx="2" fill={BLUE} />
        <rect className="eq-bar eq-2" x="8" y="4" width="4" height="22" rx="2" fill={INDIGO} />
        <rect className="eq-bar eq-3" x="16" y="8" width="4" height="14" rx="2" fill={BLUE} />
      </g>
    </svg>
  );
}

export default function App() {
  const [licenseCode, setLicenseCode] = useState(() => localStorage.getItem('sir_licenseCode') || '');
  const [unlocked, setUnlocked] = useState(() => localStorage.getItem('sir_unlocked') === 'true');
  const [licenseError, setLicenseError] = useState('');

  const [inputText, setInputText] = useState('');
  const [messageType, setMessageType] = useState('email');
  const [formality, setFormality] = useState(50);
  const [nativeLang, setNativeLang] = useState('es');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  function handleUnlock() {
    if (!licenseCode.trim()) {
      setLicenseError('Please enter a code.');
      return;
    }
    localStorage.setItem('sir_licenseCode', licenseCode.trim());
    localStorage.setItem('sir_unlocked', 'true');
    setUnlocked(true);
    setLicenseError('');
  }

  async function handleGenerate() {
    if (!inputText.trim()) {
      setError('Paste or type your message first.');
      return;
    }
    if (!checkAndUseDailyLimit()) {
      setError('Daily generation limit reached. Try again tomorrow.');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);

    const nativeLangLabel = NATIVE_LANGS.find(l => l.code === nativeLang)?.label || nativeLang;
    const formalityLabel = formality < 33 ? 'casual' : formality < 66 ? 'moderately formal' : 'very formal';
    const typeLabel = MESSAGE_TYPES.find(m => m.value === messageType)?.label || messageType;

    const prompt = `You help non-native English speakers write professional, natural-sounding English for small business communication.

The person's native language is: ${nativeLangLabel}
Message type: ${typeLabel}
Desired formality: ${formalityLabel}
Their draft (may be in their native language, broken English, or a mix): "${inputText}"

Do the following:
1. Rewrite it as natural, professional English matching the requested formality and message type.
2. List 2-4 specific changes you made, each explained BRIEFLY in ${nativeLangLabel} (not English), so the person learns from it.
3. If the original phrasing could come across as too blunt to an English-speaking reader, add a short tone note in English. If tone is already fine, omit this.
4. Give one short English tip specific to common mistakes made by ${nativeLangLabel} speakers -- written in ${nativeLangLabel}.

Respond ONLY with valid JSON, no markdown, no code fences:
{"rewritten": "...", "changes": ["...", "..."], "toneNote": "..." or null, "commonMistakeTip": "..."}`;

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseCode, content: prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      let parsed;
      try {
        parsed = JSON.parse(data.result || data.content || '{}');
      } catch (e) {
        parsed = { rewritten: data.result || data.content, changes: [], toneNote: null, commonMistakeTip: '' };
      }
      setResult(parsed);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const sharedStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Inter:wght@400;500;600&display=swap');
    body { margin: 0; }
    @keyframes mouthTalk { 0%, 100% { ry: 3.5; } 50% { ry: 8; } }
    .talking-mouth { animation: mouthTalk 1.1s ease-in-out infinite; transform-origin: 80px 86px; }
    @keyframes eqBounce { 0%, 100% { transform: scaleY(0.5); } 50% { transform: scaleY(1.3); } }
    .eq-bar { transform-origin: bottom; animation: eqBounce 0.9s ease-in-out infinite; }
    .eq-1 { animation-delay: 0s; }
    .eq-2 { animation-delay: 0.2s; }
    .eq-3 { animation-delay: 0.4s; }
    @keyframes glowPulse { 0%, 100% { opacity: 0.5; transform: scale(1); } 50% { opacity: 1; transform: scale(1.12); } }
    .glow-pulse { animation: glowPulse 3s ease-in-out infinite; transform-origin: 80px 78px; }
    @keyframes floatSlow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
    .float-person { animation: floatSlow 4.5s ease-in-out infinite; }
    @keyframes bgShift {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }
    .bg-gradient-animated {
      background: linear-gradient(120deg, #0E0B26, #171040, #0E0B26, #10143A);
      background-size: 300% 300%;
      animation: bgShift 14s ease infinite;
    }
  `;

  if (!unlocked) {
    return (
      <div className="bg-gradient-animated min-h-screen flex items-center justify-center px-4 py-10" style={{ fontFamily: "'Inter', sans-serif" }}>
        <style>{sharedStyles}</style>
        <div className="w-full max-w-sm">
          <div className="float-person flex justify-center mb-5"><TalkingPerson size={130} /></div>
          <div className="text-center mb-6">
            <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 28, color: INK, marginBottom: 10 }}>
              SayItRight AI
            </h1>
            <p style={{ fontSize: 14, color: INK_SOFT, lineHeight: 1.6 }}>
              Write in your own language. Get natural, professional English -- with explanations of every change.
              Enter your access code below, or <a href="/buy.html" style={{ color: BLUE, textDecoration: 'underline' }}>get one here</a>.
            </p>
          </div>
          <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: CARD, border: `1px solid ${LINE}`, backdropFilter: 'blur(16px)' }}>
            <input
              type="text"
              value={licenseCode}
              onChange={(e) => setLicenseCode(e.target.value)}
              placeholder="Enter your access code"
              className="w-full rounded-lg px-3 py-2.5 text-sm mb-3 focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${LINE}`, color: INK }}
            />
            {licenseError && <p className="text-sm mb-3" style={{ color: '#FF8A8A' }}>{licenseError}</p>}
            <button
              onClick={handleUnlock}
              className="w-full font-medium py-2.5 rounded-lg text-sm"
              style={{ background: `linear-gradient(135deg, ${BLUE}, ${INDIGO})`, color: '#FFFFFF', boxShadow: `0 8px 24px rgba(79,160,255,0.35)` }}
            >
              Unlock
            </button>
            <a href="/buy.html" className="block text-center text-xs mt-4" style={{ color: BLUE }}>
              No code? Get access
            </a>
          </div>
          <div className="flex justify-center gap-4 mt-6">
            <a href="/terms.html" style={{ fontSize: 11, color: INK_SOFT, opacity: 0.7 }}>Terms of Service</a>
            <a href="/privacy.html" style={{ fontSize: 11, color: INK_SOFT, opacity: 0.7 }}>Privacy Policy</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-animated min-h-screen" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{sharedStyles}</style>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="float-person"><TalkingPerson size={72} /></div>
          <div>
            <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 26, color: INK }}>SayItRight AI</h1>
            <p style={{ fontSize: 13, color: INK_SOFT }}>Write naturally in English, explained in your own language.</p>
          </div>
        </div>

        <div className="rounded-2xl p-5 mb-5" style={{ background: CARD, border: `1px solid ${LINE}`, backdropFilter: 'blur(16px)' }}>
          <label style={{ fontSize: 12.5, color: INK_SOFT, fontWeight: 500, display: 'block', marginBottom: 6 }}>
            Your message (any language, or rough English)
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={5}
            placeholder="Paste what you want to say..."
            className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${LINE}`, color: INK, resize: 'vertical' }}
          />

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div>
              <label style={{ fontSize: 12, color: INK_SOFT, fontWeight: 500, display: 'block', marginBottom: 4 }}>Message type</label>
              <select
                value={messageType}
                onChange={(e) => setMessageType(e.target.value)}
                className="w-full rounded-lg px-2 py-2 text-sm focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${LINE}`, color: INK }}
              >
                {MESSAGE_TYPES.map(m => <option key={m.value} value={m.value} style={{ color: '#000' }}>{m.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: INK_SOFT, fontWeight: 500, display: 'block', marginBottom: 4 }}>Your native language</label>
              <select
                value={nativeLang}
                onChange={(e) => setNativeLang(e.target.value)}
                className="w-full rounded-lg px-2 py-2 text-sm focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${LINE}`, color: INK }}
              >
                {NATIVE_LANGS.map(l => <option key={l.code} value={l.code} style={{ color: '#000' }}>{l.label}</option>)}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label style={{ fontSize: 12, color: INK_SOFT, fontWeight: 500, display: 'block', marginBottom: 4 }}>
              Formality: {formality < 33 ? 'Casual' : formality < 66 ? 'Moderate' : 'Very formal'}
            </label>
            <input
              type="range" min="0" max="100" value={formality}
              onChange={(e) => setFormality(Number(e.target.value))}
              className="w-full"
              style={{ accentColor: BLUE }}
            />
          </div>

          {error && <p className="text-sm mt-3" style={{ color: '#FF8A8A' }}>{error}</p>}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full font-medium py-2.5 rounded-lg text-sm mt-4"
            style={{ background: `linear-gradient(135deg, ${BLUE}, ${INDIGO})`, color: '#FFFFFF', opacity: loading ? 0.7 : 1, boxShadow: `0 8px 24px rgba(79,160,255,0.3)` }}
          >
            {loading ? 'Writing...' : 'Rewrite it'}
          </button>
        </div>

        {result && (
          <div className="rounded-2xl p-5 mb-5" style={{ background: CARD, border: `1px solid ${LINE}`, backdropFilter: 'blur(16px)' }}>
            <div style={{ fontSize: 12, color: BLUE, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Your English text
            </div>
            <p style={{ fontSize: 15, color: INK, lineHeight: 1.6, whiteSpace: 'pre-wrap', marginBottom: 20 }}>
              {result.rewritten}
            </p>

            {result.changes && result.changes.length > 0 && (
              <div className="mb-5">
                <div style={{ fontSize: 12, color: BLUE, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  What I changed and why
                </div>
                {result.changes.map((c, i) => (
                  <div key={i} className="flex gap-2 mb-2" style={{ fontSize: 13.5, color: INK_SOFT, lineHeight: 1.5 }}>
                    <span style={{ color: BLUE }}>&bull;</span>
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            )}

            {result.toneNote && (
              <div className="rounded-lg p-3 mb-4" style={{ background: 'rgba(255,200,80,0.08)', border: '1px solid rgba(255,200,80,0.3)' }}>
                <div style={{ fontSize: 11.5, color: '#FFC850', fontWeight: 600, marginBottom: 4 }}>TONE NOTE</div>
                <p style={{ fontSize: 13, color: INK_SOFT, lineHeight: 1.5 }}>{result.toneNote}</p>
              </div>
            )}

            {result.commonMistakeTip && (
              <div className="rounded-lg p-3" style={{ background: 'rgba(124,111,234,0.12)' }}>
                <div style={{ fontSize: 11.5, color: INDIGO, fontWeight: 600, marginBottom: 4 }}>TIP FOR YOU</div>
                <p style={{ fontSize: 13, color: INK, lineHeight: 1.5 }}>{result.commonMistakeTip}</p>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col items-center justify-center gap-1.5 mt-10 pt-6" style={{ borderTop: `1px solid ${LINE}` }}>
          <span className="text-xs" style={{ color: INK_SOFT }}>Powered by Claude &middot; Plainwork by Ksenia</span>
          <span className="text-xs" style={{ color: INK_SOFT, opacity: 0.7 }}>Fair use: up to 50 generations per day</span>
          <div className="flex gap-4 mt-1">
            <a href="/terms.html" style={{ fontSize: 11, color: INK_SOFT, opacity: 0.7 }}>Terms of Service</a>
            <a href="/privacy.html" style={{ fontSize: 11, color: INK_SOFT, opacity: 0.7 }}>Privacy Policy</a>
          </div>
        </div>
      </div>
    </div>
  );
}
