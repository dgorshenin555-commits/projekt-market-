// @ts-nocheck
'use client';

/* Создание заявки — новый дизайн «Функция» (перенос OrderNew из Cloud Design):
   5 шагов + живой предпросмотр. Логика сохранена из рабочей версии:
   — реальные типы объектов и регионы;
   — «умные» разделы из getSections(stage, objectType) по ПП РФ №87;
   — специалисты выводятся из выбранных разделов;
   — addOrder создаёт настоящую заявку, auth-guard на вход. */

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { REGIONS, getSections } from '@/lib/constants';
import { Icon } from '../../../_orders/icons';
import { typeImage } from '../../../_orders/shared';
import '../../../_orders/orders.css';

const STEPS = ['Тип объекта', 'Регион и стадия', 'Разделы', 'Бюджет и сроки', 'Файлы'];

const TYPE_CARDS = [
  ['commercial', 'building', 'Коммерческая недвижимость', 'Офисы, ТЦ, склады, гостиницы'],
  ['private', 'pin', 'Частное строительство', 'Дома, коттеджи, участки'],
  ['industrial', 'factory', 'Промышленность', 'Заводы, цехи, производства'],
  ['linear', 'globe', 'Линейные объекты', 'Дороги, сети, трубопроводы'],
  ['buildings', 'layers', 'Здания и сооружения', 'Школы, больницы, спецобъекты'],
];
const TYPE_LABEL = Object.fromEntries(TYPE_CARDS.map(([v, , l]) => [v, l]));
const STAGES = [['P', 'П'], ['RD', 'РД']];
const SCALES = [['single', 'Один специалист'], ['team', 'Команда']];

function PrevRow({ icon, label, value, hot, accent }) {
  return (
    <div className={'prev__row' + (hot ? ' is-hot' : '')}>
      <span className="prev__ico"><Icon name={icon} size={15} /></span>
      <div className="grow" style={{ minWidth: 0 }}>
        <div className="prev__k">{label}</div>
        <div className={'prev__v' + (accent ? ' prev__v--accent' : '')}>{value}</div>
      </div>
    </div>
  );
}

