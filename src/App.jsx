import React, { useState } from 'react';

const BG = '#0E0B26';
const BG_DEEP = '#080619';
const CARD = 'rgba(255,255,255,0.05)';
const LINE = 'rgba(255,255,255,0.12)';
const INK = '#F3F1FF';
const INK_SOFT = '#A9A3D9';
const BLUE = '#4FA0FF';
const INDIGO = '#A78BFA';
const INDIGO_BRIGHT = '#C4B5FD';
const INDIGO_DEEP = '#6D5BD0';

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

const LANGS = [
  { code: 'en', label: 'English' },
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
  { code: 'uk', label: '\u0423\u043a\u0440\u0430\u0457\u043d\u0441\u044c\u043a\u0430' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'th', label: '\u0e44\u0e17\u0e22' },
  { code: 'id', label: 'Bahasa Indonesia' },
  { code: 'ms', label: 'Bahasa Melayu' },
  { code: 'bn', label: '\u09ac\u09be\u0982\u09b2\u09be' },
  { code: 'ur', label: '\u0627\u0631\u062f\u0648' },
  { code: 'sw', label: 'Kiswahili' },
  { code: 'ro', label: 'Rom\u00e2n\u0103' },
  { code: 'el', label: '\u0395\u03bb\u03bb\u03b7\u03bd\u03b9\u03ba\u03ac' },
  { code: 'cs', label: '\u010ce\u0161tina' },
  { code: 'sv', label: 'Svenska' },
  { code: 'he', label: '\u05e2\u05d1\u05e8\u05d9\u05ea' },
  { code: 'hu', label: 'Magyar' },
  { code: 'fi', label: 'Suomi' },
  { code: 'da', label: 'Dansk' },
  { code: 'no', label: 'Norsk' },
  { code: 'sk', label: 'Sloven\u010dina' },
  { code: 'bg', label: '\u0411\u044a\u043b\u0433\u0430\u0440\u0441\u043a\u0438' },
  { code: 'other', label: 'Other / Другой' },
];
const NATIVE_LANGS = LANGS;

const MESSAGE_TYPES = [
  { value: 'email', label: 'Email to a client' },
  { value: 'supplier', label: 'Message to a supplier' },
  { value: 'social', label: 'Social media post' },
  { value: 'formal', label: 'Formal document paragraph' },
  { value: 'quick', label: 'Quick reply' },
];

