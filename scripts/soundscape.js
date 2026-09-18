/**
 * soundscape.js
 * Paisaje sonoro generado por código con Web Audio API — sin archivos de
 * audio, cero peso extra. Un drone ambiental muy suave que se calienta a
 * medida que sube el romance de la escena, más tres efectos breves
 * (campanilla, crujido de pergamino, golpe sordo del cofre). Nunca suena
 * sin un gesto explícito del usuario (política de autoplay del navegador).
 */
window.TesoroSound = (function () {
  let ctx = null;
  let masterGain = null;
  let ambientNodes = null;
  let enabled = false;
  let currentRomance = 0.2;

  function ensureContext() {
    if (ctx) return ctx;
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) return null;
    ctx = new AudioContextCtor();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(ctx.destination);
    return ctx;
  }

  function startAmbient() {
    if (!ensureContext()) return;
    if (ctx.state === "suspended") ctx.resume();
    if (ambientNodes) return;

    const now = ctx.currentTime;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 900;
    filter.connect(masterGain);

    const oscGain = ctx.createGain();
    oscGain.gain.value = 0.5;
    oscGain.connect(filter);

    const freqs = [98, 147, 196];
    const oscillators = freqs.map((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = i === 0 ? "sine" : "triangle";
      osc.frequency.value = freq;
      osc.detune.value = (i - 1) * 4;
      osc.connect(oscGain);
      osc.start(now);
      return osc;
    });

    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.06;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 220;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start(now);

    ambientNodes = { oscillators, filter, oscGain, lfo, lfoGain };

    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(masterGain.gain.value, now);
    masterGain.gain.linearRampToValueAtTime(0.05, now + 2);

    applyRomance(currentRomance);
  }

  function stopAmbient(fadeMs) {
    if (!ctx || !masterGain) return;
    const now = ctx.currentTime;
    const fadeSec = (fadeMs || 800) / 1000;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(masterGain.gain.value, now);
    masterGain.gain.linearRampToValueAtTime(0, now + fadeSec);

    const nodesToStop = ambientNodes;
    ambientNodes = null;
    window.setTimeout(() => {
      if (!nodesToStop) return;
      nodesToStop.oscillators.forEach((osc) => {
        try {
          osc.stop();
        } catch (err) {
          /* ya detenido */
        }
      });
      try {
        nodesToStop.lfo.stop();
      } catch (err) {
        /* ya detenido */
      }
    }, fadeMs + 80);
  }

  function applyRomance(level) {
    currentRomance = level;
    if (!ambientNodes || !ctx) return;
    const now = ctx.currentTime;
    const targetCutoff = 900 - level * 500;
    ambientNodes.filter.frequency.cancelScheduledValues(now);
    ambientNodes.filter.frequency.linearRampToValueAtTime(targetCutoff, now + 1.5);
  }

  function setRomance(level) {
    applyRomance(level);
  }

  function setEnabled(value) {
    enabled = value;
    window.TesoroState.setSoundEnabled(value);
    if (value) {
      startAmbient();
    } else {
      stopAmbient(900);
    }
  }

  function isEnabled() {
    return enabled;
  }

  function playChime() {
    if (!enabled || !ctx) return;
    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(masterGain);
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = 880;
    osc.connect(gain);
    osc.start(now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 1.0);
    osc.stop(now + 1.3);
  }

  function noiseBurst(durationSec, shapeFn) {
    if (!enabled || !ctx) return null;
    const bufferSize = Math.floor(ctx.sampleRate * durationSec);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * shapeFn(i / bufferSize);
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    return source;
  }

  function playRustle() {
    const source = noiseBurst(0.4, (t) => 1 - t);
    if (!source) return;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 2200;
    filter.Q.value = 0.6;
    const gain = ctx.createGain();
    gain.gain.value = 0.1;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    source.start(ctx.currentTime);
  }

  function playThud() {
    const source = noiseBurst(0.5, (t) => Math.pow(1 - t, 3));
    if (!source) return;
    const now = ctx.currentTime;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(500, now);
    filter.frequency.exponentialRampToValueAtTime(120, now + 0.4);
    const gain = ctx.createGain();
    gain.gain.value = 0.32;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    source.start(now);
  }

  function init() {
    enabled = window.TesoroState.isSoundEnabled();
  }

  /**
   * El audio es un extra, nunca un requisito: si el navegador lanza un error
   * aquí (permisos, Web Audio no disponible, etc.), no debe romper nada de
   * la experiencia. Cada método público queda blindado con este wrapper.
   */
  function safe(fn) {
    return function () {
      try {
        return fn.apply(null, arguments);
      } catch (err) {
        return undefined;
      }
    };
  }

  return {
    init: safe(init),
    setEnabled: safe(setEnabled),
    isEnabled: safe(isEnabled),
    setRomance: safe(setRomance),
    playChime: safe(playChime),
    playRustle: safe(playRustle),
    playThud: safe(playThud),
  };
})();
