import { describe, expect, it } from "vitest";
import { buildRounds, leaderboard, scoreRound, validPicks } from "./game";

describe("scoreRound", () => {
  it("splits 6 points across picks and ignores the author's vote", () => {
    const r = scoreRound("dana", {
      a: ["dana"],
      b: ["dana", "x"],
      c: ["x", "y", "dana"],
      d: ["x"],
      dana: ["x"],
    });
    expect(r).toEqual({ a: 6, b: 3, c: 2, d: 0 });
  });
});

describe("buildRounds", () => {
  it("includes every non-empty answer and avoids repeat authors in a row", () => {
    const rounds = buildRounds({ a: { 0: "x", 1: "y", 2: "z" }, b: { 0: "p", 3: " " }, c: { 5: "q" } });
    expect(rounds).toHaveLength(5);
    for (let i = 1; i < rounds.length; i++) {
      if (rounds[i].author === rounds[i - 1].author) {
        // Only allowed once the other authors are exhausted.
        expect(rounds.slice(i).every((r) => r.author === rounds[i].author)).toBe(true);
      }
    }
  });
});

describe("validPicks", () => {
  const c = ["a", "b", "c", "d"];
  it("accepts 1-3 known names, not yourself", () => {
    expect(validPicks(["a", "b"], c, "d")).toEqual(["a", "b"]);
    expect(validPicks([], c, "d")).toBeNull();
    expect(validPicks(["a", "b", "c", "d"], c, "x")).toBeNull();
    expect(validPicks(["d"], c, "d")).toBeNull();
    expect(validPicks(["zz"], c, "d")).toBeNull();
  });
});

describe("leaderboard", () => {
  it("gives ties the same rank", () => {
    const b = leaderboard({ a: 6, b: 6, c: 2 }, ["a", "b", "c", "d"]);
    expect(b.map((r) => r.rank)).toEqual([1, 1, 3, 4]);
  });
});
