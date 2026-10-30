# סודות במגדל (migdal-quiz)

Everyone opens the site, enters a name and answers 1-3 of the questions.
At game time the host opens `/host`, starts the game, and each round shows one random answer.
Players pick up to 3 people they think wrote it; a correct guess is worth 6 points split across the picks (1 pick = 6, 2 = 3, 3 = 2). The author's own vote doesn't count.
The host reveals the author and the top 10, then moves to the next answer.

- Questions: `lib/questions.ts`
- Game rules (order, scoring, ranking): `lib/game.ts`
- Storage: Upstash Redis via `KV_REST_API_URL` / `KV_REST_API_TOKEN`. Without them it falls back to in-memory storage (local dev only).
- Host screen: `/host` (start, reveal, next, end now, reset everything). No auth by design.

```bash
npm ci && npm run lint && npm run typecheck && npm test && npm run build
```
