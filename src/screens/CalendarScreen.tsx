import { useMemo, useState } from "react";
import { streakOf, useActivity } from "../activity";
import { todayString } from "../api";
import { Card, TopBar } from "../components/ui";
import { MAJOR_ARCANA } from "../tarot/cards";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function monthCells(year: number, month: number): (string | null)[] {
  const first = new Date(year, month, 1);
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = Array.from({ length: first.getDay() }, () => null);
  for (let d = 1; d <= days; d++) cells.push(todayString(new Date(year, month, d)));
  while (cells.length % 7) cells.push(null);
  return cells;
}

export function CalendarScreen({ onBack }: { onBack: () => void }) {
  const activity = useActivity();
  const today = todayString();
  const [view, setView] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selected, setSelected] = useState(today);

  const cells = useMemo(() => monthCells(view.year, view.month), [view]);
  const visits = useMemo(() => new Set(activity.visits), [activity.visits]);
  const streak = streakOf(activity.visits, today);
  const monthKey = `${view.year}-${String(view.month + 1).padStart(2, "0")}`;
  const monthVisits = activity.visits.filter((d) => d.startsWith(monthKey)).length;

  const move = (delta: number) =>
    setView((v) => {
      const d = new Date(v.year, v.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  const fortune = activity.fortunes[selected];
  const tarot = activity.tarots[selected];
  const tarotCard = tarot ? MAJOR_ARCANA[tarot.cardId] : null;

  return (
    <>
      <TopBar title="운세 기록" onBack={onBack} />

      <div className="stat-row">
        <div className="stat">
          <span className="stat-value">🔥 {streak}일</span>
          <span className="stat-label">연속 방문</span>
        </div>
        <div className="stat">
          <span className="stat-value">{monthVisits}일</span>
          <span className="stat-label">이번 달 방문</span>
        </div>
        <div className="stat">
          <span className="stat-value">{Object.keys(activity.tarots).length}장</span>
          <span className="stat-label">뽑은 타로</span>
        </div>
      </div>

      <Card>
        <div className="cal-head">
          <button type="button" className="cal-nav" onClick={() => move(-1)} aria-label="이전 달">
            ‹
          </button>
          <span className="cal-title">
            {view.year}년 {view.month + 1}월
          </span>
          <button type="button" className="cal-nav" onClick={() => move(1)} aria-label="다음 달">
            ›
          </button>
        </div>
        <div className="cal-grid">
          {WEEKDAYS.map((w) => (
            <span key={w} className="cal-weekday">
              {w}
            </span>
          ))}
          {cells.map((date, i) =>
            date ? (
              <button
                key={date}
                type="button"
                className={[
                  "cal-day",
                  visits.has(date) ? "is-visited" : "",
                  date === today ? "is-today" : "",
                  date === selected ? "is-selected" : "",
                ].join(" ")}
                onClick={() => setSelected(date)}
              >
                <span className="cal-num">{Number(date.slice(8))}</span>
                <span className="cal-mark" aria-hidden="true">
                  {activity.tarots[date] ? MAJOR_ARCANA[activity.tarots[date].cardId].symbol : activity.fortunes[date] ? "♥" : ""}
                </span>
              </button>
            ) : (
              <span key={`e${i}`} />
            ),
          )}
        </div>
        <p className="cal-legend">
          <span className="cal-dot is-visited" /> 방문한 날 · 기호는 그날 뽑은 타로 카드예요
        </p>
      </Card>

      <Card title={`${Number(selected.slice(5, 7))}월 ${Number(selected.slice(8))}일 기록`} eyebrow="DAILY LOG">
        {!fortune && !tarotCard && <p className="card-text muted">이날의 기록이 없어요.</p>}
        {fortune && (
          <div className="log-row">
            <span className="log-label">오늘의 운세</span>
            <span className="log-value">
              <span className="month-score">
                {"♥".repeat(fortune.score)}
                <span className="muted">{"♡".repeat(5 - fortune.score)}</span>
              </span>{" "}
              {fortune.title}
            </span>
          </div>
        )}
        {tarotCard && (
          <div className="log-row">
            <span className="log-label">오늘의 타로</span>
            <span className="log-value">
              {tarotCard.symbol} {tarotCard.nameKo}
              {tarot?.reversed ? " (역방향)" : ""}
            </span>
          </div>
        )}
      </Card>
    </>
  );
}
