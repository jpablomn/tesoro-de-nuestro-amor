/**
 * map.js
 * Dibuja marcadores y rutas dentro del SVG estático definido en index.html
 * (#map-art trae costas/islas/brújula; este script solo puebla los grupos
 * #map-routes y #map-markers). Cada ruta se dibuja progresivamente con
 * stroke-dashoffset cuando su destino deja de estar bloqueado.
 */
window.TesoroMap = (function () {
  const SVG_NS = "http://www.w3.org/2000/svg";
  const ICON_SIZE = 7;
  const BASE_VIEWBOX = { x: 0, y: 0, w: 100, h: 92 };
  const FOCUS_ZOOM = 0.55;

  let svgEl = null;
  let routesGroup = null;
  let markersGroup = null;
  let onSelect = null;
  let currentViewBox = Object.assign({}, BASE_VIEWBOX);

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function setViewBox(vb) {
    currentViewBox = vb;
    svgEl.setAttribute("viewBox", vb.x + " " + vb.y + " " + vb.w + " " + vb.h);
  }

  function animateViewBox(from, to, duration, onDone) {
    const start = performance.now();
    function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setViewBox({
        x: from.x + (to.x - from.x) * eased,
        y: from.y + (to.y - from.y) * eased,
        w: from.w + (to.w - from.w) * eased,
        h: from.h + (to.h - from.h) * eased,
      });
      if (t < 1) {
        window.requestAnimationFrame(tick);
      } else if (typeof onDone === "function") {
        onDone();
      }
    }
    window.requestAnimationFrame(tick);
  }

  function panToStop(id) {
    if (prefersReducedMotion()) return;
    const data = allMarkersData().find((d) => d.id === id);
    if (!data) return;

    const fw = BASE_VIEWBOX.w * FOCUS_ZOOM;
    const fh = BASE_VIEWBOX.h * FOCUS_ZOOM;
    const fx = Math.max(
      BASE_VIEWBOX.x,
      Math.min(data.mapCoords.x - fw / 2, BASE_VIEWBOX.x + BASE_VIEWBOX.w - fw)
    );
    const fy = Math.max(
      BASE_VIEWBOX.y,
      Math.min(data.mapCoords.y - fh / 2, BASE_VIEWBOX.y + BASE_VIEWBOX.h - fh)
    );
    const focus = { x: fx, y: fy, w: fw, h: fh };

    animateViewBox(Object.assign({}, currentViewBox), focus, 900, () => {
      window.setTimeout(() => {
        animateViewBox(Object.assign({}, currentViewBox), Object.assign({}, BASE_VIEWBOX), 900);
      }, 700);
    });
  }

  function allMarkersData() {
    const stops = window.TesoroConfig.stops.slice().sort((a, b) => a.order - b.order);
    return stops.concat([window.TesoroConfig.treasure]);
  }

  function el(tag, attrs) {
    const node = document.createElementNS(SVG_NS, tag);
    Object.keys(attrs || {}).forEach((key) => node.setAttribute(key, attrs[key]));
    return node;
  }

  function buildRoutePath(from, to, bend) {
    const mx = (from.x + to.x) / 2;
    const my = (from.y + to.y) / 2;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = (-dy / len) * bend;
    const ny = (dx / len) * bend;
    const cx = mx + nx;
    const cy = my + ny;
    return "M " + from.x + " " + from.y + " Q " + cx + " " + cy + " " + to.x + " " + to.y;
  }

  function buildMarker(data) {
    const g = el("g", {
      class: "map-marker",
      tabindex: "0",
      role: "button",
      "aria-label": (data.title ? data.title + ": " : "") + data.place,
      transform: "translate(" + data.mapCoords.x + "," + data.mapCoords.y + ")",
    });
    g.dataset.stopId = data.id;

    g.appendChild(el("circle", { class: "map-marker__halo", r: "5.6" }));
    g.appendChild(el("circle", { class: "map-marker__stamp", r: "6.4" }));
    g.appendChild(el("circle", { class: "map-marker__plate", r: "4.6" }));

    const use = el("use", {
      class: "map-marker__icon",
      x: -ICON_SIZE / 2,
      y: -ICON_SIZE / 2,
      width: ICON_SIZE,
      height: ICON_SIZE,
    });
    use.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#icon-" + data.id);
    use.setAttribute("href", "#icon-" + data.id);
    g.appendChild(use);

    const label = el("text", { class: "map-marker__label", y: "9.5", "text-anchor": "middle" });
    label.textContent = data.place;
    g.appendChild(label);

    function activate() {
      const status = window.TesoroState.getStatus(data.id);
      if (status === "locked") return;
      if (typeof onSelect === "function") onSelect(data.id, status);
    }

    g.addEventListener("click", activate);
    g.addEventListener("keydown", (evt) => {
      if (evt.key === "Enter" || evt.key === " ") {
        evt.preventDefault();
        activate();
      }
    });

    return g;
  }

  function buildRoutes() {
    const markers = allMarkersData();
    for (let i = 0; i < markers.length - 1; i++) {
      const from = markers[i];
      const to = markers[i + 1];
      const bend = i % 2 === 0 ? 7 : -7;
      const path = el("path", {
        class: "map-route",
        d: buildRoutePath(from.mapCoords, to.mapCoords, bend),
      });
      path.dataset.toStopId = to.id;
      routesGroup.appendChild(path);

      const length = path.getTotalLength();
      path.style.strokeDasharray = String(length);
      path.style.strokeDashoffset = String(length);
    }
  }

  function refreshRoutes() {
    routesGroup.querySelectorAll(".map-route").forEach((path) => {
      const status = window.TesoroState.getStatus(path.dataset.toStopId);
      const length = path.style.strokeDasharray;
      path.style.strokeDashoffset = status === "locked" ? length : "0";
      path.classList.toggle("map-route--drawn", status !== "locked");
    });
  }

  function refreshMarkers() {
    markersGroup.querySelectorAll(".map-marker").forEach((marker) => {
      const status = window.TesoroState.getStatus(marker.dataset.stopId);
      marker.classList.remove("map-marker--locked", "map-marker--available", "map-marker--completed");
      marker.classList.add("map-marker--" + status);
      marker.tabIndex = status === "locked" ? -1 : 0;
    });
  }

  function refresh() {
    if (!svgEl) return;
    refreshRoutes();
    refreshMarkers();
  }

  function render() {
    if (!svgEl) return;
    routesGroup.innerHTML = "";
    markersGroup.innerHTML = "";
    buildRoutes();
    allMarkersData().forEach((data) => {
      markersGroup.appendChild(buildMarker(data));
    });
    refresh();
  }

  function init(svg, onSelectStop) {
    svgEl = svg;
    routesGroup = svg.querySelector("#map-routes");
    markersGroup = svg.querySelector("#map-markers");
    onSelect = onSelectStop;
    render();
    window.addEventListener("adventure:stopUnlocked", (evt) => {
      refresh();
      panToStop(evt.detail.id);
    });
    window.addEventListener("adventure:stopCompleted", refresh);
    window.addEventListener("adventure:reset", () => {
      setViewBox(Object.assign({}, BASE_VIEWBOX));
      render();
    });
  }

  return { init: init, refresh: refresh };
})();
