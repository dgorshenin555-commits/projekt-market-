'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import {
  OBJECT_TYPES,
  REGIONS,
  getSections,
  STAGE_RD_GROUPS,
  SectionInfo,
  RDGroup,
} from '@/lib/constants';
import { ObjectType, DesignStage, ProjectScale } from '@/lib/types';

const STEPS = [
  { label: 'Тип объекта', icon: '🏗️' },
  { label: 'Регион', icon: '📍' },
  { label: 'Масштаб', icon: '👥' },
  { label: 'Стадия', icon: '📐' },
  { label: 'Разделы', icon: '📋' },
  { label: 'Описание', icon: '✍️' },
];

const SCALE_OPTIONS = [
  {
    value: 'single' as ProjectScale,
    icon: '👤',
    label: 'Один специалист',
    description: 'Поиск одного исполнителя на конкретный раздел или задачу',
  },
  {
    value: 'team' as ProjectScale,
    icon: '👥',
    label: 'Команда',
    description: 'Формирование полной команды проектировщиков из нескольких специалистов',
  },
];

const STAGE_OPTIONS = [
  {
    value: 'P' as DesignStage,
    icon: '📐',
    label: 'Стадия П',
    description: 'Проектная документация для получения разрешения на строительство',
  },
  {
    value: 'RD' as DesignStage,
    icon: '📋',
    label: 'Стадия РД',
    description: 'Рабочая документация для непосредственного выполнения СМР',
  },
];

