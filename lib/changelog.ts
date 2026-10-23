// The changelog queue: release lines kept in this browser (localStorage), plus pure helpers for the page.

export const STATUSES = ["Draft", "Released"] as const;
export type ReleaseStatus = (typeof STATUSES)[number];
export type Item = { id: string; title: string; body: string; status: ReleaseStatus; createdAt: number };
export type Draft = Pick<Item, "title" | "body" | "status">;

export const STORAGE_KEY = "changelog-v1";

// Fixed dates: the seed used Date.now() at import time, so server and browser rendered different dates.
export const SEED: Item[] = [
  { id: "1", title: "0.2.0", body: "Added mini-apps", status: "Released", createdAt: Date.UTC(2026, 9, 2) },
  { id: "2", title: "0.1.0", body: "Initial utilities", status: "Released", createdAt: Date.UTC(2026, 9, 1) },
];

export const EMPTY_DRAFT: Draft = { title: "", body: "", status: "Released" };

function isStatus(value: unknown): value is ReleaseStatus {
  return typeof value === "string" && (STATUSES as readonly string[]).includes(value);
}

export function parseItems(raw: string | null): Item[] | null {
  if (!raw) return null;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!Array.isArray(data)) return null;
  return data.flatMap((row): Item[] => {
    if (!row || typeof row !== "object") return [];
    const { id, title, body, status, createdAt } = row as Record<string, unknown>;
    if (typeof id !== "string" || typeof title !== "string") return [];
    return [{
      id,
      title,
      body: typeof body === "string" ? body : "",
      status: isStatus(status) ? status : "Draft",
      createdAt: typeof createdAt === "number" && Number.isFinite(createdAt) ? createdAt : 0,
    }];
  });
}

export function filterItems(items: Item[], query: string): Item[] {
  const needle = query.toLowerCase();
  return items.filter((item) => `${item.title} ${item.body} ${item.status}`.toLowerCase().includes(needle));
}

/** Add a release line on top. A blank title is refused (returns the list unchanged). */
export function addItem(items: Item[], draft: Draft, id: string, now: number): Item[] {
  const title = draft.title.trim();
  if (!title) return items;
  return [{ id, title, body: draft.body.trim(), status: draft.status, createdAt: now }, ...items];
}

export function removeItem(items: Item[], id: string): Item[] {
  return items.filter((item) => item.id !== id);
}

/** "02 OCT 2026", always in UTC so the server and every browser print the same day. */
export function formatReleaseDate(createdAt: number): string {
  return new Date(createdAt)
    .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" })
    .toUpperCase();
}
