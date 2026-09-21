import type { DayStat, History } from "../lib/pomodoro";
import {
  formatMinutes,
  keyDaysAgo,
  plural,
  todayKey,
  weekdayShort,
} from "../lib/pomodoro";
import { IconClock, IconFlame, IconTarget } from "./icons";

interface StatsCardProps {
  today: DayStat;
  goal: number;
  history: History;
  accent: string;
}

export default function StatsCard({ today, goal, history, accent }: StatsCardProps) {
  const pct = Math.min(100, Math.round((today.count / goal) * 100));
  const goalReached = today.count >= goal;

  // серия дней подряд с фокусировкой
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const day = history[keyDaysAgo(i)];
    if (day && day.count > 0) streak++;
    else break;
  }

  // последние 7 дней
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = keyDaysAgo(6 - i);
    return {
      key,
      label: weekdayShort(d),
      count: history[key]?.count ?? 0,
      isToday: key === todayKey(),
    };
  });
  const maxCount = Math.max(1, ...days.map((d) => d.count));
  const weekTotal = days.reduce((sum, d) => sum + d.count, 0);

  return (
    <section className="panel anim-fade-up px-6 py-6" style={{ animationDelay: "0.1s" }}>
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>
          Сегодня
        </h2>
        {today.lastAt && (
          <span className="text-xs font-medium" style={{ color: "var(--text-faint)" }}>
            финиш в {today.lastAt}
          </span>
        )}
      </div>

      <div className="mt-5 flex items-end gap-3">
        <span
          className="font-display text-6xl font-bold leading-none tracking-tight"
          style={{ color: accent }}
        >
          {today.count}
        </span>
        <span className="pb-1 text-lg font-semibold" style={{ color: "var(--text-muted)" }}>
          / {goal}
        </span>
        <span
          className="mb-1 ml-auto rounded-full px-3 py-1 text-xs font-semibold"
          style={{
            border: "1px solid var(--border-panel)",
            background: "var(--bg-button)",
            color: "var(--text-muted)",
          }}
        >
          {pct}%
        </span>
      </div>
      <p className="mt-2 text-sm font-medium" style={{ color: "var(--text-muted)" }}>
        {goalReached
          ? "Цель дня достигнута — отличная работа!"
          : `${plural(goal - today.count, "сессия", "сессии", "сессий")} до цели дня`}
      </p>

      {/* прогресс-бар */}
      <div
        className="mt-3 h-2.5 overflow-hidden rounded-full"
        style={{ background: "var(--bg-input)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-[cubic-bezier(.22,1,.36,1)]"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, color-mix(in srgb, ${accent} 70%, #ffffff00), ${accent})`,
            boxShadow: `0 0 12px color-mix(in srgb, ${accent} 60%, transparent)`,
          }}
        />
      </div>

      {/* мини-метрики */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div
          className="rounded-xl px-4 py-3.5 transition-colors"
          style={{
            border: "1px solid var(--border-panel)",
            background: "var(--bg-input)",
          }}
        >
          <div className="flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
            <IconClock className="h-4 w-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider">В фокусе</span>
          </div>
          <p className="font-display mt-1.5 text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            {formatMinutes(today.minutes)}
          </p>
        </div>
        <div
          className="rounded-xl px-4 py-3.5 transition-colors"
          style={{
            border: "1px solid var(--border-panel)",
            background: "var(--bg-input)",
          }}
        >
          <div className="flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
            <IconFlame className="h-4 w-4 text-orange-400/90" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Серия</span>
          </div>
          <p className="font-display mt-1.5 text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            {streak}{" "}
            <span className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
              {plural(streak, "день", "дня", "дней")}
            </span>
          </p>
        </div>
      </div>

      {/* график недели */}
      <div className="mt-6">
        <div className="flex items-baseline justify-between">
          <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            <IconTarget className="h-4 w-4" />
            Последние 7 дней
          </h3>
          <span className="text-xs font-medium" style={{ color: "var(--text-faint)" }}>
            {weekTotal} {plural(weekTotal, "сессия", "сессии", "сессий")}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-7 gap-2">
          {days.map((d, i) => (
            <div key={d.key} className="group flex flex-col items-center gap-1.5">
              <span
                className={`text-[11px] font-bold transition-opacity ${
                  d.count > 0 ? "" : "opacity-0 group-hover:opacity-40"
                }`}
                style={d.count > 0 ? { color: "var(--text-muted)" } : undefined}
              >
                {d.count || "·"}
              </span>
              <div className="flex h-16 w-full items-end justify-center">
                <div
                  className="anim-bar w-full max-w-[26px] rounded-t-[7px] rounded-b-[3px] transition-colors duration-300"
                  style={{
                    height: `${Math.max(7, (d.count / maxCount) * 100)}%`,
                    animationDelay: `${0.15 + i * 0.05}s`,
                    background: d.isToday
                      ? accent
                      : d.count > 0
                        ? "color-mix(in srgb, " + accent + " 38%, rgba(255,255,255,0.06))"
                        : "var(--bar-inactive)",
                    boxShadow: d.isToday
                      ? `0 0 14px color-mix(in srgb, ${accent} 45%, transparent)`
                      : "none",
                  }}
                  title={`${d.label}: ${d.count} ${plural(d.count, "сессия", "сессии", "сессий")}`}
                />
              </div>
              <span
                className={`text-[11px] font-semibold ${
                  d.isToday ? "" : ""
                }`}
                style={{ color: d.isToday ? "var(--text-primary)" : "var(--text-faint)" }}
              >
                {d.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