export default function NewOrderPage() {
  const router = useRouter();
  const { user, addOrder } = useApp();
  const [step, setStep] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  // Form state
  const [objectType, setObjectType] = useState<ObjectType | ''>('');
  const [region, setRegion] = useState('');
  const [stage, setStage] = useState<DesignStage | ''>('');
  const [scale, setScale] = useState<ProjectScale | ''>('');
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [selectedSpecialists, setSelectedSpecialists] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');

  // Accordion state for RD groups
  const [openGroups, setOpenGroups] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      router.push('/auth');
    }
  }, [user, router]);

  // Get sections based on current selections
  const sections = useMemo(() => {
    if (!objectType || !stage) return [];
    return getSections(stage as DesignStage, objectType as ObjectType);
  }, [objectType, stage]);

  // Flat list of all available sections for P stage
  const flatSections = useMemo((): SectionInfo[] => {
    if (!sections) return [];
    if (Array.isArray(sections) && sections.length > 0 && 'sections' in sections[0]) {
      return (sections as RDGroup[]).flatMap((g) => g.sections);
    }
    return sections as SectionInfo[];
  }, [sections]);

  // Is this RD stage with groups?
  const isRDGrouped = useMemo(() => {
    return stage === 'RD' && Array.isArray(sections) && sections.length > 0 && 'sections' in sections[0];
  }, [stage, sections]);

  if (!user) return null;

  const canNext = () => {
    switch (step) {
      case 0: return !!objectType;
      case 1: return !!region;
      case 2: return !!scale;
      case 3: return !!stage;
      case 4: return selectedSections.length > 0;
      case 5: return !!title.trim();
      default: return false;
    }
  };

  const handleSubmit = () => {
    if (!objectType || !stage || !scale) return;
    const newOrder = addOrder({
      title,
      description,
      objectType: objectType as ObjectType,
      region,
      scale: scale as ProjectScale,
      stage: stage as DesignStage,
      sections: selectedSections,
      specialists: selectedSpecialists,
      budget: budget || 'По договорённости',
      deadline: deadline || undefined,
      status: 'published',
    });
    setCreatedOrderId(newOrder.id);
    setIsSubmitted(true);
  };

  const toggleSection = (code: string) => {
    setSelectedSections((prev) =>
      prev.includes(code) ? prev.filter((s) => s !== code) : [...prev, code]
    );
  };

  const toggleSpecialist = (spec: string) => {
    setSelectedSpecialists((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    );
  };

  const toggleGroup = (letter: string) => {
    setOpenGroups((prev) =>
      prev.includes(letter) ? prev.filter((g) => g !== letter) : [...prev, letter]
    );
  };

  const selectAllInGroup = (group: RDGroup) => {
    const codes = group.sections.map((s) => s.code);
    const allSelected = codes.every((c) => selectedSections.includes(c));
    if (allSelected) {
      setSelectedSections((prev) => prev.filter((s) => !codes.includes(s)));
    } else {
      setSelectedSections((prev) => [...new Set([...prev, ...codes])]);
    }
  };

  const goToStep = (targetStep: number) => {
    if (targetStep < step) {
      if (objectType === 'private' && targetStep === 3) {
        setStep(2);
      } else {
        setStep(targetStep);
      }
    }
  };

  // Get summary info for selected items
  const objectTypeLabel = OBJECT_TYPES.find((t) => t.value === objectType);
  const stageLabel = STAGE_OPTIONS.find((s) => s.value === stage);

  // === SUCCESS SCREEN ===
  if (isSubmitted) {
    return (
      <div className="animate-in" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', paddingTop: 60 }}>
        <div className="fnl-success-screen">
          <div className="fnl-success-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h2 className="fnl-success-title">Заявка опубликована!</h2>
          <p className="fnl-success-subtitle">
            Ваша заявка «{title}» успешно создана и доступна проектировщикам. Ожидайте первые отклики.
          </p>

          <div className="fnl-success-summary">
            <div className="fnl-success-summary-row">
              <span>Тип объекта</span>
              <span>{objectTypeLabel?.icon?.startsWith('/') ? <img src={objectTypeLabel.icon} alt="" style={{ height: 16, display: 'inline-block', verticalAlign: 'middle', marginRight: 4 }} /> : objectTypeLabel?.icon} {objectTypeLabel?.label}</span>
            </div>
            <div className="fnl-success-summary-row">
              <span>Регион</span>
              <span>📍 {region}</span>
            </div>
            <div className="fnl-success-summary-row">
              <span>Стадия</span>
              <span>{stageLabel?.icon} {stageLabel?.label}</span>
            </div>
            <div className="fnl-success-summary-row">
              <span>Разделов</span>
              <span>{selectedSections.length} шт.</span>
            </div>
            {budget && (
              <div className="fnl-success-summary-row">
                <span>Бюджет</span>
                <span>💰 {budget}</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 32 }}>
            <Link href="/orders" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
              ← К списку заявок
            </Link>
            <Link href={`/orders/detail?id=${createdOrderId}`} className="btn btn-primary" style={{ textDecoration: 'none' }}>
              Открыть заявку →
            </Link>
          </div>
        </div>

        {/* Confetti particles */}
        <div className="fnl-confetti" aria-hidden="true">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="fnl-confetti-particle"
              style={{
                '--x': `${Math.random() * 100}%`,
                '--delay': `${Math.random() * 2}s`,
                '--color': ['#8b5cf6', '#10b981', '#3b82f6', '#f59e0b', '#ec4899'][i % 5],
                '--drift': `${(Math.random() - 0.5) * 200}px`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      </div>
    );
  }

  // === MAIN FUNNEL ===
  return (
    <div className="animate-in fnl-layout">
      {/* Main content */}
      <div className="fnl-main">
        {/* Stepper */}
        <div className="stepper">
          {STEPS.map((s, i) => (
            <div key={i} style={{ display: 'contents' }}>
              <div
                className={`stepper-step ${i === step ? 'active' : i < step ? 'completed' : ''}`}
                onClick={() => goToStep(i)}
                style={{ cursor: i < step ? 'pointer' : 'default' }}
              >
                <div className="stepper-circle">{i < step ? '✓' : i + 1}</div>
                <span className="stepper-label">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`stepper-connector ${i < step ? 'completed' : ''}`} />}
            </div>
          ))}
        </div>

        {/* Step 0: Object Type */}
        {step === 0 && (
          <div className="funnel-step">
            <h2>Выберите тип объекта</h2>
            <p>Определяет набор необходимых разделов проектной документации</p>
            <div className="funnel-options">
              {OBJECT_TYPES.map((t) => (
                <div
                  key={t.value}
                  className={`funnel-option ${objectType === t.value ? 'selected' : ''}`}
                  onClick={() => setObjectType(t.value)}
                >
                  <div className="funnel-option-icon">
                    {t.icon.startsWith('/') ? <img src={t.icon} alt={t.label} style={{ height: 48, margin: '0 auto' }} /> : t.icon}
                  </div>
                  <div className="funnel-option-label">{t.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Region */}
        {step === 1 && (
          <div className="funnel-step">
            <h2>Где расположен объект?</h2>
            <p>Выберите регион строительства</p>
            <div className="funnel-options" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
              {REGIONS.map((r) => (
                <div
                  key={r}
                  className={`funnel-option ${region === r ? 'selected' : ''}`}
                  onClick={() => setRegion(r)}
                  style={{ padding: 14 }}
                >
                  <div className="funnel-option-icon" style={{ fontSize: 20 }}>📍</div>
                  <div className="funnel-option-label">{r}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Scale */}
        {step === 2 && (
          <div className="funnel-step">
            <h2>Масштаб проекта</h2>
            <p>Вам нужен один специалист или полная команда?</p>
            <div className="funnel-options" style={{ gridTemplateColumns: '1fr 1fr' }}>
              {SCALE_OPTIONS.map((opt) => (
                <div
                  key={opt.value}
                  className={`funnel-option ${scale === opt.value ? 'selected' : ''}`}
                  onClick={() => setScale(opt.value)}
                >
                  <div className="funnel-option-icon">{opt.icon}</div>
                  <div className="funnel-option-label">{opt.label}</div>
                  <div className="fnl-option-desc">{opt.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Stage */}
        {step === 3 && (
          <div className="funnel-step">
            <h2>Стадия проектирования</h2>
            <p>Какая стадия документации требуется?</p>
            <div className="funnel-options" style={{ gridTemplateColumns: '1fr 1fr' }}>
              {STAGE_OPTIONS.map((opt) => (
                <div
                  key={opt.value}
                  className={`funnel-option ${stage === opt.value ? 'selected' : ''}`}
                  onClick={() => {
                    setStage(opt.value);
                    setSelectedSections([]);
                    setSelectedSpecialists([]);
                  }}
                >
                  <div className="funnel-option-icon">{opt.icon}</div>
                  <div className="funnel-option-label">{opt.label}</div>
                  <div className="fnl-option-desc">{opt.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Sections */}
        {step === 4 && (
          <div className="funnel-step">
            <h2>Выберите разделы</h2>
            <p>
              Какие разделы документации необходимы?
              <span className="fnl-selected-count">{selectedSections.length} выбрано</span>
            </p>

            {isRDGrouped ? (
              // RD stage: grouped accordion
              <div className="fnl-accordion">
                {(sections as RDGroup[]).map((group) => {
                  const isOpen = openGroups.includes(group.letter);
                  const groupCodes = group.sections.map((s) => s.code);
                  const selectedInGroup = groupCodes.filter((c) => selectedSections.includes(c)).length;
                  const allSelected = selectedInGroup === groupCodes.length && groupCodes.length > 0;

                  return (
                    <div key={group.letter} className={`fnl-accordion-group ${isOpen ? 'open' : ''}`}>
                      <div className="fnl-accordion-header" onClick={() => toggleGroup(group.letter)}>
                        <div className="fnl-accordion-header-left">
                          <span className="fnl-accordion-letter">{group.letter}</span>
                          <div>
                            <div className="fnl-accordion-title">{group.name}</div>
                            <div className="fnl-accordion-meta">{group.sections.length} разделов</div>
                          </div>
                        </div>
                        <div className="fnl-accordion-header-right">
                          {selectedInGroup > 0 && (
                            <span className="fnl-accordion-badge">{selectedInGroup}</span>
                          )}
                          <button
                            className={`fnl-select-all-btn ${allSelected ? 'active' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              selectAllInGroup(group);
                            }}
                          >
                            {allSelected ? 'Убрать все' : 'Выбрать все'}
                          </button>
                          <span className={`fnl-accordion-arrow ${isOpen ? 'open' : ''}`}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </span>
                        </div>
                      </div>

                      {isOpen && (
                        <div className="fnl-accordion-body">
                          {group.sections.map((s) => (
                            <div
                              key={s.code}
                              className={`checkbox-item ${selectedSections.includes(s.code) ? 'selected' : ''}`}
                              onClick={() => toggleSection(s.code)}
                            >
                              <div className="checkbox-box">
                                {selectedSections.includes(s.code) && (
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                )}
                              </div>
                              <div style={{ flex: 1 }}>
                                <span style={{ fontWeight: 700, color: 'var(--text-accent)' }}>{s.code}</span>
                                <span style={{ marginLeft: 8 }}>{s.name}</span>
                                <div className="fnl-specialists">
                                  {s.specialists.slice(0, 2).map((sp, i) => (
                                    <span key={i} className="fnl-specialist-tag">{sp}</span>
                                  ))}
                                  {s.specialists.length > 2 && (
                                    <span className="fnl-specialist-tag muted">+{s.specialists.length - 2}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              // P stage: flat checkbox grid
              <div className="checkbox-grid">
                {flatSections.map((s) => (
                  <div
                    key={s.code}
                    className={`checkbox-item ${selectedSections.includes(s.code) ? 'selected' : ''}`}
                    onClick={() => toggleSection(s.code)}
                  >
                    <div className="checkbox-box">
                      {selectedSections.includes(s.code) && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-accent)' }}>{s.code}</span>
                      <span style={{ marginLeft: 8 }}>{s.name}</span>
                      <div className="fnl-specialists">
                        {s.specialists.slice(0, 2).map((sp, i) => (
                          <span key={i} className="fnl-specialist-tag">{sp}</span>
                        ))}
                        {s.specialists.length > 2 && (
                          <span className="fnl-specialist-tag muted">+{s.specialists.length - 2}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 5: Details */}
        {step === 5 && (
          <div className="funnel-step">
            <h2>Детали заявки</h2>
            <p>Заполните информацию о проекте для привлечения лучших специалистов</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="form-group">
                <label className="form-label">Название проекта <span style={{ color: 'var(--status-error)' }}>*</span></label>
                <input
                  className="form-input"
                  placeholder="Например: Проектирование ЖК «Парк Резиденс»"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Описание проекта</label>
                <textarea
                  className="form-textarea"
                  placeholder="Опишите задачу: этажность, площади, особые требования, наличие исходных данных..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ minHeight: 120 }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Бюджет</label>
                  <input
                    className="form-input"
                    placeholder="Например: 5 000 000 ₽"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                  />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    Оставьте пустым — «По договорённости»
                  </span>
                </div>
                <div className="form-group">
                  <label className="form-label">Желаемый срок (в днях)</label>
                  <input
                    className="form-input"
                    type="number"
                    placeholder="Например: 30"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>
              </div>

              {/* File upload placeholder */}
              <div className="form-group">
                <label className="form-label">Файлы (ТЗ, исходные данные)</label>
                <div className="fnl-file-dropzone">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                    Перетащите файлы сюда или <span style={{ color: 'var(--accent)', cursor: 'pointer' }}>выберите</span>
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>PDF, DWG, DOC до 50 МБ</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="funnel-actions">
          <button
            className="btn btn-secondary"
            onClick={() => {
              if (step === 4 && objectType === 'private') {
                setStep(2);
              } else {
                setStep(Math.max(0, step - 1));
              }
            }}
            disabled={step === 0}
          >
            ← Назад
          </button>
          {step < STEPS.length - 1 ? (
            <button className="btn btn-primary" onClick={() => {
              if (step === 2 && objectType === 'private') {
                setStage('RD');
                setSelectedSections([]);
                setSelectedSpecialists([]);
                setStep(4);
              } else {
                setStep(step + 1);
              }
            }} disabled={!canNext()}>
              Далее →
            </button>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={!canNext()}>
              🚀 Опубликовать заявку
            </button>
          )}
        </div>
      </div>

      {/* Right sidebar: summary */}
      <aside className="fnl-sidebar">
        <div className="fnl-sidebar-card">
          <h3 className="fnl-sidebar-title">Сводка заявки</h3>

          {objectType ? (
            <div className="fnl-sidebar-item">
              <span className="fnl-sidebar-label">Тип объекта</span>
              <span className="fnl-sidebar-value">
                {objectTypeLabel?.icon?.startsWith('/') ? <img src={objectTypeLabel.icon} alt="" style={{ height: 16, display: 'inline-block', verticalAlign: 'middle', margin: '-2px 4px 0 0' }} /> : objectTypeLabel?.icon} {objectTypeLabel?.label}
              </span>
            </div>
          ) : (
            <div className="fnl-sidebar-item empty">
              <span className="fnl-sidebar-label">Тип объекта</span>
              <span className="fnl-sidebar-placeholder">Не выбран</span>
            </div>
          )}

          {region ? (
            <div className="fnl-sidebar-item">
              <span className="fnl-sidebar-label">Регион</span>
              <span className="fnl-sidebar-value">📍 {region}</span>
            </div>
          ) : (
            <div className="fnl-sidebar-item empty">
              <span className="fnl-sidebar-label">Регион</span>
              <span className="fnl-sidebar-placeholder">Не выбран</span>
            </div>
          )}

          {scale ? (
            <div className="fnl-sidebar-item">
              <span className="fnl-sidebar-label">Масштаб</span>
              <span className="fnl-sidebar-value">{scale === 'single' ? '👤 Один специалист' : '👥 Команда'}</span>
            </div>
          ) : (
            <div className="fnl-sidebar-item empty">
              <span className="fnl-sidebar-label">Масштаб</span>
              <span className="fnl-sidebar-placeholder">Не выбран</span>
            </div>
          )}

          {stage ? (
            <div className="fnl-sidebar-item">
              <span className="fnl-sidebar-label">Стадия</span>
              <span className="fnl-sidebar-value">{stageLabel?.icon} {stageLabel?.label}</span>
            </div>
          ) : (
            <div className="fnl-sidebar-item empty">
              <span className="fnl-sidebar-label">Стадия</span>
              <span className="fnl-sidebar-placeholder">Не выбрана</span>
            </div>
          )}

          {selectedSections.length > 0 ? (
            <div className="fnl-sidebar-item">
              <span className="fnl-sidebar-label">Разделы ({selectedSections.length})</span>
              <div className="fnl-sidebar-tags">
                {selectedSections.map((s) => (
                  <span key={s} className="fnl-sidebar-tag">{s}</span>
                ))}
              </div>
            </div>
          ) : (
            <div className="fnl-sidebar-item empty">
              <span className="fnl-sidebar-label">Разделы</span>
              <span className="fnl-sidebar-placeholder">Не выбраны</span>
            </div>
          )}

          {title && (
            <div className="fnl-sidebar-item">
              <span className="fnl-sidebar-label">Название</span>
              <span className="fnl-sidebar-value" style={{ fontSize: 13 }}>{title}</span>
            </div>
          )}

          {budget && (
            <div className="fnl-sidebar-item">
              <span className="fnl-sidebar-label">Бюджет</span>
              <span className="fnl-sidebar-value">💰 {budget}</span>
            </div>
          )}
        </div>

        {/* Progress indicator */}
        <div className="fnl-sidebar-card" style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Прогресс заполнения</span>
            <span style={{ fontWeight: 700, color: 'var(--accent)' }}>
              {Math.round(((step + (canNext() ? 1 : 0)) / STEPS.length) * 100)}%
            </span>
          </div>
          <div style={{ height: 6, background: 'var(--bg-input)', borderRadius: 3, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                background: 'var(--accent-gradient)',
                width: `${((step + (canNext() ? 1 : 0)) / STEPS.length) * 100}%`,
                transition: 'width 0.4s ease',
                borderRadius: 3,
              }}
            />
          </div>
        </div>
      </aside>
    </div>
  );
}
