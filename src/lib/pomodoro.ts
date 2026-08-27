export type Mode = "focus" | "short" | "long";
export type Status = "idle" | "running" | "paused";

export interface Settings {
  focusMin: number;
  shortMin: number;
  longMin: number;
  /** длинный перерыв каждые N сессий */
  interval: number;
  dailyGoal: number;
  autoBreak: boolean;
  autoFocus: boolean;
  sound: boolean;
}

export interface DayStat {
  count: number;
  minutes: number;
  lastAt?: string;
}

export type History = Record<string, DayStat>;

export const DEFAULT_SETTINGS: Settings = {
  focusMin: 25,
  shortMin: 5,
  longMin: 15,
  interval: 4,
  dailyGoal: 8,
  autoBreak: true,
  autoFocus: false,
  sound: true,
};

const SETTINGS_KEY = "pomodoro.settings.v1";
const HISTORY_KEY = "pomodoro.history.v1";

function safeParse<T extends object>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return { ...fallback, ...parsed } as T;
    }
  } catch {
    /* повреждённые данные — игнорируем */
  }
  return fallback;
}

export function loadSettings(): Settings {
  try {
    const s = safeParse(localStorage.getItem(SETTINGS_KEY), DEFAULT_SETTINGS);
    return {
      ...s,
      focusMin: clamp(s.focusMin, 1, 120),
      shortMin: clamp(s.shortMin, 1, 45),
      longMin: clamp(s.longMin, 5, 90),
      interval: clamp(s.interval, 2, 8),
      dailyGoal: clamp(s.dailyGoal, 1, 16),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(s: Settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    /* приватный режим — пропускаем */
  }
}

export function loadHistory(): History {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as History) : {};
  } catch {
    return {};
  }
}

export function saveHistory(h: History) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
  } catch {
    /* noop */
  }
}

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

/* ---------- даты ---------- */

export function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export const todayKey = () => dateKey(new Date());

export function keyDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return dateKey(d);
}

export function weekdayShort(d: Date): string {
  return ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"][(d.getDay() + 6) % 7];
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ---------- время ---------- */

export function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function formatMinutes(min: number): string {
  if (min < 60) return `${min} мин`;
  const h = Math.floor(min / 60);
  const rest = min % 60;
  return rest ? `${h} ч ${rest} мин` : `${h} ч`;
}

export function plural(n: number, one: string, few: string, many: string): string {
  const abs = Math.abs(n) % 100;
  const d = abs % 10;
  if (abs > 10 && abs < 20) return many;
  if (d === 1) return one;
  if (d >= 2 && d <= 4) return few;
  return many;
}

/* ---------- режимы ---------- */

export const MODE_META: Record<
  Mode,
  { label: string; short: string; color: string; caption: string }
> = {
  focus: {
    label: "Фокус",
    short: "Фокус",
    color: "#FF5C39",
    caption: "Работайте, пока идёт таймер",
  },
  short: {
    label: "Короткий перерыв",
    short: "Перерыв",
    color: "#43D9A3",
    caption: "Разомнитесь и отдохните",
  },
  long: {
    label: "Длинный перерыв",
    short: "Длинный",
    color: "#5AA9FF",
    caption: "Вы заслужили долгий отдых",
  },
};

export function modeDuration(mode: Mode, s: Settings): number {
  const min = mode === "focus" ? s.focusMin : mode === "short" ? s.shortMin : s.longMin;
  return min * 60;
}

/* ---------- звук ---------- */

let audioCtx: AudioContext | null = null;

function ensureCtx(): AudioContext | null {
  try {
    if (!audioCtx) {
      const Ctor =
        window.AudioContext ??
        (window as Window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return null;
      audioCtx = new Ctor();
    }
    if (audioCtx.state === "suspended") void audioCtx.resume();
    return audioCtx;
  } catch {
    return null;
  }
}

/** Будит аудио-контекст по первому жесту пользователя. */
export function primeAudio() {
  ensureCtx();
}

export function playChime(kind: "focus" | "break") {
  const ac = ensureCtx();
  if (!ac) return;
  const notes = kind === "focus" ? [523.25, 659.25, 783.99, 1046.5] : [659.25, 493.88];
  notes.forEach((freq, i) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const t = ac.currentTime + i * 0.17;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.16, t + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(t);
    osc.stop(t + 0.6);
  });
}
