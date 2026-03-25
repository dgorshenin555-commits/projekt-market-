'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { OBJECT_TYPES, REGIONS, getSections, STAGE_P_CAPITAL } from '@/lib/constants';
import { ObjectType, DesignStage, ProjectScale } from '@/lib/types';

const STEPS = ['Тип объекта', 'Регион', 'Стадия', 'Масштаб', 'Разделы', 'Описание'];

export default function NewOrderPage() {
  const router = useRouter();
  const { user, addOrder } = useApp();
  const [step, setStep] = useState(0);

  const [objectType, setObjectType] = useState<ObjectType | ''>('');
  const [region, setRegion] = useState('');
  const [stage, setStage] = useState<DesignStage | ''>('');
  const [scale, setScale] = useState<ProjectScale | ''>('');
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');

  if (!user) {
    router.push('/auth');
    return null;
  }

  const canNext = () => {
    switch (step) {
      case 0: return !!objectType;
      case 1: return !!region;
      case 2: return !!stage;
      case 3: return !!scale;
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
      specialists: [],
      budget: budget || 'По запросу',
      deadline: deadline || undefined,
      status: 'published',
    });
    router.push(`/orders/${newOrder.id}`);
  };

  const toggleSection = (code: string) => {
    setSelectedSections((prev) =>
      prev.includes(code) ? prev.filter((s) => s !== code) : [...prev, code]
    );
  };

  const sections = objectType && stage ? getSections(stage as DesignStage, objectType as ObjectType) : [];

  return (
    <div className="animate-in" style={{ maxWidth: 720 }}>
      {/* Stepper */}
      <div className="stepper">
        {STEPS.map((s, i) => (
          <div key={i} style={{ display: 'contents' }}>
            <div className={`stepper-step ${i === step ? 'active' : i < step ? 'completed' : ''}`}>
              <div className="stepper-circle">{i < step ? '✓' : i + 1}</div>
              <span className="stepper-label">{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`stepper-connector ${i < step ? 'completed' : ''}`} />}
          </div>
        ))}
      </div>

      {/* Step 0: Object Type */}
      {step === 0 && (
        <div className="funnel-step">
          <h2>Выберите тип объекта</h2>
          <p>Это поможет подобрать нужные разделы документации</p>
          <div className="funnel-options">
            {OBJECT_TYPES.map((t) => (
              <div
                key={t.value}
                className={`funnel-option ${objectType === t.value ? 'selected' : ''}`}
                onClick={() => setObjectType(t.value)}
              >
                <div className="funnel-option-icon">{t.icon}</div>
                <div className="funnel-option-label">{t.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 1: Region */}
      {step === 1 && (
        <div className="funnel-step">
          <h2>Выберите регион</h2>
          <p>Где расположен объект?</p>
          <div className="funnel-options" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
            {REGIONS.map((r) => (
              <div
                key={r}
                className={`funnel-option ${region === r ? 'selected' : ''}`}
                onClick={() => setRegion(r)}
                style={{ padding: 14 }}
              >
                <div className="funnel-option-label">{r}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Stage */}
      {step === 2 && (
        <div className="funnel-step">
          <h2>Стадия проектирования</h2>
          <p>Какая стадия документации требуется?</p>
          <div className="funnel-options" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className={`funnel-option ${stage === 'P' ? 'selected' : ''}`} onClick={() => setStage('P')}>
              <div className="funnel-option-icon">📐</div>
              <div className="funnel-option-label">Стадия П</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Проектная документация</div>
            </div>
            <div className={`funnel-option ${stage === 'RD' ? 'selected' : ''}`} onClick={() => setStage('RD')}>
              <div className="funnel-option-icon">📋</div>
              <div className="funnel-option-label">Стадия РД</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Рабочая документация</div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Scale */}
      {step === 3 && (
        <div className="funnel-step">
          <h2>Масштаб проекта</h2>
          <p>Вам нужен один специалист или команда?</p>
          <div className="funnel-options" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className={`funnel-option ${scale === 'single' ? 'selected' : ''}`} onClick={() => setScale('single')}>
              <div className="funnel-option-icon">👤</div>
              <div className="funnel-option-label">Один специалист</div>
            </div>
            <div className={`funnel-option ${scale === 'team' ? 'selected' : ''}`} onClick={() => setScale('team')}>
              <div className="funnel-option-icon">👥</div>
              <div className="funnel-option-label">Формирование команды</div>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Sections */}
      {step === 4 && (
        <div className="funnel-step">
          <h2>Выберите разделы</h2>
          <p>Какие разделы документации необходимы?</p>
          <div className="checkbox-grid">
            {(Array.isArray(sections) ? (sections as any[]).flatMap((g: any) => g.sections || [g]) : []).map((s: any) => (
              <div
                key={s.code}
                className={`checkbox-item ${selectedSections.includes(s.code) ? 'selected' : ''}`}
                onClick={() => toggleSection(s.code)}
              >
                <div className="checkbox-box">
                  {selectedSections.includes(s.code) && '✓'}
                </div>
                <span><strong>{s.code}</strong> — {s.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 5: Details */}
      {step === 5 && (
        <div className="funnel-step">
          <h2>Детали заявки</h2>
          <p>Укажите название, описание, бюджет и сроки</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Название проекта *</label>
              <input className="form-input" placeholder="Например: Проектирование ЖК «Парк Резиденс»" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Описание</label>
              <textarea className="form-textarea" placeholder="Опишите проект подробнее..." value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Бюджет</label>
                <input className="form-input" placeholder="Например: 5 000 000 ₽" value={budget} onChange={(e) => setBudget(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Срок</label>
                <input className="form-input" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="funnel-actions">
        <button className="btn btn-secondary" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
          ← Назад
        </button>
        {step < STEPS.length - 1 ? (
          <button className="btn btn-primary" onClick={() => setStep(step + 1)} disabled={!canNext()}>
            Далее →
          </button>
        ) : (
          <button className="btn btn-primary" onClick={handleSubmit} disabled={!canNext()}>
            Опубликовать заявку
          </button>
        )}
      </div>
    </div>
  );
}
