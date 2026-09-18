/**
 * state.js
 * Motor de progreso de la aventura. Aislado de la interfaz: solo conoce
 * el orden de las paradas (desde TesoroConfig) y persiste en localStorage.
 * La UI escucha los eventos `adventure:stopUnlocked` / `adventure:stopCompleted`
 * / `adventure:reset` en `window` en vez de leer el estado directamente.
 */
window.TesoroState = (function () {
  const STORAGE_KEY = window.TesoroConfig.app.storageKey;

  function getSequence() {
    const stopIds = window.TesoroConfig.stops
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((stop) => stop.id);
    return stopIds.concat([window.TesoroConfig.treasure.id]);
  }

  function defaultState() {
    return { completed: [], hintsRevealed: {}, soundEnabled: false, finalMapViewed: false };
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      return Object.assign(defaultState(), parsed);
    } catch (err) {
      return defaultState();
    }
  }

  function save(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      /* localStorage no disponible (modo privado, cuota, etc.): la aventura sigue, solo sin persistencia. */
    }
  }

  function normalizeCode(value) {
    return String(value || "")
      .trim()
      .toUpperCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");
  }

  function findStop(id) {
    return window.TesoroConfig.stops.find((s) => s.id === id) || null;
  }

  function getStatus(id) {
    const state = load();
    if (state.completed.indexOf(id) !== -1) return "completed";
    const sequence = getSequence();
    const index = sequence.indexOf(id);
    if (index === -1) return "locked";
    const allPreviousCompleted = sequence
      .slice(0, index)
      .every((prevId) => state.completed.indexOf(prevId) !== -1);
    return allPreviousCompleted ? "available" : "locked";
  }

  function dispatch(name, detail) {
    window.dispatchEvent(new CustomEvent(name, { detail: detail || {} }));
  }

  function completeStop(id) {
    const state = load();
    if (state.completed.indexOf(id) === -1) {
      state.completed.push(id);
      save(state);
    }
    dispatch("adventure:stopCompleted", { id: id });

    const sequence = getSequence();
    const nextId = sequence[sequence.indexOf(id) + 1];
    if (nextId && getStatus(nextId) === "available") {
      dispatch("adventure:stopUnlocked", { id: nextId });
    }
  }

  function verifyStopCode(id, inputValue) {
    const stop = findStop(id);
    if (!stop) return false;
    const isCorrect = normalizeCode(inputValue) === normalizeCode(stop.secretCode);
    if (isCorrect) completeStop(id);
    return isCorrect;
  }

  function getHintsRevealed(id) {
    const state = load();
    return state.hintsRevealed[id] || 0;
  }

  function revealNextHint(id, maxHints) {
    const state = load();
    const current = state.hintsRevealed[id] || 0;
    const next = Math.min(current + 1, maxHints);
    state.hintsRevealed[id] = next;
    save(state);
    return next;
  }

  function isSoundEnabled() {
    return load().soundEnabled;
  }

  function setSoundEnabled(enabled) {
    const state = load();
    state.soundEnabled = !!enabled;
    save(state);
  }

  function isFinalMapViewed() {
    return load().finalMapViewed;
  }

  function markFinalMapViewed() {
    const state = load();
    state.finalMapViewed = true;
    save(state);
  }

  function resetAdventure() {
    save(defaultState());
    dispatch("adventure:reset", {});
  }

  return {
    getSequence: getSequence,
    getStatus: getStatus,
    completeStop: completeStop,
    verifyStopCode: verifyStopCode,
    getHintsRevealed: getHintsRevealed,
    revealNextHint: revealNextHint,
    isSoundEnabled: isSoundEnabled,
    setSoundEnabled: setSoundEnabled,
    isFinalMapViewed: isFinalMapViewed,
    markFinalMapViewed: markFinalMapViewed,
    resetAdventure: resetAdventure,
  };
})();
