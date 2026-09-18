/**
 * transitions.js
 * Cambia de escena mediante una cortina que cubre la pantalla, cambia el
 * contenido activo por debajo, y se retira. `prefers-reduced-motion` reduce
 * esto a un cambio instantáneo, sin cortina.
 */
window.TesoroTransitions = (function () {
  const CURTAIN_MS = 420;
  const ROMANCE_BY_SCENE = {
    prologo: 0.15,
    "mapa-principal": 0.25,
    "stop-detail": 0.3,
    treasure: 0.8,
    "final-map": 0.95,
  };

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function getCurtain() {
    return document.getElementById("scene-curtain");
  }

  function getScene(sceneId) {
    return document.querySelector('[data-scene="' + sceneId + '"]');
  }

  function swapActive(sceneId) {
    document.querySelectorAll(".scene").forEach((el) => {
      el.classList.toggle("scene--active", el.dataset.scene === sceneId);
    });
  }

  function goTo(sceneId) {
    const target = getScene(sceneId);
    if (!target) return;

    if (window.TesoroSound) {
      window.TesoroSound.playRustle();
      if (ROMANCE_BY_SCENE[sceneId] !== undefined) {
        window.TesoroSound.setRomance(ROMANCE_BY_SCENE[sceneId]);
      }
    }

    if (prefersReducedMotion()) {
      swapActive(sceneId);
      return;
    }

    const curtain = getCurtain();
    if (!curtain) {
      swapActive(sceneId);
      return;
    }

    curtain.classList.add("curtain--visible");
    window.setTimeout(() => {
      swapActive(sceneId);
      window.setTimeout(() => {
        curtain.classList.remove("curtain--visible");
      }, 30);
    }, CURTAIN_MS);
  }

  return { goTo: goTo };
})();
