"use client";

import { useEffect, useState } from "react";
import type { Phase, Ranked } from "@/lib/game";
import { MAX_PICKS, QUESTIONS, RECOMMENDED_ANSWERS, ROUND_POINTS } from "@/lib/questions";
import { api, usePoll } from "@/lib/client";
import { Leaderboard } from "./Leaderboard";

type State = {
  phase: Phase;
  round: number;
  total: number;
  current?: { question: string; text: string };
  candidates?: string[];
  myVote?: string[] | null;
  author?: string;
  myPoints?: number | null;
  top?: Ranked[];
  me?: Ranked | null;
};

const NAME_KEY = "migdal-quiz-name";

export default function PlayerPage() {
  const [name, setName] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      setName(localStorage.getItem(NAME_KEY));
    } catch {}
    setLoaded(true);
  }, []);

  const choose = (n: string | null) => {
    try {
      if (n) localStorage.setItem(NAME_KEY, n);
      else localStorage.removeItem(NAME_KEY);
    } catch {}
    setName(n);
  };

  const [state, refresh] = usePoll<State>(name ? `/api/state?name=${encodeURIComponent(name)}` : null);

  if (!loaded) return null;
  if (!name) return <Join onJoin={choose} />;

  return (
    <>
      <h1 className="title">
        סודות במגדל
        <small>
          שלום {name}{" "}
          {state?.phase === "lobby" && (
            <button className="ghost" style={{ color: "#c8cde0" }} onClick={() => choose(null)}>
              (לא את/ה?)
            </button>
          )}
        </small>
      </h1>
      {!state && <p className="title pulse" style={{ fontSize: 18 }}>טוען…</p>}
      {state?.phase === "lobby" && <Answers name={name} />}
      {state?.phase === "question" && <Vote key={state.round} name={name} state={state} onVoted={refresh} />}
      {state?.phase === "reveal" && <Reveal name={name} state={state} />}
      {state?.phase === "end" && (
        <div className="card">
          <h2>המשחק נגמר!</h2>
          {state.me && <p>סיימת במקום {state.me.rank} עם {state.me.score} נקודות.</p>}
          <Leaderboard rows={state.top ?? []} me={name} />
        </div>
      )}
    </>
  );
}

function Join({ onJoin }: { onJoin: (name: string) => void }) {
  const [value, setValue] = useState("");
  const [exists, setExists] = useState(false);
  const [error, setError] = useState("");

  const submit = async (confirm = false) => {
    setError("");
    try {
      const res = await api<{ name?: string; exists?: boolean }>("/api/join", { name: value, confirm });
      if (res.exists) setExists(true);
      else if (res.name) onJoin(res.name);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <>
      <h1 className="title">
        סודות במגדל
        <small>משחק משפחתי לסופ״ש</small>
      </h1>
      <div className="card">
        <h2>איך קוראים לך?</h2>
        <p className="muted">
          עונים עכשיו על כמה שאלות, ובערב כולם מנסים לנחש מי כתב מה. ילד/ה שעונה יחד עם הורה? כתבו את שני השמות,
          למשל &quot;איציק / רונית&quot;.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <input
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setExists(false);
            }}
            placeholder="השם שלך"
            autoFocus
          />
          {!exists && (
            <button className="block" style={{ marginTop: 12 }} disabled={!value.trim()}>
              כניסה
            </button>
          )}
        </form>
        {exists && (
          <div style={{ marginTop: 12 }}>
            <p>
              כבר יש שחקן בשם <b>{value.trim()}</b>. זה/זו את/ה?
            </p>
            <div className="row">
              <button onClick={() => submit(true)}>כן, זה אני</button>
              <button className="secondary" onClick={() => setExists(false)}>
                לא, אבחר שם אחר
              </button>
            </div>
          </div>
        )}
        {error && <p className="error">{error}</p>}
      </div>
    </>
  );
}