function TalkingPerson({ size = 150 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 120" style={{ display: 'block', overflow: 'visible' }}>
      <circle cx="50" cy="35" r="20" stroke={BLUE} strokeWidth="5" fill="none" />
      <path d="M20 108 Q20 65 50 65 Q80 65 80 108" stroke={BLUE} strokeWidth="5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// Декоративная иконка: маленький речевой пузырь без текста (форма узнаваема
// и на маленьком размере) — заполняет пустое пространство на всех экранах.
function ProfileSoundIcon({ size = 60, delay = '0s' }) {
  return (
    <svg width={size} height={size * 0.8} viewBox="0 0 100 80" style={{ overflow: 'visible' }}>
      <g className="bubble-pulse" style={{ transformOrigin: '50px 40px', animationDelay: delay }}>
        <rect x="8" y="8" width="84" height="48" rx="14" fill={BLUE} />
        <polygon points="30,54 20,72 42,56" fill={BLUE} />
      </g>
    </svg>
  );
}

// Речевой пузырь с текстом "Say It Right" — используется только на экране
// разблокировки, рядом с человечком (две независимые фигуры, не одна сложная).
function TextBubble({ size = 100 }) {
  return (
    <svg width={size} height={size * 0.8} viewBox="0 0 200 160">
      <defs>
        <linearGradient id="bubbleTextGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={BLUE} />
          <stop offset="100%" stopColor={INDIGO} />
        </linearGradient>
      </defs>
      <rect x="15" y="15" width="170" height="95" rx="24" fill="url(#bubbleTextGrad)" />
      <polygon points="55,108 40,140 80,110" fill={INDIGO} />
      <text x="100" y="55" textAnchor="middle" fontFamily="'Fraunces', serif" fontWeight="700" fontSize="30" fill="#FFFFFF">Say It</text>
      <text x="100" y="90" textAnchor="middle" fontFamily="'Fraunces', serif" fontWeight="700" fontSize="30" fill="#FFFFFF">Right</text>
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
  const [quickCheckOnly, setQuickCheckOnly] = useState(false);
  const [copied, setCopied] = useState(false);
  const [nativeLang, setNativeLang] = useState('es');
  const [targetLang, setTargetLang] = useState('en');
  const [showNotes, setShowNotes] = useState(true);
  const [toneCheckOn, setToneCheckOn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [showSupportEmail, setShowSupportEmail] = useState(false);

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

    const nativeLangLabel = LANGS.find(l => l.code === nativeLang)?.label || nativeLang;
    const targetLangLabel = LANGS.find(l => l.code === targetLang)?.label || targetLang;
    const formalityLabel = formality < 33 ? 'casual' : formality < 66 ? 'moderately formal' : 'very formal';
    const typeLabel = MESSAGE_TYPES.find(m => m.value === messageType)?.label || messageType;

    const prompt = quickCheckOnly
      ? `You are a spelling, grammar, and punctuation checker for a non-native ${targetLangLabel} speaker (native language: ${nativeLangLabel}).

Their text: "${inputText}"

Fix ONLY spelling, grammar, and punctuation errors, in ${targetLangLabel}. Do NOT change their wording, tone, or style beyond what's needed to fix actual errors -- keep their voice intact.
${showNotes ? `List each correction briefly in ${nativeLangLabel}.` : 'Do not list corrections, just return the fixed text.'}

Respond ONLY with valid JSON, no markdown, no code fences:
{"rewritten": "...", "changes": [${showNotes ? '"...", "..."' : ''}], "toneNote": null, "commonMistakeTip": "..."}`
      : `You help non-native ${targetLangLabel} speakers write professional, natural-sounding ${targetLangLabel} for small business communication.

The person's native language is: ${nativeLangLabel}
Message type: ${typeLabel}
Desired formality: ${formalityLabel}
Their draft (may be in their native language, broken ${targetLangLabel}, or a mix): "${inputText}"

Do the following:
1. Rewrite it as natural, professional ${targetLangLabel} matching the requested formality and message type. Fix all spelling, grammar, and punctuation errors as part of this.
${showNotes ? `2. List 2-4 specific changes you made, each explained BRIEFLY in ${nativeLangLabel} (not ${targetLangLabel}), so the person learns from it. Include spelling/punctuation fixes among these if relevant.` : '2. Do not list changes.'}
${toneCheckOn ? `3. If the original phrasing could come across as too blunt to a native ${targetLangLabel} reader, add a short tone note in ${targetLangLabel}. If tone is already fine, omit this.` : '3. Skip tone analysis.'}
4. Give one short ${targetLangLabel} tip specific to common mistakes made by ${nativeLangLabel} speakers -- written in ${nativeLangLabel}.

Respond ONLY with valid JSON, no markdown, no code fences:
{"rewritten": "...", "changes": [${showNotes ? '"...", "..."' : ''}], "toneNote": "..." or null, "commonMistakeTip": "..."}`;

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
    @keyframes bubblePulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.035); } }
    .bubble-pulse { animation: bubblePulse 2.6s ease-in-out infinite; }
    @keyframes driftShape {
      0%, 100% { transform: translate(0, 0) rotate(0deg); }
      50% { transform: translate(14px, -18px) rotate(6deg); }
    }
    .drift-shape { animation: driftShape 7s ease-in-out infinite; }
    @keyframes soundArc { 0%, 100% { opacity: 0.25; transform: scale(0.85); } 50% { opacity: 0.9; transform: scale(1.05); } }
    .sound-arc { animation: soundArc 1.6s ease-in-out infinite; transform-origin: center; }
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
      <div className="bg-gradient-animated min-h-screen flex items-center justify-center px-4 py-10" style={{ fontFamily: "'Inter', sans-serif", position: 'relative', overflow: 'hidden' }}>
        <style>{sharedStyles}</style>

        {/* Декоративные плавающие фигуры, заполняют пустой фон */}
        <div className="drift-shape" style={{ position: 'absolute', top: '8%', left: '6%', opacity: 0.45 }}><ProfileSoundIcon size={54} delay="0s" /></div>
        <div className="drift-shape" style={{ position: 'absolute', bottom: '14%', right: '8%', opacity: 0.4, animationDelay: '1s' }}><ProfileSoundIcon size={70} delay="0.4s" /></div>
        <div className="drift-shape" style={{ position: 'absolute', top: '24%', right: '10%', opacity: 0.35, animationDelay: '2s' }}><ProfileSoundIcon size={40} delay="0.8s" /></div>
        <div className="drift-shape" style={{ position: 'absolute', bottom: '26%', left: '10%', opacity: 0.38, animationDelay: '0.5s' }}><ProfileSoundIcon size={46} delay="1.2s" /></div>

        <div className="w-full max-w-sm" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ position: 'relative', width: 200, height: 190, margin: '0 auto 24px' }}>
            <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)' }}><TalkingPerson size={110} /></div>
            <div style={{ position: 'absolute', top: 0, right: 0 }}><TextBubble size={110} /></div>
          </div>
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

          <div className="grid grid-cols-2 gap-2.5 mt-6">
            {[
              { icon: '\u2699\ufe0f', label: 'Formality slider' },
              { icon: '\ud83d\udcac', label: 'Native-language notes' },
              { icon: '\ud83c\udfb5', label: 'Tone check' },
              { icon: '\u2705', label: 'Spelling & punctuation' },
            ].map((f, i) => (
              <div key={i} className="rounded-xl p-3 text-center" style={{ background: CARD, border: `1px solid ${LINE}`, backdropFilter: 'blur(12px)' }}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>{f.icon}</div>
                <div style={{ fontSize: 10.5, color: INK_SOFT, lineHeight: 1.3 }}>{f.label}</div>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-4 mt-6 mb-2">
            <a href="/terms.html" style={{ fontSize: 11, color: INK_SOFT, opacity: 0.7 }}>Terms of Service</a>
            <a href="/privacy.html" style={{ fontSize: 11, color: INK_SOFT, opacity: 0.7 }}>Privacy Policy</a>
          </div>
          <div className="flex justify-center">
            {!showSupportEmail ? (
              <button
                onClick={() => setShowSupportEmail(true)}
                style={{ fontSize: 11, color: BLUE, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}
              >
                Support
              </button>
            ) : (
              <a href="mailto:kssw117@gmail.com" style={{ fontSize: 11, color: BLUE }}>kssw117@gmail.com</a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-animated min-h-screen" style={{ fontFamily: "'Inter', sans-serif", position: 'relative', overflow: 'hidden' }}>
      <style>{sharedStyles}</style>

      <div className="drift-shape" style={{ position: 'absolute', top: '6%', left: '4%', opacity: 0.3 }}><ProfileSoundIcon size={44} delay="0s" /></div>
      <div className="drift-shape" style={{ position: 'absolute', top: '40%', right: '5%', opacity: 0.26, animationDelay: '1.4s' }}><ProfileSoundIcon size={56} delay="0.6s" /></div>
      <div className="drift-shape" style={{ position: 'absolute', bottom: '8%', left: '6%', opacity: 0.26, animationDelay: '0.7s' }}><ProfileSoundIcon size={38} delay="1s" /></div>

      <div className="max-w-2xl mx-auto px-4 py-10" style={{ position: 'relative', zIndex: 1 }}>
        <div className="flex items-center gap-4 mb-8">
          <div><TalkingPerson size={90} /></div>
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
          </div>

          <div className="flex items-end gap-2 mt-4">
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: INK_SOFT, fontWeight: 500, display: 'block', marginBottom: 4 }}>Your language</label>
              <select
                value={nativeLang}
                onChange={(e) => setNativeLang(e.target.value)}
                className="w-full rounded-lg px-2 py-2 text-sm focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${LINE}`, color: INK }}
              >
                {LANGS.map(l => <option key={l.code} value={l.code} style={{ color: '#000' }}>{l.label}</option>)}
              </select>
            </div>
            <button
              onClick={() => { const a = nativeLang; setNativeLang(targetLang); setTargetLang(a); }}
              title="Swap languages"
              style={{
                flexShrink: 0, width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.06)',
                border: `1px solid ${LINE}`, color: BLUE, cursor: 'pointer', fontSize: 16, marginBottom: 1,
              }}
            >
              &#8646;
            </button>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: INK_SOFT, fontWeight: 500, display: 'block', marginBottom: 4 }}>Write in</label>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="w-full rounded-lg px-2 py-2 text-sm focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${LINE}`, color: INK }}
              >
                {LANGS.map(l => <option key={l.code} value={l.code} style={{ color: '#000' }}>{l.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 mt-4">
            <button
              onClick={() => setFormality(f => (f + 50) % 150 > 100 ? 0 : f + 50)}
              className="rounded-xl p-2.5 text-center"
              style={{ background: 'rgba(79,160,255,0.12)', border: `1px solid ${BLUE}`, cursor: 'pointer' }}
            >
              <div style={{ fontSize: 18 }}>{'\u2699\ufe0f'}</div>
              <div style={{ fontSize: 9.5, color: INK_SOFT, marginTop: 3 }}>Formality</div>
            </button>
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="rounded-xl p-2.5 text-center"
              style={{
                background: showNotes ? 'rgba(79,160,255,0.12)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${showNotes ? BLUE : LINE}`, cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: 18 }}>{'\ud83d\udcac'}</div>
              <div style={{ fontSize: 9.5, color: INK_SOFT, marginTop: 3 }}>Notes {showNotes ? 'On' : 'Off'}</div>
            </button>
            <button
              onClick={() => setToneCheckOn(!toneCheckOn)}
              className="rounded-xl p-2.5 text-center"
              style={{
                background: toneCheckOn ? 'rgba(79,160,255,0.12)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${toneCheckOn ? BLUE : LINE}`, cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: 18 }}>{'\ud83c\udfb5'}</div>
              <div style={{ fontSize: 9.5, color: INK_SOFT, marginTop: 3 }}>Tone {toneCheckOn ? 'On' : 'Off'}</div>
            </button>
            <button
              onClick={() => setQuickCheckOnly(!quickCheckOnly)}
              className="rounded-xl p-2.5 text-center"
              style={{
                background: quickCheckOnly ? 'rgba(79,160,255,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${quickCheckOnly ? BLUE : LINE}`, cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: 18 }}>{'\u2705'}</div>
              <div style={{ fontSize: 9.5, color: INK_SOFT, marginTop: 3 }}>Quick check {quickCheckOnly ? 'On' : 'Off'}</div>
            </button>
          </div>

          <div className="mt-4">
            <label style={{ fontSize: 12, color: INK_SOFT, fontWeight: 500, display: 'block', marginBottom: 4 }}>
              Formality: {formality < 33 ? 'Casual' : formality < 66 ? 'Moderate' : 'Very formal'}
            </label>
            <input
              type="range" min="0" max="100" value={formality}
              onChange={(e) => setFormality(Number(e.target.value))}
              disabled={quickCheckOnly}
              className="w-full"
              style={{ accentColor: BLUE, opacity: quickCheckOnly ? 0.4 : 1 }}
            />
          </div>

          {error && <p className="text-sm mt-3" style={{ color: '#FF8A8A' }}>{error}</p>}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full font-medium py-2.5 rounded-lg text-sm mt-4"
            style={{ background: `linear-gradient(135deg, ${BLUE}, ${INDIGO})`, color: '#FFFFFF', opacity: loading ? 0.7 : 1, boxShadow: `0 8px 24px rgba(79,160,255,0.3)` }}
          >
            {loading ? 'Writing...' : quickCheckOnly ? 'Check it' : 'Rewrite it'}
          </button>
        </div>

        {result && (
          <div className="rounded-2xl p-5 mb-5" style={{ background: CARD, border: `1px solid ${LINE}`, backdropFilter: 'blur(16px)' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
              <div style={{ fontSize: 12, color: BLUE, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Your English text
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(result.rewritten);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1800);
                }}
                style={{
                  fontSize: 11, color: copied ? '#7CE0A0' : BLUE, background: 'none', border: 'none',
                  cursor: 'pointer', fontWeight: 600,
                }}
              >
                {copied ? '\u2713 Copied' : 'Copy'}
              </button>
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
          <div className="mt-1">
            {!showSupportEmail ? (
              <button
                onClick={() => setShowSupportEmail(true)}
                style={{ fontSize: 11, color: BLUE, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}
              >
                Support
              </button>
            ) : (
              <a href="mailto:kssw117@gmail.com" style={{ fontSize: 11, color: BLUE }}>kssw117@gmail.com</a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
