import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { History, Mode, Settings, Status } from "./lib/pomodoro";
import {
  capitalize,
  DEFAULT_SETTINGS,
  formatClock,
  loadHistory,
  loadSettings,
  MODE_META,
  modeDuration,
  playChime,
  primeAudio,
  saveHistory,
  saveSettings,
  todayKey,
} from "./lib/pomodoro";
import TimerCard from "./components/TimerCard";
import StatsCard from "./components/StatsCard";
import SettingsCard from "./components/SettingsCard";
import { IconTomato } from "./components/icons";

interface Toast {
  id: number;
  text: string;
  color: string;
}

export default function App() {
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [history, setHistory] = useState<History>(() => loadHistory());
  const [mode, setMode] = useState<Mode>("focus");
  const [status, setStatus] = useState<Status>("idle");
  const [remaining, setRemaining] = useState<number>(() =>
    modeDuration("focus", loadSettings()),
  );
  const [toast, setToast] = useState<Toast | null>(null);

  const endAtRef = useRef<number | null>(null);
  const toastIdRef = useRef(0);

  const accent = MODE_META[mode].color;
  const tKey = todayKey();
  const today = history[tKey] ?? { count: 0, minutes: 0 };
  const dotsFilled = mode === "long" ? settings.interval : today.count % settings.interval;

  /* ---------- сохранение ---------- */

  useEffect(() => saveSettings(settings), [settings]);
  useEffect(() => saveHistory(history), [history]);

  /* ---------- вспомогательные ---------- */

  const showToast = (text: string, color: string) => {
    toastIdRef.current += 1;
    setToast({ id: toastIdRef.current, text, color });
  };

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const applyMode = (next: Mode, autoStart: boolean, msg: string) => {
    const dur = modeDuration(next, settings);
    setMode(next);
    setRemaining(dur);
    if (autoStart) {
      endAtRef.current = Date.now() + dur * 1000;
      setStatus("running");
    } else {
      endAtRef.current = null;
      setStatus("idle");
    }
    showToast(msg, MODE_META[next].color);
  };

  const completeSession = () => {
    if (mode === "focus") {
      const cur = history[tKey] ?? { count: 0, minutes: 0 };
      const updated = {
        count: cur.count + 1,
        minutes: cur.minutes + settings.focusMin,
        lastAt: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
      };
      setHistory({ ...history, [tKey]: updated });

      const next: Mode = updated.count % settings.interval === 0 ? "long" : "short";
      const mins = next === "long" ? settings.longMin : settings.shortMin;
      if (settings.sound) playChime("focus");
      applyMode(
        next,
        settings.autoBreak,
        updated.count === settings.dailyGoal
          ? `Цель дня достигнута — ${updated.count} сессий! Теперь отдых`
          : `Фокус завершён — перерыв ${mins} мин`,
      );
    } else {
      if (settings.sound) playChime("break");
      applyMode("focus", settings.autoFocus, "Перерыв окончен — время фокусироваться");
    }
  };

  /* ---------- управление ---------- */

  const toggle = () => {
    primeAudio();
    if (status === "running") {
      endAtRef.current = null;
      setStatus("paused");
    } else {
      const startFrom = remaining > 0 ? remaining : modeDuration(mode, settings);
      endAtRef.current = Date.now() + startFrom * 1000;
      setRemaining(startFrom);
      setStatus("running");
    }
  };

  const reset = () => {
    endAtRef.current = null;
    setStatus("idle");
    setRemaining(modeDuration(mode, settings));
  };

  const skip = () => {
    const next: Mode =
      mode === "focus"
        ? today.count > 0 && today.count % settings.interval === 0
          ? "long"
          : "short"
        : "focus";
    applyMode(next, false, "Сессия пропущена");
  };

  const switchMode = (m: Mode) => {
    endAtRef.current = null;
    setMode(m);
    setStatus("idle");
    setRemaining(modeDuration(m, settings));
  };

  const updateSettings = (patch: Partial<Settings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    const affectsCurrent =
      (mode === "focus" && patch.focusMin !== undefined) ||
      (mode === "short" && patch.shortMin !== undefined) ||
      (mode === "long" && patch.longMin !== undefined);
    if (!affectsCurrent) return;
    const total = modeDuration(mode, next);
    if (status === "running" && endAtRef.current != null) {
      const rem = Math.max(0, Math.round((endAtRef.current - Date.now()) / 1000));
      if (rem > total) {
        setRemaining(total);
        endAtRef.current = Date.now() + total * 1000;
      }
    } else if (status === "paused") {
      setRemaining((r) => Math.min(r, total));
    } else {
      setRemaining(total);
    }
  };

  const wipeStats = () => {
    setHistory({});
    showToast("Статистика очищена", "#F2EDE3");
  };

  /* ---------- тик таймера (по временной метке, без дрейфа) ---------- */

  const completeRef = useRef(completeSession);
  completeRef.current = completeSession;

  useEffect(() => {
    if (status !== "running") return;
    const id = window.setInterval(() => {
      const end = endAtRef.current;
      if (end == null) return;
      const rem = Math.max(0, Math.round((end - Date.now()) / 1000));
      setRemaining(rem);
      if (rem <= 0) {
        endAtRef.current = null;
        completeRef.current();
      }
    }, 250);
    return () => window.clearInterval(id);
  }, [status]);

  /* ---------- горячие клавиши ---------- */

  const toggleRef = useRef(toggle);
  const resetRef = useRef(reset);
  const skipRef = useRef(skip);
  toggleRef.current = toggle;
  resetRef.current = reset;
  skipRef.current = skip;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "BUTTON" || t.isContentEditable)
      )
        return;
      if (e.code === "Space") {
        e.preventDefault();
        toggleRef.current();
      } else if (e.code === "KeyR") {
        resetRef.current();
      } else if (e.code === "KeyS") {
        skipRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ---------- заголовок вкладки ---------- */

  useEffect(() => {
    const label = MODE_META[mode].label;
    document.title =
      status === "idle" && remaining === modeDuration(mode, settings)
        ? `${label} · Помодоро`
        : `${formatClock(remaining)} · ${label} — Помодоро`;
  }, [remaining, status, mode, settings]);

  const dateStr = capitalize(
    new Date().toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" }),
  );

  return (
    <div
      className="relative min-h-screen overflow-x-hidden font-body text-[#EDE8DD]"
      style={{ "--accent": accent } as CSSProperties}
    >
      {/* фоновая сцена */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[#0B1411]">
        {(Object.keys(MODE_META) as Mode[]).map((m) => (
          <div
            key={m}
            className="absolute -top-56 left-1/2 h-[620px] w-[1100px] max-w-none -translate-x-1/2 rounded-full blur-2xl transition-opacity duration-1000"
            style={{
              background: `radial-gradient(closest-side, color-mix(in srgb, ${MODE_META[m].color} 17%, transparent), transparent 72%)`,
              opacity: m === mode ? 1 : 0,
            }}
          />
        ))}
        <div
          className="absolute -bottom-64 -left-40 h-[520px] w-[720px] rounded-full blur-3xl transition-opacity duration-1000"
          style={{
            background: `radial-gradient(closest-side, color-mix(in srgb, ${accent} 8%, transparent), transparent 70%)`,
            opacity: 0.9,
          }}
        />
        <div className="bg-dots absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/45 to-transparent" />
      </div>

      {/* шапка */}
      <header className="anim-fade-up mx-auto flex w-full max-w-6xl items-center justify-between px-5 pt-7 sm:px-8">
        <div className="flex items-center gap-3.5">
          <IconTomato className="h-10 w-10 drop-shadow-[0_6px_16px_rgba(255,92,57,0.45)]" />
          <div>
            <p className="font-display text-xl font-bold leading-none tracking-tight text-[#F2EDE3]">
              Помодоро
            </p>
            <p className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-white/35">
              таймер фокусировки
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-white/70">{dateStr}</p>
          <p className="mt-0.5 text-xs font-medium text-white/30">данные хранятся локально</p>
        </div>
      </header>

      {/* содержимое */}
      <main className="mx-auto grid w-full max-w-6xl gap-5 px-5 pb-4 pt-6 sm:px-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-start">
        <TimerCard
          mode={mode}
          status={status}
          remaining={remaining}
          total={modeDuration(mode, settings)}
          cyclePos={dotsFilled}
          interval={settings.interval}
          onSwitchMode={switchMode}
          onToggle={toggle}
          onReset={reset}
          onSkip={skip}
        />

        <div className="flex flex-col gap-5">
          <StatsCard today={today} goal={settings.dailyGoal} history={history} accent={accent} />
          <SettingsCard
            settings={settings}
            onChange={updateSettings}
            onWipe={wipeStats}
            accent={accent}
          />
        </div>
      </main>

      <footer className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-5 pb-8 pt-2 text-xs font-medium text-white/25 sm:px-8">
        <p>Метод Pomodoro: чередуйте фокус и короткие перерывы, длинный — после каждого цикла</p>
        <p>
          {DEFAULT_SETTINGS.focusMin} / {DEFAULT_SETTINGS.shortMin} — классика ·{" "}
          <span style={{ color: accent }} className="font-semibold transition-colors duration-500">
            {today.count > 0 ? `${today.count} ✓ сегодня` : "начните первую сессию"}
          </span>
        </p>
      </footer>

      {/* тост */}
      {toast && (
        <div
          key={toast.id}
          className="anim-toast fixed bottom-6 left-1/2 z-50 flex items-center gap-3 rounded-2xl border px-5 py-3.5 text-sm font-semibold text-[#F2EDE3] shadow-2xl"
          style={{
            borderColor: `color-mix(in srgb, ${toast.color} 45%, transparent)`,
            background: "color-mix(in srgb, #101B16 88%, transparent)",
            backdropFilter: "blur(12px)",
          }}
          role="status"
        >
          <span
            className="anim-pop h-2.5 w-2.5 shrink-0 rounded-full"
            style={{
              background: toast.color,
              boxShadow: `0 0 10px ${toast.color}`,
            }}
          />
          {toast.text}
        </div>
      )}
    </div>
  );
}