function Answers({ name }: { name: string }) {
  const [draft, setDraft] = useState<Record<number, string> | null>(null);
  const [saved, setSaved] = useState<Record<number, string>>({});
  const [status, setStatus] = useState("");

  useEffect(() => {
    api<{ answers: Record<number, string> }>(`/api/answers?name=${encodeURIComponent(name)}`)
      .then((r) => {
        setDraft(r.answers);
        setSaved(r.answers);
      })
      .catch(() => setDraft({}));
  }, [name]);

  if (!draft) return <p className="title pulse" style={{ fontSize: 18 }}>טוען…</p>;

  const count = Object.values(draft).filter((t) => t?.trim()).length;
  const dirty = JSON.stringify(clean(draft)) !== JSON.stringify(clean(saved));

  const save = async () => {
    setStatus("שומר…");
    try {
      const r = await api<{ answers: Record<number, string> }>("/api/answers", { name, answers: draft });
      setSaved(r.answers);
      setStatus("נשמר ✓");
    } catch (e) {
      setStatus((e as Error).message);
    }
  };

  return (
    <>
      <div className="card">
        <h2>בחר/י על אילו שאלות לענות</h2>
        <p className="muted" style={{ margin: 0 }}>
          מומלץ לפחות {RECOMMENDED_ANSWERS}. אפשר לחזור ולשנות עד שהמשחק מתחיל.
        </p>
      </div>
      <div className="card">
        {QUESTIONS.map((q, i) => (
          <div key={i} className={`q ${draft[i]?.trim() ? "done" : ""}`}>
            <label htmlFor={`q${i}`}>{q}</label>
            <textarea
              id={`q${i}`}
              value={draft[i] ?? ""}
              onChange={(e) => {
                setDraft({ ...draft, [i]: e.target.value });
                setStatus("");
              }}
              placeholder="לא חובה"
              maxLength={500}
            />
          </div>
        ))}
      </div>
      <div className="card sticky row spread">
        <span>
          ענית על <b>{count}</b> {count < RECOMMENDED_ANSWERS ? <span className="muted">(מומלץ {RECOMMENDED_ANSWERS})</span> : "✓"}
          {status && <span className="muted"> · {status}</span>}
        </span>
        <button onClick={save} disabled={!dirty}>
          שמירה
        </button>
      </div>
    </>
  );
}

const clean = (a: Record<number, string>) =>
  Object.fromEntries(Object.entries(a).filter(([, t]) => t?.trim()).map(([k, t]) => [k, t.trim()]));

function Vote({ name, state, onVoted }: { name: string; state: State; onVoted: () => void }) {
  const [picks, setPicks] = useState<string[]>(state.myVote ?? []);
  const [editing, setEditing] = useState(!state.myVote);
  const [error, setError] = useState("");
  const candidates = (state.candidates ?? []).filter((c) => c !== name);

  const toggle = (c: string) => {
    setError("");
    if (picks.includes(c)) setPicks(picks.filter((p) => p !== c));
    else if (picks.length < MAX_PICKS) setPicks([...picks, c]);
  };

  const send = async () => {
    try {
      await api("/api/vote", { name, round: state.round, picks });
      setEditing(false);
      onVoted();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <>
      <RoundCard state={state} />
      <div className="card">
        {editing ? (
          <>
            <h2>מי כתב את זה?</h2>
            <p className="points">
              אפשר לבחור עד {MAX_PICKS}. ניחוש נכון שווה {ROUND_POINTS} נקודות, מתחלקות בין הבחירות: בחירה
              אחת = {ROUND_POINTS}, שתיים = {ROUND_POINTS / 2}, שלוש = {ROUND_POINTS / 3}.
            </p>
            <div className="chips">
              {candidates.map((c) => (
                <button key={c} className={`chip ${picks.includes(c) ? "on" : ""}`} onClick={() => toggle(c)}>
                  {c}
                </button>
              ))}
            </div>
            <button className="block" onClick={send} disabled={!picks.length}>
              סיימתי ({picks.length ? `${ROUND_POINTS / picks.length} נק׳ אם צדקת` : "בחר/י מישהו"})
            </button>
            {error && <p className="error">{error}</p>}
          </>
        ) : (
          <>
            <h2>ההצבעה נשלחה ✓</h2>
            <p>בחרת: {picks.join(", ")}</p>
            <p className="muted pulse">מחכים לשאר…</p>
            <button className="secondary" onClick={() => setEditing(true)}>
              שינוי
            </button>
          </>
        )}
      </div>
    </>
  );
}

function Reveal({ name, state }: { name: string; state: State }) {
  const mine = state.author === name;
  return (
    <>
      <RoundCard state={state} />
      <div className="card">
        <p className="muted" style={{ margin: 0 }}>
          את זה כתב/ה
        </p>
        <p className="big">{state.author}</p>
        {mine ? (
          <p>זו הייתה התשובה שלך 🤫</p>
        ) : state.myPoints == null ? (
          <p className="muted">לא הצבעת בסיבוב הזה</p>
        ) : state.myPoints > 0 ? (
          <p>
            <span className="badge ok">+{state.myPoints} נקודות</span> ניחשת נכון!
          </p>
        ) : (
          <p>לא ניחשת הפעם.</p>
        )}
      </div>
      <div className="card">
        <h2>הטבלה</h2>
        <Leaderboard rows={state.top ?? []} me={name} />
        {state.me && state.me.rank > 10 && (
          <p className="muted">
            את/ה במקום {state.me.rank} עם {state.me.score} נקודות
          </p>
        )}
      </div>
    </>
  );
}

function RoundCard({ state }: { state: State }) {
  if (!state.current) return null;
  return (
    <div className="card">
      <div className="row spread">
        <span className="question">{state.current.question}</span>
        <span className="badge">
          {state.round + 1}/{state.total}
        </span>
      </div>
      <p className="quote">״{state.current.text}״</p>
    </div>
  );
}
