/* screens_orders.jsx — Orders, OrderDetail, OrderNew */
(function () {
  const Icon = window.Icon, Avatar = window.Avatar;
  const { ORDERS, STATUS } = window.DATA;

  function StatusBadge({ status }) {
    const s = STATUS[status];
    return <span className={"badge " + s.cls}><i />{s.label}</span>;
  }

  /* стандартные превью по типу объекта */
  const TYPE_IMAGES = {
    "Промышленность": { src: "assets/hero-industrial.png", tag: "Промышленный объект" },
    "Коммерческая": { src: "assets/hero-commercial.png", tag: "Коммерческий объект" },
    "Частное": { src: "assets/hero-private.png", tag: "Частный дом" },
  };
  const imageFor = (type) => {
    const key = Object.keys(TYPE_IMAGES).find(k => type && type.includes(k));
    return key ? TYPE_IMAGES[key] : null;
  };

  function OrderCard({ o, go }) {
    const extra = o.sections.length > 6 ? o.sections.length - 6 : 0;
    const shown = o.sections.slice(0, 6);
    const img = imageFor(o.type);
    return (
      <div className="card card-hover ordercard" onClick={() => go("order-detail", o.id)}>
        {img
          ? <div className="ordercard__thumb--img" style={{ backgroundImage: "url('" + img.src + "')" }} />
          : <div className="thumb thumb-tower ordercard__thumb" />}
        <div className="grow" style={{ minWidth: 0 }}>
          <div className="row between gap16" style={{ alignItems: "flex-start" }}>
            <h3 className="ordercard__title">{o.title}</h3>
            <StatusBadge status={o.status} />
          </div>
          <p className="muted ordercard__desc">{o.desc}</p>
          <div className="meta-row mt12">
            <span><Icon name="pin" />{o.region}</span>
            <span><Icon name="building" />{o.type}</span>
            <span><Icon name="clock" />Срок: {o.due}</span>
          </div>
          <div className="chips mt12">
            {shown.map(s => <span key={s} className="chip chip-code">{s}</span>)}
            {extra > 0 && <span className="chip">+{extra}</span>}
          </div>
          <div className="row between mt16">
            {o.wait
              ? <span className="row gap8" style={{ color: "var(--amber)", fontWeight: 700 }}><Icon name="wallet" size={16} />{o.budget}</span>
              : <span className="price row gap8"><Icon name="wallet" size={17} style={{ color: "var(--accent-2)" }} />{o.budget}</span>}
            <span className="row gap6 dim" style={{ fontSize: 13 }}><Icon name="comment" size={15} />{o.replies} откликов</span>
          </div>
        </div>
      </div>
    );
  }

  /* срок до дедлайна относительно текущей даты платформы (10.06.2026) */
  const NOW = new Date(2026, 5, 10);
  const daysLeft = (due) => { const [d, m, y] = due.split(".").map(Number); return Math.round((new Date(y, m - 1, d) - NOW) / 86400000); };
  const urgencyBucket = (due) => { const n = daysLeft(due); return n <= 30 ? "u1" : n <= 90 ? "u2" : "u3"; };
  const URGENCY = [["Любой", null, "#9ca3af"], ["Срочно", "u1", "#f4717f"], ["1–3 мес", "u2", "#f5b13d"], ["3 мес+", "u3", "#34d399"]];

  function UrgencyScale({ value, onPick }) {
    return (
      <div className="ratescale" title="Срочность по дедлайну">
        {URGENCY.map(([label, v, c]) => (
          <button key={label} className={value === v ? "is-on" : ""} style={{ "--dot": c }} onClick={() => onPick(v)}><i />{label}</button>
        ))}
      </div>
    );
  }

  const ORDER_HINTS = [
    ["building", "Коммерческие", o => o.type.includes("Коммерческая")],
    ["factory", "Промышленность", o => o.type.includes("Промышленность")],
    ["wallet", "Бюджет 10М+", o => (parseInt((o.budget || "").replace(/\D/g, ""), 10) || 0) >= 10000000],
    ["comment", "Много откликов", o => o.replies >= 8],
  ];

  function OrderHints({ active, onPick }) {
    return (
      <div className="cat-hints">
        {ORDER_HINTS.map(([ic, label], i) => (
          <button key={label} className={"cat-hint" + (active === i ? " is-on" : "")} onClick={() => onPick(active === i ? null : i)}>
            <Icon name={ic} size={14} />{label}
          </button>
        ))}
      </div>
    );
  }

  /* ============ ORDERS LIST ============ */
  function Orders({ go }) {
    const [view, setView] = React.useState("list");
    const [type, setType] = React.useState("Все типы");
    const [status, setStatus] = React.useState("Все статусы");
    const [urg, setUrg] = React.useState(null);
    const [hint, setHint] = React.useState(null);
    const [q, setQ] = React.useState("");

    const query = q.trim().toLowerCase();
    const list = ORDERS.filter(o =>
      (type === "Все типы" || o.type.includes(type)) &&
      (status === "Все статусы" || (STATUS[o.status] && STATUS[o.status].label === status)) &&
      (urg == null || urgencyBucket(o.due) === urg) &&
      (hint == null || ORDER_HINTS[hint][2](o)) &&
      (!query || o.title.toLowerCase().includes(query) || o.desc.toLowerCase().includes(query) || o.region.toLowerCase().includes(query))
    );
    const reset = () => { setType("Все типы"); setStatus("Все статусы"); setUrg(null); setHint(null); setQ(""); };
    const PromptSearch = window.PromptSearch;

    return (
      <>
        <div className="cat-head">
          <div>
            <p className="cat-eyebrow">Заявки</p>
            <h1 className="cat-title">Заявки на проектирование<br />и экспертизу</h1>
            <p className="cat-lead">Активные проекты заказчиков: от частных домов до промышленных объектов. Откликайтесь на подходящие или опишите свою задачу.</p>
          </div>
          <button className="btn btn-primary" onClick={() => go("order-new")}><Icon name="plus" size={16} /> Создать заявку</button>
        </div>

        {PromptSearch && <PromptSearch value={q} onChange={setQ} placeholder="Опишите задачу — найдём подходящие заявки…" />}

        <div style={{ marginTop: 14 }}><OrderHints active={hint} onPick={setHint} /></div>

        <div className="row between gap16 wrap" style={{ margin: "20px 0 16px" }}>
          <div className="row gap10 wrap">
            <Dropdown value={type} setValue={setType} options={["Все типы","Коммерческая","Промышленность","Частное","Линейные"]} />
            <Dropdown value={status} setValue={setStatus} options={["Все статусы","Опубликована","В работе","Завершена"]} />
            <UrgencyScale value={urg} onPick={setUrg} />
          </div>
          <div className="viewtoggle">
            {["list","columns","menu"].map(v => (
              <button key={v} className={view === v ? "is-active" : ""} onClick={() => setView(v)}><Icon name={v === "list" ? "list" : v === "columns" ? "columns" : "menu"} /></button>
            ))}
          </div>
        </div>

        <div className="row between" style={{ marginBottom: 18 }}>
          <span className="dim" style={{ fontSize: 13 }}>Найдено: {list.length} из {ORDERS.length}</span>
          {(type !== "Все типы" || status !== "Все статусы" || urg != null || hint != null || query) &&
            <button className="btn btn-ghost btn-sm" onClick={reset}><Icon name="x" size={13} /> Сбросить</button>}
        </div>

        {list.length ? (
          <div className={view === "columns" ? "orders-grid" : "col gap16"}>
            {list.map(o => <OrderCard key={o.id} o={o} go={go} />)}
          </div>
        ) : (
          <div className="card" style={{ textAlign: "center", padding: 44 }}>
            <p className="muted" style={{ margin: "0 0 16px", fontSize: 14.5 }}>По заданным условиям заявок не нашлось.</p>
            <button className="btn btn-outline btn-sm" onClick={reset}>Сбросить фильтры</button>
          </div>
        )}
      </>
    );
  }

  function Dropdown({ value, setValue, options }) {
    const [open, setOpen] = React.useState(false);
    const ref = React.useRef(null);
    React.useEffect(() => {
      const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
      document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
    }, []);
    return (
      <div ref={ref} style={{ position: "relative" }}>
        <button className={"pill" + (value !== options[0] ? " is-active" : "")} style={{ height: 42 }} onClick={() => setOpen(o => !o)}>
          {value} <Icon name="chevD" size={14} />
        </button>
        {open && (
          <div className="menu-pop">
            {options.map(o => (
              <button key={o} className={"menu-pop__item" + (o === value ? " is-sel" : "")} onClick={() => { setValue(o); setOpen(false); }}>{o}</button>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ============ ORDER DETAIL ============ */
  function OrderDetail({ id, go }) {
    const o = ORDERS.find(x => x.id === id) || ORDERS[0];
    const [tab, setTab] = React.useState("Описание");
    const team = ["Архитектор","ГАП","Конструктор","Инженер-электрик","Инженер-сантехник"];
    const timeline = [
      { label: "Принята в работу", done: true },
      { label: "Назначены проектировщики", done: false },
      { label: "Передана на экспертизу", done: false },
      { label: "Закрыта", done: false },
    ];

    const RESPONSES = [
      { ini: "КБ", g: ["#4aa3ff","#3b7ff0"], name: "Бюро «Контур»", spec: "Архитектура · КР", rating: "4.9", price: "11 800 000 ₽", term: "95 дней", note: "Опыт по жилым комплексам бизнес-класса, своя BIM-команда." },
      { ini: "СА", g: ["#3ad6a6","#22b886"], name: "ИП Соколов А.В.", spec: "Конструктив", rating: "4.8", price: "10 200 000 ₽", term: "110 дней", note: "Готов начать сразу, среднее время ответа — 30 минут." },
      { ini: "МП", g: ["#f5933d","#ec6f2a"], name: "ПИ «Мостпроект»", spec: "Полный комплект", rating: "5.0", price: "12 600 000 ₽", term: "90 дней", note: "Берёт проект под ключ с прохождением экспертизы." },
    ];
    const MESSAGES = [
      { me: false, who: "Бюро «Контур»", t: "Добрый день! Изучили ТЗ, готовы взяться. Уточните: подземная автостоянка на 2 уровня?", time: "10:24" },
      { me: true, who: "Вы", t: "Здравствуйте! Да, два уровня, около 180 машино-мест.", time: "10:31" },
      { me: false, who: "Бюро «Контур»", t: "Принято. Направим коммерческое предложение с разбивкой по разделам до конца дня.", time: "10:36" },
      { me: true, who: "Вы", t: "Отлично, ждём. Интересует срок по стадии П.", time: "10:38" },
    ];
    const REMARKS = [
      { sec: "КР", txt: "Уточнить расчёт нагрузок на плиту перекрытия 3 этажа", tag: ["wait","Открыто"] },
      { sec: "ЭОМ", txt: "Схема электроснабжения принята без замечаний", tag: ["done","Принято"] },
      { sec: "ВК", txt: "Ответ направлен эксперту, ожидается проверка", tag: ["work","На проверке"] },
      { sec: "ПБ", txt: "Добавить расчёт эвакуационных путей секции 2", tag: ["wait","Открыто"] },
    ];
    const FILES = [
      { ic: "file", name: "Техническое задание.pdf", size: "1,2 МБ", date: "08.06.2026" },
      { ic: "layers", name: "Генплан участка.dwg", size: "4,8 МБ", date: "08.06.2026" },
      { ic: "bim", name: "Концепция_BIM.ifc", size: "23,1 МБ", date: "07.06.2026" },
      { ic: "file", name: "Исходные данные.zip", size: "12,4 МБ", date: "05.06.2026" },
    ];

    const Stars = ({ v }) => <span className="row gap6" style={{ fontSize: 13, color: "var(--text-dim)" }}><Icon name="star" size={13} style={{ color: "var(--amber)" }} />{v}</span>;

    const Main = () => {
      if (tab === "Проектировщики") return (
        <div className="col gap16" style={{ minWidth: 0 }}>
          <div className="row between" style={{ alignItems: "flex-end" }}>
            <h3 className="section-title" style={{ margin: 0 }}>Отклики на заявку</h3>
            <span className="dim" style={{ fontSize: 13 }}>{o.replies} откликов · сортировка по рейтингу</span>
          </div>
          {RESPONSES.map(r => (
            <div key={r.name} className="card">
              <div className="row gap12" style={{ marginBottom: 12 }}>
                <Avatar text={r.ini} size={44} />
                <div className="grow">
                  <div className="row between"><div style={{ fontWeight: 700, fontSize: 15 }}>{r.name}</div><Stars v={r.rating} /></div>
                  <div className="dim" style={{ fontSize: 13 }}>{r.spec}</div>
                </div>
              </div>
              <p className="muted" style={{ margin: "0 0 14px", fontSize: 13.5, lineHeight: 1.55 }}>{r.note}</p>
              <div className="row between gap16 wrap">
                <span className="row gap16">
                  <span className="price row gap6"><Icon name="wallet" size={16} style={{ color: "var(--accent-2)" }} />{r.price}</span>
                  <span className="row gap6 dim" style={{ fontSize: 13 }}><Icon name="clock" size={14} />{r.term}</span>
                </span>
                <div className="row gap8">
                  <button className="btn btn-ghost btn-sm" onClick={() => go("designer-profile")}>Профиль</button>
                  <button className="btn btn-primary btn-sm" onClick={() => go("chat")}>Выбрать <Icon name="arrowRight" size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
      if (tab === "Коммуникации") return (
        <div className="card" style={{ minWidth: 0 }}>
          <div className="row between" style={{ marginBottom: 18 }}>
            <h3 className="section-title" style={{ margin: 0 }}>Переписка по заявке</h3>
            <span className="badge done"><i />Бюро «Контур»</span>
          </div>
          <div className="col gap14">
            {MESSAGES.map((m, i) => (
              <div key={i} className="row gap10" style={{ flexDirection: m.me ? "row-reverse" : "row", alignItems: "flex-end" }}>
                <Avatar text={m.me ? "Вы" : "КБ"} size={32} />
                <div style={{ maxWidth: "76%" }}>
                  <div style={{
                    padding: "10px 14px", borderRadius: 14,
                    borderBottomRightRadius: m.me ? 4 : 14, borderBottomLeftRadius: m.me ? 14 : 4,
                    background: m.me ? "var(--grad)" : "var(--surface-2)", color: m.me ? "#fff" : "var(--text)",
                    fontSize: 13.5, lineHeight: 1.5, border: m.me ? "none" : "1px solid var(--border)"
                  }}>{m.t}</div>
                  <div className="dim" style={{ fontSize: 11.5, marginTop: 4, textAlign: m.me ? "right" : "left" }}>{m.time}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="topbar__search mt24" style={{ maxWidth: "none", height: 46 }}><Icon name="comment" /><input placeholder="Написать сообщение…" /><button className="btn btn-primary btn-sm" onClick={() => go("chat")}>Отправить</button></div>
        </div>
      );
      if (tab === "Замечания") return (
        <div className="card" style={{ minWidth: 0 }}>
          <div className="row between" style={{ marginBottom: 18 }}>
            <h3 className="section-title" style={{ margin: 0 }}>Замечания экспертизы</h3>
            <span className="dim" style={{ fontSize: 13 }}>{REMARKS.filter(r => r.tag[0] === "wait").length} открытых · {REMARKS.length} всего</span>
          </div>
          <div className="col gap10">
            {REMARKS.map((r, i) => (
              <div key={i} className="row gap14" style={{ padding: "13px 16px", borderRadius: 12, background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                <span className="chip chip-code" style={{ flex: "none" }}>{r.sec}</span>
                <span className="grow" style={{ fontSize: 13.5, minWidth: 0 }}>{r.txt}</span>
                <span className={"badge " + r.tag[0]} style={{ flex: "none" }}><i />{r.tag[1]}</span>
              </div>
            ))}
          </div>
        </div>
      );
      if (tab === "Файлы") return (
        <div className="card" style={{ minWidth: 0 }}>
          <div className="row between" style={{ marginBottom: 18 }}>
            <h3 className="section-title" style={{ margin: 0 }}>Файлы проекта</h3>
            <button className="btn btn-ghost btn-sm"><Icon name="plus" size={14} /> Загрузить</button>
          </div>
          <div className="col gap10">
            {FILES.map((f, i) => (
              <div key={i} className="row gap14" style={{ padding: "13px 16px", borderRadius: 12, background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, display: "grid", placeItems: "center", background: "var(--accent-soft)", color: "var(--accent-2)", flex: "none" }}><Icon name={f.ic} size={19} /></div>
                <div className="grow" style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{f.name}</div>
                  <div className="dim" style={{ fontSize: 12.5, marginTop: 2 }}>{f.size} · {f.date}</div>
                </div>
                <button className="iconbtn" title="Скачать"><Icon name="download" size={17} /></button>
              </div>
            ))}
          </div>
        </div>
      );
      return (
        <>
          <div className="card">
            <h3 className="section-title" style={{ marginBottom: 18 }}>Описание</h3>
            <table className="spec">
              <tbody>
                <tr><td>Тип объекта</td><td>{o.type}</td></tr>
                <tr><td>Регион</td><td>{o.region}</td></tr>
                <tr><td>Масштаб</td><td>{o.scope}</td></tr>
                <tr><td>Стадия</td><td>{o.stage}</td></tr>
                <tr><td>Разделы</td><td>{o.sections.join(" / ")}</td></tr>
              </tbody>
            </table>
            <div className="row gap16 mt24" style={{ alignItems: "center" }}>
              <span className="price" style={{ fontSize: 24 }}>{o.budget}</span>
              <span className="chip">До {o.due}</span>
            </div>
            <p className="muted mt16" style={{ lineHeight: 1.6, fontSize: 14.5 }}>{o.desc}</p>
          </div>

          <div className="card">
            <h3 className="section-title" style={{ marginBottom: 22 }}>Таймлайн работы</h3>
            <div className="timeline">
              {timeline.map((s, i) => (
                <div key={s.label} className={"tl" + (s.done ? " tl--done" : "")}>
                  <div className="tl__dot">{s.done && <Icon name="check" size={13} />}</div>
                  {i < timeline.length - 1 && <div className="tl__line" />}
                  <div className="tl__label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      );
    };

    return (
      <>
        <div className="breadcrumb">
          <a className="link" onClick={() => go("orders")}>Заявки</a>
          <Icon name="chevR" size={13} /> <span className="dim">{o.title}</span>
        </div>

        <div className="row between gap16 wrap" style={{ margin: "16px 0 22px" }}>
          <h1 className="page-title" style={{ maxWidth: 760 }}>{o.title}</h1>
          <div className="row gap10">
            <StatusBadge status={o.status} />
            <button className="btn btn-ghost btn-sm" onClick={() => go("chat")}><Icon name="comment" size={15} /> Обсудить</button>
          </div>
        </div>

        {(() => { const h = imageFor(o.type); return h
          ? <div className="detail__hero--img" style={{ backgroundImage: "url('" + h.src + "')" }}>
              <span className="detail__hero-tag"><Icon name="factory" size={14} />BIM-модель · {h.tag}</span>
            </div>
          : <div className="thumb thumb-tower detail__hero" />; })()}

        <div className="tabs">
          {["Описание","Проектировщики","Коммуникации","Замечания","Файлы"].map(t => (
            <button key={t} className={"tab" + (t === tab ? " is-active" : "")} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>

        <div className="detail__grid">
          <div className="col gap20" style={{ minWidth: 0 }}>
            <Main />
          </div>

          <div className="col gap20">
            <div className="card">
              <div className="dim" style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Заказчик</div>
              <div className="row gap12" style={{ marginBottom: 18 }}>
                <Avatar text={o.client.replace(/[^А-ЯA-Z]/g, "").slice(0, 2) || "ЗК"} size={44} />
                <div>
                  <div style={{ fontWeight: 700 }}>{o.client}</div>
                  <div className="dim" style={{ fontSize: 13 }}>{o.clientCity}</div>
                </div>
              </div>
              <button className="btn btn-primary btn-block" onClick={() => go("chat")}>Связаться</button>
            </div>

            <div className="card">
              <h3 className="section-title" style={{ fontSize: 16, marginBottom: 6 }}>Требуются специалисты</h3>
              <div className="team">
                {team.map(t => (
                  <div key={t} className="team__row" onClick={() => go("designer-profile")}>
                    <div className="team__ava"><Icon name="user" size={15} /></div>
                    <span>{t}</span>
                    <Icon name="chevR" size={14} style={{ marginLeft: "auto", opacity: .5 }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ============ ORDER NEW (create form) ============ */
  function PrevRow({ icon, label, value, hot, accent }) {
    return (
      <div className={"prev__row" + (hot ? " is-hot" : "")}>
        <span className="prev__ico"><Icon name={icon} size={15} /></span>
        <div className="grow" style={{ minWidth: 0 }}>
          <div className="prev__k">{label}</div>
          <div className={"prev__v" + (accent ? " prev__v--accent" : "")}>{value}</div>
        </div>
      </div>
    );
  }

  function OrderNew({ go }) {
    const steps = ["Тип объекта","Регион и стадия","Разделы","Бюджет и сроки","Файлы"];
    const [step, setStep] = React.useState(0);
    const TYPES = [
      ["Коммерческая недвижимость", "building", "Офисы, ТЦ, склады, гостиницы"],
      ["Жилая недвижимость", "grid", "Многоквартирные дома, ЖК"],
      ["Промышленность", "factory", "Заводы, цехи, производства"],
      ["Линейные объекты", "globe", "Дороги, сети, трубопроводы"],
      ["Здания и сооружения", "layers", "Общественные и спец. объекты"],
      ["Частное строительство", "pin", "Дома, коттеджи, участки"],
    ];
    const SUBTYPES = {
      "Коммерческая недвижимость": ["Офис", "Торговый центр", "Склад", "Гостиница", "Бизнес-центр", "Другое"],
      "Жилая недвижимость": ["Многоквартирный дом", "ЖК", "Апартаменты", "Таунхаусы", "Другое"],
      "Промышленность": ["Завод", "Цех", "Логистический комплекс", "Энергообъект", "Другое"],
      "Линейные объекты": ["Автодорога", "Инженерные сети", "Трубопровод", "ЛЭП", "Другое"],
      "Здания и сооружения": ["Школа / детсад", "Больница", "Спортобъект", "Админздание", "Другое"],
      "Частное строительство": ["Жилой дом", "Коттедж", "Баня / хозблок", "Участок", "Другое"],
    };
    const allSections = ["АР","КР","ЭОМ","ВК","ОВиК","ПОС","ПБ","СМ","ТХ","ГП","ПЗУ","ООС"];
    const [type, setType] = React.useState("Коммерческая недвижимость");
    const [subtype, setSubtype] = React.useState("Офис");
    const [title, setTitle] = React.useState("");
    const [region, setRegion] = React.useState("Москва");
    const [stage, setStage] = React.useState("П");
    const [attract, setAttract] = React.useState("Команда");
    const [sel, setSel] = React.useState(["АР","КР","ЭОМ"]);
    const toggle = s => setSel(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
    const [budget, setBudget] = React.useState("");
    const [due, setDue] = React.useState("");
    const [byOffer, setByOffer] = React.useState(true);
    const [files, setFiles] = React.useState(0);

    const filled = [type, region && stage && attract, sel.length, (byOffer || budget) && due ? 1 : (budget || due), files].filter(Boolean).length;

    return (
      <>
        <div className="breadcrumb"><a className="link" onClick={() => go("orders")}>Заявки</a><Icon name="chevR" size={13} /> <span className="dim">Новая заявка</span></div>
        <h1 className="page-title" style={{ margin: "16px 0 26px" }}>Создание заявки</h1>

        <div className="stepper">
          {steps.map((s, i) => (
            <div key={s} className={"stepper__item" + (i === step ? " is-active" : "") + (i < step ? " is-done" : "")} onClick={() => setStep(i)}>
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
                <input className="input" placeholder="Например: ЖК «Северный парк», корпус 2" value={title} onChange={e => setTitle(e.target.value)} />
              </div>

              <div className="col gap12">
                <h3 className="section-title">Тип объекта</h3>
                <div className="grid-2">
                  {TYPES.map(([t, ic, d]) => (
                    <button type="button" key={t} className={"selectcard" + (t === type ? " is-sel" : "")} onClick={() => { setType(t); setSubtype(SUBTYPES[t][0]); }}>
                      <span className="selectcard__ic"><Icon name={ic} size={20} /></span>
                      <b>{t}</b>
                      <span className="sc-d">{d}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="field fade-in" key={type}>
                <label>Назначение объекта</label>
                <div className="row gap10 wrap">
                  {SUBTYPES[type].map(s => (
                    <button key={s} type="button" className={"pill" + (s === subtype ? " is-active" : "")} onClick={() => setSubtype(s)}>{s}</button>
                  ))}
                </div>
              </div>

              {(() => {
                const exempt = type === "Частное строительство";
                return (
                  <div className="hintbar" style={{ borderLeftColor: exempt ? "var(--green)" : "var(--blue)" }}>
                    <Icon name={exempt ? "checkCircle" : "shield"} size={18} style={{ color: exempt ? "var(--green)" : "var(--blue)" }} />
                    <div>{exempt
                      ? <><b>Экспертиза не требуется.</b> Для индивидуального жилого дома проектная документация не подлежит обязательной экспертизе.</>
                      : <><b>Потребуется экспертиза.</b> Объект капитального строительства — документация проходит государственную или негосударственную экспертизу.</>}</div>
                  </div>
                );
              })()}
            </div>}
            {step === 1 && <div className="col gap18 fade-in">
              <h3 className="section-title">Регион и стадия</h3>
              <div className="field"><label>Регион</label><input className="input" value={region} onChange={e => setRegion(e.target.value)} /></div>
              <div className="field"><label>Стадия проектирования</label><div className="row gap10 wrap">{["П","РД","ПД","Эскиз"].map((s) => <button key={s} type="button" className={"pill" + (s === stage ? " is-active" : "")} onClick={() => setStage(s)}>{s}</button>)}</div></div>
              <div className="field"><label>Тип привлечения</label><div className="row gap10 wrap">{["Один специалист","Команда","Организация"].map((s) => <button key={s} type="button" className={"pill" + (s === attract ? " is-active" : "")} onClick={() => setAttract(s)}>{s}</button>)}</div></div>
            </div>}
            {step === 2 && <div className="col gap16 fade-in">
              <h3 className="section-title">Разделы документации</h3>
              <p className="muted" style={{ margin: 0, fontSize: 14 }}>Выбрано: {sel.length}</p>
              <div className="chips">{allSections.map(s => <button key={s} className={"chip chip-toggle" + (sel.includes(s) ? " is-sel" : "")} onClick={() => toggle(s)}>{s}</button>)}</div>
            </div>}
            {step === 3 && <div className="col gap18 fade-in">
              <h3 className="section-title">Бюджет и сроки</h3>
              <div className="field"><label>Бюджет, ₽</label><input className="input" placeholder="12 000 000" value={budget} disabled={byOffer} style={{ opacity: byOffer ? .5 : 1 }} onChange={e => setBudget(e.target.value)} /></div>
              <div className="field"><label>Срок выполнения</label><input className="input" placeholder="01.09.2026" value={due} onChange={e => setDue(e.target.value)} /></div>
              <label className="row gap10" style={{ fontSize: 14, cursor: "pointer" }}><input type="checkbox" checked={byOffer} onChange={e => setByOffer(e.target.checked)} /> Ждём предложений по цене</label>
            </div>}
            {step === 4 && <div className="col gap16 fade-in">
              <h3 className="section-title">Файлы проекта</h3>
              <button type="button" className="dropzone" style={{ width: "100%", cursor: "pointer" }} onClick={() => setFiles(f => f + 1)}><Icon name="paperclip" size={26} /><div>Перетащите файлы DWG, IFC, PDF или нажмите для выбора</div></button>
              {files > 0 && <div className="muted" style={{ fontSize: 13.5 }}>Прикреплено файлов: {files}</div>}
            </div>}

            <div className="row between mt32">
              <button className="btn btn-ghost" disabled={step === 0} style={{ opacity: step === 0 ? .4 : 1 }} onClick={() => setStep(s => Math.max(0, s - 1))}>Назад</button>
              {step < steps.length - 1
                ? <button className="btn btn-primary" onClick={() => setStep(s => s + 1)}>Далее</button>
                : <button className="btn btn-primary" onClick={() => go("orders")}>Опубликовать заявку</button>}
            </div>
          </div>

          <div className="card newgrid__preview prev">
            <div className="row between" style={{ marginBottom: 16 }}>
              <span className="overline">Предпросмотр заявки</span>
              <span className="prev__count">{filled}<span className="dim">/5</span></span>
            </div>
            <div className="thumb thumb-tower" style={{ height: 110, marginBottom: 16 }} />
            <h3 style={{ margin: "0 0 4px", fontSize: 17, color: "#fff" }}>{title.trim() || "Новая заявка"}</h3>
            <div className="dim" style={{ fontSize: 12.5, marginBottom: 16 }}>Стадия {stage} · {attract}</div>

            <div className="prev__rows">
              <PrevRow icon="building" label="Тип объекта" value={subtype ? type + " · " + subtype : type} hot={step === 0} />
              <PrevRow icon="pin" label="Регион" value={region || "—"} hot={step === 1} />
              <PrevRow icon="layers" label="Стадия / привлечение" value={stage + " · " + attract} hot={step === 1} />
              {sel.length > 0 && (
                <div className={"prev__row" + (step === 2 ? " is-hot" : "")}>
                  <span className="prev__ico"><Icon name="file" size={15} /></span>
                  <div className="grow" style={{ minWidth: 0 }}>
                    <div className="prev__k">Разделы · {sel.length}</div>
                    <div className="chips" style={{ marginTop: 6 }}>{sel.map(s => <span key={s} className="chip chip-code">{s}</span>)}</div>
                  </div>
                </div>
              )}
              {(budget || due || byOffer) && (
                <PrevRow icon="calendar" label="Срок" value={due || "по согласованию"} hot={step === 3} />
              )}
              {files > 0 && <PrevRow icon="paperclip" label="Файлы" value={files + " шт."} hot={step === 4} />}
            </div>

            <div className="prev__price">
              {byOffer || !budget
                ? <span className="row gap8" style={{ color: "var(--amber)", fontWeight: 700, fontSize: 18 }}><Icon name="wallet" size={18} />Ждём предложений</span>
                : <span className="price" style={{ fontSize: 22 }}><Icon name="wallet" size={18} style={{ color: "var(--accent-2)" }} /> {budget} ₽</span>}
            </div>
          </div>
        </div>
      </>
    );
  }

  Object.assign(window, { Orders, OrderDetail, OrderNew, StatusBadge, OrderCard });
})();
