import type { Ranked } from "@/lib/game";

const fmt = (n: number) => (Number.isInteger(n) ? n : n.toFixed(1));

export function Leaderboard({ rows, me }: { rows: Ranked[]; me?: string }) {
  if (!rows.length) return <p className="muted">עוד אין נקודות</p>;
  return (
    <ol className="board">
      {rows.map((r) => (
        <li key={r.name} className={r.name === me ? "me" : ""}>
          <span className="rank">{r.rank}</span>
          <span className="name">{r.name}</span>
          <span className="score">{fmt(r.score)}</span>
        </li>
      ))}
    </ol>
  );
}
