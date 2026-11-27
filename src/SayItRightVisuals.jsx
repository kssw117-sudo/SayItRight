import React, { useEffect, useRef, useState } from 'react';

export function SayItRightHero() {
  const reset = (event) => {
    event.currentTarget.style.setProperty('--px', '0px');
    event.currentTarget.style.setProperty('--py', '0px');
  };
  const move = (event) => {
    if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    event.currentTarget.style.setProperty('--px', `${((event.clientX - rect.left) / rect.width - .5) * 8}px`);
    event.currentTarget.style.setProperty('--py', `${((event.clientY - rect.top) / rect.height - .5) * 6}px`);
  };
  return (<>
    <header className="top"><div className="brand"><span aria-hidden="true" className="brandmark"></span>SayItRight AI</div><a href="#editor">Open writing studio ↘</a></header>
    <section className="hero"><div className="hero-copy"><span className="kicker">SAYITRIGHT AI  /  THE ART OF COMMUNICATION</span><h1>Your words.<br/><em>More confidence.</em></h1><p className="lead">Write naturally in English, explained in your own language.</p><p className="tagline">Fixes your English. Teaches you why.</p><div className="price"><div><strong>$59</strong><small>One-time payment · Lifetime access</small></div><a className="purchase" href="/buy.html">Get lifetime access <span>↗</span></a></div></div><div aria-hidden="true" className="visual" onPointerMove={move} onPointerLeave={reset}><div className="sir-v4-dialogue"><img alt="" src="/images/sir-soft-glass.webp"/><svg aria-hidden="true" className="sir-v4-speech" viewBox="0 0 640 356"><g className="sir-v4-wave" fill="none" stroke="#b2caed" strokeLinecap="round" strokeWidth="1.7"><path d="M236 153v6 M243 149v14 M250 145v22 M257 140v32 M264 148v16 M271 151v10 M278 154v4"></path></g><g className="sir-v4-dots" fill="#bacdec"><circle cx="374" cy="210" r="2.6"></circle><circle cx="384" cy="210" r="2.6"></circle><circle cx="394" cy="210" r="2.6"></circle></g></svg></div><span className="word">BONJOUR</span><span className="word">HELLO</span><span className="word">Привет</span><span className="word">HOLA</span><span className="word">你好</span><span className="word">مرحبا</span><div className="art-label"><span>LANGUAGE WITHOUT BARRIERS</span><i></i><span>35 LANGUAGES</span></div><svg aria-hidden="true" className="art-orbits" viewBox="0 0 640 410"><defs><linearGradient id="artline"><stop stopColor="#8fbfff" stopOpacity="0"></stop><stop offset=".5" stopColor="#9ca8d9" stopOpacity=".6"></stop><stop offset="1" stopColor="#a78bfa" stopOpacity="0"></stop></linearGradient></defs><ellipse cx="320" cy="205" fill="none" rx="265" ry="116" stroke="url(#artline)" strokeDasharray="2 7" transform="rotate(-22 320 205)"></ellipse><ellipse cx="320" cy="205" fill="none" rx="249" ry="129" stroke="url(#artline)" transform="rotate(24 320 205)"></ellipse><circle fill="#b9c9ed" r="3"><animateMotion dur="16s" path="M85 246 C60 153 212 57 370 82 S600 246 500 302 S151 351 85 246" repeatCount="indefinite"></animateMotion></circle></svg><div className="art-note note-left"><span>01</span> INTENTION</div><div className="art-note note-right"><span>02</span> EXPRESSION</div></div></section>
  </>);
}
export function WorkspaceHeading() { return (<div className="work-head"><div><span className="kicker">02  /  YOUR WORKSPACE</span><h2>Make it sound like you.</h2></div><p>Write · Refine · Understand</p></div>); }
export function EditorMast() { return <div className="editor-mast"><span><i /> WRITING STUDIO</span><span>YOUR WORDS, YOUR VOICE</span></div>; }
export function SettingIcon({ name }) {
  const icons = { formality: <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"></path><circle cx="9" cy="6" fill="#1c203c" r="2"></circle><circle cx="15" cy="12" fill="#1c203c" r="2"></circle><circle cx="8" cy="18" fill="#1c203c" r="2"></circle></svg>, notes: <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M4 4h16v13H9l-5 4zM8 8h8M8 12h5"></path></svg>, tone: <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M4 10v4M8 7v10M12 3v18M16 7v10M20 10v4"></path></svg>, quick: <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><path d="m8 12 3 3 5-6"></path></svg> };
  return icons[name] || null;
}

const samples = [
 {type:'email',label:'Client email',kind:'FLUENCY',before:'I am waiting your reply.',old:'waiting your reply',after:'I look forward to your reply.',changed:'look forward to your reply',why:'“Look forward to” is a natural, courteous expression in professional emails.'},
 {type:'supplier',label:'Supplier',kind:'POLITENESS',before:'Send me the documents.',old:'Send me',after:'Could you please send me the documents?',changed:'Could you please',why:'A question softens the request without changing what you need from your supplier.'},
 {type:'social',label:'Social',kind:'NATURAL FLOW',before:'We are happy to announce about our new collection.',old:'announce about',after:'We’re excited to share our new collection.',changed:'excited to share',why:'“Share” is warmer and more conversational. “Announce” does not need “about”.'},
 {type:'formal',label:'Formal',kind:'GRAMMAR',before:'I am interesting in your proposal.',old:'interesting',after:'I am interested in your proposal.',changed:'interested',why:'Use “interested” to describe how you feel; “interesting” describes something that attracts attention.'},
 {type:'quick',label:'Quick reply',kind:'TONE',before:'I can not come today.',old:'can not come',after:'Sorry, I won’t be able to make it today.',changed:'won’t be able to make it',why:'A natural, considerate reply that keeps the original meaning.'}
];
function Marked({ text, part, corrected }) {
  const index = text.indexOf(part);
  if (index < 0) return text;
  return <>{text.slice(0,index)}{corrected ? <mark>{part}</mark> : <del>{part}</del>}{text.slice(index+part.length)}</>;
}
const defaultStatus = 'Illustrative examples · no AI requests';
export function LanguageLab({ onUseExample, onListen, speaking = false }) {
  const [current, setCurrent] = useState(0);
  const [auto, setAuto] = useState(() => typeof window !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [status, setStatus] = useState(defaultStatus);
  const labRef = useRef(null);
  const selected = samples[current];
  useEffect(() => {
    if (!auto || speaking) return;
    const id = window.setInterval(() => {
      const lab = labRef.current;
      if (document.hidden || !lab || lab.matches(':hover') || lab.contains(document.activeElement)) return;
      setCurrent(i => (i + 1) % samples.length);
      setStatus(defaultStatus);
    },10500);
    return () => window.clearInterval(id);
  },[auto,speaking]);
  const select = i => { setAuto(false); setCurrent(i); setStatus(defaultStatus); };
  const listen = () => {
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) { setStatus('Speech playback is unavailable in this browser.'); return; }
    onListen(selected.after);
  };
  return (
    <aside ref={labRef} className="language-lab" aria-label="Interactive example corrections">
      <div className="lab-top"><div className="lab-label"><span className="lab-dot" /> THE LANGUAGE LAB</div><button type="button" className="play-demo" aria-label={auto?'Pause automatic examples':'Play automatic examples'} aria-pressed={auto} onClick={()=>setAuto(v=>!v)}><svg fill="none" height="14" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24" width="14"><path d={auto?'M9 5v14M15 5v14':'m9 5 11 7-11 7z'}/></svg><span>{auto?'Auto':'Paused'}</span></button></div>
      <div className="lab-title"><h2>Small words.<br/><em>Big difference.</em></h2><p>Explore how meaning, tone and context change a sentence.</p></div>
      <div className="lab-context" aria-label="Example context">{samples.map((sample,i)=><button type="button" key={sample.type} data-context={i} aria-pressed={i===current} onClick={()=>select(i)}>{sample.label}</button>)}</div>
      <div key={current} className="lab-sheet changing" aria-live={auto?'off':'polite'}>
        <div className="sheet-meta"><span>{String(current+1).padStart(2,'0')} / {selected.kind}</span><span>{String(current+1).padStart(2,'0')} — 05</span></div>
        <div className="sheet-line"><span className="sheet-caption">ORIGINAL</span><p><Marked text={selected.before} part={selected.old}/></p></div>
        <div className="edit-rule"><span/><i>↓</i><span/></div>
        <div className="sheet-line refined"><span className="sheet-caption">REFINED</span><p><Marked text={selected.after} part={selected.changed} corrected/></p></div>
        <div className="lab-why"><span className="why-mark">✳</span><div><span className="sheet-caption">WHY IT WORKS</span><p>{selected.why}</p></div></div>
      </div>
      <div className="lab-actions"><button className={'listen-example'+(speaking?' speaking':'')} type="button" onClick={listen}><svg fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" viewBox="0 0 24 24" width="18"><path d="M4 10v4h4l5 4V6l-5 4H4zM16 9a5 5 0 0 1 0 6M19 6a9 9 0 0 1 0 12"/></svg><span>{speaking?'Stop':'Listen'}</span></button><button className="use-example" type="button" onClick={()=>{if(onUseExample(selected))setStatus('Example loaded into the editor.');}}>Try this example <span>↗</span></button></div>
      <div className="lab-status" role="status">{status}</div>
      <div className="lab-foot"><span>THOUGHT</span><svg aria-hidden="true" fill="none" height="24" viewBox="0 0 95 24" width="95"><path d="M0 12H17l5-3 5 6 6-10 5 14 6-16 6 19 6-15 5 8 6-3h28" stroke="#8279aa" strokeWidth="1.2"/></svg><span>CLARITY</span></div>
    </aside>
  );
}
