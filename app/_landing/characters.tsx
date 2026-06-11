// @ts-nocheck
'use client';
/* characters.tsx — перенос characters.jsx: mouse-tracking eye mascots (<Mascots scale=.. />) */
import React from 'react';

function useMouse() {
  const [mouse, setMouse] = React.useState({ x: -9999, y: -9999 });
  React.useEffect(() => {
    let raf;
    const onMove = e => { cancelAnimationFrame(raf); const x = e.clientX, y = e.clientY; raf = requestAnimationFrame(() => setMouse({ x, y })); };
    window.addEventListener('mousemove', onMove);
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf); };
  }, []);
  return mouse;
}

function EyeBall({ size = 18, pupilSize = 7, max = 5, blinking, mouse }) {
  const ref = React.useRef(null);
  const [pos, setPos] = React.useState({ x: 0, y: 0 });
  React.useLayoutEffect(() => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = mouse.x - (r.left + r.width / 2), dy = mouse.y - (r.top + r.height / 2);
    const dist = Math.min(Math.hypot(dx, dy), max), a = Math.atan2(dy, dx);
    setPos({ x: Math.cos(a) * dist, y: Math.sin(a) * dist });
  }, [mouse.x, mouse.y]);
  return (
    <div ref={ref} className="eye" style={{ width: size, height: blinking ? 2 : size }}>
      {!blinking && <div className="pupil" style={{ width: pupilSize, height: pupilSize, transform: `translate(${pos.x}px,${pos.y}px)` }} />}
    </div>
  );
}

function Pupil({ size = 12, max = 5, mouse }) {
  const ref = React.useRef(null);
  const [pos, setPos] = React.useState({ x: 0, y: 0 });
  React.useLayoutEffect(() => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = mouse.x - (r.left + r.width / 2), dy = mouse.y - (r.top + r.height / 2);
    const dist = Math.min(Math.hypot(dx, dy), max), a = Math.atan2(dy, dx);
    setPos({ x: Math.cos(a) * dist, y: Math.sin(a) * dist });
  }, [mouse.x, mouse.y]);
  return <div ref={ref} className="pupil pupil--bare" style={{ width: size, height: size, transform: `translate(${pos.x}px,${pos.y}px)` }} />;
}

function useBlink() {
  const [b, setB] = React.useState(false);
  React.useEffect(() => {
    let t;
    const loop = () => { t = setTimeout(() => { setB(true); setTimeout(() => { setB(false); loop(); }, 150); }, Math.random() * 4000 + 3000); };
    loop();
    return () => clearTimeout(t);
  }, []);
  return b;
}

function skew(ref, mouse) {
  const el = ref.current; if (!el) return 0;
  const r = el.getBoundingClientRect();
  return Math.max(-6, Math.min(6, -(mouse.x - (r.left + r.width / 2)) / 120));
}

export function Mascots({ scale = 1, style }) {
  const mouse = useMouse();
  const purple = React.useRef(null), dark = React.useRef(null), amber = React.useRef(null), rose = React.useRef(null);
  const blinkP = useBlink(), blinkD = useBlink();
  return (
    <div className="chars-embed" style={{ width: 480 * scale, height: 360 * scale, ...style }}>
      <div className="chars" style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        <div ref={purple} className="char char--purple" style={{ transform: `skewX(${skew(purple, mouse)}deg)` }}>
          <div className="char__eyes" style={{ gap: 22 }}>
            <EyeBall mouse={mouse} blinking={blinkP} />
            <EyeBall mouse={mouse} blinking={blinkP} />
          </div>
        </div>
        <div ref={dark} className="char char--dark" style={{ transform: `skewX(${skew(dark, mouse)}deg)` }}>
          <div className="char__eyes" style={{ gap: 16, top: 30 }}>
            <EyeBall size={16} pupilSize={6} max={4} mouse={mouse} blinking={blinkD} />
            <EyeBall size={16} pupilSize={6} max={4} mouse={mouse} blinking={blinkD} />
          </div>
        </div>
        <div ref={amber} className="char char--amber" style={{ transform: `skewX(${skew(amber, mouse)}deg)` }}>
          <div className="char__eyes" style={{ gap: 30, top: 92, left: 78 }}>
            <Pupil mouse={mouse} />
            <Pupil mouse={mouse} />
          </div>
        </div>
        <div ref={rose} className="char char--rose" style={{ transform: `skewX(${skew(rose, mouse)}deg)` }}>
          <div className="char__eyes" style={{ gap: 18, top: 42, left: 48 }}>
            <Pupil mouse={mouse} />
            <Pupil mouse={mouse} />
          </div>
          <div className="char__mouth" />
        </div>
      </div>
    </div>
  );
}
