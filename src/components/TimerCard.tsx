import type { Mode, Status } from "../lib/pomodoro";
import { MODE_META, formatClock } from "../lib/pomodoro";
import { IconPause, IconPlay, IconReset, IconSkip } from "./icons";

interface TimerCardProps {
  mode: Mode;
  status: Status;
  remaining: number;
  total: number;
  cyclePos: number;
  interval: number;
  onSwitchMode: (m: Mode) => void;
  onToggle: () => void;
  onReset: () => void;
  onSkip: () => void;
}

const MODES: Mode[] = ["focus", "short", "long"];
const R = 150;
const C = 2 * Math.PI * R;

export default function TimerCard({
  mode,
  status,
  remaining,
  total,
  cyclePos,
  interval,
  onSwitchMode,
  onToggle,
  onReset,
  onSkip,
}: TimerCardProps) {
  const meta = MODE_META[mode];
  const frac = total > 0 ? remaining / total : 0;
  const offset = C * (1 - frac);
  const [mm, ss] = formatClock(remaining).split(":");
  const running = status === "running";
  const modeIdx = MODES.indexOf(mode);

  const caption =
    status === "running"
      ? mode === "focus"
        ? "Идёт фокусировка"
        : "Идёт перерыв"
      : status === "paused"
        ? "Пауза"
        : meta.caption;

  return (
    <section className="panel anim-fade-up relative overflow-hidden px-5 pb-8 pt-5 sm:px-8">
      {/* дышащее свечение за кольцом */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[46%] -z-0 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full transition-opacity duration-700"
        style={{
          background: `radial-gradient(circle, color-mix(in srgb, ${meta.color} 26%, transparent), transparent 65%)`,
          opacity: running ? 1 : 0.45,
        }}
      >
        {running && (
          <div
            className="timer-glow h-full w-full rounded-full"
            style={{
              background: `radial-gradient(circle, color-mix(in srgb, ${meta.color} 22%, transparent), transparent 60%)`,
            }}
          />
        )}
      </div>

      {/* переключатель режимов */}
      <div
        className="relative z-10 mx-auto grid w-full max-w-md grid-cols-3 rounded-full p-1"
        style={{
          border: "1px solid var(--border-panel)",
          background: "var(--bg-input)",
        }}
      >
        <span
          aria-hidden
          className="absolute inset-y-1 left-1 w-[calc((100%-0.5rem)/3)] rounded-full transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)]"
          style={{
            transform: `translateX(${modeIdx * 100}%)`,
            background: `color-mix(in srgb, ${meta.color} 22%, transparent)`,
            boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${meta.color} 55%, transparent)`,
          }}
        />
        {MODES.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onSwitchMode(m)}
            className={`relative z-10 rounded-full px-2 py-2.5 text-[13px] font-semibold transition-colors duration-300 sm:text-sm ${
              m === mode ? "" : "hover:opacity-80"
            }`}
            style={
              m === mode
                ? { color: MODE_META[m].color }
                : { color: "var(--text-muted)" }
            }
          >
            {MODE_META[m].short}
          </button>
        ))}
      </div>

      {/* кольцо таймера */}
      <div className="relative z-10 mx-auto mt-8 w-[min(80vw,330px)] sm:mt-10">
        <svg viewBox="0 0 340 340" className="w-full -rotate-90">
          {/* декоративный пунктирный обод */}
          <g className="dial-spin" style={{ transformBox: "fill-box" }}>
            <circle
              cx="170"
              cy="170"
              r="164"
              fill="none"
              stroke="var(--ring-decor)"
              strokeWidth="1.5"
              strokeDasharray="1.5 10.5"
              strokeLinecap="round"
            />
          </g>
          <circle
            cx="170"
            cy="170"
            r={R}
            fill="none"
            stroke="var(--ring-track)"
            strokeWidth="13"
          />
          <circle
            cx="170"
            cy="170"
            r={R}
            fill="none"
            stroke={meta.color}
            strokeWidth="13"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={offset}
            className="ring-progress"
            style={{
              filter: `drop-shadow(0 0 14px color-mix(in srgb, ${meta.color} 55%, transparent))`,
            }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span
            className="font-display text-[11px] font-semibold uppercase tracking-[0.28em] transition-colors duration-500"
            style={{ color: meta.color }}
          >
            {meta.label}
          </span>
          <div
            className="font-display mt-2 whitespace-nowrap text-[clamp(52px,16vw,72px)] font-bold leading-none tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            {mm}
            <span className={running ? "colon-blink" : ""}>:</span>
            {ss}
          </div>
          <div className="mt-4 flex items-center gap-2.5" aria-label={`Сессии цикла: ${cyclePos} из ${interval}`}>
            {Array.from({ length: interval }, (_, i) => (
              <span
                key={i}
                className="h-2 w-2 rounded-full transition-all duration-500"
                style={
                  i < cyclePos
                    ? {
                        background: meta.color,
                        boxShadow: `0 0 8px color-mix(in srgb, ${meta.color} 70%, transparent)`,
                        transform: "scale(1)",
                      }
                    : { background: "var(--dot-inactive)", transform: "scale(0.85)" }
                }
              />
            ))}
          </div>
          <p
            className={`mt-4 text-sm font-medium transition-colors duration-500 ${
              status === "paused" ? "text-amber-400" : ""
            }`}
            style={status !== "paused" ? { color: "var(--text-muted)" } : undefined}
          >
            {caption}
          </p>
        </div>
      </div>

      {/* управление */}
      <div className="relative z-10 mt-8 flex items-center justify-center gap-4 sm:mt-10">
        <button
          type="button"
          onClick={onReset}
          title="Сброс (R)"
          aria-label="Сбросить таймер"
          className="group grid h-13 w-13 place-items-center rounded-full transition-all duration-200 active:scale-90"
          style={{
            border: "1px solid var(--border-button)",
            background: "var(--bg-button)",
            color: "var(--text-muted)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--border-button-hover)";
            e.currentTarget.style.background = "var(--bg-button-hover)";
            e.currentTarget.style.color = "var(--text-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border-button)";
            e.currentTarget.style.background = "var(--bg-button)";
            e.currentTarget.style.color = "var(--text-muted)";
          }}
        >
          <IconReset className="h-5 w-5 transition-transform duration-500 group-hover:-rotate-[200deg]" />
        </button>

        <button
          type="button"
          onClick={onToggle}
          className="font-display group flex h-16 items-center gap-3 rounded-full px-9 text-[15px] font-semibold uppercase tracking-wider text-[#17110C] transition-all duration-200 hover:brightness-110 active:scale-95 sm:h-[68px] sm:px-12 sm:text-base"
          style={{
            background: meta.color,
            boxShadow: `0 16px 44px -14px color-mix(in srgb, ${meta.color} 75%, transparent)`,
          }}
        >
          {running ? (
            <IconPause className="h-5 w-5" />
          ) : (
            <IconPlay className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5" />
          )}
          {running ? "Пауза" : status === "paused" ? "Дальше" : "Старт"}
        </button>

        <button
          type="button"
          onClick={onSkip}
          title="Пропустить сессию (S)"
          aria-label="Пропустить сессию"
          className="group grid h-13 w-13 place-items-center rounded-full transition-all duration-200 active:scale-90"
          style={{
            border: "1px solid var(--border-button)",
            background: "var(--bg-button)",
            color: "var(--text-muted)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--border-button-hover)";
            e.currentTarget.style.background = "var(--bg-button-hover)";
            e.currentTarget.style.color = "var(--text-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border-button)";
            e.currentTarget.style.background = "var(--bg-button)";
            e.currentTarget.style.color = "var(--text-muted)";
          }}
        >
          <IconSkip className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </button>
      </div>

      <p className="relative z-10 mt-6 text-center text-xs font-medium" style={{ color: "var(--text-extra-faint)" }}>
        Пробел — старт / пауза · R — сброс · S — пропустить
      </p>
    </section>
  );
}
