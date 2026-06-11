/* landing_map_gl.jsx — «География»: реальная интерактивная карта (MapLibre GL) с дугами из Москвы.
   Заменяет упрощённый SVG-вариант. Опирается на maplibre-gl (window.maplibregl). */
(function () {
  const DARK_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

  // o = заявки · d = проектировщики · e = эксперты · ll = [lng, lat]
  const CITIES = [
    { id: "msk", name: "Москва",          ll: [37.6176, 55.7558], o: 9, d: 38, e: 7 },
    { id: "spb", name: "Санкт-Петербург", ll: [30.3351, 59.9343], o: 6, d: 22, e: 4 },
    { id: "kzn", name: "Казань",          ll: [49.1066, 55.7963], o: 5, d: 14, e: 3 },
    { id: "ekb", name: "Екатеринбург",    ll: [60.5975, 56.8389], o: 4, d: 12, e: 2 },
    { id: "nsk", name: "Новосибирск",     ll: [82.9357, 55.0084], o: 3, d: 10, e: 2 },
    { id: "krd", name: "Краснодар",       ll: [38.9769, 45.0448], o: 3, d: 9,  e: 2 },
    { id: "ufa", name: "Уфа",             ll: [55.9721, 54.7388], o: 2, d: 8,  e: 1 },
    { id: "vvo", name: "Владивосток",     ll: [131.8855, 43.1198], o: 2, d: 7, e: 1 },
    { id: "rnd", name: "Ростов-на-Дону",  ll: [39.7015, 47.2357], o: 0, d: 3, e: 0 },
    { id: "sam", name: "Самара",          ll: [50.1500, 53.1959], o: 0, d: 2, e: 0 },
    { id: "che", name: "Челябинск",       ll: [61.4029, 55.1644], o: 0, d: 2, e: 0 },
    { id: "kya", name: "Красноярск",      ll: [92.8526, 56.0153], o: 0, d: 1, e: 0 },
    { id: "irk", name: "Иркутск",         ll: [104.2800, 52.2870], o: 0, d: 1, e: 0 },
    { id: "yak", name: "Якутск",          ll: [129.7331, 62.0281], o: 0, d: 1, e: 0 },
    { id: "khv", name: "Хабаровск",       ll: [135.0719, 48.4802], o: 0, d: 1, e: 0 },
    { id: "mmk", name: "Мурманск",        ll: [33.0827, 68.9707], o: 0, d: 1, e: 0 },
    { id: "kgd", name: "Калининград",     ll: [20.4522, 54.7104], o: 0, d: 1, e: 0 },
  ];

  const LAYERS = [
    { id: "o", label: "Заявки",         forms: ["заявка", "заявки", "заявок"],                       hex: "#ab87ff", week: 5 },
    { id: "d", label: "Проектировщики", forms: ["проектировщик", "проектировщика", "проектировщиков"], hex: "#34d399", week: 11 },
    { id: "e", label: "Эксперты",       forms: ["эксперт", "эксперта", "экспертов"],                 hex: "#5b9dff", week: 3 },
  ];

  function plural(n, f) {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return f[0];
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return f[1];
    return f[2];
  }

  // квадратичная дуга в lng/lat, выгибаем к северу — «авиа»-дуга
  function buildArc(from, to, curv, samples) {
    const [x0, y0] = from, [x2, y2] = to;
    const dist = Math.hypot(x2 - x0, y2 - y0);
    if (dist === 0) return [from, to];
    const cx = (x0 + x2) / 2;
    const cy = (y0 + y2) / 2 + dist * curv;
    const pts = [];
    const seg = Math.max(2, samples);
    for (let i = 0; i <= seg; i++) {
      const t = i / seg, inv = 1 - t;
      pts.push([inv * inv * x0 + 2 * inv * t * cx + t * t * x2, inv * inv * y0 + 2 * inv * t * cy + t * t * y2]);
    }
    return pts;
  }

  function RegionMapGL({ go }) {
    const Icon = window.Icon;
    const [layer, setLayer] = React.useState("o");
    const [hover, setHover] = React.useState(null);
    const [auto, setAuto] = React.useState(0);
    const [paused, setPaused] = React.useState(false);
    const [ready, setReady] = React.useState(false);
    const [failed, setFailed] = React.useState(false);

    const elRef = React.useRef(null);
    const mapRef = React.useRef(null);
    const markersRef = React.useRef({});   // id -> {el, marker}
    const popupRef = React.useRef(null);
    const hoverRef = React.useRef(setHover);
    hoverRef.current = setHover;

    const meta = LAYERS.find(l => l.id === layer);
    const ranked = React.useMemo(
      () => CITIES.filter(c => c[layer] > 0).sort((a, b) => b[layer] - a[layer]),
      [layer]
    );
    const maxV = ranked.length ? ranked[0][layer] : 1;
    const total = ranked.reduce((s, c) => s + c[layer], 0);
    const hub = CITIES[0];

    // auto-rotate highlight
    React.useEffect(() => {
      if (paused || !ranked.length) return;
      const top = Math.min(ranked.length, 8);
      const t = setInterval(() => setAuto(a => (a + 1) % top), 2400);
      return () => clearInterval(t);
    }, [paused, ranked.length]);
    React.useEffect(() => { setAuto(0); }, [layer]);

    const activeId = hover || (ranked[auto] && ranked[auto].id);

    // init map once
    React.useEffect(() => {
      const gl = window.maplibregl;
      if (!gl || !elRef.current) { setFailed(true); return; }
      let map;
      try {
        map = new gl.Map({
          container: elRef.current,
          style: DARK_STYLE,
          center: [99, 64], zoom: 1.7,
          attributionControl: { compact: true },
          dragRotate: false, pitchWithRotate: false, maxZoom: 7, minZoom: 1,
          preserveDrawingBuffer: true,
        });
      } catch (e) { setFailed(true); return; }
      mapRef.current = map;
      map.scrollZoom.disable();
      map.touchZoomRotate.disableRotation();
      map.addControl(new gl.NavigationControl({ showCompass: false, visualizePitch: false }), "top-right");

      const failTimer = setTimeout(() => { if (!mapRef.current?.isStyleLoaded()) setFailed(true); }, 15000);

      map.on("load", () => {
        clearTimeout(failTimer);
        setFailed(false);
        // arcs (base) + active arc layers
        map.addSource("arcs", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
        map.addLayer({ id: "arcs-line", type: "line", source: "arcs",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: { "line-color": meta.hex, "line-width": 1.4, "line-opacity": 0.45, "line-dasharray": [2, 2.2] } });
        map.addSource("arcs-hot", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
        map.addLayer({ id: "arcs-hot-line", type: "line", source: "arcs-hot",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: { "line-color": meta.hex, "line-width": 2.4, "line-opacity": 0.95 } });

        // markers
        CITIES.forEach(c => {
          const el = document.createElement("div");
          el.className = "tl-glm";
          el.innerHTML = '<span class="tl-glm__pulse"></span><span class="tl-glm__core"></span><span class="tl-glm__dot"></span><span class="tl-glm__lbl"></span>';
          el.querySelector(".tl-glm__lbl").textContent = c.name;
          el.addEventListener("mouseenter", () => hoverRef.current(c.id));
          el.addEventListener("mouseleave", () => hoverRef.current(null));
          const marker = new gl.Marker({ element: el, anchor: "center" }).setLngLat(c.ll).addTo(map);
          markersRef.current[c.id] = { el, marker };
        });

        popupRef.current = new gl.Popup({ closeButton: false, closeOnClick: false, focusAfterOpen: false, offset: 16, anchor: "bottom", className: "tl-glpop" });

        const b = new gl.LngLatBounds();
        CITIES.forEach(c => b.extend(c.ll));
        map.fitBounds(b, { padding: { top: 54, bottom: 40, left: 48, right: 48 }, maxZoom: 4, animate: false });
        setReady(true);
      });
      map.on("error", () => { /* tile errors are non-fatal */ });

      return () => { clearTimeout(failTimer); map.remove(); mapRef.current = null; markersRef.current = {}; };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // resize/refit when the section scrolls into view (scroll-reveal)
    React.useEffect(() => {
      if (!elRef.current) return;
      const io = new IntersectionObserver((es) => {
        if (es[0].isIntersecting && mapRef.current) mapRef.current.resize();
      }, { threshold: 0.15 });
      io.observe(elRef.current);
      return () => io.disconnect();
    }, []);

    // update markers / arcs / popup on layer or active change
    React.useEffect(() => {
      const map = mapRef.current;
      if (!ready || !map) return;

      CITIES.forEach(c => {
        const ref = markersRef.current[c.id]; if (!ref) return;
        const el = ref.el, v = c[layer], on = v > 0, isAct = c.id === activeId;
        const d = on ? 9 + 15 * Math.sqrt(v / maxV) : 6;
        el.style.setProperty("--c", meta.hex);
        el.style.setProperty("--d", d.toFixed(1) + "px");
        el.classList.toggle("tl-glm--faint", !on);
        el.classList.toggle("is-active", isAct);
        el.style.zIndex = isAct ? "6" : on ? "3" : "1";
        el.querySelector(".tl-glm__lbl").style.display = on ? "" : "none";
      });

      const active = ranked.filter(c => c.id !== hub.id);
      const feats = active.map(c => ({ type: "Feature", properties: { id: c.id }, geometry: { type: "LineString", coordinates: buildArc(hub.ll, c.ll, 0.16, 48) } }));
      const src = map.getSource("arcs"); if (src) src.setData({ type: "FeatureCollection", features: feats });
      map.setPaintProperty("arcs-line", "line-color", meta.hex);

      const hotCity = activeId && activeId !== hub.id ? CITIES.find(c => c.id === activeId && c[layer] > 0) : null;
      const hot = hotCity ? [{ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: buildArc(hub.ll, hotCity.ll, 0.16, 48) } }] : [];
      const hsrc = map.getSource("arcs-hot"); if (hsrc) hsrc.setData({ type: "FeatureCollection", features: hot });
      map.setPaintProperty("arcs-hot-line", "line-color", meta.hex);

      // popup on active city
      const pc = activeId && CITIES.find(c => c.id === activeId);
      const pu = popupRef.current;
      if (pu && pc && pc[layer] > 0) {
        pu.setLngLat(pc.ll)
          .setHTML('<b>' + pc.name + '</b><span><i style="color:' + meta.hex + '">' + pc[layer] + '</i> ' + plural(pc[layer], meta.forms) + '</span>')
          .addTo(map);
      } else if (pu) { pu.remove(); }
    }, [ready, layer, activeId, maxV]);

    return (
      <section className="tl-section" id="geo">
        <p className="tl-eyebrow">География</p>
        <h2 className="tl-h2">Заявки по всей России</h2>
        <p className="tl-lead">Заказчики и исполнители подключаются из разных регионов — от Калининграда до Владивостока. Площадка только набирает обороты, и сеть растёт каждую неделю.</p>

        <div className="tl-map" onMouseLeave={() => { setPaused(false); setHover(null); }} onMouseEnter={() => setPaused(true)}>
          {/* left — live map */}
          <div className="tl-map__panel">
            <div className="tl-map__tabs">
              {LAYERS.map(l => (
                <button key={l.id} className={"tl-map__tab" + (l.id === layer ? " is-on" : "")}
                  style={l.id === layer ? { borderColor: l.hex, background: `color-mix(in srgb, ${l.hex} 14%, transparent)`, color: l.hex } : null}
                  onClick={() => setLayer(l.id)}>
                  <span className="tl-map__swatch" style={{ background: l.hex, color: l.hex }} />
                  {l.label}
                </button>
              ))}
            </div>
            <div className="tl-map__gl" ref={elRef}>
              {!ready && !failed && <div className="tl-map__loading"><span /><span /><span /></div>}
              {failed && <div className="tl-map__err">Карта не загрузилась — нет доступа к сети. Обновите страницу.</div>}
            </div>
          </div>

          {/* right — totals + ranked regions */}
          <div className="tl-map__panel tl-map__side">
            <div className="tl-map__stat">
              <span className="tl-map__big" style={{ color: meta.hex }}>{total}</span>
              <span className="tl-map__statlbl">{plural(total, meta.forms)} на&nbsp;площадке</span>
            </div>
            <div className="tl-map__sub">
              <span className="tl-map__chip"><Icon name="pin" size={13} /> {ranked.length}&nbsp;{plural(ranked.length, ["регион", "региона", "регионов"])}</span>
              <span>·</span>
              <span className="tl-map__nowrap"><span className="tl-map__up">▲ +{meta.week}</span> за&nbsp;неделю</span>
            </div>
            <div className="tl-map__divider" />

            <div className="tl-map__rows">
              {ranked.slice(0, 8).map((c, i) => {
                const isOn = c.id === activeId;
                return (
                  <div key={c.id} className={"tl-map__row" + (isOn ? " is-active" : "")}
                    onMouseEnter={() => setHover(c.id)} onMouseLeave={() => setHover(null)}>
                    <span className="tl-map__rank">{i + 1}</span>
                    <div className="tl-map__rname">
                      <b>{c.name}</b>
                      <div className="tl-map__track">
                        <div className="tl-map__fill" style={{ width: (c[layer] / maxV * 100) + "%", background: meta.hex }} />
                      </div>
                    </div>
                    <span className="tl-map__rval">{c[layer]}</span>
                  </div>
                );
              })}
            </div>

            <div className="tl-map__foot">
              <Icon name="globe" size={15} /> Подключайтесь из любого региона — это бесплатно для заказчиков.
            </div>
          </div>
        </div>
      </section>
    );
  }

  window.RegionMap = RegionMapGL;
})();
