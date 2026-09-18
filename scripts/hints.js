/**
 * hints.js
 * Modal de ayuda progresiva, compartido por las cinco paradas. Nunca
 * revela la respuesta de golpe: cada toque en "Otra pista" añade la
 * siguiente pista de `stop.hints[]`, en orden, sin poder retroceder.
 */
window.TesoroHints = (function () {
  let dialogEl, listEl, moreBtn, closeBtn, currentStopId;

  function findStop(id) {
    return window.TesoroConfig.stops.find((s) => s.id === id) || null;
  }

  function renderList(stopId) {
    const stop = findStop(stopId);
    if (!stop) return;
    const revealed = window.TesoroState.getHintsRevealed(stopId);

    listEl.innerHTML = "";
    for (let i = 0; i < revealed; i++) {
      const p = document.createElement("p");
      p.className = "hint-modal__hint";
      if (i === revealed - 1) p.classList.add("hint-modal__hint--new");
      p.textContent = stop.hints[i];
      listEl.appendChild(p);
    }

    const exhausted = revealed >= stop.hints.length;
    moreBtn.disabled = exhausted;
    moreBtn.textContent = exhausted ? "El capitán no tiene más pistas" : "Otra pista";

    listEl.scrollTop = listEl.scrollHeight;
  }

  function requestMore() {
    const stop = findStop(currentStopId);
    if (!stop) return;
    window.TesoroState.revealNextHint(currentStopId, stop.hints.length);
    renderList(currentStopId);
    window.TesoroSound.playRustle();
  }

  function open(stopId) {
    currentStopId = stopId;
    const stop = findStop(stopId);
    if (!stop) return;

    if (window.TesoroState.getHintsRevealed(stopId) === 0) {
      window.TesoroState.revealNextHint(stopId, stop.hints.length);
    }
    renderList(stopId);
    dialogEl.showModal();
    window.requestAnimationFrame(() => dialogEl.classList.add("hint-modal--open"));
  }

  function close() {
    dialogEl.classList.remove("hint-modal--open");
    window.setTimeout(() => {
      if (dialogEl.open) dialogEl.close();
    }, 220);
  }

  function init() {
    dialogEl = document.getElementById("hint-modal");
    listEl = document.getElementById("hint-modal-list");
    moreBtn = document.getElementById("hint-modal-more");
    closeBtn = document.getElementById("hint-modal-close");

    moreBtn.addEventListener("click", requestMore);
    closeBtn.addEventListener("click", close);
    dialogEl.addEventListener("click", (evt) => {
      if (evt.target === dialogEl) close();
    });
    dialogEl.addEventListener("cancel", (evt) => {
      evt.preventDefault();
      close();
    });
  }

  document.addEventListener("DOMContentLoaded", init);

  return { open: open, close: close };
})();
