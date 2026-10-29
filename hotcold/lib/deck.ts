import type { Task } from "./tasks";

function shuffle<T>(items: T[], random: () => number): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Random order that avoids the same category twice in a row when possible.
// `after` is the task shown right before this deck, so a reshuffle doesn't repeat it either.
export function buildDeck(tasks: Task[], calm: boolean, after?: Task, random = Math.random): Task[] {
  const remaining = shuffle(
    tasks.filter((t) => !calm || !t.active),
    random,
  );
  const out: Task[] = [];
  let prev = after;
  while (remaining.length) {
    let i = remaining.findIndex((t) => t.category !== prev?.category && t !== after);
    if (i === -1) i = remaining.findIndex((t) => t !== after);
    if (i === -1) i = 0;
    prev = remaining.splice(i, 1)[0];
    out.push(prev);
  }
  return out;
}
