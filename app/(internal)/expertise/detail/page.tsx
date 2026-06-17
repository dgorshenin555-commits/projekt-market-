// @ts-nocheck
'use client';

/* Экран детали заявки на обследование/экспертизу — перенос ExpertiseDetail из
   Cloud Design (screens_data.jsx, посылка «Функция(4)»). Реальные данные: заявка
   из MOCK_EXPERTISE_REQUESTS по ?id. Действия «Откликнуться/Обсудить/Связаться»
   ведут в Коммуникации; «Запросить материалы»/скачивание — демо-заглушки (нет
   бэкенда). Дизайн заскоуплен под .fx (та же дизайн-система, что и orders/detail). */

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { Icon } from '../../../_orders/icons';
import { Avatar, typeLabel, formatDeadline } from '../../../_orders/shared';
import { MOCK_EXPERTISE_REQUESTS } from '@/lib/mock-data';
import '../../../_orders/orders.css';

/* Код раздела → полное название (аналог DATA.SECTION_NAMES в прототипе). */
const SECTION_NAMES = {
  ПЗ: 'Пояснительная записка',
  ПЗУ: 'Схема планировочной организации земельного участка',
  АР: 'Архитектурные решения',
  КР: 'Конструктивные решения',
  ЭОМ: 'Система электроснабжения',
  ВК: 'Системы водоснабжения и водоотведения',
  ОВ: 'Отопление, вентиляция и кондиционирование',
  ПОС: 'Проект организации строительства',
  СМ: 'Смета на строительство',
  ПБ: 'Мероприятия по обеспечению пожарной безопасности',
};

const plural = (n, forms) => {
  const a = Math.abs(n) % 100, b = a % 10;
  if (a > 10 && a < 20) return forms[2];
  if (b > 1 && b < 5) return forms[1];
  if (b === 1) return forms[0];
  return forms[2];
};
const razdel = (n) => plural(n, ['раздел', 'раздела', 'разделов']);
const otklik = (n) => plural(n, ['отклик', 'отклика', 'откликов']);

function ExpertiseDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { notify } = useApp();
  const id = searchParams.get('id');
  const e = id ? MOCK_EXPERTISE_REQUESTS.find((x) => x.id === id) : null;

  if (!e) {
    return (
      <div className="fx">
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <h2 style={{ marginBottom: 12 }}>Заявка не найдена</h2>
          <button className="btn btn-primary" onClick={() => router.push('/expertise')}>К бирже обследования</button>
        </div>
      </div>
    );
  }

  const n = e.sections.length;
  const expType = e.expType || 'Экспертиза';
  const expLabel = /ая$/.test(expType) ? expType + ' экспертиза' : expType;
  const files = e.files || [];
  const scope = [
    'Проверка соответствия документации техническим регламентам и действующим нормативам (ГОСТ, СП, СНиП).',
    'Анализ расчётов несущих конструкций и инженерных систем.',
    'Проверка полноты и комплектности разделов.',
    'Формирование замечаний и ведение итераций с проектировщиком.',
    'Подготовка и выдача заключения экспертизы.',
  ];

  return (
    <div className="fx animate-in">
      <div className="breadcrumb">
        <a className="link" onClick={() => router.push('/expertise')}>Экспертиза</a>
        <Icon name="chevR" size={13} /> <span className="dim">{e.title}</span>
      </div>

      <div className="row between gap16 wrap" style={{ margin: '16px 0 22px' }}>
        <h1 className="page-title" style={{ maxWidth: 720 }}>{e.title}</h1>
        <div className="row gap10">
          {e.requiredSro && <span className="badge" style={{ background: 'rgba(245,177,61,.15)', color: 'var(--amber)' }}><Icon name="shield" size={13} /> СРО</span>}
          <button className="btn btn-ghost btn-sm" onClick={() => router.push('/chat')}><Icon name="comment" size={15} /> Обсудить</button>
          <button className="btn btn-primary btn-sm" onClick={() => router.push('/chat')}><Icon name="send" size={14} /> Откликнуться</button>
        </div>
      </div>

      <div className="thumb thumb-tower detail__hero" style={{ position: 'relative' }}>
        <span className="detail__hero-tag"><Icon name="scan" size={14} />{expLabel} · {n} {razdel(n)} на проверку</span>
      </div>

      <div className="detail__grid">
        <div className="col gap20" style={{ minWidth: 0 }}>
          <div className="card">
            <h3 className="section-title" style={{ marginBottom: 18 }}>Задача от заказчика</h3>
            <table className="spec"><tbody>
              <tr><td>Тип объекта</td><td>{typeLabel(e.objectType)}</td></tr>
              {e.region && <tr><td>Регион</td><td>{e.region}</td></tr>}
              {e.area && <tr><td>Площадь</td><td>{e.area}</td></tr>}
              {e.stage && <tr><td>Стадия</td><td>{e.stage}</td></tr>}
              <tr><td>Тип экспертизы</td><td>{expType}</td></tr>
              <tr><td>Срок</td><td>До {formatDeadline(e.deadline)}</td></tr>
            </tbody></table>
            <p className="muted mt16" style={{ lineHeight: 1.6, fontSize: 14.5 }}>{e.detail || e.description}</p>
          </div>

          <div className="card">
            <div className="row between" style={{ marginBottom: 16 }}>
              <h3 className="section-title" style={{ margin: 0 }}>Состав документации</h3>
              <span className="dim" style={{ fontSize: 13 }}>{e.sections.length} {razdel(e.sections.length)} на проверку</span>
            </div>
            <div className="col gap10">
              {e.sections.map((s) => (
                <div key={s} className="row" style={{ gap: 14, padding: '12px 16px', borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                  <span className="chip chip-code" style={{ flex: 'none' }}>{s}</span>
                  <span className="grow" style={{ fontSize: 13.5, minWidth: 0 }}>{SECTION_NAMES[s] || 'Раздел проектной документации'}</span>
                  <span className="dim" style={{ fontSize: 12.5, flex: 'none' }}>к проверке</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="section-title" style={{ marginBottom: 16 }}>Объём проверки</h3>
            <div className="col gap12">
              {scope.map((t) => (
                <div key={t} className="row gap12" style={{ alignItems: 'flex-start' }}>
                  <Icon name="checkCircle" size={18} style={{ color: 'var(--green)', flex: 'none', marginTop: 1 }} />
                  <span style={{ fontSize: 13.5, lineHeight: 1.5 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col gap20">
          <div className="card">
            <div className="dim" style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Условия</div>
            <div className="price" style={{ fontSize: 26 }}>{e.budget || 'По договорённости'}</div>
            <div className="dim" style={{ fontSize: 12.5, margin: '4px 0 18px' }}>гонорар эксперта · {e.responsesCount} {otklik(e.responsesCount)}</div>
            <div className="col gap10" style={{ marginBottom: 18 }}>
              <div className="row between"><span className="dim" style={{ fontSize: 13 }}>Срок проверки</span><b style={{ fontSize: 13.5 }}>До {formatDeadline(e.deadline)}</b></div>
              <div className="row between"><span className="dim" style={{ fontSize: 13 }}>Тип экспертизы</span><b style={{ fontSize: 13.5 }}>{expType}</b></div>
              <div className="row between"><span className="dim" style={{ fontSize: 13 }}>Аккредитация</span><b style={{ fontSize: 13.5 }}>{e.requiredSro ? 'СРО — требуется' : 'не требуется'}</b></div>
            </div>
            <button className="btn btn-primary btn-block" onClick={() => router.push('/chat')}><Icon name="send" size={15} /> Откликнуться</button>
            <button className="btn btn-outline btn-block mt12" onClick={() => notify('Запрос материалов появится в ближайшем обновлении')}>Запросить материалы</button>
          </div>

          {files.length > 0 && (
            <div className="card">
              <h3 className="section-title" style={{ fontSize: 16, marginBottom: 16 }}>Исходные материалы</h3>
              <div className="col gap10">
                {files.map((f, i) => (
                  <div key={i} className="row gap12" style={{ padding: '11px 12px', borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, display: 'grid', placeItems: 'center', background: 'var(--accent-soft)', color: 'var(--accent-2)', flex: 'none' }}><Icon name={f[0]} size={18} /></div>
                    <div className="grow" style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f[1]}</div>
                      <div className="dim" style={{ fontSize: 12 }}>{f[2]}</div>
                    </div>
                    <button className="iconbtn" style={{ width: 34, height: 34, flex: 'none' }} title="Скачать" onClick={() => notify('Скачивание файлов появится в ближайшем обновлении')}><Icon name="download" size={16} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {e.client && (
            <div className="card">
              <div className="dim" style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Заказчик</div>
              <div className="row gap12" style={{ marginBottom: 16 }}>
                <Avatar text={e.client.replace(/[^А-ЯA-Z]/g, '').slice(0, 2) || 'ЗК'} size={44} />
                <div><div style={{ fontWeight: 700 }}>{e.client}</div><div className="dim" style={{ fontSize: 13 }}>{e.clientCity}</div></div>
              </div>
              <button className="btn btn-ghost btn-block" onClick={() => router.push('/chat')}><Icon name="comment" size={15} /> Связаться</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ExpertiseDetailPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center' }}>Загрузка…</div>}>
      <ExpertiseDetailContent />
    </Suspense>
  );
}
