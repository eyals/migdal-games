import { QUESTIONS } from "@/lib/questions";
import { getAnswers, getGame, getPlayers, saveAnswers } from "@/lib/store";
import { cleanName, fail, ok } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const name = cleanName(new URL(req.url).searchParams.get("name"));
  const answers = await getAnswers();
  return ok({ answers: answers[name] ?? {} });
}

export async function POST(req: Request) {
  const body = await req.json();
  const name = cleanName(body.name);
  if (!(await getPlayers()).includes(name)) return fail("שחקן לא מוכר", 404);
  if ((await getGame()).phase !== "lobby") return fail("המשחק כבר התחיל, אי אפשר לשנות תשובות", 409);
  const answers: Record<number, string> = {};
  for (const [q, text] of Object.entries(body.answers ?? {})) {
    const i = Number(q);
    if (Number.isInteger(i) && i >= 0 && i < QUESTIONS.length && typeof text === "string" && text.trim()) {
      answers[i] = text.trim().slice(0, 500);
    }
  }
  await saveAnswers(name, answers);
  return ok({ answers });
}
