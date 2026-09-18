import React, { useState, useEffect } from 'react';

const BG = '#0E0B26';
const BG_DEEP = '#080619';
const CARD = 'rgba(255,255,255,0.05)';
const LINE = 'rgba(255,255,255,0.12)';
const INK = '#F3F1FF';
const INK_SOFT = '#A9A3D9';
const BLUE = '#4FA0FF';
const INDIGO = '#2D6FDB';
const INDIGO_BRIGHT = '#8FBFFF';
const INDIGO_DEEP = '#1E4FA8';

const FREE_TRIAL_LIMIT = 0;
const DAILY_GEN_LIMIT = 50;
const DAILY_GEN_KEY = 'sir_daily_gens';

function getDailyCount() {
  const today = new Date().toISOString().slice(0, 10);
  let record;
  try {
    record = JSON.parse(localStorage.getItem(DAILY_GEN_KEY) || 'null');
  } catch (e) {
    record = null;
  }
  if (!record || record.date !== today) return 0;
  return record.count;
}

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
// Иллюстрация "до/после" — два пузыря со стрелкой, нарисованные прямо в
// коде (как человечек и остальные декоративные фигуры), без файла-картинки
function BeforeAfterBubbles({ width = 320 }) {
  const height = width * 0.42;
  return (
    <svg width={width} height={height} viewBox="0 0 320 134" fill="none">
      {/* Левый пузырь — волнистые линии (ломаный текст) */}
      <rect x="8" y="8" width="120" height="80" rx="14" stroke={BLUE} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <polygon points="35,88 25,108 48,89" stroke={BLUE} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="48" cy="48" r="7" fill={BLUE} />
      <circle cx="68" cy="48" r="7" fill={BLUE} />
      <circle cx="88" cy="48" r="7" fill={BLUE} />

      {/* Стрелка */}
      <path d="M136 46 Q160 20 184 46" stroke={INDIGO} strokeWidth="4" fill="none" strokeLinecap="round" />
      <polygon points="184,46 172,42 178,54" fill={INDIGO} />

      {/* Правый пузырь — галочка (исправлено) */}
      <rect x="192" y="8" width="120" height="80" rx="14" stroke={INDIGO} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <polygon points="219,88 209,108 232,89" stroke={INDIGO} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <polyline points="222,50 245,68 285,28" stroke={INDIGO} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

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
  const [freeTrialUsed, setFreeTrialUsed] = useState(() => localStorage.getItem('sir_free_trial_used') === 'true');
  const [licenseError, setLicenseError] = useState('');

  const [inputText, setInputText] = useState(() => localStorage.getItem('sir_draft_inputText') || '');
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
  const [history, setHistory] = useState([]);
  const [speaking, setSpeaking] = useState(false);
  const [dailyCount, setDailyCount] = useState(() => getDailyCount());
  const [showSupportEmail, setShowSupportEmail] = useState(false);
  const [showHelpBubble, setShowHelpBubble] = useState(false);

  // Лёгкий "поп"-звук для открытия/закрытия окошка подсказки
  function playPopSound(opening) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(opening ? 520 : 380, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(opening ? 780 : 260, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) { /* звук не критичен для работы приложения */ }
  }

  const [showHowTo, setShowHowTo] = useState(false);

  // Сохраняем текст ввода при каждом изменении, чтобы не терять его
  // при обновлении или случайном закрытии страницы
  useEffect(() => { localStorage.setItem('sir_draft_inputText', inputText); }, [inputText]);

  // Восстанавливаем последний результат и историю при загрузке страницы
  useEffect(() => {
    try {
      const savedResult = localStorage.getItem('sir_draft_result');
      if (savedResult) setResult(JSON.parse(savedResult));
      const savedHistory = localStorage.getItem('sir_draft_history');
      if (savedHistory) setHistory(JSON.parse(savedHistory));
    } catch (e) { /* повреждённые данные — просто игнорируем */ }
  }, []);

  // Сохраняем результат и историю при каждом изменении
  useEffect(() => {
    try { if (result) localStorage.setItem('sir_draft_result', JSON.stringify(result)); } catch (e) {}
  }, [result]);
  useEffect(() => {
    try { localStorage.setItem('sir_draft_history', JSON.stringify(history)); } catch (e) {}
  }, [history]);

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

  function handleSpeak(text, lang) {
    if (!window.speechSynthesis) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang || 'en-US';
    utter.rate = 0.95;
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utter);
  }

  async function handleGenerate() {
    if (!inputText.trim()) {
      setError('Paste or type your message first.');
      return;
    }
    if (!unlocked && freeTrialUsed) {
      setError('Free preview used. Enter your access code to continue.');
      return;
    }
    const isTrial = !unlocked && !freeTrialUsed;
    if (!isTrial) {
      if (!checkAndUseDailyLimit()) {
        setDailyCount(DAILY_GEN_LIMIT);
        return;
      }
      setDailyCount(getDailyCount());
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
        body: JSON.stringify({ licenseCode, content: prompt, trial: isTrial }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      if (isTrial) {
        localStorage.setItem('sir_free_trial_used', 'true');
        setFreeTrialUsed(true);
      }
      let parsed;
      try {
        parsed = JSON.parse(data.result || data.content || '{}');
      } catch (e) {
        parsed = { rewritten: data.result || data.content, changes: [], toneNote: null, commonMistakeTip: '' };
      }
      setResult(parsed);
      setHistory(h => [{ text: parsed.rewritten, lang: targetLang, time: Date.now() }, ...h].slice(0, 5));
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const sharedStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Playfair+Display:wght@500&family=Inter:wght@400;500;600&display=swap');
    body { margin: 0; }
    @keyframes bubblePulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.035); } }
    @keyframes marqueeScroll { 0% { left: 100%; } 100% { left: -100%; } }
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


  return (
    <div className="bg-gradient-animated min-h-screen" style={{ fontFamily: "'Inter', sans-serif", position: 'relative', overflow: 'hidden' }}>
      <style>{sharedStyles}</style>

      <div className="drift-shape" style={{ position: 'absolute', top: '6%', left: '4%', opacity: 0.3 }}><ProfileSoundIcon size={44} delay="0s" /></div>
      <div className="drift-shape" style={{ position: 'absolute', top: '40%', right: '5%', opacity: 0.26, animationDelay: '1.4s' }}><ProfileSoundIcon size={56} delay="0.6s" /></div>
      <div className="drift-shape" style={{ position: 'absolute', bottom: '8%', left: '6%', opacity: 0.26, animationDelay: '0.7s' }}><ProfileSoundIcon size={38} delay="1s" /></div>
      <div className="drift-shape" style={{ position: 'absolute', top: '18%', right: '8%', opacity: 0.22, animationDelay: '2.1s' }}>
        <svg width="46" height="46" viewBox="0 0 24 24" fill="none"><path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4V6a2 2 0 0 1 2-2z" fill={BLUE} /></svg>
      </div>
      <div className="drift-shape" style={{ position: 'absolute', bottom: '20%', right: '4%', opacity: 0.2, animationDelay: '1.1s' }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4V6a2 2 0 0 1 2-2z" fill={INDIGO} /></svg>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10" style={{ position: 'relative', zIndex: 1 }}>
        <div className="flex flex-col items-center text-center gap-2 mb-6">
          <div><TalkingPerson size={90} /></div>
          <div>
            <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 26, color: INK }}>SayItRight AI</h1>
            <p style={{ fontSize: 13, color: INK_SOFT }}>Write naturally in English, explained in your own language.</p>
          </div>
        </div>

        <div className="flex justify-center mb-3">
          <BeforeAfterBubbles width={280} />
        </div>
        <div style={{ overflow: 'hidden', marginBottom: 16, position: 'relative', height: 30 }}>
          <div style={{ position: 'absolute', animation: 'marqueeScroll 13s linear infinite' }}>
            <span style={{
              color: '#F5F4EE', fontFamily: "'Playfair Display', serif", fontSize: 19,
            }}>
              Fixes your English. Teaches you why
            </span>
          </div>
        </div>

        {!unlocked && (
          <div className="rounded-lg p-3 mb-5" style={{ background: freeTrialUsed ? 'rgba(167,139,250,0.1)' : 'rgba(79,160,255,0.1)', border: `1px solid ${freeTrialUsed ? 'rgba(167,139,250,0.3)' : 'rgba(79,160,255,0.3)'}` }}>
            {freeTrialUsed ? (
              <>
                <p className="text-sm" style={{ color: INDIGO_BRIGHT, margin: 0, fontWeight: 600 }}>Free preview used</p>
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={licenseCode}
                    onChange={(e) => setLicenseCode(e.target.value)}
                    placeholder="Enter your access code"
                    className="flex-1 rounded-lg px-3 py-2 text-sm focus:outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${LINE}`, color: INK }}
                  />
                  <button
                    onClick={handleUnlock}
                    className="font-medium px-4 rounded-lg text-sm"
                    style={{ background: `linear-gradient(135deg, ${INDIGO}, ${INDIGO_DEEP})`, color: '#FFFFFF' }}
                  >
                    Unlock
                  </button>
                </div>
                {licenseError && <p className="text-sm mt-2" style={{ color: INDIGO_BRIGHT }}>{licenseError}</p>}
                <a href="/buy.html" className="block text-xs mt-2" style={{ color: INDIGO }}>No code? Get access</a>
              </>
            ) : (
              <p className="text-sm" style={{ color: '#8FBFFF', margin: 0 }}>Try it free — your first generation is on us. No code needed.</p>
            )}
          </div>
        )}

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
              <div style={{ fontSize: 18, display: 'flex', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#A78BFA" strokeWidth="2" />
                  <polyline points="7,12.5 10.5,16 17,8.5" stroke="#A78BFA" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
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

          {dailyCount >= DAILY_GEN_LIMIT ? (
            <div className="rounded-lg p-3 mt-4 text-center" style={{ background: 'rgba(255,138,138,0.1)', border: '1px solid rgba(255,138,138,0.3)' }}>
              <p style={{ fontSize: 13, color: '#FF8A8A', margin: 0, fontWeight: 600 }}>Today's limit reached</p>
              <p style={{ fontSize: 12, color: INK_SOFT, margin: '4px 0 0' }}>Come back tomorrow for 50 more free generations.</p>
            </div>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full font-medium py-2.5 rounded-lg text-sm mt-4"
              style={{ background: `linear-gradient(135deg, ${BLUE}, #A78BFA)`, color: '#FFFFFF', opacity: loading ? 0.7 : 1, boxShadow: `0 8px 24px rgba(79,160,255,0.3)` }}
            >
              {loading ? 'Writing...' : quickCheckOnly ? 'Check it' : 'Rewrite it'}
            </button>
          )}

          <div className="mt-3">
            <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
              <span style={{ fontSize: 10.5, color: INK_SOFT }}>Today's free generations</span>
              <span style={{ fontSize: 10.5, color: INK_SOFT, fontWeight: 600 }}>{DAILY_GEN_LIMIT - dailyCount}/{DAILY_GEN_LIMIT} left</span>
            </div>
            <div style={{ height: 4, borderRadius: 999, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 999, width: `${(dailyCount / DAILY_GEN_LIMIT) * 100}%`,
                background: dailyCount >= DAILY_GEN_LIMIT ? '#FF8A8A' : `linear-gradient(90deg, ${BLUE}, ${INDIGO})`,
                transition: 'width 0.3s ease',
              }} />
            </div>
          </div>
        </div>

        {result && (
          <div className="rounded-2xl p-5 mb-5" style={{ background: CARD, border: `1px solid ${LINE}`, backdropFilter: 'blur(16px)' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
              <div style={{ fontSize: 12, color: BLUE, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Your text
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleSpeak(result.rewritten, targetLang)}
                  style={{ fontSize: 11, color: speaking ? INDIGO : BLUE, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                >
                  {speaking ? '\u23f9 Stop' : '\ud83d\udd0a Listen'}
                </button>
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

        {history.length > 0 && (
          <div className="rounded-2xl p-5 mb-5" style={{ background: CARD, border: `1px solid ${LINE}`, backdropFilter: 'blur(16px)' }}>
            <div style={{ fontSize: 12, color: BLUE, fontWeight: 600, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Recent
            </div>
            {history.map((h, i) => (
              <div key={h.time} className="flex items-start justify-between gap-3" style={{ padding: '8px 0', borderTop: i === 0 ? 'none' : `1px solid ${LINE}` }}>
                <p style={{ fontSize: 13, color: INK_SOFT, lineHeight: 1.4, margin: 0, flex: 1 }}>{h.text}</p>
                <button
                  onClick={() => navigator.clipboard.writeText(h.text)}
                  style={{ fontSize: 11, color: BLUE, background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}
                >
                  Copy
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col items-center justify-center gap-1.5 mt-10 pt-6" style={{ borderTop: `1px solid ${LINE}` }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'normal', textDecoration: 'underline', fontSize: 13, color: BLUE, marginBottom: 2 }}>
            Corrections that actually stick.
          </span>
          <span className="text-xs" style={{ color: INK_SOFT }}>Powered by Claude &middot; Plainwork by Ksenia</span>

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

      {/* Плавающая кнопка "как пользоваться" — в углу экрана */}
      <button
        onClick={() => {
          playPopSound(!showHelpBubble);
          setShowHelpBubble(v => !v);
        }}
        aria-label="How it works"
        style={{
          position: 'fixed', bottom: 20, right: 20, width: 48, height: 48, borderRadius: '50%',
          background: BLUE, color: '#FFF', border: 'none',
          cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(79,160,255,0.35)', zIndex: 50,
        }}
      >
        {showHelpBubble ? '\u2715' : '?'}
      </button>

      {showHelpBubble && (
        <div
          style={{
            position: 'fixed', bottom: 80, right: 20, width: 310, maxWidth: 'calc(100vw - 40px)',
            background: CARD, borderRadius: 14, padding: 18, boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
            border: `1px solid ${LINE}`, zIndex: 50, backdropFilter: 'blur(16px)',
          }}
        >
          <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: INK }}>How SayItRight AI works</p>
          <p style={{ margin: 0, fontSize: 12.5, color: INK_SOFT, lineHeight: 1.55 }}>
            Write in your own language or rough English, pick your languages and tone, and hit Rewrite. Every result comes with a plain-language explanation of what changed and why, plus a listen button to hear how it sounds. Switch on Quick check for spelling and grammar only.
          </p>
        </div>
      )}
    </div>
  );
}
