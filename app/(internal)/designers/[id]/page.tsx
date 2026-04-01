'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { MOCK_DESIGNERS, MOCK_PROJECTS } from '@/lib/mock-data';

const TABS = ['Обзор', 'Портфолио', 'Отзывы', 'Документы и СРО'];

const AVATAR_COLORS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
];

export default function DesignerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [activeTab, setActiveTab] = useState('Обзор');

  // Ищем дизайнера по ID, или берем первого как фолбек (на случай перезагрузки страницы)
  const designer = MOCK_DESIGNERS.find(d => d.id === id) || MOCK_DESIGNERS[0];

  if (!designer) {
    return (
      <div className="empty-state animate-in">
        <div className="empty-state-icon">🔍</div>
        <div className="empty-state-title">Специалист не найден</div>
        <button onClick={() => router.push('/designers')} className="btn btn-primary" style={{ marginTop: 16 }}>
          К списку каталога
        </button>
      </div>
    );
  }

  const avatarGradient = AVATAR_COLORS[MOCK_DESIGNERS.indexOf(designer) % AVATAR_COLORS.length];

  return (
    <div className="animate-in pb-20">
      {/* Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Link href="/designers" style={{ color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none' }}>
          Каталог специалистов
        </Link>
        <span style={{ color: 'var(--text-muted)' }}>/</span>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{designer.name}</span>
      </div>

      {/* Header Profile Hero */}
      <div style={{
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        marginBottom: 24,
      }}>
        {/* Cover Graphic */}
        <div style={{
          height: 140,
          background: 'linear-gradient(90deg, #1e1e2f 0%, #2d2b42 100%)',
          position: 'relative'
        }}>
           <div style={{
             position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
             opacity: 0.1,
             backgroundImage: 'radial-gradient(circle at 20px 20px, var(--accent) 2px, transparent 0)',
             backgroundSize: '40px 40px'
           }} />
        </div>

        {/* Info Area */}
        <div style={{ padding: '0 32px 32px', display: 'flex', gap: 24, alignItems: 'flex-start', marginTop: -40 }}>
          <div style={{
            width: 100, height: 100,
            borderRadius: '50%',
            background: avatarGradient,
            border: '4px solid var(--bg-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, color: 'white', fontWeight: 800,
            flexShrink: 0, zIndex: 1,
            boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
          }}>
            {designer.type === 'company' ? '🏢' : designer.name.substring(0, 2).toUpperCase()}
          </div>
          
          <div style={{ flex: 1, marginTop: 46 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                  {designer.name}
                  {designer.rating > 4.7 && (
                    <span title="Топ специалист" style={{ fontSize: 18 }}>🏆</span>
                  )}
                </h1>
                
                <div style={{ display: 'flex', gap: 16, color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16 }}>
                  <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    📍 {designer.city} {designer.region && <span style={{ color: 'var(--text-muted)' }}>({designer.region})</span>}
                  </span>
                  <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    ⭐ {designer.rating} ({designer.reviewsLabel})
                  </span>
                  {designer.type === 'company' && (
                    <span style={{ display: 'flex', gap: 6, alignItems: 'center', color: 'var(--accent)' }}>
                      🏢 Организация
                    </span>
                  )}
                </div>

                <div className="dsn-featured-sections" style={{ marginTop: 0 }}>
                  {designer.sections.map((s, i) => (
                    <span key={i} className="dsn-section-tag accent" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>{s}</span>
                  ))}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-secondary">
                  💬 Написать
                </button>
                <button className="btn btn-primary">
                  🚀 Пригласить в проект
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 24, alignItems: 'start' }}>
        {/* Left main content */}
        <div>
          {/* Tabs */}
          <div style={{
            display: 'flex',
            gap: 0,
            borderBottom: '1px solid var(--border)',
            marginBottom: 24,
            overflowX: 'auto',
          }}>
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '12px 24px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
                  color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontWeight: activeTab === tab ? 600 : 500,
                  fontSize: 15,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="card" style={{ minHeight: 400 }}>
            {activeTab === 'Обзор' && (
              <div className="animate-in">
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>О специалисте</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 15, marginBottom: 32 }}>
                  {designer.description ||
                    `${designer.type === 'company' ? 'Проектная организация' : 'Специалист'} с богатым опытом работы на рынке. Основная специализация: разработка проектной и рабочей документации для объектов различного назначения. Высокое качество чертежей, соблюдение сроков и норм оформления (ГОСТ, СП).`}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                   <div>
                     <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Программное обеспечение</h4>
                     <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                       {['AutoCAD', 'Revit', 'Navisworks', 'Lira-SAPR'].map(s => (
                         <span key={s} style={{ padding: '6px 12px', background: 'var(--bg-input)', borderRadius: 6, fontSize: 13, color: 'var(--text-secondary)' }}>{s}</span>
                       ))}
                     </div>
                   </div>
                   
                   <div>
                     <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Достижения на Кульман</h4>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                       {(designer.achievements?.length ? designer.achievements : ['Проверенный профиль', 'Быстрый отклик', '+10 проектов за квартал']).map((ach, i) => (
                         <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 14, color: 'var(--text-secondary)' }}>
                           <span style={{ color: 'var(--status-success)' }}>✓</span> {ach}
                         </div>
                       ))}
                     </div>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'Портфолио' && (
              <div className="animate-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700 }}>Примеры работ ({designer.projectsCount})</h3>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {MOCK_PROJECTS.map((p, idx) => (
                    <div key={idx} style={{ 
                      borderRadius: 'var(--radius-md)', 
                      border: '1px solid var(--border)',
                      overflow: 'hidden',
                      position: 'relative',
                      cursor: 'pointer'
                    }}>
                       <div style={{ height: 160, background: 'var(--bg-input)' }}>
                          {/* Placeholder for project mock image */}
                          <div style={{ width: '100%', height: '100%', opacity: 0.5, background: 'linear-gradient(45deg, #2a2a40, #1e1e2f)' }} />
                       </div>
                       <div style={{ padding: 16, background: 'var(--bg-secondary)' }}>
                         <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{p.title}</div>
                         <div style={{ color: 'var(--text-muted)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                           <span>📍 {p.location}</span>
                           <span>•</span>
                           <span>Раздел: {designer.sections[0]}</span>
                         </div>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'Отзывы' && (
              <div className="animate-in empty-state" style={{ minHeight: 300 }}>
                <div className="empty-state-icon">⭐</div>
                <div className="empty-state-title">Отзывы ({designer.rating})</div>
                <p style={{ color: 'var(--text-muted)' }}>Здесь будут отображаться отзывы от прошедших сделок.</p>
              </div>
            )}

            {activeTab === 'Документы и СРО' && (
              <div className="animate-in">
                 <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Юридическая информация</h3>
                 
                 <div style={{ 
                   display: 'flex', alignItems: 'center', gap: 16, 
                   padding: 20, background: 'rgba(16, 185, 129, 0.05)', 
                   border: '1px solid rgba(16, 185, 129, 0.2)',
                   borderRadius: 'var(--radius-md)'
                 }}>
                    <div style={{ width: 48, height: 48, background: 'rgba(16, 185, 129, 0.1)', color: 'var(--status-success)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                      🏛️
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Членство в СРО Подтверждено</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                        {designer.sroNumber || 'СРО-П-123-4567890'}
                      </div>
                    </div>
                 </div>

                 <div style={{ marginTop: 24 }}>
                   <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 16 }}>Прикрепленные файлы</h4>
                   <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 12 }}>
                     {[1, 2].map(doc => (
                       <div key={doc} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                         <div style={{ fontSize: 24 }}>📄</div>
                         <div style={{ flex: 1 }}>
                           <div style={{ fontSize: 14, fontWeight: 500 }}>Выписка_СРО_2026.pdf</div>
                           <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>PDF • 1.2 MB</div>
                         </div>
                         <button className="btn btn-secondary btn-sm" style={{ padding: '6px 12px' }}>Скачать</button>
                       </div>
                     ))}
                   </div>
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
           <div className="card">
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' }}>
               <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 600 }}>График загрузки</span>
               <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--status-success)', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: 12 }}>
                 <div style={{ width: 8, height: 8, background: 'var(--status-success)', borderRadius: '50%' }} />
                 Свободен
               </span>
             </div>
             <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
               Готов взять проект в работу прямо сейчас. Среднее время ответа на заявку — менее 30 минут.
             </p>
           </div>

           <div className="card">
             <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Статистика профиля</h4>
             
             <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                 <span style={{ color: 'var(--text-muted)' }}>Выполнено на платформе</span>
                 <span style={{ fontWeight: 600 }}>{designer.projectsCount} проектов</span>
               </div>
               {designer.yearsExperience && (
                 <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                   <span style={{ color: 'var(--text-muted)' }}>Стаж работы</span>
                   <span style={{ fontWeight: 600 }}>{designer.yearsExperience} лет</span>
                 </div>
               )}
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                 <span style={{ color: 'var(--text-muted)' }}>Процент успешных сделок</span>
                 <span style={{ fontWeight: 600, color: 'var(--status-success)' }}>98%</span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                 <span style={{ color: 'var(--text-muted)' }}>Рейтинг заказчиков</span>
                 <span style={{ fontWeight: 600 }}>⭐ {designer.rating} / 5.0</span>
               </div>
             </div>
           </div>

           <div className="card">
             <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Контактные данные</h4>
             <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {designer.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                    <span style={{ color: 'var(--text-muted)', width: 24, textAlign: 'center' }}>📞</span>
                    <span>{designer.phone}</span>
                  </div>
                )}
                {designer.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                    <span style={{ color: 'var(--text-muted)', width: 24, textAlign: 'center' }}>✉️</span>
                    <span>{designer.email}</span>
                  </div>
                )}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
