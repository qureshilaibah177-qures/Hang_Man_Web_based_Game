import { useCallback, useRef } from "react";

type SoundType = "correct" | "wrong" | "win" | "lose" | "click" | "hint";

export function useSound(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback((): AudioContext | null => {
    if (typeof window === "undefined") return null;
    if (!ctxRef.current) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AudioContextClass) {
        ctxRef.current = new AudioContextClass();
      }
    }
    return ctxRef.current;
  }, []);

  const playTone = useCallback(
    (
      freq: number,
      duration: number,
      type: OscillatorType = "sine",
      volume = 0.15,
      startOffset = 0
    ) => {
      if (!enabled) return;
      const ctx = getCtx();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.value = freq;

      const now = ctx.currentTime + startOffset;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(volume, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    },
    [enabled, getCtx]
  );

  const play = useCallback(
    (type: SoundType) => {
      if (!enabled) return;

      switch (type) {
        case "correct":
          playTone(523.25, 0.15, "sine", 0.12);
          playTone(659.25, 0.15, "sine", 0.12, 0.08);
          break;
        case "wrong":
          playTone(196, 0.2, "sawtooth", 0.1);
          playTone(146.83, 0.3, "sawtooth", 0.08, 0.1);
          break;
        case "click":
          playTone(800, 0.05, "square", 0.05);
          break;
        case "hint":
          playTone(440, 0.1, "triangle", 0.1);
          playTone(554.37, 0.1, "triangle", 0.1, 0.06);
          playTone(659.25, 0.15, "triangle", 0.1, 0.12);
          break;
        case "win":
          playTone(523.25, 0.12, "sine", 0.12);
          playTone(659.25, 0.12, "sine", 0.12, 0.1);
          playTone(783.99, 0.12, "sine", 0.12, 0.2);
          playTone(1046.5, 0.3, "sine", 0.12, 0.3);
          break;
        case "lose":
          playTone(392, 0.2, "sawtooth", 0.1);
          playTone(311.13, 0.2, "sawtooth", 0.1, 0.15);
          playTone(261.63, 0.4, "sawtooth", 0.1, 0.3);
          break;
      }
    },
    [enabled, playTone]
  );

  return play;
}
