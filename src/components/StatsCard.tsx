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
        <h2 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
          Сегодня
        </h2>
        {today.lastAt && (
          <span className="text-xs font-medium text-white/35">
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
        <span className="pb-1 text-lg font-semibold text-white/40">/ {goal}</span>
        <span className="mb-1 ml-auto rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/55">
          {pct}%
        </span>
      </div>
      <p className="mt-2 text-sm font-medium text-white/45">
        {goalReached
          ? "Цель дня достигнута — отличная работа!"
          : `${plural(goal - today.count, "сессия", "сессии", "сессий")} до цели дня`}
      </p>

      {/* прогресс-бар */}
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/10">
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
        <div className="rounded-xl border border-white/8 bg-black/20 px-4 py-3.5 transition-colors hover:border-white/15">
          <div className="flex items-center gap-2 text-white/40">
            <IconClock className="h-4 w-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider">В фокусе</span>
          </div>
          <p className="font-display mt-1.5 text-xl font-semibold text-[#F2EDE3]">
            {formatMinutes(today.minutes)}
          </p>
        </div>
        <div className="rounded-xl border border-white/8 bg-black/20 px-4 py-3.5 transition-colors hover:border-white/15">
          <div className="flex items-center gap-2 text-white/40">
            <IconFlame className="h-4 w-4 text-orange-400/90" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Серия</span>
          </div>
          <p className="font-display mt-1.5 text-xl font-semibold text-[#F2EDE3]">
            {streak}{" "}
            <span className="text-sm font-medium text-white/45">
              {plural(streak, "день", "дня", "дней")}
            </span>
          </p>
        </div>
      </div>

      {/* график недели */}
      <div className="mt-6">
        <div className="flex items-baseline justify-between">
          <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-white/40">
            <IconTarget className="h-4 w-4" />
            Последние 7 дней
          </h3>
          <span className="text-xs font-medium text-white/35">
            {weekTotal} {plural(weekTotal, "сессия", "сессии", "сессий")}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-7 gap-2">
          {days.map((d, i) => (
            <div key={d.key} className="group flex flex-col items-center gap-1.5">
              <span
                className={`text-[11px] font-bold transition-opacity ${
                  d.count > 0 ? "text-white/55" : "opacity-0 group-hover:opacity-40"
                }`}
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
                        : "rgba(235,242,235,0.1)",
                    boxShadow: d.isToday
                      ? `0 0 14px color-mix(in srgb, ${accent} 45%, transparent)`
                      : "none",
                  }}
                  title={`${d.label}: ${d.count} ${plural(d.count, "сессия", "сессии", "сессий")}`}
                />
              </div>
              <span
                className={`text-[11px] font-semibold ${
                  d.isToday ? "text-white/85" : "text-white/35"
                }`}
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
