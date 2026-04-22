// Petits sons synthétisés via Web Audio API (pas de fichiers externes).
let ctx = null
function getCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (AC) ctx = new AC()
  }
  return ctx
}

function tone(freq, duration = 0.18, type = 'sine', gain = 0.18, delay = 0) {
  const c = getCtx()
  if (!c) return
  const t0 = c.currentTime + delay
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.value = freq
  g.gain.value = 0
  g.gain.linearRampToValueAtTime(gain, t0 + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  osc.connect(g).connect(c.destination)
  osc.start(t0)
  osc.stop(t0 + duration + 0.02)
}

export function playSuccess() {
  // petite gamme montante joyeuse
  tone(523.25, 0.15, 'triangle', 0.2, 0)      // C5
  tone(659.25, 0.15, 'triangle', 0.2, 0.12)   // E5
  tone(783.99, 0.22, 'triangle', 0.22, 0.24)  // G5
}

export function playError() {
  // son doux, pas punitif
  tone(330, 0.18, 'sine', 0.15, 0)
  tone(247, 0.25, 'sine', 0.15, 0.14)
}

export function playLevelUp() {
  // fanfare courte
  tone(523.25, 0.12, 'triangle', 0.22, 0)
  tone(659.25, 0.12, 'triangle', 0.22, 0.1)
  tone(783.99, 0.12, 'triangle', 0.22, 0.2)
  tone(1046.5, 0.25, 'triangle', 0.25, 0.3)
}

export function playTap() {
  tone(880, 0.05, 'triangle', 0.1, 0)
}
