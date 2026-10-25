import { MAX_PICKS, ROUND_POINTS } from "./questions";

export type Phase = "lobby" | "question" | "reveal" | "end";

export type Round = { author: string; q: number; text: string };

export type Game = {
  phase: Phase;
  rounds: Round[];
  index: number;
  // Players who answered at least one question, frozen when the game starts.
  candidates: string[];
  scores: Record<string, number>;
  // Points each voter got in the current round, filled on reveal.
  lastRound?: Record<string, number>;
};

export type AnswerMap = Record<string, Record<number, string>>;

export const emptyGame = (): Game => ({
  phase: "lobby",
  rounds: [],
  index: 0,
  candidates: [],
  scores: {},
});

function shuffle<T>(items: T[], random: () => number): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Random order that avoids the same author twice in a row when possible.
export function buildRounds(answers: AnswerMap, random = Math.random): Round[] {
  const pool: Round[] = [];
  for (const [author, byQ] of Object.entries(answers)) {
    for (const [q, text] of Object.entries(byQ)) {
      if (text.trim()) pool.push({ author, q: Number(q), text: text.trim() });
    }
  }
  const remaining = shuffle(pool, random);
  const out: Round[] = [];
  while (remaining.length) {
    const prev = out[out.length - 1]?.author;
    let i = remaining.findIndex((r) => r.author !== prev);
    if (i === -1) i = 0;
    out.push(remaining.splice(i, 1)[0]);
  }
  return out;
}

// 6 points split across the picks: 1 pick = 6, 2 = 3, 3 = 2.
// The author's own vote never counts.
export function scoreRound(
  author: string,
  votes: Record<string, string[]>,
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const [voter, picks] of Object.entries(votes)) {
    if (voter === author || picks.length === 0) continue;
    result[voter] = picks.includes(author) ? ROUND_POINTS / picks.length : 0;
  }
  return result;
}

export function validPicks(picks: unknown, candidates: string[], voter: string): string[] | null {
  if (!Array.isArray(picks)) return null;
  const unique = [...new Set(picks)];
  if (unique.length < 1 || unique.length > MAX_PICKS) return null;
  if (!unique.every((p) => typeof p === "string" && p !== voter && candidates.includes(p))) return null;
  return unique as string[];
}

export type Ranked = { name: string; score: number; rank: number };

export function leaderboard(scores: Record<string, number>, players: string[]): Ranked[] {
  const rows = players
    .map((name) => ({ name, score: scores[name] ?? 0 }))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, "he"));
  let rank = 0;
  return rows.map((r, i) => {
    if (i === 0 || r.score !== rows[i - 1].score) rank = i + 1;
    return { ...r, rank };
  });
}
