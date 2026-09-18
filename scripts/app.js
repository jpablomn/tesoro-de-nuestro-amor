/**
 * app.js
 * Orquestación principal: cablea el prólogo, inicializa el mapa y renderiza
 * las escenas de parada / tesoro / mapa final a partir de content.js.
 * El reinicio es un parámetro de URL (?reset=1), nunca un botón visible
 * durante la experiencia normal.
 */
(function () {
  function handleResetParam() {
    const params = new URLSearchParams(window.location.search);
    if (!params.has("reset")) return;
    window.TesoroState.resetAdventure();
    params.delete("reset");
    const query = params.toString();
    window.history.replaceState({}, "", window.location.pathname + (query ? "?" + query : ""));
  }

  function renderNarratorLine(group) {
    const el = document.getElementById("narrator-line");
    if (el) el.textContent = window.TesoroNarrator.say(group);
  }

  function wireProlog() {
    const beginBtn = document.getElementById("begin-adventure");
    beginBtn.addEventListener("click", () => {
      if (window.TesoroSound.isEnabled()) window.TesoroSound.setEnabled(true);
      window.TesoroTransitions.goTo("mapa-principal");
      renderNarratorLine("onMapEnter");
    });
  }

  function wireSoundToggle() {
    const toggle = document.getElementById("sound-toggle");
    const sync = () => {
      const on = window.TesoroSound.isEnabled();
      toggle.setAttribute("aria-pressed", String(on));
      toggle.setAttribute("aria-label", on ? "Silenciar el mapa" : "Activar sonido ambiente");
    };
    toggle.addEventListener("click", () => {
      window.TesoroSound.setEnabled(!window.TesoroSound.isEnabled());
      sync();
    });
    sync();
  }

  function findStop(id) {
    return window.TesoroConfig.stops.find((s) => s.id === id) || null;
  }

  function showInkStamp(container, text) {
    const stamp = document.createElement("div");
    stamp.className = "ink-stamp";
    stamp.textContent = text;
    container.appendChild(stamp);
    window.requestAnimationFrame(() => stamp.classList.add("ink-stamp--show"));
  }

  function renderStopDetail(id, status) {
    const stop = findStop(id);
    if (!stop) return;
    const root = document.getElementById("stop-detail-content");
    root.innerHTML = "";

    const eyebrow = document.createElement("p");
    eyebrow.className = "scene__eyebrow";
    eyebrow.textContent = stop.title;
    root.appendChild(eyebrow);

    const heading = document.createElement("h2");
    heading.textContent = stop.place;
    root.appendChild(heading);

    const message = document.createElement("p");
    message.className = "scene__body-text";
    message.textContent = status === "completed" ? stop.completionMessage : stop.unlockMessage;
    root.appendChild(message);

    if (status !== "completed") {
      const helpBtn = document.createElement("button");
      helpBtn.type = "button";
      helpBtn.className = "btn-help";
      helpBtn.textContent = "🏴‍☠️ Necesito ayuda";
      helpBtn.addEventListener("click", () => window.TesoroHints.open(id));
      root.appendChild(helpBtn);

      const form = document.createElement("form");
      form.className = "code-form";
      form.innerHTML =
        '<label for="code-input">Código secreto</label>' +
        '<input id="code-input" type="text" autocomplete="off" autocapitalize="characters" />' +
        '<button type="submit">Desbloquear ruta</button>' +
        '<p class="code-form__feedback" aria-live="polite"></p>';
      root.appendChild(form);

      form.addEventListener("animationend", (evt) => {
        if (evt.animationName === "code-form-shake") form.classList.remove("code-form--shake");
      });

      form.addEventListener("submit", (evt) => {
        evt.preventDefault();
        const input = form.querySelector("#code-input");
        const feedback = form.querySelector(".code-form__feedback");
        const correct = window.TesoroState.verifyStopCode(id, input.value);
        if (correct) {
          feedback.textContent = "";
          form.classList.add("code-form--success");
          form.querySelectorAll("input, button").forEach((elToDisable) => (elToDisable.disabled = true));
          showInkStamp(root, "PISTA VERIFICADA");
          window.TesoroSound.playChime();
          window.setTimeout(() => renderStopDetail(id, "completed"), 1100);
        } else {
          feedback.textContent = "No parece ser la palabra que busca el capitán...";
          feedback.classList.remove("code-form__feedback--ok");
          form.classList.remove("code-form--shake");
          input.focus();
          window.requestAnimationFrame(() => form.classList.add("code-form--shake"));
        }
      });
    }

    const backBtn = document.createElement("button");
    backBtn.type = "button";
    backBtn.className = "btn-link";
    backBtn.textContent = "Consultar mapa";
    backBtn.addEventListener("click", () => window.TesoroTransitions.goTo("mapa-principal"));
    root.appendChild(backBtn);
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  const FINAL_MAP_ORNAMENT_SVG =
    '<svg class="final-map-ornament" viewBox="0 0 100 30" aria-hidden="true">' +
    '<path class="final-map-ornament__path" d="M6,21 Q18,7 32,17 T60,13 Q75,9 90,15" />' +
    '<g class="final-map-ornament__bloom" transform="translate(20,10)">' +
    '<circle r="1.1" /><circle cx="1.6" cy="0.5" r="1.1" /><circle cx="-1.6" cy="0.5" r="1.1" />' +
    '<circle cx="0.8" cy="-1.4" r="1.1" /><circle cx="-0.8" cy="-1.4" r="1.1" />' +
    "</g>" +
    '<g class="final-map-ornament__bloom" transform="translate(55,9)">' +
    '<circle r="1.1" /><circle cx="1.6" cy="0.5" r="1.1" /><circle cx="-1.6" cy="0.5" r="1.1" />' +
    '<circle cx="0.8" cy="-1.4" r="1.1" /><circle cx="-0.8" cy="-1.4" r="1.1" />' +
    "</g>" +
    '<path class="final-map-ornament__heart" d="M90,12.5 C88.5,10.3 85.5,10.8 85.5,13.2 C85.5,15.6 90,18.5 90,18.5 C90,18.5 94.5,15.6 94.5,13.2 C94.5,10.8 91.5,10.3 90,12.5 Z" />' +
    '<path class="final-map-ornament__x" d="M87,11 L93,17 M93,11 L87,17" />' +
    "</svg>";

  const CHEST_SVG =
    '<svg class="chest-svg" viewBox="0 0 100 70" aria-hidden="true">' +
    '<defs><radialGradient id="chest-glow-gradient" cx="50%" cy="40%" r="60%">' +
    '<stop offset="0%" stop-color="var(--gold-bright)" stop-opacity="0.9" />' +
    '<stop offset="100%" stop-color="var(--gold-bright)" stop-opacity="0" />' +
    "</radialGradient></defs>" +
    '<ellipse class="chest-shadow" cx="50" cy="66" rx="32" ry="4" />' +
    '<ellipse class="chest-glow" cx="50" cy="36" rx="28" ry="14" />' +
    '<path class="chest-body" d="M18,38 L18,60 Q18,64 22,64 L78,64 Q82,64 82,60 L82,38 Z" />' +
    '<rect class="chest-band" x="45.5" y="38" width="9" height="26" />' +
    '<rect class="chest-lock" x="44" y="45" width="12" height="10" rx="1.2" />' +
    '<circle class="chest-lock-hole" cx="50" cy="50" r="1.6" />' +
    '<g class="chest-lid">' +
    '<path d="M18,38 Q18,15 50,13 Q82,15 82,38 Q82,32 50,30 Q18,32 18,38 Z" />' +
    "</g>" +
    "</svg>";

  function renderTreasureScene() {
    const treasure = window.TesoroConfig.treasure;
    const root = document.getElementById("treasure-content");
    root.innerHTML = "";

    const chestWrap = document.createElement("button");
    chestWrap.type = "button";
    chestWrap.className = "chest-button";
    chestWrap.setAttribute("aria-label", "Abrir el cofre");
    chestWrap.innerHTML = CHEST_SVG;
    root.appendChild(chestWrap);

    const hint = document.createElement("p");
    hint.className = "chest-hint";
    hint.textContent = "Toca el cofre para abrirlo.";
    root.appendChild(hint);

    const reveal = document.createElement("h2");
    reveal.className = "reveal-fade";
    reveal.textContent = treasure.revealMessage;
    root.appendChild(reveal);

    const twist = document.createElement("p");
    twist.className = "scene__body-text reveal-fade";
    twist.textContent = treasure.twistMessage;
    root.appendChild(twist);

    const missionBtn = document.createElement("button");
    missionBtn.type = "button";
    missionBtn.className = "btn-primary reveal-fade";
    missionBtn.textContent = treasure.nextMissionLabel;
    missionBtn.addEventListener("click", () => {
      window.TesoroState.completeStop(treasure.id);
      window.TesoroState.markFinalMapViewed();
      renderFinalMapScene();
      window.TesoroTransitions.goTo("final-map");
    });
    root.appendChild(missionBtn);

    chestWrap.addEventListener("click", () => {
      chestWrap.disabled = true;
      chestWrap.classList.add("chest-button--open");
      hint.classList.add("chest-hint--hidden");
      window.TesoroSound.playThud();

      const step = prefersReducedMotion() ? 150 : 900;
      window.setTimeout(() => reveal.classList.add("reveal-fade--show"), step);
      window.setTimeout(() => twist.classList.add("reveal-fade--show"), step * 2);
      window.setTimeout(() => missionBtn.classList.add("reveal-fade--show"), step * 3);
    });
  }

  function renderFinalMapScene() {
    const finalMap = window.TesoroConfig.finalMap;
    const root = document.getElementById("final-map-content");
    root.innerHTML = "";
    let delay = 200;
    const step = prefersReducedMotion() ? 0 : 550;

    finalMap.messages.forEach((line) => {
      const p = document.createElement("p");
      p.className = "final-map__line reveal-line";
      p.style.animationDelay = delay + "ms";
      p.textContent = line;
      root.appendChild(p);
      delay += step;
    });

    root.insertAdjacentHTML("beforeend", FINAL_MAP_ORNAMENT_SVG);
    const ornament = root.querySelector(".final-map-ornament");
    if (ornament) {
      ornament.classList.add("reveal-line");
      ornament.style.animationDelay = delay + "ms";
      delay += step;
    }

    finalMap.closingMessages.forEach((line) => {
      const p = document.createElement("p");
      p.className = "final-map__closing reveal-line";
      p.style.animationDelay = delay + "ms";
      p.textContent = line;
      root.appendChild(p);
      delay += step;
    });

    if (finalMap.destination.label) {
      const dest = document.createElement("p");
      dest.className = "final-map__destination reveal-line";
      dest.style.animationDelay = delay + "ms";
      dest.textContent = finalMap.destination.label;
      root.appendChild(dest);
    }
  }

  function handleSelectStop(id, status) {
    if (id === window.TesoroConfig.treasure.id) {
      renderTreasureScene();
      window.TesoroTransitions.goTo("treasure");
      return;
    }
    renderNarratorLine(status === "completed" ? "onComplete" : "onUnlock");
    renderStopDetail(id, status);
    window.TesoroTransitions.goTo("stop-detail");
  }

  function init() {
    handleResetParam();
    window.TesoroSound.init();
    wireProlog();
    wireSoundToggle();
    window.TesoroMap.init(document.getElementById("map-canvas"), handleSelectStop);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
