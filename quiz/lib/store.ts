import { Redis } from "@upstash/redis";
import { AnswerMap, Game, emptyGame } from "./game";

// Keys:
//   players       hash  name -> joined-at timestamp
//   answers       hash  name -> {questionIndex: text}
//   game          json  Game (written only by the host)
//   votes:<round> hash  voter -> picked names
const PREFIX = "mq:";

type Hash = Record<string, unknown>;

interface Backend {
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown): Promise<void>;
  hset(key: string, field: string, value: unknown): Promise<void>;
  hgetall(key: string): Promise<Hash>;
  del(keys: string[]): Promise<void>;
}

function redisBackend(url: string, token: string): Backend {
  const r = new Redis({ url, token });
  return {
    get: (k) => r.get(k),
    set: async (k, v) => void (await r.set(k, JSON.stringify(v))),
    hset: async (k, f, v) => void (await r.hset(k, { [f]: JSON.stringify(v) })),
    hgetall: async (k) => (await r.hgetall<Hash>(k)) ?? {},
    del: async (keys) => void (keys.length && (await r.del(...keys))),
  };
}

// In-memory fallback for local development without Redis.
function memoryBackend(): Backend {
  const g = globalThis as unknown as { __mq?: Map<string, unknown> };
  const m = (g.__mq ??= new Map());
  return {
    get: async (k) => m.get(k) ?? null,
    set: async (k, v) => void m.set(k, structuredClone(v)),
    hset: async (k, f, v) => {
      const h = (m.get(k) as Hash) ?? {};
      h[f] = structuredClone(v);
      m.set(k, h);
    },
    hgetall: async (k) => structuredClone((m.get(k) as Hash) ?? {}),
    del: async (keys) => keys.forEach((k) => m.delete(k)),
  };
}

const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
const db: Backend = url && token ? redisBackend(url, token) : memoryBackend();

// Upstash auto-parses JSON values; the memory backend stores objects as is.
const parse = <T>(v: unknown): T => (typeof v === "string" ? JSON.parse(v) : v) as T;

export async function getGame(): Promise<Game> {
  const g = await db.get(PREFIX + "game");
  return g ? parse<Game>(g) : emptyGame();
}

export const saveGame = (g: Game) => db.set(PREFIX + "game", g);

export async function getPlayers(): Promise<string[]> {
  const h = await db.hgetall(PREFIX + "players");
  return Object.entries(h)
    .sort((a, b) => Number(parse(a[1])) - Number(parse(b[1])))
    .map(([name]) => name);
}

export const addPlayer = (name: string) => db.hset(PREFIX + "players", name, Date.now());

export async function getAnswers(): Promise<AnswerMap> {
  const h = await db.hgetall(PREFIX + "answers");
  return Object.fromEntries(Object.entries(h).map(([k, v]) => [k, parse(v)]));
}

export const saveAnswers = (name: string, answers: Record<number, string>) =>
  db.hset(PREFIX + "answers", name, answers);

export async function getVotes(round: number): Promise<Record<string, string[]>> {
  const h = await db.hgetall(`${PREFIX}votes:${round}`);
  return Object.fromEntries(Object.entries(h).map(([k, v]) => [k, parse<string[]>(v)]));
}

export const saveVote = (round: number, voter: string, picks: string[]) =>
  db.hset(`${PREFIX}votes:${round}`, voter, picks);

export async function resetAll() {
  const g = await getGame();
  const voteKeys = g.rounds.map((_, i) => `${PREFIX}votes:${i}`);
  await db.del([PREFIX + "game", PREFIX + "players", PREFIX + "answers", ...voteKeys]);
}

export const usingRedis = Boolean(url && token);
