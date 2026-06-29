// @ts-nocheck
'use client';
import { useApp } from '@/lib/store';
import { Icon } from '../../_orders/icons';
import '../../_orders/orders.css';

const PLANS = [
  {
    name: 'Старт', price: '0 ₽', per: '', tagline: 'Для первого знакомства', featured: false,
    features: ['До 3 активных заявок', 'Каталог проектировщиков и производителей', 'База нормативов', 'Чат с исполнителями'],
  },
  {
    name: 'Команда', price: '12 900 ₽', per: '/ мес', tagline: 'Для постоянной работы', featured: true,
    features: ['Без лимита заявок', 'Обследование и экспертиза', 'Проверка СРО', 'Аналитика и отчёты', 'Приоритетная поддержка'],
  },
  {
    name: 'Бизнес', price: 'Индивид.', per: '', tagline: 'Для организаций', featured: false,
    features: ['Всё из тарифа «Команда»', 'API и интеграции', 'Выделенный менеджер', 'SLA и приоритет', 'Обучение команды'],
  },
];

export default function PricingPage() {
  const { notify } = useApp();
  return (
    <div className="fx animate-in">
      <div>
        <h1 className="page-title" style={{ margin: 0 }}>Тарифы</h1>
        <p className="page-sub" style={{ margin: '4px 0 0' }}>Выберите план под объём работы. Сменить или отменить можно в любой момент.</p>
      </div>

      <div className="pricing-grid">
        {PLANS.map((p) => (
          <div key={p.name} className={'pricing-card' + (p.featured ? ' is-featured' : '')}>
            {p.featured && <span className="pricing-card__badge">Популярный</span>}
            <div className="pricing-card__name">{p.name}</div>
            <div className="pricing-card__tagline">{p.tagline}</div>
            <div className="pricing-card__price"><b>{p.price}</b>{p.per && <span>{p.per}</span>}</div>
            <ul className="pricing-card__list">
              {p.features.map((f) => (
                <li key={f}><Icon name="check" size={16} /> {f}</li>
              ))}
            </ul>
            <button
              className={'btn ' + (p.featured ? 'btn-primary' : 'btn-ghost')}
              style={{ width: '100%', marginTop: 'auto' }}
              onClick={() => notify(p.name === 'Бизнес' ? 'Заявка на тариф «Бизнес» — мы свяжемся с вами' : `Тариф «${p.name}» — оформление скоро`)}
            >
              {p.name === 'Бизнес' ? 'Связаться' : 'Выбрать тариф'}
            </button>
          </div>
        ))}
      </div>

      <p className="dim" style={{ fontSize: 13, marginTop: 22 }}>Цены указаны без НДС. Это демонстрационный прототип — оплата не подключена.</p>
    </div>
  );
}
