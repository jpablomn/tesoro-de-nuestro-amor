/**
 * narrator.js
 * Frases del Capitán: elige una frase al azar de un grupo definido en
 * content.js, evitando repetir la misma frase dos veces seguidas.
 */
window.TesoroNarrator = (function () {
  const lastByGroup = {};

  function say(groupName) {
    const pool = window.TesoroConfig.narrator[groupName];
    if (!pool || pool.length === 0) return "";
    if (pool.length === 1) return pool[0];

    let choice = pool[Math.floor(Math.random() * pool.length)];
    while (choice === lastByGroup[groupName]) {
      choice = pool[Math.floor(Math.random() * pool.length)];
    }
    lastByGroup[groupName] = choice;
    return choice;
  }

  return { say: say };
})();
