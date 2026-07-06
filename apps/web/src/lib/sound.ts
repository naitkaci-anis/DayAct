// Tiny notification "ring" generated with the Web Audio API (no asset needed).
// Browsers block/suspend audio until the user has interacted with the page, so
// we lazily create the context and always resume() it before playing.

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) {
    try {
      ctx = new AC();
    } catch {
      return null;
    }
  }
  return ctx;
}

// Call this from a real user gesture (click/keydown) to "unlock" audio so that
// later, timer-triggered sounds are allowed to play.
export function unlockAudio() {
  const c = getCtx();
  if (c && c.state === "suspended") c.resume().catch(() => {});
}

export function playReminderSound() {
  const c = getCtx();
  if (!c) return;
  try {
    // A suspended context (e.g. fired from a background timer) produces no
    // sound — resume first, then schedule the tones.
    if (c.state === "suspended") c.resume().catch(() => {});

    const now = c.currentTime;
    // two short "ding" tones
    const notes = [880, 1175];
    notes.forEach((freq, i) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = now + i * 0.18;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.3, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      osc.connect(gain).connect(c.destination);
      osc.start(t);
      osc.stop(t + 0.18);
    });
  } catch {
    /* audio not available */
  }
}