export default function NewOrderPage() {
  const router = useRouter();
  const { user, addOrder, notify } = useApp();

  const [step, setStep] = useState(0);
  const [done, setDone] = useState(null); // созданная заявка (экран успеха)

  const [objectType, setObjectType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [region, setRegion] = useState('Москва');
  const [stage, setStage] = useState('P');
  const [scale, setScale] = useState('team');
  const [sel, setSel] = useState([]);
  const [budget, setBudget] = useState('');
  const [due, setDue] = useState('');
  const [byOffer, setByOffer] = useState(true);
  const [files, setFiles] = useState(0);

  useEffect(() => { if (!user) router.push('/auth'); }, [user, router]);

  // Реальная таксономия разделов по стадии и типу (ПП РФ №87).
  // ВАЖНО: все хуки — до любого условного return (Rules of Hooks).
  const flatSections = useMemo(() => {
    if (!objectType) return [];
    const s = getSections(stage, objectType);
    if (Array.isArray(s) && s.length && 'sections' in s[0]) return s.flatMap((g) => g.sections);
    return s;
  }, [objectType, stage]);

  if (!user) return null;

  const toggle = (code) => setSel((p) => (p.includes(code) ? p.filter((x) => x !== code) : [...p, code]));

  const filled = [objectType, region && stage, sel.length, (byOffer || budget || due) ? 1 : 0, files].filter(Boolean).length;
  const exempt = objectType === 'private';

  const canNext = () => {
    if (step === 0) return !!objectType && !!title.trim();
    if (step === 2) return sel.length > 0;
    return true;
  };

  const publish = () => {
    const specialists = [...new Set(flatSections.filter((s) => sel.includes(s.code)).flatMap((s) => s.specialists))];
    const order = addOrder({
      title: title.trim() || 'Новая заявка',
      description: description.trim(),
      objectType,
      region,
      scale,
      stage,
      sections: sel,
      specialists,
      budget: byOffer ? 'Ждём предложений' : (budget.trim() || 'По договорённости'),
      deadline: due.trim() || undefined,
      status: 'published',
    });
    setDone(order);
  };

  // ====== ЭКРАН УСПЕХА ======
  if (done) {
    return (
      <div className="fx animate-in">
        <div className="card" style={{ maxWidth: 560, margin: '40px auto', textAlign: 'center', padding: 40 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', margin: '0 auto 18px', display: 'grid', placeItems: 'center', background: 'var(--accent-soft)', color: 'var(--green)' }}>
            <Icon name="checkCircle" size={40} strokeWidth={2} />
          </div>
          <h1 className="page-title" style={{ marginBottom: 10 }}>Заявка опубликована!</h1>
          <p className="muted" style={{ margin: '0 auto 24px', maxWidth: 420, lineHeight: 1.6 }}>
            Заявка «{done.title}» создана и доступна проектировщикам. Ожидайте первые отклики.
          </p>
          <div className="prev__rows" style={{ textAlign: 'left', marginBottom: 24 }}>
            <PrevRow icon="building" label="Тип объекта" value={TYPE_LABEL[objectType]} />
            <PrevRow icon="pin" label="Регион" value={region} />
            <PrevRow icon="layers" label="Стадия / привлечение" value={(stage === 'P' ? 'П' : 'РД') + ' · ' + (scale === 'team' ? 'Команда' : 'Один специалист')} />
            <PrevRow icon="file" label="Разделов" value={sel.length + ' шт.'} />
          </div>
          <div className="row gap10" style={{ justifyContent: 'center' }}>
            <button className="btn btn-outline" onClick={() => router.push('/orders')}>К списку заявок</button>
            <button className="btn btn-primary" onClick={() => router.push(`/orders/detail?id=${done.id}`)}>Открыть заявку <Icon name="arrowRight" size={14} /></button>
          </div>
        </div>
      </div>
    );
  }

  // ====== МАСТЕР ======
  return (
    <div className="fx animate-in">
      <div className="breadcrumb"><a className="link" onClick={() => router.push('/orders')}>Заявки</a><Icon name="chevR" size={13} /> <span className="dim">Новая заявка</span></div>
      <h1 className="page-title" style={{ margin: '16px 0 26px' }}>Создание заявки</h1>

      <div className="stepper">
        {STEPS.map((s, i) => (
          <div key={s} className={'stepper__item' + (i === step ? ' is-active' : '') + (i < step ? ' is-done' : '')} onClick={() => i < step && setStep(i)}>
            <div className="stepper__num">{i < step ? <Icon name="check" size={14} /> : i + 1}</div>
            <span>{s}</span>
          </div>
        ))}
      </div>

      <div className="newgrid">
        <div className="card">
          {step === 0 && <div className="col gap20 fade-in">
            <div className="field">
              <label>Название заявки</label>
              <input className="input" placeholder="Например: ЖК «Северный парк», корпус 2" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="col gap12">
              <h3 className="section-title">Тип объекта</h3>
              <div className="grid-2">
                {TYPE_CARDS.map(([v, ic, t, d]) => (
                  <button type="button" key={v} className={'selectcard' + (v === objectType ? ' is-sel' : '')} onClick={() => { setObjectType(v); setSel([]); }}>
                    <span className="selectcard__ic"><Icon name={ic} size={20} /></span>
                    <b>{t}</b>
                    <span className="sc-d">{d}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label>Описание задачи</label>
              <textarea className="input" style={{ minHeight: 96, resize: 'vertical' }} placeholder="Этажность, площади, особые требования, наличие исходных данных…" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            {objectType && (
              <div className="hintbar" style={{ borderLeftColor: exempt ? 'var(--green)' : 'var(--blue)' }}>
                <Icon name={exempt ? 'checkCircle' : 'shield'} size={18} style={{ color: exempt ? 'var(--green)' : 'var(--blue)' }} />
                <div>{exempt
                  ? <><b>Экспертиза не требуется.</b> Для индивидуального жилого дома проектная документация не подлежит обязательной экспертизе.</>
                  : <><b>Потребуется экспертиза.</b> Объект капитального строительства — документация проходит государственную или негосударственную экспертизу.</>}</div>
              </div>
            )}
          </div>}

          {step === 1 && <div className="col gap18 fade-in">
            <h3 className="section-title">Регион и стадия</h3>
            <div className="field"><label>Регион</label>
              <select className="input" value={region} onChange={(e) => setRegion(e.target.value)}>
                {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="field"><label>Стадия проектирования</label><div className="row gap10 wrap">{STAGES.map(([v, l]) => <button key={v} type="button" className={'pill' + (v === stage ? ' is-active' : '')} onClick={() => { setStage(v); setSel([]); }}>{l}</button>)}</div></div>
            <div className="field"><label>Тип привлечения</label><div className="row gap10 wrap">{SCALES.map(([v, l]) => <button key={v} type="button" className={'pill' + (v === scale ? ' is-active' : '')} onClick={() => setScale(v)}>{l}</button>)}</div></div>
          </div>}

          {step === 2 && <div className="col gap16 fade-in">
            <h3 className="section-title">Разделы документации</h3>
            <p className="muted" style={{ margin: 0, fontSize: 14 }}>Выбрано: {sel.length} · разделы подобраны под стадию «{stage === 'P' ? 'П' : 'РД'}» и тип «{TYPE_LABEL[objectType]}»</p>
            <div className="chips">{flatSections.map((s) => <button key={s.code} type="button" className={'chip chip-toggle' + (sel.includes(s.code) ? ' is-sel' : '')} title={s.name} onClick={() => toggle(s.code)}>{s.code}</button>)}</div>
          </div>}

          {step === 3 && <div className="col gap18 fade-in">
            <h3 className="section-title">Бюджет и сроки</h3>
            <div className="field"><label>Бюджет, ₽</label><input className="input" placeholder="12 000 000" value={budget} disabled={byOffer} style={{ opacity: byOffer ? 0.5 : 1 }} onChange={(e) => setBudget(e.target.value)} /></div>
            <div className="field"><label>Срок выполнения</label><input className="input" placeholder="01.09.2026" value={due} onChange={(e) => setDue(e.target.value)} /></div>
            <label className="row gap10" style={{ fontSize: 14, cursor: 'pointer' }}><input type="checkbox" checked={byOffer} onChange={(e) => setByOffer(e.target.checked)} /> Ждём предложений по цене</label>
          </div>}

          {step === 4 && <div className="col gap16 fade-in">
            <h3 className="section-title">Файлы проекта</h3>
            <button type="button" className="dropzone" style={{ width: '100%', cursor: 'pointer' }} onClick={() => { setFiles((f) => f + 1); notify('Загрузка файлов — в разработке'); }}><Icon name="paperclip" size={26} /><div>Перетащите файлы DWG, IFC, PDF или нажмите для выбора</div></button>
            {files > 0 && <div className="muted" style={{ fontSize: 13.5 }}>Прикреплено файлов: {files}</div>}
          </div>}

          <div className="row between mt32">
            <button className="btn btn-ghost" disabled={step === 0} style={{ opacity: step === 0 ? 0.4 : 1 }} onClick={() => setStep((s) => Math.max(0, s - 1))}>Назад</button>
            {step < STEPS.length - 1
              ? <button className="btn btn-primary" disabled={!canNext()} style={{ opacity: canNext() ? 1 : 0.5 }} onClick={() => setStep((s) => s + 1)}>Далее</button>
              : <button className="btn btn-primary" onClick={publish}>Опубликовать заявку</button>}
          </div>
        </div>

        <div className="card newgrid__preview prev">
          <div className="row between" style={{ marginBottom: 16 }}>
            <span className="overline">Предпросмотр заявки</span>
            <span className="prev__count">{filled}<span className="dim">/5</span></span>
          </div>
          {(() => { const img = typeImage(objectType); return img
            ? <div className="ordercard__thumb--img" style={{ height: 110, marginBottom: 16, borderRadius: 'var(--r-md)', backgroundImage: `url('${img.src.src}')` }} />
            : <div className="thumb thumb-tower" style={{ height: 110, marginBottom: 16 }} />; })()}
          <h3 style={{ margin: '0 0 4px', fontSize: 17, color: '#fff' }}>{title.trim() || 'Новая заявка'}</h3>
          <div className="dim" style={{ fontSize: 12.5, marginBottom: 16 }}>Стадия {stage === 'P' ? 'П' : 'РД'} · {scale === 'team' ? 'Команда' : 'Один специалист'}</div>

          <div className="prev__rows">
            <PrevRow icon="building" label="Тип объекта" value={objectType ? TYPE_LABEL[objectType] : '—'} hot={step === 0} />
            <PrevRow icon="pin" label="Регион" value={region || '—'} hot={step === 1} />
            <PrevRow icon="layers" label="Стадия / привлечение" value={(stage === 'P' ? 'П' : 'РД') + ' · ' + (scale === 'team' ? 'Команда' : 'Один специалист')} hot={step === 1} />
            {sel.length > 0 && (
              <div className={'prev__row' + (step === 2 ? ' is-hot' : '')}>
                <span className="prev__ico"><Icon name="file" size={15} /></span>
                <div className="grow" style={{ minWidth: 0 }}>
                  <div className="prev__k">Разделы · {sel.length}</div>
                  <div className="chips" style={{ marginTop: 6 }}>{sel.map((s) => <span key={s} className="chip chip-code">{s}</span>)}</div>
                </div>
              </div>
            )}
            {(budget || due || byOffer) && <PrevRow icon="calendar" label="Срок" value={due || 'по согласованию'} hot={step === 3} />}
            {files > 0 && <PrevRow icon="paperclip" label="Файлы" value={files + ' шт.'} hot={step === 4} />}
          </div>

          <div className="prev__price">
            {byOffer || !budget
              ? <span className="row gap8" style={{ color: 'var(--amber)', fontWeight: 700, fontSize: 18 }}><Icon name="wallet" size={18} />Ждём предложений</span>
              : <span className="price" style={{ fontSize: 22 }}><Icon name="wallet" size={18} style={{ color: 'var(--accent-2)' }} /> {budget} ₽</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
