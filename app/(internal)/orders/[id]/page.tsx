'use client';

import { useParams } from 'next/navigation';
import { useApp } from '@/lib/store';
import { OBJECT_TYPE_LABELS, ORDER_STATUS_MAP } from '@/lib/constants';
import { useState } from 'react';
import Link from 'next/link';

const TABS = ['Описание', 'Проектировщики', 'Коммуникации', 'Замечания', 'Файлы'];

const TIMELINE_STEPS = [
  { label: 'Принята в работу', done: true },
  { label: 'Назначены проектировщики', done: false },
  { label: 'Передана на экспертизу', done: false },
  { label: 'Закрыта', done: false },
];

export default function OrderDetailPage() {
  const params = useParams();
  const { getOrderById, getResponsesForOrder, user, addResponse } = useApp();
  const [activeTab, setActiveTab] = useState('Описание');
  const [responseText, setResponseText] = useState('');
  const [propBudget, setPropBudget] = useState('');

  const order = getOrderById(params.id as string);
  const responses = order ? getResponsesForOrder(order.id) : [];

  if (!order) {
    return (
      <div className="empty-state animate-in">
        <div className="empty-state-icon">🔍</div>
        <div className="empty-state-title">Заявка не найдена</div>
        <Link href="/orders" className="btn btn-primary" style={{ marginTop: 16 }}>К списку заявок</Link>
      </div>
    );
  }

  const status = ORDER_STATUS_MAP[order.status];

  const handleSubmitResponse = () => {
    if (!responseText.trim() || !user) return;
    addResponse({
      orderId: order.id,
      message: responseText,
      proposedBudget: propBudget || undefined,
    });
    setResponseText('');
    setPropBudget('');
  };

  return (
    <div className="animate-in">
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Link href="/orders" style={{ color: 'var(--text-muted)', fontSize: 13 }}>Заявки</Link>
        <span style={{ color: 'var(--text-muted)' }}>/</span>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{order.title}</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
          <span className="status-badge" style={{ color: status.color, background: `${status.color}16` }}>
            {status.label}
          </span>
          <button className="btn btn-secondary btn-sm">💬 Обсудить</button>
        </div>
      </div>

      {/* Title */}
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 24 }}>{order.title}</h1>

      {/* Hero image */}
      <div style={{
        width: '100%',
        height: 220,
        borderRadius: 'var(--radius-lg)',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        marginBottom: 24,
        overflow: 'hidden',
        position: 'relative',
      }}>
        <img
          src="/hero-bg.png"
          alt="Project"
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
        />
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: 0,
        borderBottom: '1px solid var(--border)',
        marginBottom: 24,
      }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 20px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
              color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: activeTab === tab ? 600 : 500,
              fontSize: 14,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.2s ease',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
        {/* Left */}
        <div>
          {activeTab === 'Описание' && (
            <div className="card" style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Описание</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '10px 16px', fontSize: 14 }}>
                <span style={{ color: 'var(--text-muted)' }}>Тип объекта</span>
                <span>{OBJECT_TYPE_LABELS[order.objectType]}</span>
                <span style={{ color: 'var(--text-muted)' }}>Регион</span>
                <span>{order.region}</span>
                <span style={{ color: 'var(--text-muted)' }}>Масштаб</span>
                <span>{order.scale === 'team' ? 'Формирование команды' : 'Один специалист'}</span>
                <span style={{ color: 'var(--text-muted)' }}>Стадия</span>
                <span>{order.stage === 'P' ? 'П' : 'РД'}</span>
                <span style={{ color: 'var(--text-muted)' }}>Разделы</span>
                <span>{order.sections.join(' / ')}</span>
              </div>

              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', gap: 24, alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800 }}>{order.budget || 'По запросу'}</div>
                </div>
                {order.deadline && (
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '8px 14px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                    До {new Date(order.deadline).toLocaleDateString('ru-RU')}
                  </div>
                )}
              </div>

              {/* Description text */}
              <p style={{ marginTop: 16, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                {order.description}
              </p>
            </div>
          )}

          {activeTab === 'Описание' && (
            <>
              {/* Timeline */}
              <div className="card">
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Таймлайн работы</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {TIMELINE_STEPS.map((step, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}>
                        <div style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          border: step.done ? 'none' : '2px solid var(--border)',
                          background: step.done ? 'var(--status-success)' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 12,
                          color: 'white',
                          flexShrink: 0,
                        }}>
                          {step.done ? '✓' : ''}
                        </div>
                        {i < TIMELINE_STEPS.length - 1 && (
                          <div style={{
                            width: 2,
                            height: 28,
                            background: step.done ? 'var(--status-success)' : 'var(--border)',
                          }} />
                        )}
                      </div>
                      <span style={{
                        fontSize: 14,
                        color: step.done ? 'var(--text-primary)' : 'var(--text-muted)',
                        fontWeight: step.done ? 600 : 400,
                        paddingTop: 2,
                      }}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'Проектировщики' && (
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Отклики ({responses.length})</h3>
              {responses.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">💬</div>
                  <div className="empty-state-title">Откликов пока нет</div>
                </div>
              ) : (
                responses.map((r) => (
                  <div key={r.id} className="response-card">
                    <div className="response-card-header">
                      <div className="response-card-avatar">
                        {r.designerName.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="response-card-info">
                        <div className="response-card-name">{r.designerName}</div>
                        <div className="response-card-date">
                          {r.designerCompany && <span>{r.designerCompany} · </span>}
                          {new Date(r.createdAt).toLocaleDateString('ru-RU')}
                        </div>
                      </div>
                    </div>
                    <div className="response-card-body">{r.message}</div>
                    {(r.proposedBudget || r.proposedDeadline) && (
                      <div className="response-card-meta">
                        {r.proposedBudget && <span>💰 {r.proposedBudget}</span>}
                        {r.proposedDeadline && <span>📅 До {new Date(r.proposedDeadline).toLocaleDateString('ru-RU')}</span>}
                      </div>
                    )}
                  </div>
                ))
              )}

              {/* Response form */}
              {user && user.role === 'designer' && (
                <div className="card" style={{ marginTop: 16 }}>
                  <h4 style={{ marginBottom: 12, fontWeight: 600 }}>Оставить отклик</h4>
                  <div className="form-group" style={{ marginBottom: 12 }}>
                    <textarea
                      className="form-textarea"
                      placeholder="Опишите ваш опыт и предложение..."
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 16 }}>
                    <input
                      className="form-input"
                      placeholder="Предлагаемый бюджет (необязательно)"
                      value={propBudget}
                      onChange={(e) => setPropBudget(e.target.value)}
                    />
                  </div>
                  <button className="btn btn-primary" onClick={handleSubmitResponse} disabled={!responseText.trim()}>
                    Отправить отклик
                  </button>
                </div>
              )}
            </div>
          )}

          {(activeTab === 'Коммуникации' || activeTab === 'Замечания' || activeTab === 'Файлы') && (
            <div className="empty-state">
              <div className="empty-state-icon">🚧</div>
              <div className="empty-state-title">Раздел в разработке</div>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Этот функционал скоро будет доступен</p>
            </div>
          )}
        </div>

        {/* Right sidebar — Customer info */}
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'var(--text-muted)' }}>Заказчик</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div className="sidebar-user-avatar" style={{ width: 40, height: 40, fontSize: 13 }}>
                {order.customerName.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{order.customerName}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {order.region}
                </div>
              </div>
            </div>
            <button className="btn btn-accent btn-block" style={{ marginTop: 8 }}>Связаться</button>
          </div>

          {/* Required specialists list */}
          <div className="card">
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'var(--text-muted)' }}>Проектировщики</h4>
            {order.specialists.map((s, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 0',
                borderBottom: i < order.specialists.length - 1 ? '1px solid var(--border)' : 'none',
                fontSize: 13,
                color: 'var(--text-secondary)',
              }}>
                <span>👷</span>
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
