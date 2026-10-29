"use client";

import { useEffect, useState } from "react";
import { buildDeck } from "@/lib/deck";
import { LEVELS, TASKS, type Level, type Task } from "@/lib/tasks";

const CALM_KEY = "migdal-hotcold-calm";

export default function Page() {
  const [level, setLevel] = useState<Level | null>(null);
  const [calm, setCalm] = useState(false);
  // Tasks shown so far at this level, so "back" works.
  const [shown, setShown] = useState<Task[]>([]);
  const [pos, setPos] = useState(0);
  const [deck, setDeck] = useState<Task[]>([]);

  useEffect(() => {
    try {
      setCalm(localStorage.getItem(CALM_KEY) === "1");
    } catch {}
  }, []);

  const toggleCalm = (on: boolean) => {
    try {
      localStorage.setItem(CALM_KEY, on ? "1" : "0");
    } catch {}
    setCalm(on);
  };

  const draw = (lvl: Level, rest: Task[], last?: Task) => {
    const pile = rest.length ? rest : buildDeck(TASKS[lvl], calm, last);
    return { task: pile[0], rest: pile.slice(1) };
  };

  const start = (lvl: Level) => {
    const { task, rest } = draw(lvl, []);
    setLevel(lvl);
    setShown([task]);
    setPos(0);
    setDeck(rest);
  };

  const next = () => {
    if (!level) return;
    if (pos < shown.length - 1) return setPos(pos + 1);
    const { task, rest } = draw(level, deck, shown[pos]);
    setShown([...shown, task]);
    setPos(pos + 1);
    setDeck(rest);
  };

  if (!level) {
    return (
      <>
        <h1 className="title">
          חם קר
          <small>בחרו רמה לפי מי שיוצא מהחדר</small>
        </h1>
        {LEVELS.map((l) => (
          <button key={l.id} className="level" onClick={() => start(l.id)}>
            {l.label}
            <small>{l.hint}</small>
          </button>
        ))}
        <label className="toggle">
          <input type="checkbox" checked={calm} onChange={(e) => toggleCalm(e.target.checked)} />
          בלי מאמץ פיזי (בלי רצפה, קפיצות ושיווי משקל)
        </label>
      </>
    );
  }

  const current = LEVELS.find((l) => l.id === level)!;
  return (
    <>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h1 className="title" style={{ margin: 0 }}>חם קר</h1>
        <button className="ghost" onClick={() => setLevel(null)}>
          לתפריט
        </button>
      </div>
      <div className="card task">
        <span className="badge">
          {current.label}
          {calm && " · רגוע"}
        </span>
        <p className="text">{shown[pos].text}</p>
      </div>
      <div className="controls">
        <button className="secondary" disabled={pos === 0} onClick={() => setPos(pos - 1)}>
          הקודמת
        </button>
        <button onClick={next}>משימה אחרת</button>
      </div>
    </>
  );
}
