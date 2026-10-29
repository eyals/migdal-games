# חם קר (migdal-hotcold)

Task ideas for "hot and cold": one player leaves the room, the host picks a level for them and shows the task to everyone, and the group guides the player back in with cheers and groans only.

- Three levels (easy = one clear step for small kids, medium, hard = several steps in a row).
- "No physical effort" hides tasks with floor work, jumping or balance (for older players).
- Tasks are generic ("someone", "an object"); the group picks the actual person or object out loud.
- Tasks: `lib/tasks.ts`. Order (shuffled, no same category twice in a row): `lib/deck.ts`.
- No backend, no env vars.

```bash
npm ci && npm run lint && npm run typecheck && npm test && npm run build
```
