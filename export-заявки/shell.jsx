/* shell.jsx — AppShell (sidebar + topbar + legend). window.Shell, window.Avatar */
(function () {
  const Icon = window.Icon;
  const FuncMark = window.FuncMark;

  const NAV = [
    { key: "orders",        label: "Заявки",         icon: "grid" },
    { key: "expertise",     label: "Экспертиза",     icon: "scan" },
    { key: "designers",     label: "Проектировщики", icon: "pen" },
    { key: "experts",       label: "Эксперты",       icon: "shield" },
    { key: "manufacturers", label: "Производители",  icon: "stamp" },
    { key: "standards",     label: "Нормативы",      icon: "database" },
    { key: "chat",          label: "Коммуникации",   icon: "chat" },
    { key: "analytics",     label: "Аналитика",      icon: "chart" },
    { key: "pricing",       label: "Тарифы",        icon: "wallet" },
    { key: "settings",      label: "Настройки",      icon: "sliders" },
  ];

  // parent screen for sub-views (so nav stays highlighted)
  const PARENT = { "order-detail": "orders", "designer-profile": "designers", "order-new": "orders" };

  const LEGEND = [
    ["Заявки", "var(--accent-2)"], ["Экспертиза", "var(--blue)"], ["Проектировщики", "var(--green)"],
    ["Эксперты", "var(--amber)"], ["Производители", "var(--pink)"], ["Нормативы", "var(--accent)"],
  ];

  function Avatar({ text, size = 36, style }) {
    return <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.36, ...style }}>{text}</div>;
  }

  function Shell({ active, go, children, scrollKey, flush }) {
    const cur = PARENT[active] || active;
    const contentRef = React.useRef(null);
    React.useEffect(() => { if (contentRef.current) contentRef.current.scrollTop = 0; }, [scrollKey]);
    return (
      <div className="app">
        {/* sidebar */}
        <aside className="sidebar">
          <div className="sidebar__brand" onClick={() => go("landing")} title="На главную">
            <FuncMark size={32} />
            <div className="brand__name">ФУНКЦИЯ</div>
          </div>
          <nav className="sidebar__nav">
            {NAV.map(n => (
              <button key={n.key} className={"navitem" + (cur === n.key ? " is-active" : "")} onClick={() => go(n.key)}>
                <Icon name={n.icon} /> {n.label}
              </button>
            ))}
          </nav>
          <div className="sidebar__foot" onClick={() => go("settings")}>
            <Avatar text="ДП" size={40} />
            <div>
              <div className="meta-name">Демо Пользователь</div>
              <div className="meta-sub">demo@funktsiya.ru</div>
            </div>
          </div>
        </aside>

        {/* main */}
        <div className="main">
          <header className="topbar">
            <button className="iconbtn"><Icon name="menu" /></button>
            <div className="topbar__search">
              <Icon name="search" /><input placeholder="Поиск по заявкам" />
            </div>
            <div className="topbar__user">
              <span>Демо Пользователь</span>
              <Avatar text="ДП" size={36} />
            </div>
          </header>

          <div className={"content" + (flush ? " content--flush" : "")} ref={contentRef}>
            <div className={(flush ? "content__flush" : "content__inner") + " fade-in"} key={scrollKey}>{children}</div>
          </div>

          <footer className="legend">
            {LEGEND.map(([l, c]) => (
              <span key={l}><i style={{ background: c }} />{l}</span>
            ))}
          </footer>
        </div>
      </div>
    );
  }

  Object.assign(window, { Shell, Avatar });
})();
