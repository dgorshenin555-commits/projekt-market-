// @ts-nocheck
'use client';

import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { UserRole } from '@/lib/types';
import Link from 'next/link';
import { Icon } from '../_orders/icons';
import '../_orders/orders.css';

const ROLES: { value: UserRole; label: string; icon: string }[] = [
  { value: 'customer', label: 'Заказчик', icon: '🏢' },
  { value: 'designer', label: 'Проектировщик', icon: '👷' },
  { value: 'expert', label: 'Эксперт', icon: '🔍' },
  { value: 'manufacturer', label: 'Производитель', icon: '🏭' },
];

/* ───────────────────────── animated characters (ported from Cloud Design) ───────────────────────── */

/* eye with white sclera + tracking pupil */
function EyeBall({ size = 18, pupilSize = 7, max = 5, blinking, lookX, lookY, mouse }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useLayoutEffect(() => {
    if (lookX !== undefined) { setPos({ x: lookX, y: lookY }); return; }
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = mouse.x - (r.left + r.width / 2), dy = mouse.y - (r.top + r.height / 2);
    const dist = Math.min(Math.hypot(dx, dy), max), a = Math.atan2(dy, dx);
    setPos({ x: Math.cos(a) * dist, y: Math.sin(a) * dist });
  }, [mouse.x, mouse.y, lookX, lookY]);
  return (
    <div ref={ref} className="eye" style={{ width: size, height: blinking ? 2 : size }}>
      {!blinking && <div className="pupil" style={{ width: pupilSize, height: pupilSize, transform: `translate(${pos.x}px,${pos.y}px)` }} />}
    </div>
  );
}

/* bare pupil (no sclera) */
function Pupil({ size = 12, max = 5, lookX, lookY, mouse }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useLayoutEffect(() => {
    if (lookX !== undefined) { setPos({ x: lookX, y: lookY }); return; }
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = mouse.x - (r.left + r.width / 2), dy = mouse.y - (r.top + r.height / 2);
    const dist = Math.min(Math.hypot(dx, dy), max), a = Math.atan2(dy, dx);
    setPos({ x: Math.cos(a) * dist, y: Math.sin(a) * dist });
  }, [mouse.x, mouse.y, lookX, lookY]);
  return <div ref={ref} className="pupil pupil--bare" style={{ width: size, height: size, transform: `translate(${pos.x}px,${pos.y}px)` }} />;
}

