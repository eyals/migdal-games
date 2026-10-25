import { addPlayer, getPlayers } from "@/lib/store";
import { cleanName, fail, ok } from "@/lib/http";

export const dynamic = "force-dynamic";

// Registers a name. If the name exists the client must confirm it is the same person.
export async function POST(req: Request) {
  const body = await req.json();
  const name = cleanName(body.name);
  if (!name) return fail("חסר שם");
  const players = await getPlayers();
  if (players.includes(name) && !body.confirm) return ok({ exists: true });
  if (!players.includes(name)) await addPlayer(name);
  return ok({ name });
}
