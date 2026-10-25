import { validPicks } from "@/lib/game";
import { getGame, getPlayers, saveVote } from "@/lib/store";
import { cleanName, fail, ok } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json();
  const name = cleanName(body.name);
  if (!(await getPlayers()).includes(name)) return fail("שחקן לא מוכר", 404);
  const game = await getGame();
  if (game.phase !== "question" || body.round !== game.index) return fail("הסיבוב הזה כבר נסגר", 409);
  const picks = validPicks(body.picks, game.candidates, name);
  if (!picks) return fail("צריך לבחור בין 1 ל-3 אנשים");
  await saveVote(game.index, name, picks);
  return ok({ picks });
}
