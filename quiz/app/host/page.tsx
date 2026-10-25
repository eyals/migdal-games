"use client";

import { useState } from "react";
import type { Phase, Ranked } from "@/lib/game";
import { api, usePoll } from "@/lib/client";
import { Leaderboard } from "../Leaderboard";

type HostState = {
  phase: Phase;
  round: number;
  total: number;
  usingRedis: boolean;
  players?: { name: string; count: number }[];
  current?: { question: string; text: string };
  voted?: string[];
  waiting?: string[];
  author?: string;
  guessed?: number;
  counted?: number;
  top?: Ranked[];
};

export default function HostPage() {
  const [state, refresh] = usePoll<HostState>("/api/host");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const act = async (action: string, confirmText?: string) => {
    if (confirmText && !confirm(confirmText)) return;
    setBusy(true);
    setError("");
    try {
      await api("/api/host", { action });
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (!state) return <p className="title pulse">טוען…</p>;

  return (
    <div className="host">
      <h1 className="title">
        מסך המנחה
        <small>
          {state.phase === "lobby" ? "לפני המשחק" : state.phase === "end" ? "המשחק נגמר" : `סיבוב ${state.round + 1} מתוך ${state.total}`}
        </small>
      </h1>

      {!state.usingRedis && (
        <div className="card">
          <b>אין חיבור למסד נתונים.</b> הנתונים נשמרים בזיכרון בלבד ויימחקו. צריך לחבר Upstash Redis בפרויקט ב-Vercel.
        </div>
      )}

      {state.phase === "lobby" && <Lobby state={state} busy={busy} onStart={() => act("start", "להתחיל את המשחק? אחרי זה אי אפשר לשנות תשובות.")} />}

      {(state.phase === "question" || state.phase === "reveal") && state.current && (
        <div className="card">
          <span className="question">{state.current.question}</span>
          <p className="quote">״{state.current.text}״</p>
        </div>
      )}

      {state.phase === "question" && (
        <div className="card">
          <h2>
            הצביעו {state.voted?.length} מתוך {(state.voted?.length ?? 0) + (state.waiting?.length ?? 0)}
          </h2>
          {!!state.waiting?.length && (
            <>
              <p className="muted" style={{ margin: 0 }}>
                עוד לא הצביעו:
              </p>
              <div className="names">
                {state.waiting.map((n) => (
                  <span key={n} className="badge">
                    {n}
                  </span>
                ))}
              </div>
            </>
          )}
          <button className="block" style={{ marginTop: 14 }} disabled={busy} onClick={() => act("reveal")}>
            חשיפה וטבלה
          </button>
        </div>
      )}

      {state.phase === "reveal" && (
        <>
          <div className="card">
            <p className="muted" style={{ margin: 0 }}>
              את זה כתב/ה
            </p>
            <p className="big">{state.author}</p>
            <p>
              {state.guessed} מתוך {state.counted} ניחשו נכון
            </p>
            <button className="block" disabled={busy} onClick={() => act("next")}>
              {state.round + 1 >= state.total ? "לסיום המשחק" : "לשאלה הבאה"}
            </button>
          </div>
          <div className="card">
            <h2>הטבלה</h2>
            <Leaderboard rows={state.top ?? []} />
          </div>
        </>
      )}

      {state.phase === "end" && (
        <div className="card">
          <h2>הטבלה הסופית</h2>
          <Leaderboard rows={state.top ?? []} />
        </div>
      )}

      {error && <div className="card error">{error}</div>}

      <div className="row" style={{ justifyContent: "center", marginTop: 24 }}>
        {(state.phase === "question" || state.phase === "reveal") && (
          <button className="secondary" disabled={busy} onClick={() => act("end", "לסיים את המשחק עכשיו ולהציג טבלה סופית?")}>
            סיום המשחק עכשיו
          </button>
        )}
        <button
          className="danger"
          disabled={busy}
          onClick={() => act("reset", "למחוק את כל השחקנים, התשובות והניקוד? אי אפשר לבטל.")}
        >
          איפוס הכל
        </button>
      </div>
    </div>
  );
}

function Lobby({ state, busy, onStart }: { state: HostState; busy: boolean; onStart: () => void }) {
  const players = state.players ?? [];
  const answers = players.reduce((s, p) => s + p.count, 0);
  return (
    <div className="card">
      <h2>
        {players.length} שחקנים · {answers} תשובות
      </h2>
      {players.length ? (
        <ol className="board">
          {players.map((p) => (
            <li key={p.name}>
              <span className="name">{p.name}</span>
              <span className={`badge ${p.count >= 3 ? "ok" : ""}`}>{p.count} תשובות</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="muted">עוד אף אחד לא נכנס</p>
      )}
      <button className="block" style={{ marginTop: 14 }} disabled={busy || !answers} onClick={onStart}>
        התחלת המשחק
      </button>
    </div>
  );
}
