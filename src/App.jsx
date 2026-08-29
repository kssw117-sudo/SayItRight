import React, { useState } from 'react';

const INDIGO = '#4C3B8C';
const INDIGO_DEEP = '#382C6B';
const BLUE = '#4A6FE3';
const BLUE_SOFT = '#EEF1FD';
const BG = '#F7F7FC';
const CARD = '#FFFFFF';
const LINE = '#E3E1F5';
const INK = '#241F3D';
const INK_SOFT = '#6E699A';

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

// Простой говорящий персонаж — голова с анимированным "разговором"
// (открывающийся/закрывающийся рот + пульсирующие звуковые волны)
function TalkingHead({ size = 140 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 140 140" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="headGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={BLUE} />
          <stop offset="100%" stopColor={INDIGO} />
        </linearGradient>
      </defs>
      <circle cx="70" cy="70" r="58" fill="url(#headGrad)" opacity="0.12" />
      <circle cx="70" cy="66" r="40" fill="url(#headGrad)" />
      {/* Глаза */}
      <circle cx="56" cy="60" r="4" fill="#FFFFFF" />
      <circle cx="84" cy="60" r="4" fill="#FFFFFF" />
      {/* Рот — анимируется через CSS класс talking-mouth */}
      <ellipse className="talking-mouth" cx="70" cy="82" rx="12" ry="4" fill="#FFFFFF" />
      {/* Звуковые волны, пульсируют */}
      <path className="sound-wave wave-1" d="M118 55 Q128 66 118 77" stroke={BLUE} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path className="sound-wave wave-2" d="M126 45 Q142 66 126 87" stroke={INDIGO} strokeWidth="3" fill="none" strokeLinecap="round" />
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
2. List 2-4 specific changes you made, each explained BRIEFLY in ${nativeLangLabel} (not English), so the person learns from it. Focus on patterns common for speakers of ${nativeLangLabel} learning English.
3. If the original phrasing could come across as too blunt or direct to an English-speaking reader, add a short tone note in English explaining this and suggesting a softer alternative. If tone is already fine, omit this.
4. Give one short, generally useful English tip specific to common mistakes made by ${nativeLangLabel} speakers (not necessarily related to this specific message) -- written in ${nativeLangLabel}.

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

  if (!unlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{ background: BG, fontFamily: "'Inter', sans-serif" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Inter:wght@400;500;600&display=swap');
          @keyframes mouthTalk { 0%, 100% { ry: 4; } 50% { ry: 9; } }
          .talking-mouth { animation: mouthTalk 1.1s ease-in-out infinite; transform-origin: 70px 82px; }
          @keyframes wavePulse { 0%, 100% { opacity: 0.25; } 50% { opacity: 0.9; } }
          .wave-1 { animation: wavePulse 1.3s ease-in-out infinite; }
          .wave-2 { animation: wavePulse 1.3s ease-in-out infinite 0.3s; }
        `}</style>
        <div className="w-full max-w-sm">
          <div className="flex justify-center mb-4"><TalkingHead size={110} /></div>
          <div className="text-center mb-6">
            <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 26, color: INK, marginBottom: 8 }}>
              SayItRight AI
            </h1>
            <p style={{ fontSize: 14, color: INK_SOFT, lineHeight: 1.55 }}>
              Write in your own language. Get natural, professional English -- with explanations of every change.
              Enter your access code below, or <a href="/buy.html" style={{ color: INDIGO, textDecoration: 'underline' }}>get one here</a>.
            </p>
          </div>
          <div className="w-full max-w-sm rounded-xl p-6" style={{ background: CARD, border: `1px solid ${LINE}` }}>
            <input
              type="text"
              value={licenseCode}
              onChange={(e) => setLicenseCode(e.target.value)}
              placeholder="Enter your access code"
              className="w-full rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none"
              style={{ background: BLUE_SOFT, border: `1px solid ${LINE}`, color: INK }}
            />
            {licenseError && <p className="text-sm mb-3" style={{ color: '#C0392B' }}>{licenseError}</p>}
            <button
              onClick={handleUnlock}
              className="w-full font-medium py-2.5 rounded-lg text-sm"
              style={{ background: `linear-gradient(135deg, ${BLUE}, ${INDIGO})`, color: '#FFFFFF' }}
            >
              Unlock
            </button>
            <a href="/buy.html" className="block text-center text-xs mt-4" style={{ color: INDIGO }}>
              No code? Get access
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: BG, fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Inter:wght@400;500;600&display=swap');
        @keyframes mouthTalk { 0%, 100% { ry: 4; } 50% { ry: 9; } }
        .talking-mouth { animation: mouthTalk 1.1s ease-in-out infinite; transform-origin: 70px 82px; }
        @keyframes wavePulse { 0%, 100% { opacity: 0.25; } 50% { opacity: 0.9; } }
        .wave-1 { animation: wavePulse 1.3s ease-in-out infinite; }
        .wave-2 { animation: wavePulse 1.3s ease-in-out infinite 0.3s; }
        @keyframes floatSlow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .float-head { animation: floatSlow 4s ease-in-out infinite; }
      `}</style>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="float-head"><TalkingHead size={64} /></div>
          <div>
            <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 24, color: INK }}>SayItRight AI</h1>
            <p style={{ fontSize: 13, color: INK_SOFT }}>Write naturally in English, explained in your own language.</p>
          </div>
        </div>

        <div className="rounded-xl p-5 mb-5" style={{ background: CARD, border: `1px solid ${LINE}` }}>
          <label style={{ fontSize: 12.5, color: INK_SOFT, fontWeight: 500, display: 'block', marginBottom: 6 }}>
            Your message (any language, or rough English)
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={5}
            placeholder="Paste what you want to say..."
            className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
            style={{ background: BLUE_SOFT, border: `1px solid ${LINE}`, color: INK, resize: 'vertical' }}
          />

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div>
              <label style={{ fontSize: 12, color: INK_SOFT, fontWeight: 500, display: 'block', marginBottom: 4 }}>Message type</label>
              <select
                value={messageType}
                onChange={(e) => setMessageType(e.target.value)}
                className="w-full rounded-lg px-2 py-2 text-sm focus:outline-none"
                style={{ background: BLUE_SOFT, border: `1px solid ${LINE}`, color: INK }}
              >
                {MESSAGE_TYPES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: INK_SOFT, fontWeight: 500, display: 'block', marginBottom: 4 }}>Your native language</label>
              <select
                value={nativeLang}
                onChange={(e) => setNativeLang(e.target.value)}
                className="w-full rounded-lg px-2 py-2 text-sm focus:outline-none"
                style={{ background: BLUE_SOFT, border: `1px solid ${LINE}`, color: INK }}
              >
                {NATIVE_LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
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
              style={{ accentColor: INDIGO }}
            />
          </div>

          {error && <p className="text-sm mt-3" style={{ color: '#C0392B' }}>{error}</p>}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full font-medium py-2.5 rounded-lg text-sm mt-4"
            style={{ background: `linear-gradient(135deg, ${BLUE}, ${INDIGO})`, color: '#FFFFFF', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Writing...' : 'Rewrite it'}
          </button>
        </div>

        {result && (
          <div className="rounded-xl p-5 mb-5" style={{ background: CARD, border: `1px solid ${LINE}` }}>
            <div style={{ fontSize: 12, color: INDIGO, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Your English text
            </div>
            <p style={{ fontSize: 15, color: INK, lineHeight: 1.6, whiteSpace: 'pre-wrap', marginBottom: 20 }}>
              {result.rewritten}
            </p>

            {result.changes && result.changes.length > 0 && (
              <div className="mb-5">
                <div style={{ fontSize: 12, color: INDIGO, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
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
              <div className="rounded-lg p-3 mb-4" style={{ background: '#FFF8E8', border: '1px solid #F2D98A' }}>
                <div style={{ fontSize: 11.5, color: '#8A6B1A', fontWeight: 600, marginBottom: 4 }}>TONE NOTE</div>
                <p style={{ fontSize: 13, color: '#6B5314', lineHeight: 1.5 }}>{result.toneNote}</p>
              </div>
            )}

            {result.commonMistakeTip && (
              <div className="rounded-lg p-3" style={{ background: BLUE_SOFT }}>
                <div style={{ fontSize: 11.5, color: INDIGO, fontWeight: 600, marginBottom: 4 }}>TIP FOR YOU</div>
                <p style={{ fontSize: 13, color: INK, lineHeight: 1.5 }}>{result.commonMistakeTip}</p>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col items-center justify-center gap-1 mt-10 pt-6" style={{ borderTop: `1px solid ${LINE}` }}>
          <span className="text-xs" style={{ color: INK_SOFT }}>Powered by Claude &middot; Plainwork by Ksenia</span>
          <span className="text-xs" style={{ color: INK_SOFT, opacity: 0.7 }}>Fair use: up to 50 generations per day</span>
        </div>
      </div>
    </div>
  );
}
