import { describe, expect, it } from "vitest";
import { SEED, STATUSES, addItem, filterItems, formatReleaseDate, parseItems, removeItem, type Item } from "@/lib/changelog";

const rows: Item[] = [
  { id: "a", title: "1.0.0", body: "First stable", status: "Released", createdAt: Date.UTC(2026, 0, 5) },
  { id: "b", title: "1.1.0", body: "Search", status: "Draft", createdAt: Date.UTC(2026, 1, 5) },
];

describe("changelog logic", () => {
  it("every seed line uses a status the form offers", () => {
    for (const item of SEED) expect(STATUSES).toContain(item.status);
  });

  it("searches title, details and status case-insensitively", () => {
    expect(filterItems(rows, "SEARCH").map((r) => r.id)).toEqual(["b"]);
    expect(filterItems(rows, "released").map((r) => r.id)).toEqual(["a"]);
    expect(filterItems(rows, "")).toHaveLength(2);
    expect(filterItems(rows, "nothing")).toEqual([]);
  });

  it("adds a trimmed line on top and refuses a blank title", () => {
    const next = addItem(rows, { title: " 2.0.0 ", body: " Big ", status: "Draft" }, "n", 42);
    expect(next[0]).toEqual({ id: "n", title: "2.0.0", body: "Big", status: "Draft", createdAt: 42 });
    expect(addItem(rows, { title: "  ", body: "x", status: "Released" }, "n", 1)).toBe(rows);
  });

  it("removes a line by id", () => {
    expect(removeItem(rows, "a").map((r) => r.id)).toEqual(["b"]);
  });

  it("formats dates in UTC so every timezone prints the same day", () => {
    expect(formatReleaseDate(Date.UTC(2026, 9, 2, 23, 30))).toBe("02 OCT 2026");
    expect(formatReleaseDate(Date.UTC(2026, 9, 2, 0, 30))).toBe("02 OCT 2026");
  });

  it("round-trips stored lines and repairs or drops malformed rows", () => {
    expect(parseItems(JSON.stringify(rows))).toEqual(rows);
    expect(parseItems(null)).toBeNull();
    expect(parseItems("{")).toBeNull();
    expect(parseItems("{}")).toBeNull();
    expect(parseItems('[null, {"id":1}, {"id":"x","title":"t","status":"Shipped","createdAt":"soon"}]')).toEqual([
      { id: "x", title: "t", body: "", status: "Draft", createdAt: 0 },
    ]);
  });
});