function useBlink() {
  const [b, setB] = useState(false);
  useEffect(() => {
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

function Characters({ mouse, typing, hideEyes, peek }) {
  const purple = useRef(null), dark = useRef(null), amber = useRef(null), rose = useRef(null);
  const blinkP = useBlink(), blinkD = useBlink();
  // forced looks
  const away = hideEyes ? { lookX: -4, lookY: -5 } : {};
  const peekLook = peek ? { lookX: 3, lookY: 5 } : away;
  const glanceR = typing ? { lookX: 4, lookY: 2 } : {};
  const glanceL = typing ? { lookX: -4, lookY: 2 } : {};
  return (
    <div className="chars">
      {/* purple — tall, back */}
      <div ref={purple} className="char char--purple" style={{ transform: `skewX(${(hideEyes ? 0 : skew(purple, mouse)) + (typing ? -10 : 0)}deg)` }}>
        <div className="char__eyes" style={{ gap: 22 }}>
          <EyeBall mouse={mouse} blinking={blinkP} {...(hideEyes ? peekLook : glanceR)} />
          <EyeBall mouse={mouse} blinking={blinkP} {...(hideEyes ? peekLook : glanceR)} />
        </div>
      </div>
      {/* dark — middle */}
      <div ref={dark} className="char char--dark" style={{ transform: `skewX(${(hideEyes ? 0 : skew(dark, mouse)) + (typing ? 9 : 0)}deg)` }}>
        <div className="char__eyes" style={{ gap: 16, top: 30 }}>
          <EyeBall size={16} pupilSize={6} max={4} mouse={mouse} blinking={blinkD} {...(hideEyes ? away : glanceL)} />
          <EyeBall size={16} pupilSize={6} max={4} mouse={mouse} blinking={blinkD} {...(hideEyes ? away : glanceL)} />
        </div>
      </div>
      {/* amber — semicircle, front-left */}
      <div ref={amber} className="char char--amber" style={{ transform: `skewX(${hideEyes ? 0 : skew(amber, mouse)}deg)` }}>
        <div className="char__eyes" style={{ gap: 30, top: 92, left: 78 }}>
          <Pupil mouse={mouse} {...(hideEyes ? away : {})} />
          <Pupil mouse={mouse} {...(hideEyes ? away : {})} />
        </div>
      </div>
      {/* rose — front-right, with mouth */}
      <div ref={rose} className="char char--rose" style={{ transform: `skewX(${hideEyes ? 0 : skew(rose, mouse)}deg)` }}>
        <div className="char__eyes" style={{ gap: 18, top: 42, left: 48 }}>
          <Pupil mouse={mouse} {...(hideEyes ? away : {})} />
          <Pupil mouse={mouse} {...(hideEyes ? away : {})} />
        </div>
        <div className="char__mouth" />
      </div>
    </div>
  );
}

/* brand mark (inline svg, как на текущей странице) */
function BrandMark() {
  return (
    <div className="brand__logo" style={{ width: 32, height: 32 }}>
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="4" width="4" height="12" rx="1" fill="#fff" />
        <rect x="8" y="2" width="4" height="16" rx="1" fill="#fff" />
        <rect x="14" y="6" width="4" height="10" rx="1" fill="#fff" />
      </svg>
    </div>
  );
}

/* ───────────────────────── page ───────────────────────── */

export default function AuthPage() {
  const router = useRouter();
  const { login, register, user, hydrated } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [error, setError] = useState('');

  // presentation-only state (анимация персонажей, не влияет на логику входа)
  const [show, setShow] = useState(false);
  const [typing, setTyping] = useState(false);
  const [glance, setGlance] = useState(false);
  const [peek, setPeek] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  // Уже авторизован → в кабинет (BUG-006).
  useEffect(() => {
    if (hydrated && user) router.replace('/dashboard');
  }, [hydrated, user, router]);

  // mouse-трекинг для глаз персонажей
  useEffect(() => {
    let raf;
    const onMove = (e) => { cancelAnimationFrame(raf); const x = e.clientX, y = e.clientY; raf = requestAnimationFrame(() => setMouse({ x, y })); };
    window.addEventListener('mousemove', onMove);
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf); };
  }, []);

  // короткий «переглядываются» при фокусе поля
  useEffect(() => {
    if (!typing) { setGlance(false); return; }
    setGlance(true);
    const t = setTimeout(() => setGlance(false), 850);
    return () => clearTimeout(t);
  }, [typing]);

  const hideEyes = password.length > 0 && !show; // закрывают глаза, пока пароль скрыт

  // purple подглядывает, когда пароль раскрыт
  useEffect(() => {
    if (!(password.length > 0 && show)) { setPeek(false); return; }
    let t1, t2;
    const loop = () => { t1 = setTimeout(() => { setPeek(true); t2 = setTimeout(() => { setPeek(false); loop(); }, 800); }, Math.random() * 3000 + 2000); };
    loop();
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [password, show]);

  const switchMode = (toLogin: boolean) => { setIsLogin(toLogin); setError(''); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (isLogin) {
      const ok = login(email, password);
      if (ok) {
        router.push('/dashboard');
      } else {
        setError('Неверный email или пароль.');
      }
    } else {
      const ok = register({ email, name, role, company, phone: '', password });
      if (ok) {
        router.push('/dashboard');
      } else {
        setError('Этот email уже зарегистрирован — войдите в существующий аккаунт.');
      }
    }
  };

  return (
    <div className="fx">
      <div className="authx">
        <aside className="authx__brand">
          <Link href="/" className="authx__top brand-link" style={{ textDecoration: 'none' }}>
            <BrandMark />
            <div className="brand__name" style={{ fontSize: 18 }}>ФУНКЦИЯ</div>
          </Link>

          <div className="authx__stage">
            <Characters mouse={mouse} typing={glance} hideEyes={hideEyes || (password.length > 0 && show)} peek={peek} />
          </div>

          <div className="authx__foot">
            <span>Единая платформа ПИР</span>
            <span className="dim">Проектирование · Экспертиза · Подбор</span>
          </div>
          <div className="authx__glow authx__glow--1" />
          <div className="authx__glow authx__glow--2" />
        </aside>

        <div className="authx__form">
          <div className="authx__formwrap">
            <div className="authx__head">
              <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, color: '#fff' }}>{isLogin ? 'С возвращением' : 'Регистрация'}</h1>
              <p className="muted" style={{ margin: '8px 0 0', fontSize: 14.5 }}>{isLogin ? 'Войдите для доступа к заявкам и кабинету' : 'Создайте аккаунт для работы на платформе'}</p>
            </div>

            <form onSubmit={handleSubmit} className="col gap18" style={{ marginTop: 30 }}>
              {!isLogin && (
                <>
                  <div className="field">
                    <label>Ваша роль</label>
                    <div className="role-selector" role="radiogroup" aria-label="Ваша роль">
                      {ROLES.map((r) => (
                        <div
                          key={r.value}
                          className={`role-option ${role === r.value ? 'selected' : ''}`}
                          role="radio"
                          aria-checked={role === r.value}
                          tabIndex={0}
                          onClick={() => setRole(r.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setRole(r.value); } }}
                        >
                          <div className="role-option-icon">{r.icon}</div>
                          <div className="role-option-label">{r.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="field">
                    <label>ФИО / Название компании</label>
                    <input className="input" placeholder="Иванов Иван Иванович" value={name} onChange={(e) => setName(e.target.value)} required
                      onFocus={() => setTyping(true)} onBlur={() => setTyping(false)} />
                  </div>
                  <div className="field">
                    <label>Компания (необязательно)</label>
                    <input className="input" placeholder="ООО «Проект»" value={company} onChange={(e) => setCompany(e.target.value)}
                      onFocus={() => setTyping(true)} onBlur={() => setTyping(false)} />
                  </div>
                </>
              )}

              <div className="field">
                <label>Email</label>
                <input className="input" type="email" placeholder="mail@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required
                  autoComplete="off" onFocus={() => setTyping(true)} onBlur={() => setTyping(false)} />
              </div>

              <div className="field">
                <label>Пароль</label>
                <div className="inputwrap">
                  <input className="input" type={show ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                    onFocus={() => setTyping(true)} onBlur={() => setTyping(false)} />
                  <button type="button" className="inputwrap__btn" onClick={() => setShow((s) => !s)} title={show ? 'Скрыть' : 'Показать'} aria-label={show ? 'Скрыть пароль' : 'Показать пароль'}>
                    <Icon name={show ? 'eyeOff' : 'eye'} size={18} />
                  </button>
                </div>
                {!isLogin && <span style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 4, display: 'block' }}>Минимум 6 символов</span>}
              </div>

              {error && (
                <div role="alert" style={{ background: 'rgba(244,113,127,0.12)', color: '#f4717f', border: '1px solid rgba(244,113,127,0.32)', borderRadius: 8, padding: '10px 14px', fontSize: 13.5 }}>
                  {error}
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-block" style={{ height: 50, fontSize: 15 }}>
                {isLogin ? 'Войти' : 'Зарегистрироваться'}
              </button>
            </form>

            <p className="muted" style={{ textAlign: 'center', marginTop: 26, fontSize: 14 }}>
              {isLogin ? (
                <>Нет аккаунта? <a className="link" onClick={() => switchMode(false)}>Зарегистрируйтесь</a></>
              ) : (
                <>Уже есть аккаунт? <a className="link" onClick={() => switchMode(true)}>Войдите</a></>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
