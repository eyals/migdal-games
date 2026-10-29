import { describe, expect, it } from "vitest";
import { buildDeck } from "./deck";
import { TASKS } from "./tasks";

describe("buildDeck", () => {
  it("includes every task once and avoids repeat categories in a row", () => {
    const deck = buildDeck(TASKS.easy, false);
    expect(new Set(deck)).toEqual(new Set(TASKS.easy));
    for (let i = 1; i < deck.length; i++) {
      if (deck[i].category === deck[i - 1].category) {
        // Only allowed once the other categories are exhausted.
        expect(deck.slice(i).every((t) => t.category === deck[i].category)).toBe(true);
      }
    }
  });

  it("drops physical tasks in calm mode", () => {
    const deck = buildDeck(TASKS.hard, true);
    expect(deck.length).toBeGreaterThan(0);
    expect(deck.some((t) => t.active)).toBe(false);
  });

  it("doesn't start a reshuffled deck with the task just shown", () => {
    const last = TASKS.medium[0];
    for (let n = 0; n < 50; n++) expect(buildDeck(TASKS.medium, false, last)[0]).not.toBe(last);
  });

  it("has enough tasks per level in calm mode", () => {
    for (const tasks of Object.values(TASKS)) expect(buildDeck(tasks, true).length).toBeGreaterThanOrEqual(10);
  });
});
