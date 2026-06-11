/* screens_catalog.jsx — Designers, DesignerProfile, Experts, Manufacturers */
(function () {
  const Icon = window.Icon, Avatar = window.Avatar;

  const grad = (a, b) => ({ background: `linear-gradient(135deg, ${a}, ${b})` });
  function Ava({ text, g, size = 44 }) {
    return <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.34, ...grad(g[0], g[1]) }}>{text}</div>;
  }
  /* фото-аватар в стиле главной: фото + ободок + индикатор, с fallback на градиент с инициалами */
  function PhotoAva({ d, size = 44, ring = true, dot }) {
    const [err, setErr] = React.useState(false);
    const initials = d.name.replace(/[^А-ЯA-Z]/g, "").slice(0, 2);
    const showImg = d.photo && !err;
    const px = Math.round(size * 2);
    const src = d.photo ? `${d.photo}?w=${px}&h=${px}&fit=crop&crop=faces` : null;
    return (
      <span className={"tl-avatar" + (ring ? " tl-avatar--ring" : "")}
        style={{ width: size, height: size, fontSize: size * 0.36, ...(showImg ? {} : grad(d.g[0], d.g[1])) }}>
        {showImg
          ? <img src={src} alt="" onError={() => setErr(true)} />
          : <span className="tl-avatar__fb">{initials}</span>}
        {dot && <span className="tl-avatar__dot" />}
      </span>
    );
  }
  function Stars({ v }) {
    return <span className="row gap6" style={{ fontSize: 13.5, color: "var(--text-dim)" }}><Icon name="star" size={14} style={{ color: "var(--amber)" }} />{v}</span>;
  }

  /* ============ DESIGNERS ============ */
  const DESIGNERS = [
    { name: "Вадим Петров", org: false, photo: "https://images.unsplash.com/photo-1633332755192-727a05c4013d", codes: ["КР","АР"], city: "Санкт-Петербург", sro: "СРО НБПИ-04-032", rating: "4.8", projects: 21, g: ["#f76f9e","#f0507f"], featured: true },
    { name: "ООО «ПроектСити»", org: true, codes: ["КР"], city: "Москва", sro: "СРО ДОМФ-01-134", rating: "4.7", projects: 86, g: ["#4aa3ff","#3b7ff0"] },
    { name: "Андрей Смирнов", org: false, photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e", codes: ["КР"], city: "Воронеж", sro: "СРО ПТЗ-05-456", rating: "4.5", projects: 48, g: ["#3ad6a6","#22b886"] },
    { name: "АрхПроект Строй", org: true, codes: ["КР","АР"], city: "Санкт-Петербург", sro: "СРО ППЦ-02-467", rating: "4.7", projects: 66, g: ["#f5933d","#ec6f2a"] },
    { name: "Елена Волкова", org: false, photo: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e", codes: ["ЭОМ","ВК"], city: "Москва", sro: "СРО ИНЖ-07-891", rating: "4.9", projects: 74, g: ["#a06bf5","#7d52e8"] },
    { name: "ООО «СПД»", org: true, codes: ["ТУС"], city: "Москва", sro: "СРО СПП-77-187", rating: "4.5", projects: 188, g: ["#5ad0e0","#3aa9d8"] },
  ];

  function PersonCard({ d, go, accent = "designers" }) {
    return (
      <div className={"card card-hover personcard" + (d.featured ? " is-featured" : "")}>
        <div className="row gap12" style={{ marginBottom: 14 }}>
          <PhotoAva d={d} dot={!d.org} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{d.name}</div>
            <div className="chips" style={{ marginTop: 6 }}>{d.codes.map(c => <span key={c} className="chip chip-code">{c}</span>)}</div>
          </div>
        </div>
        <div className="col gap8 muted" style={{ fontSize: 13.5, marginBottom: 14 }}>
          <span className="row gap6"><Icon name="pin" size={14} />{d.city}</span>
          <span className="row gap6"><Icon name="building" size={14} />{d.sro}</span>
          <span className="row gap16"><Stars v={d.rating} /><span className="row gap6"><Icon name="portfolio" size={14} />{d.projects} проектов</span></span>
        </div>
        <div className="row gap8">
          <button className="btn btn-ghost btn-sm grow" onClick={() => go("designer-profile")}>Открыть профиль</button>
          <button className="btn btn-primary btn-sm" onClick={() => go("order-detail", 1)}>Выбрать <Icon name="arrowRight" size={14} /></button>
        </div>
      </div>
    );
  }

  function CatalogTopFilters({ chips, active, onPick }) {
    return (
      <div className="chips" style={{ marginBottom: 22 }}>
        {chips.map(c => <button key={c} className={"pill" + (c === active ? " is-active" : "")} onClick={() => onPick(c)}>{c}</button>)}
        <button className="pill">…</button>
      </div>
    );
  }

  const RATE_STEPS = [["Любой", 0, "#9ca3af"], ["4.0+", 4.0, "#f5b13d"], ["4.5+", 4.5, "#facc15"], ["4.8+", 4.8, "#34d399"]];
  const HINTS = [
    ["pin", "КР в Москве", d => d.codes.includes("КР") && d.city === "Москва"],
    ["compass", "АР в Петербурге", d => d.codes.includes("АР") && d.city === "Санкт-Петербург"],
    ["building", "Только организации", d => d.org],
    ["portfolio", "50+ проектов", d => d.projects >= 50],
  ];

  function RateScale({ value, onPick }) {
    return (
      <div className="ratescale" title="Минимальный рейтинг">
        {RATE_STEPS.map(([label, v, c]) => (
          <button key={label} className={value === v ? "is-on" : ""} style={{ "--dot": c }} onClick={() => onPick(v)}><i />{label}</button>
        ))}
      </div>
    );
  }

  function CatHints({ active, onPick }) {
    return (
      <div className="cat-hints">
        {HINTS.map(([ic, label], i) => (
          <button key={label} className={"cat-hint" + (active === i ? " is-on" : "")} onClick={() => onPick(active === i ? null : i)}>
            <Icon name={ic} size={14} />{label}
          </button>
        ))}
      </div>
    );
  }

  function FilterPills() {
    return (
      <>
        <span className="pill"><Icon name="pin" />Регион</span>
        <span className="pill"><Icon name="layers" />Раздел</span>
        <span className="pill"><Icon name="building" />СРО</span>
        <span className="pill"><Icon name="filter" />Фильтры</span>
      </>
    );
  }

  function PromptSearch({ value, onChange, placeholder }) {
    const [files, setFiles] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const taRef = React.useRef(null);
    const fileRef = React.useRef(null);

    React.useLayoutEffect(() => {
      const ta = taRef.current; if (!ta) return;
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
    }, [value]);

    const has = (value || "").trim().length > 0 || files.length > 0;
    const submit = () => {
      if (!has || loading) return;
      setLoading(true);
      setTimeout(() => setLoading(false), 1400);
    };
    const addFiles = (e) => {
      const list = Array.from(e.target.files || []);
      if (list.length) setFiles(p => [...p, ...list]);
      e.target.value = "";
    };
    const removeFile = (i) => setFiles(p => p.filter((_, idx) => idx !== i));

    return (
      <div className="psearch">
        {files.length > 0 && (
          <div className="psearch__files">
            {files.map((f, i) => (
              <span key={i} className="psearch__file">
                <Icon name="paperclip" /><b>{f.name}</b>
                <button onClick={() => removeFile(i)} aria-label="Убрать"><Icon name="x" size={13} /></button>
              </span>
            ))}
          </div>
        )}
        <textarea ref={taRef} rows={1} className="psearch__ta" value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder || "Опишите, какой специалист нужен — раздел, регион, опыт…"}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }} />
        <div className="psearch__bar">
          <label className="psearch__act psearch__attach" data-tip="Прикрепить файлы">
            <input ref={fileRef} type="file" multiple hidden onChange={addFiles} />
            <Icon name="paperclip" />
          </label>
          <span className="psearch__spacer" />
          <button className={"psearch__act psearch__send" + (has ? " is-on" : "")} disabled={!has}
            data-tip={loading ? "Остановить" : "Найти"} onClick={submit} aria-label="Найти">
            {loading ? <span className="psearch__sq" /> : <Icon name="send" />}
          </button>
        </div>
      </div>
    );
  }

  function Designers({ go, header = "Слева" }) {
    const [q, setQ] = React.useState("");
    const [rate, setRate] = React.useState(0);
    const [hint, setHint] = React.useState(null);
    const spot = DESIGNERS[0];
    const centered = header === "По центру";

    const query = q.trim().toLowerCase();
    const list = DESIGNERS.filter(d =>
      parseFloat(d.rating) >= rate &&
      (hint == null || HINTS[hint][2](d)) &&
      (!query || d.name.toLowerCase().includes(query) || d.city.toLowerCase().includes(query))
    );
    const reset = () => { setQ(""); setRate(0); setHint(null); };

    const searchBox = <PromptSearch value={q} onChange={setQ} />;

    const grid = list.length
      ? <div className="orders-grid">{list.map(d => <PersonCard key={d.name} d={d} go={go} />)}</div>
      : (
        <div className="card" style={{ textAlign: "center", padding: 40 }}>
          <p className="muted" style={{ margin: "0 0 16px", fontSize: 14.5 }}>По заданным условиям никого не нашлось.</p>
          <button className="btn btn-outline btn-sm" onClick={reset}>Сбросить фильтры</button>
        </div>
      );

    return (
      <>
        {centered ? (
          <div className="cat-hero">
            <p className="cat-eyebrow">Каталог</p>
            <h1 className="cat-title">Проектировщики и организации</h1>
            <p className="cat-lead">Верифицированные специалисты и бюро с СРО, рейтингом и портфолио. Подберите исполнителя под раздел, регион и бюджет.</p>
            {searchBox}
            <CatHints active={hint} onPick={setHint} />
          </div>
        ) : (
          <div className="cat-head">
            <div>
              <p className="cat-eyebrow">Каталог</p>
              <h1 className="cat-title">Проектировщики<br />и организации</h1>
              <p className="cat-lead">Верифицированные специалисты и бюро с СРО, рейтингом и портфолио. Подберите исполнителя под раздел, регион и бюджет.</p>
            </div>
            <div className="cat-head__filters">
              <div className="viewtoggle">{["list","columns","menu"].map((v, i) => <button key={v} className={i === 0 ? "is-active" : ""}><Icon name={v === "list" ? "list" : v === "columns" ? "columns" : "user"} /></button>)}</div>
              <FilterPills />
            </div>
          </div>
        )}

        {centered && (
          <div className="row gap10 wrap" style={{ marginBottom: 22 }}>
            <div className="viewtoggle">{["list","columns","menu"].map((v, i) => <button key={v} className={i === 0 ? "is-active" : ""}><Icon name={v === "list" ? "list" : v === "columns" ? "columns" : "user"} /></button>)}</div>
            <FilterPills />
            <span className="grow" />
            <RateScale value={rate} onPick={setRate} />
          </div>
        )}

        <div className="catalog">
          <div className="col gap16" style={{ minWidth: 0 }}>
            {!centered && searchBox}
            {!centered && <CatHints active={hint} onPick={setHint} />}
            {!centered && (
              <div className="row gap12 wrap between">
                <RateScale value={rate} onPick={setRate} />
                <span className="dim" style={{ fontSize: 13 }}>Найдено: {list.length} из {DESIGNERS.length}</span>
              </div>
            )}
            {grid}
          </div>

          <div className="col gap20">
            <div className="card spotlight">
              <div style={{ display: "flex", justifyContent: "center" }}><PhotoAva d={spot} size={84} dot={!spot.org} /></div>
              <h3 style={{ textAlign: "center", margin: "16px 0 8px", fontSize: 19 }}>{spot.name}</h3>
              <div className="chips" style={{ justifyContent: "center", marginBottom: 12 }}>{spot.codes.map(c => <span key={c} className="chip chip-code">{c}</span>)}</div>
              <div className="col gap8 muted" style={{ fontSize: 13.5, textAlign: "center", marginBottom: 16 }}>
                <span>{spot.sro}</span>
                <span className="row gap6" style={{ justifyContent: "center" }}><Icon name="phone" size={14} />+7 987 125-45-67</span>
                <span className="row gap6" style={{ justifyContent: "center" }}><Icon name="pin" size={14} />Санкт-Петербург, ПО, МСК</span>
              </div>
              <button className="btn btn-primary btn-block" onClick={() => go("designer-profile")}>Связаться</button>
            </div>

            <div className="card">
              <h3 className="row gap8 section-title" style={{ fontSize: 16, marginBottom: 14 }}><Icon name="globe" size={17} style={{ color: "var(--accent-2)" }} />Регион</h3>
              <div className="col gap10 muted" style={{ fontSize: 13.5 }}>
                <span className="row gap6"><Icon name="pin" size={14} />Санкт-Петербург, ПО, МСК</span>
                <span className="row gap16"><Stars v="4.8" /><span>21 проект</span></span>
                {["С 2020 года в проектировании","3 года стажа","Первые места в конкурсах"].map(t => <span key={t} className="row gap8"><Icon name="check" size={14} style={{ color: "var(--green)" }} />{t}</span>)}
              </div>
              <button className="btn btn-outline btn-sm btn-block mt16" onClick={() => go("designer-profile")}>Смотреть все</button>
            </div>

            <div className="card">
              <h3 className="section-title" style={{ fontSize: 16, marginBottom: 14 }}>Последние проекты</h3>
              <div className="grid-2" style={{ gap: 12 }}>
                {[["ЖК Ренессанс","Санкт-Петербург"],["МФК Старый город","Москва"],["Торговый центр","Москва"],["Приморский центр","Новосибирск"]].map(([t, c]) => (
                  <div key={t}><div className="thumb thumb-tower" style={{ height: 76 }} /><div style={{ fontSize: 13, fontWeight: 600, marginTop: 8 }}>{t}</div><div className="dim" style={{ fontSize: 12 }}>{c}</div></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ============ DESIGNER PROFILE ============ */
  function DesignerProfile({ go }) {
    const [tab, setTab] = React.useState("Обзор");

    const PORTFOLIO = [
      { t: "ЖК «Северный парк»", c: "Санкт-Петербург", role: "АР · КР", year: "2024", area: "78 400 м²", status: ["done", "Сдан"] },
      { t: "МФК «Старый город»", c: "Москва", role: "АР", year: "2023", area: "42 100 м²", status: ["done", "Сдан"] },
      { t: "БЦ «Приморский»", c: "Владивосток", role: "КР", year: "2023", area: "31 800 м²", status: ["done", "Сдан"] },
      { t: "ЖК «Ренессанс»", c: "Санкт-Петербург", role: "АР · КР", year: "2025", area: "96 200 м²", status: ["work", "В работе"] },
    ];
    const REVIEWS = [
      { ini: "ДК", g: ["#4aa3ff", "#3b7ff0"], name: "Дмитрий Карпов", org: "ООО «СтройИнвест»", r: "5.0", date: "12 марта 2025", proj: "ЖК «Северный парк»",
        text: "Раздел КР выполнен раньше срока, все замечания экспертизы сняты с первой итерации. Олег на связи постоянно — отвечает в течение получаса. Однозначно рекомендую." },
      { ini: "АН", g: ["#3ad6a6", "#22b886"], name: "Анна Новикова", org: "ИП Новикова", r: "4.5", date: "28 января 2025", proj: "МФК «Старый город»",
        text: "Грамотный архитектор, аккуратная документация по ГОСТ. Пара правок по планировкам заняла время, но итог отличный." },
      { ini: "СМ", g: ["#f5933d", "#ec6f2a"], name: "Сергей Морозов", org: "ООО «Девелопмент-Групп»", r: "5.0", date: "9 декабря 2024", proj: "БЦ «Приморский»",
        text: "Сложный объект с ограничениями по участку — решение нашли быстро. BIM-модель чистая, коллизий минимум. Будем работать снова." },
    ];
    const DOCS = [
      { ic: "building", name: "Выписка из реестра СРО", sub: "СРО НБПИ-04-032 · Действует до 14.08.2026", tag: ["done", "Активно"] },
      { ic: "cert", name: "Специалист НРС (ГИП)", sub: "№ П-145122 · Минстрой России", tag: ["done", "Активно"] },
      { ic: "award", name: "Диплом СПбГАСУ", sub: "Архитектор · 2012 год", tag: null },
      { ic: "shield", name: "Страхование ответственности", sub: "Полис № 24/0915 · до 31.12.2025", tag: ["wait", "Истекает"] },
    ];

    const reviewAgg = [["5★", 78], ["4★", 18], ["3★", 4], ["2★", 0], ["1★", 0]];

    const Main = () => {
      if (tab === "Портфолио") return (
        <div className="card" style={{ minWidth: 0 }}>
          <div className="row between" style={{ marginBottom: 16 }}>
            <h3 className="section-title" style={{ margin: 0 }}>Портфолио · 198 проектов</h3>
            <span className="dim" style={{ fontSize: 13 }}>Показаны 4 последних</span>
          </div>
          <div className="grid-2" style={{ gap: 16 }}>
            {PORTFOLIO.map(p => (
              <div key={p.t} className="card card-hover" style={{ padding: 0, overflow: "hidden" }}>
                <div className="thumb thumb-tower" style={{ height: 132, borderRadius: 0 }} />
                <div style={{ padding: 16 }}>
                  <div className="row between" style={{ marginBottom: 8 }}>
                    <span className={"badge " + p.status[0]}><i />{p.status[1]}</span>
                    <span className="dim" style={{ fontSize: 12.5 }}>{p.year}</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{p.t}</div>
                  <div className="col gap6 muted mt12" style={{ fontSize: 13 }}>
                    <span className="row gap6"><Icon name="pin" size={13} />{p.c}</span>
                    <span className="row gap16"><span className="row gap6"><Icon name="layers" size={13} />{p.role}</span><span className="row gap6"><Icon name="portfolio" size={13} />{p.area}</span></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
      if (tab === "Отзывы") return (
        <div className="card" style={{ minWidth: 0 }}>
          <div className="row gap24 wrap" style={{ marginBottom: 22, alignItems: "center" }}>
            <div style={{ textAlign: "center", paddingRight: 24, borderRight: "1px solid var(--border)" }}>
              <div style={{ fontSize: 42, fontWeight: 800, color: "#fff", lineHeight: 1 }}>4.6</div>
              <div className="row gap4" style={{ justifyContent: "center", marginTop: 8 }}>{[0,1,2,3,4].map(i => <Icon key={i} name="star" size={14} style={{ color: i < 4 ? "var(--amber)" : "var(--text-mute)" }} />)}</div>
              <div className="dim" style={{ fontSize: 12.5, marginTop: 6 }}>76 отзывов</div>
            </div>
            <div className="col gap8 grow" style={{ minWidth: 220 }}>
              {reviewAgg.map(([lbl, pct]) => (
                <div key={lbl} className="row gap10" style={{ fontSize: 12.5 }}>
                  <span className="muted" style={{ width: 26 }}>{lbl}</span>
                  <span className="grow" style={{ height: 6, borderRadius: 99, background: "var(--surface-3)", overflow: "hidden" }}><span style={{ display: "block", height: "100%", width: pct + "%", background: "var(--amber)" }} /></span>
                  <span className="dim" style={{ width: 34, textAlign: "right" }}>{pct}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="col gap16">
            {REVIEWS.map(rv => (
              <div key={rv.name} className="card" style={{ background: "var(--surface-2)" }}>
                <div className="row gap12" style={{ marginBottom: 10 }}>
                  <Ava text={rv.ini} g={rv.g} size={40} />
                  <div className="grow">
                    <div className="row between"><div style={{ fontWeight: 700, fontSize: 14 }}>{rv.name}</div><Stars v={rv.r} /></div>
                    <div className="dim" style={{ fontSize: 12.5 }}>{rv.org} · {rv.date}</div>
                  </div>
                </div>
                <p className="muted" style={{ margin: "0 0 10px", fontSize: 13.5, lineHeight: 1.55 }}>{rv.text}</p>
                <span className="chip"><Icon name="portfolio" size={13} />{rv.proj}</span>
              </div>
            ))}
          </div>
        </div>
      );
      if (tab === "Документы и СРО") return (
        <div className="card" style={{ minWidth: 0 }}>
          <h3 className="section-title" style={{ marginBottom: 6 }}>Документы и допуски</h3>
          <p className="muted" style={{ margin: "0 0 18px", fontSize: 13.5 }}>Документы проверены платформой «Функция». Членство в СРО подтверждено в реестре НОПРИЗ.</p>
          <div className="col gap10">
            {DOCS.map(d => (
              <div key={d.name} className="row gap14" style={{ padding: "14px 16px", borderRadius: 12, background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, display: "grid", placeItems: "center", background: "var(--accent-soft)", color: "var(--accent-2)", flex: "none" }}><Icon name={d.ic} size={20} /></div>
                <div className="grow" style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{d.name}</div>
                  <div className="dim" style={{ fontSize: 12.5, marginTop: 2 }}>{d.sub}</div>
                </div>
                {d.tag && <span className={"badge " + d.tag[0]}><i />{d.tag[1]}</span>}
                <button className="iconbtn" title="Скачать"><Icon name="download" size={17} /></button>
              </div>
            ))}
          </div>
        </div>
      );
      return (
        <div className="card" style={{ minWidth: 0 }}>
          <h3 className="section-title" style={{ marginBottom: 14 }}>О специалисте</h3>
          <p className="muted" style={{ lineHeight: 1.6, fontSize: 14.5, marginTop: 0 }}>Архитектор с опытом проектирования жилых комплексов. Работает в AutoCAD, Revit и ArchiCAD. Специализация — многоквартирные дома бизнес-класса и комплексное освоение территорий.</p>
          <div className="grid-2 mt24" style={{ gap: 28 }}>
            <div>
              <div className="overline">Программное обеспечение</div>
              <div className="chips mt12">{["AutoCAD","Revit","Navisworks","Lira-SAPR"].map(s => <span key={s} className="chip">{s}</span>)}</div>
            </div>
            <div>
              <div className="overline">Достижения на Функции</div>
              <div className="col gap10 mt12">{["Топ-10 архитекторов СПб","98% успешных сделок","12 лет на рынке ПИР"].map(s => <span key={s} className="row gap8" style={{ fontSize: 14 }}><Icon name="checkCircle" size={16} style={{ color: "var(--green)" }} />{s}</span>)}</div>
            </div>
          </div>
          <div className="divider mt24" />
          <div className="overline mt24">Разделы документации</div>
          <div className="chips mt12">{["АР","КР","ГП","ПОС"].map(c => <span key={c} className="chip chip-code">{c}</span>)}</div>
        </div>
      );
    };

    return (
      <>
        <div className="breadcrumb"><a className="link" onClick={() => go("designers")}>Каталог специалистов</a><Icon name="chevR" size={13} /> <span className="dim">Олег Соколов</span></div>

        <div className="profile-hero">
          <div className="profile-hero__bg" />
          <div className="profile-hero__row">
            <PhotoAva d={{ name: "Олег Соколов", photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d", g: ["#a06bf5","#7d52e8"] }} size={108} dot />
            <div className="grow">
              <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 8px", color: "#fff" }}>Олег Соколов</h1>
              <div className="meta-row" style={{ fontSize: 14 }}><span><Icon name="pin" />Санкт-Петербург</span><Stars v="4.6 (Рейтинг)" /></div>
              <div className="chips mt12">{["АР","КР"].map(c => <span key={c} className="chip chip-code">{c}</span>)}</div>
            </div>
            <div className="row gap10">
              <button className="btn btn-ghost" onClick={() => go("chat")}><Icon name="comment" size={15} /> Написать</button>
              <button className="btn btn-primary" onClick={() => go("order-detail", 1)}><Icon name="rocket" size={15} /> Пригласить в проект</button>
            </div>
          </div>
        </div>

        <div className="tabs">{["Обзор","Портфолио","Отзывы","Документы и СРО"].map(t => <button key={t} className={"tab" + (t === tab ? " is-active" : "")} onClick={() => setTab(t)}>{t}</button>)}</div>

        <div className="detail__grid">
          <Main />

          <div className="col gap20">
            <div className="card">
              <div className="row between" style={{ marginBottom: 12 }}><span className="dim" style={{ fontSize: 13, fontWeight: 600 }}>График загрузки</span><span className="badge done"><i />Свободен</span></div>
              <p className="muted" style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55 }}>Готов взять проект в работу прямо сейчас. Среднее время ответа на заявку — менее 30 минут.</p>
            </div>
            <div className="card">
              <h3 className="section-title" style={{ fontSize: 16, marginBottom: 16 }}>Статистика профиля</h3>
              <div className="col gap14">
                {[["Выполнено на платформе","198 проектов"],["Стаж работы","12 лет"],["Процент успешных сделок","98%"],["Рейтинг заказчиков","4.6 / 5.0"]].map(([k, v]) => (
                  <div key={k} className="row between" style={{ fontSize: 14 }}><span className="muted">{k}</span><b style={{ color: v.includes("%") || v.includes("/") ? "var(--accent-2)" : "#fff" }}>{v}</b></div>
                ))}
              </div>
            </div>
            <div className="card">
              <h3 className="section-title" style={{ fontSize: 16, marginBottom: 14 }}>Контактные данные</h3>
              <div className="col gap12 muted" style={{ fontSize: 14 }}>
                <span className="row gap10"><Icon name="phone" size={16} style={{ color: "var(--accent-2)" }} />+7 912 345-67-89</span>
                <span className="row gap10"><Icon name="mail" size={16} style={{ color: "var(--accent-2)" }} />sokolov@proekt.ru</span>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ============ EXPERTS ============ */
  const EXPERTS = [
    { name: "Ковалёв Иван Иванович", org: false, photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d", tags: ["Проверка узлов (КР)","Аудит смет"], city: "Санкт-Петербург", lic: "Специалист НРС №145122", rating: "4.8", checks: 94, g: ["#4aa3ff","#3b7ff0"] },
    { name: "АО «BIM Технологии»", org: true, tags: ["BIM/ТИМ контроль","Инженерные сети"], city: "Казань", lic: "ISO-19650 Сертификат", rating: "4.7", checks: 156, g: ["#a06bf5","#7d52e8"] },
    { name: "Ефремова Анна", org: false, photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80", tags: ["Инженерные сети","BIM/ТИМ контроль"], city: "Новосибирск", lic: "Инженер-эксперт ПБ", rating: "5.0", checks: 58, g: ["#f5933d","#ec6f2a"] },
    { name: "Центр Сметного Аудита", org: true, tags: ["Аудит смет","Негос. экспертиза ПД"], city: "Краснодар", lic: "Лицензия №24/11", rating: "4.6", checks: 812, g: ["#f76f9e","#f0507f"] },
  ];
  const EXPERT_HINTS = [
    ["shield", "Негос. экспертиза", e => e.tags.some(t => t.includes("экспертиза"))],
    ["bim", "BIM / ТИМ", e => e.tags.some(t => t.includes("BIM"))],
    ["building", "Только организации", e => e.org],
    ["checkCircle", "100+ проверок", e => e.checks >= 100],
  ];
  function Experts({ go }) {
    const [q, setQ] = React.useState("");
    const [rate, setRate] = React.useState(0);
    const [hint, setHint] = React.useState(null);
    const PromptSearch = window.PromptSearch;

    const query = q.trim().toLowerCase();
    const list = EXPERTS.filter(e =>
      parseFloat(e.rating) >= rate &&
      (hint == null || EXPERT_HINTS[hint][2](e)) &&
      (!query || e.name.toLowerCase().includes(query) || e.city.toLowerCase().includes(query) || e.tags.join(" ").toLowerCase().includes(query))
    );
    const reset = () => { setQ(""); setRate(0); setHint(null); };

    return (
      <>
        <div className="cat-head">
          <div>
            <p className="cat-eyebrow">Экспертиза</p>
            <h1 className="cat-title">Эксперты<br />и BIM-контроль</h1>
            <p className="cat-lead">Аккредитованные эксперты и организации для проверки разделов, аудита смет и BIM/ТИМ-контроля. Выберите исполнителя под тип экспертизы.</p>
          </div>
          <div className="cat-head__filters">
            <div className="viewtoggle"><button className="is-active"><Icon name="list" /></button><button><Icon name="shield" /></button></div>
            <span className="pill"><Icon name="pin" />Регион</span>
            <span className="pill"><Icon name="shield" />Тип проверки</span>
            <span className="pill"><Icon name="cert" />Сертификаты</span>
          </div>
        </div>

        <div className="catalog">
          <div className="col gap16" style={{ minWidth: 0 }}>
            {PromptSearch && <PromptSearch value={q} onChange={setQ} placeholder="Опишите, какая экспертиза нужна — разделы, аудит, BIM…" />}
            <div className="cat-hints">
              {EXPERT_HINTS.map(([ic, label], i) => (
                <button key={label} className={"cat-hint" + (hint === i ? " is-on" : "")} onClick={() => setHint(hint === i ? null : i)}><Icon name={ic} size={14} />{label}</button>
              ))}
            </div>
            <div className="row gap12 wrap between">
              <RateScale value={rate} onPick={setRate} />
              <span className="dim" style={{ fontSize: 13 }}>Найдено: {list.length} из {EXPERTS.length}</span>
            </div>

            <div className="card is-featured" style={{ borderColor: "rgba(52,211,153,.3)" }}>
              <div className="row gap12" style={{ marginBottom: 12 }}>
                <PhotoAva d={{ name: "ЭР", g: ["#3ad6a6","#22b886"] }} />
                <div><div className="row gap8" style={{ fontWeight: 700, fontSize: 16 }}>ООО «Эксперт-Регион» <span className="row gap4" style={{ color: "var(--green)", fontSize: 13 }}><Icon name="check" size={14} />Лидер отрасли</span></div></div>
              </div>
              <div className="chips" style={{ marginBottom: 12 }}><span className="chip" style={{ background: "rgba(52,211,153,.14)", color: "var(--green)" }}>Негосударственная экспертиза ПД</span><span className="chip" style={{ background: "rgba(52,211,153,.14)", color: "var(--green)" }}>Аудит смет</span></div>
              <div className="meta-row" style={{ fontSize: 13.5 }}><span><Icon name="pin" />Москва</span><span><Icon name="cert" />Аккредитация МИНСТРОЙ №0015</span></div>
              <div className="row between mt16"><span className="row gap16"><Stars v="4.9" /><span className="row gap6 muted" style={{ fontSize: 13 }}><Icon name="checkCircle" size={14} style={{ color: "var(--green)" }} />412 заключений</span></span>
                <button className="btn btn-sm" style={{ background: "linear-gradient(135deg,#2fbf8a,#22b886)", color: "#fff" }} onClick={() => go("expertise")}>Заказать экспертизу <Icon name="arrowRight" size={14} /></button></div>
            </div>

            {list.length ? (
              <div className="orders-grid">
                {list.map(e => (
                  <div key={e.name} className="card card-hover personcard">
                    <div className="row gap12" style={{ marginBottom: 14 }}>
                      <PhotoAva d={e} dot={!e.org} />
                      <div><div style={{ fontWeight: 700, fontSize: 14.5 }}>{e.name}</div><div className="chips" style={{ marginTop: 6 }}>{e.tags.map(t => <span key={t} className="chip">{t}</span>)}</div></div>
                    </div>
                    <div className="col gap8 muted" style={{ fontSize: 13.5, marginBottom: 14 }}>
                      <span className="row gap6"><Icon name="pin" size={14} />{e.city}</span>
                      <span className="row gap6"><Icon name="cert" size={14} />{e.lic}</span>
                      <span className="row gap16"><Stars v={e.rating} /><span className="row gap6"><Icon name="checkCircle" size={14} style={{ color: "var(--green)" }} />{e.checks} проверок</span></span>
                    </div>
                    <button className="btn btn-primary btn-sm btn-block" onClick={() => go("expertise")}>Выбрать <Icon name="arrowRight" size={14} /></button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card" style={{ textAlign: "center", padding: 40 }}>
                <p className="muted" style={{ margin: "0 0 16px", fontSize: 14.5 }}>По заданным условиям никого не нашлось.</p>
                <button className="btn btn-outline btn-sm" onClick={reset}>Сбросить фильтры</button>
              </div>
            )}
          </div>

          <div className="col gap20">
            <div className="card spotlight">
              <div style={{ display: "flex", justifyContent: "center" }}><PhotoAva d={{ name: "ЭР", g: ["#3ad6a6","#22b886"] }} size={84} /></div>
              <h3 style={{ textAlign: "center", margin: "16px 0 12px", fontSize: 18 }}>ООО «Эксперт-Регион»</h3>
              <div className="col gap8 muted" style={{ fontSize: 13.5, textAlign: "center", marginBottom: 16 }}>
                <span className="row gap6" style={{ justifyContent: "center" }}><Icon name="cert" size={14} />Аккредитация МИНСТРОЙ №0015</span>
                <span className="row gap6" style={{ justifyContent: "center" }}><Icon name="phone" size={14} />+7 495 222-33-44</span>
                <span className="row gap6" style={{ justifyContent: "center" }}><Icon name="mail" size={14} />info@expert-region.ru</span>
              </div>
              <button className="btn btn-block" style={{ background: "linear-gradient(135deg,#2fbf8a,#22b886)", color: "#fff" }} onClick={() => go("expertise")}>Связаться</button>
              <button className="btn btn-outline btn-block mt12">Запросить договор</button>
            </div>
            <div className="card">
              <h3 className="row gap8 section-title" style={{ fontSize: 16, marginBottom: 14 }}><Icon name="chart" size={17} style={{ color: "var(--green)" }} />Статистика</h3>
              <div className="col gap10 muted" style={{ fontSize: 13.5 }}>
                <span className="row gap16"><Stars v="4.9 / 5.0" /><span>Высокая оценка</span></span>
                <span className="row gap16"><b style={{ color: "#fff" }}>412</b> заключений · 8 лет опыта</span>
                {["Допуск к объектам гос. значения","Проверка сметной документации","Полная материальная ответственность"].map(t => <span key={t} className="row gap8"><Icon name="check" size={14} style={{ color: "var(--green)" }} />{t}</span>)}
              </div>
            </div>
            <div className="card">
              <h3 className="section-title" style={{ fontSize: 16, marginBottom: 14 }}>Выданы заключения</h3>
              <div className="col gap12">
                {[["ЖК «Симфония»","Положительное · 14 разделов"],["Складской комплекс","Положительное · КР, ОВиК"],["Школа на 1200 мест","Положительное · Полная экспертиза"]].map(([t, s]) => (
                  <div key={t} className="row gap12"><div className="thumb thumb-tower" style={{ width: 56, height: 44 }} /><div><div style={{ fontSize: 13.5, fontWeight: 600 }}>{t}</div><div style={{ fontSize: 12, color: "var(--green)" }}>{s}</div></div></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ============ MANUFACTURERS ============ */
  const MANUF = [
    { name: "ООО «ТехФасад»", type: "org", desc: "Производитель фасадных систем и узлов для жилых и коммерческих зданий", chips: ["BIM","Узлы","СП / ГОСТ","АР / КР"], rating: "4.8", projects: 120, geo: "РФ / СНГ", g: ["#a06bf5","#7d52e8"], featured: true, contacts: true },
    { name: "Завод ЖБИ «ЗапСибСтрой»", type: "org", desc: "Производство ЖБИ изделий для промышленного и гражданского строительства", chips: ["КР","Нормативы","Промышленность"], rating: "4.9", projects: 87, geo: "РФ / СНГ", g: ["#4aa3ff","#3b7ff0"] },
    { name: "АО «ПрофМет»", type: "org", desc: "Производитель металлических конструкций, поставщик для кровельных систем", chips: ["КР","Металл","ГОСТ"], rating: "4.6", projects: 65, geo: "РФ", g: ["#f5933d","#ec6f2a"] },
    { name: "СтальПром Урал", type: "org", desc: "Изготовление и монтаж металлоконструкций, узлы крепления, опорные системы", chips: ["КР","Узлы","ГОСТ"], rating: "4.7", projects: 53, geo: "РФ", g: ["#3ad6a6","#22b886"] },
  ];
  const PRODUCTS = [
    { name: "Фасадная система F-300", sub: "Навес на фасад", chips: ["BIM","Узлы","FC","Сертификаты"], spec: "СП 60, ГОСТ-31231", certs: 18 },
    { name: "Узел крепления UF-12", sub: "Узел фасада", chips: ["BIM","Узлы","ГОСТ","КР"], spec: "ФС ГОСТ-31231", certs: 68 },
  ];
  function Manufacturers({ go }) {
    return (
      <>
        <h1 className="page-title" style={{ maxWidth: 500, lineHeight: 1.12, marginBottom: 22 }}>Каталог производителей и технических решений</h1>
        <div className="topbar__search" style={{ maxWidth: "none", height: 50, marginBottom: 18 }}><Icon name="search" /><input placeholder="Поиск по продуктам, BIM, брендам" /></div>
        <div className="chips" style={{ marginBottom: 24 }}>
          <span className="pill"><Icon name="layers" />Раздел</span>
          <span className="pill is-active"><Icon name="database" />Нормативы</span>
          <span className="pill"><Icon name="filter" />Фильтры</span>
        </div>

        <div className="orders-grid">
          {MANUF.map(m => (
            <div key={m.name} className={"card card-hover" + (m.featured ? " is-featured" : "")}>
              <div className="row gap12" style={{ marginBottom: 14 }}>
                <div className="manuf__logo" style={grad(m.g[0], m.g[1])}><Icon name="factory" size={22} /></div>
                <div><div style={{ fontWeight: 700, fontSize: 16 }}>{m.name}</div><p className="muted" style={{ margin: "4px 0 0", fontSize: 13.5, lineHeight: 1.45 }}>{m.desc}</p></div>
              </div>
              {m.contacts && <div className="card" style={{ background: "var(--surface-2)", padding: 14, marginBottom: 14 }}>
                <div className="col gap8 muted" style={{ fontSize: 13.5 }}>
                  <span className="row gap8"><Icon name="globe" size={14} />www.techfasad.ru</span>
                  <span className="row gap8"><Icon name="mail" size={14} />info@techfasad.ru</span>
                  <span className="row gap8"><Icon name="phone" size={14} />+7 495 125-45-67</span>
                </div></div>}
              <div className="chips" style={{ marginBottom: 14 }}>{m.chips.map(c => <span key={c} className="chip">{c}</span>)}</div>
              <div className="row between" style={{ marginBottom: 14 }}>
                <span className="row gap16"><Stars v={m.rating} /><span className="row gap6 muted" style={{ fontSize: 13 }}><Icon name="portfolio" size={14} />{m.projects} проектов</span></span>
                <span className="chip"><Icon name="pin" size={13} />{m.geo}</span>
              </div>
              {m.featured
                ? <button className="btn btn-primary btn-block" onClick={() => go("chat")}>Связаться</button>
                : <div className="row gap8"><button className="btn btn-ghost btn-sm grow">Открыть профиль</button><button className="btn btn-primary btn-sm" onClick={() => go("order-detail", 1)}>В проект</button></div>}
            </div>
          ))}
          {PRODUCTS.map(p => (
            <div key={p.name} className="card card-hover">
              <div className="row gap12" style={{ marginBottom: 14 }}>
                <div className="manuf__logo" style={grad("#6f5cf0", "#9a7bff")}><Icon name="cpu" size={22} /></div>
                <div><div style={{ fontWeight: 700, fontSize: 16 }}>{p.name}</div><div className="dim" style={{ fontSize: 13 }}>{p.sub}</div></div>
              </div>
              <div className="chips" style={{ marginBottom: 14 }}>{p.chips.map(c => <span key={c} className="chip chip-code">{c}</span>)}</div>
              <div className="row between" style={{ marginBottom: 14 }}><span className="muted" style={{ fontSize: 13.5 }}>{p.spec}</span><span className="row gap6 muted" style={{ fontSize: 13 }}><Icon name="cert" size={14} />Сертификаты: {p.certs}</span></div>
              <button className="btn btn-ghost btn-block" onClick={() => go("manufacturers")}><Icon name="download" size={15} /> Скачать BIM / Открыть</button>
            </div>
          ))}
        </div>
      </>
    );
  }

  Object.assign(window, { Designers, DesignerProfile, Experts, Manufacturers, PromptSearch });
})();
