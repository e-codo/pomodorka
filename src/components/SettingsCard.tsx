import { useEffect, useState, type ReactNode } from "react";
import type { Settings } from "../lib/pomodoro";
import { clamp } from "../lib/pomodoro";
import { IconTrash, IconVolume, IconMute } from "./icons";

interface SettingsCardProps {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  onWipe: () => void;
  accent: string;
}

type NumKey = "focusMin" | "shortMin" | "longMin" | "interval" | "dailyGoal";

const ROWS: { key: NumKey; label: string; hint: string; min: number; max: number; unit: string }[] = [
  { key: "focusMin", label: "Фокус", hint: "длина рабочей сессии", min: 1, max: 120, unit: "мин" },
  { key: "shortMin", label: "Короткий перерыв", hint: "пауза между сессиями", min: 1, max: 45, unit: "мин" },
  { key: "longMin", label: "Длинный перерыв", hint: "отдых после цикла", min: 5, max: 90, unit: "мин" },
  { key: "interval", label: "Сессий до длинного перерыва", hint: "цикл помодоро", min: 2, max: 8, unit: "шт" },
  { key: "dailyGoal", label: "Цель на день", hint: "сколько сессий фокуса", min: 1, max: 16, unit: "шт" },
];

export default function SettingsCard({ settings, onChange, onWipe, accent }: SettingsCardProps) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const t = window.setTimeout(() => setArmed(false), 3000);
    return () => window.clearTimeout(t);
  }, [armed]);

  const step = (key: NumKey, dir: 1 | -1) => {
    const row = ROWS.find((r) => r.key === key)!;
    onChange({ [key]: clamp(settings[key] + dir, row.min, row.max) } as Partial<Settings>);
  };

  const setDirect = (key: NumKey, raw: string) => {
    const row = ROWS.find((r) => r.key === key)!;
    const n = parseInt(raw, 10);
    onChange({ [key]: clamp(Number.isFinite(n) ? n : row.min, row.min, row.max) } as Partial<Settings>);
  };

  return (
    <section className="panel anim-fade-up px-6 py-6" style={{ animationDelay: "0.2s" }}>
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
          Настройки
        </h2>
        <span className="text-xs font-medium text-white/35">сохраняются автоматически</span>
      </div>

      <ul className="mt-4 divide-y divide-white/5">
        {ROWS.map((row) => (
          <li key={row.key} className="flex items-center gap-3 py-3.5">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#EDE8DD]">{row.label}</p>
              <p className="text-xs font-medium text-white/35">{row.hint}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                aria-label={`Уменьшить: ${row.label}`}
                onClick={() => step(row.key, -1)}
                disabled={settings[row.key] <= row.min}
                className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5 text-lg font-bold text-white/65 transition-all hover:border-white/25 hover:text-white active:scale-90 disabled:pointer-events-none disabled:opacity-30"
              >
                −
              </button>
              <div className="flex w-[74px] items-baseline justify-center gap-1 rounded-lg border border-white/10 bg-black/25 py-1.5">
                <input
                  type="number"
                  inputMode="numeric"
                  className="no-spin w-9 bg-transparent text-right font-display text-base font-semibold text-[#F2EDE3] outline-none"
                  value={settings[row.key]}
                  min={row.min}
                  max={row.max}
                  onChange={(e) => setDirect(row.key, e.target.value)}
                  onBlur={(e) => setDirect(row.key, e.target.value)}
                  aria-label={row.label}
                />
                <span className="text-[11px] font-semibold text-white/35">{row.unit}</span>
              </div>
              <button
                type="button"
                aria-label={`Увеличить: ${row.label}`}
                onClick={() => step(row.key, 1)}
                disabled={settings[row.key] >= row.max}
                className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5 text-lg font-bold text-white/65 transition-all hover:border-white/25 hover:text-white active:scale-90 disabled:pointer-events-none disabled:opacity-30"
              >
                +
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* переключатели */}
      <div className="mt-2 space-y-1">
        <ToggleRow
          label="Автозапуск перерывов"
          hint="после фокуса отдых начнётся сам"
          value={settings.autoBreak}
          accent={accent}
          onToggle={() => onChange({ autoBreak: !settings.autoBreak })}
        />
        <ToggleRow
          label="Автозапуск фокуса"
          hint="после перерыва работа начнётся сама"
          value={settings.autoFocus}
          accent={accent}
          onToggle={() => onChange({ autoFocus: !settings.autoFocus })}
        />
        <ToggleRow
          label="Звуковой сигнал"
          hint="мелодия в конце каждой сессии"
          value={settings.sound}
          accent={accent}
          icon={settings.sound ? <IconVolume className="h-4 w-4" /> : <IconMute className="h-4 w-4" />}
          onToggle={() => onChange({ sound: !settings.sound })}
        />
      </div>

      {/* сброс статистики */}
      <div className="mt-5 border-t border-white/5 pt-4">
        <button
          type="button"
          onClick={() => {
            if (armed) {
              onWipe();
              setArmed(false);
            } else {
              setArmed(true);
            }
          }}
          className={`flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.98] ${
            armed
              ? "border-red-400/50 bg-red-500/15 text-red-300"
              : "border-white/10 bg-white/5 text-white/45 hover:border-white/20 hover:text-white/75"
          }`}
        >
          <IconTrash className="h-4 w-4" />
          {armed ? "Нажмите ещё раз для удаления" : "Очистить всю статистику"}
        </button>
      </div>
    </section>
  );
}

function ToggleRow({
  label,
  hint,
  value,
  accent,
  onToggle,
  icon,
}: {
  label: string;
  hint: string;
  value: boolean;
  accent: string;
  onToggle: () => void;
  icon?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 text-sm font-semibold text-[#EDE8DD]">
          {icon && <span className="text-white/40">{icon}</span>}
          {label}
        </p>
        <p className="text-xs font-medium text-white/35">{hint}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-label={label}
        onClick={onToggle}
        className="relative h-[26px] w-[46px] shrink-0 rounded-full transition-colors duration-300"
        style={{
          background: value ? accent : "rgba(235,242,235,0.12)",
          boxShadow: value
            ? `0 0 14px color-mix(in srgb, ${accent} 45%, transparent)`
            : "inset 0 0 0 1px rgba(255,255,255,0.08)",
        }}
      >
        <span
          className="absolute top-[3px] h-5 w-5 rounded-full bg-[#F4F1E8] shadow-md transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)]"
          style={{ left: value ? 23 : 3 }}
        />
      </button>
    </div>
  );
}
