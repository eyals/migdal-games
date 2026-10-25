import { buildRounds, leaderboard, scoreRound } from "@/lib/game";
import { QUESTIONS } from "@/lib/questions";
import { getAnswers, getGame, getPlayers, getVotes, resetAll, saveGame, usingRedis } from "@/lib/store";
import { fail, ok } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  const [game, players] = await Promise.all([getGame(), getPlayers()]);
  const base = { phase: game.phase, round: game.index, total: game.rounds.length, usingRedis };

  if (game.phase === "lobby") {
    const answers = await getAnswers();
    return ok({
      ...base,
      players: players.map((name) => ({ name, count: Object.keys(answers[name] ?? {}).length })),
    });
  }

  const round = game.rounds[game.index];
  const current = round && { question: QUESTIONS[round.q], text: round.text };
  if (game.phase === "question") {
    const votes = await getVotes(game.index);
    return ok({
      ...base,
      current,
      voted: players.filter((p) => votes[p]),
      waiting: players.filter((p) => !votes[p]),
    });
  }
  const last = game.lastRound ?? {};
  return ok({
    ...base,
    current: game.phase === "reveal" ? current : undefined,
    author: game.phase === "reveal" ? round?.author : undefined,
    guessed: Object.values(last).filter((p) => p > 0).length,
    counted: Object.keys(last).length,
    top: leaderboard(game.scores, players).filter((r) => r.rank <= 10),
  });
}

export async function POST(req: Request) {
  const { action } = await req.json();
  const game = await getGame();

  switch (action) {
    case "start": {
      if (game.phase !== "lobby") return fail("המשחק כבר התחיל", 409);
      const answers = await getAnswers();
      const rounds = buildRounds(answers);
      if (!rounds.length) return fail("אין עדיין תשובות");
      const candidates = (await getPlayers()).filter((p) => Object.keys(answers[p] ?? {}).length);
      await saveGame({ phase: "question", rounds, index: 0, candidates, scores: {} });
      break;
    }
    case "reveal": {
      if (game.phase !== "question") return fail("אין סיבוב פתוח", 409);
      const result = scoreRound(game.rounds[game.index].author, await getVotes(game.index));
      for (const [p, pts] of Object.entries(result)) game.scores[p] = (game.scores[p] ?? 0) + pts;
      await saveGame({ ...game, phase: "reveal", lastRound: result });
      break;
    }
    case "next": {
      if (game.phase !== "reveal") return fail("קודם צריך לחשוף", 409);
      const index = game.index + 1;
      await saveGame(
        index >= game.rounds.length
          ? { ...game, phase: "end" }
          : { ...game, phase: "question", index, lastRound: undefined },
      );
      break;
    }
    case "end":
      if (game.phase === "lobby") return fail("המשחק עוד לא התחיל", 409);
      await saveGame({ ...game, phase: "end" });
      break;
    case "reset":
      await resetAll();
      break;
    default:
      return fail("פעולה לא מוכרת");
  }
  return ok({ done: true });
}
