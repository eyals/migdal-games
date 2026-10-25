import { leaderboard } from "@/lib/game";
import { QUESTIONS } from "@/lib/questions";
import { getGame, getPlayers, getVotes } from "@/lib/store";
import { cleanName, ok } from "@/lib/http";

export const dynamic = "force-dynamic";

// What a player's screen needs. The author is hidden until the host reveals.
export async function GET(req: Request) {
  const name = cleanName(new URL(req.url).searchParams.get("name"));
  const game = await getGame();
  const base = { phase: game.phase, round: game.index, total: game.rounds.length };
  if (game.phase === "lobby") return ok(base);

  const players = await getPlayers();
  const board = leaderboard(game.scores, players);
  const round = game.rounds[game.index];
  const current = round && { question: QUESTIONS[round.q], text: round.text };

  if (game.phase === "question") {
    const votes = await getVotes(game.index);
    return ok({ ...base, current, candidates: game.candidates, myVote: votes[name] ?? null });
  }
  const me = board.find((r) => r.name === name) ?? null;
  return ok({
    ...base,
    current: game.phase === "reveal" ? current : undefined,
    author: game.phase === "reveal" ? round?.author : undefined,
    myPoints: game.phase === "reveal" ? (game.lastRound?.[name] ?? null) : undefined,
    top: board.filter((r) => r.rank <= 10),
    me,
  });
}
