// Tiny notification "ring" generated with the Web Audio API (no asset needed).
// Browsers block audio until the user has interacted with the page — that's fine
// for an app the user is actively using.

let ctx: AudioContext | null = null;

export function playReminderSound() {
  if (typeof window === "undefined") return;
  try {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx = ctx ?? new AC();

    const now = ctx.currentTime;
    // two short "ding" tones
    const notes = [880, 1175];
    notes.forEach((freq, i) => {
      const osc = ctx!.createOscillator();
      const gain = ctx!.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = now + i * 0.18;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.3, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      osc.connect(gain).connect(ctx!.destination);
      osc.start(t);
      osc.stop(t + 0.18);
    });
  } catch {
    /* audio not available */
  }
}
