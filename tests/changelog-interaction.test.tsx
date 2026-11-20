// @vitest-environment happy-dom
import { act } from "react";
import { renderToString } from "react-dom/server";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ChangelogPage } from "@/components/changelog-page";
import { createLocalStore } from "@/lib/local-store";
import { SEED, parseItems, type Item } from "@/lib/changelog";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root;
let host: HTMLDivElement;
let saved: Record<string, string>;
const button = (text: string) => [...host.querySelectorAll("button")].find((b) => b.textContent?.trim() === text) as HTMLButtonElement;
const titles = () => [...host.querySelectorAll(".rs-entry h3")].map((h) => h.textContent);
const press = (el: Element) => act(() => { el.dispatchEvent(new MouseEvent("click", { bubbles: true })); });
const submit = () => act(() => { host.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })); });
function type(el: HTMLInputElement, value: string) {
  act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
const field = (label: string) => [...host.querySelectorAll<HTMLLabelElement>(".cl-field")].find((l) => l.textContent?.startsWith(label))!.querySelector("input, select") as HTMLInputElement;

beforeEach(() => {
  saved = {};
  const store = createLocalStore<Item[]>({ key: "k", seed: SEED, parse: parseItems, serialize: JSON.stringify, storage: () => ({ getItem: (k) => saved[k] ?? null, setItem: (k, v) => { saved[k] = v; } }) });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  act(() => root.render(<ChangelogPage store={store} now={() => Date.UTC(2026, 10, 19)} />));
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
});

describe("changelog page with a broken stored date", () => {
  it("renders the row as Date unknown and keeps the other rows", () => {
    act(() => root.unmount());
    const broken = JSON.stringify([
      { id: "a", title: "9.9.9", body: "", status: "Released", createdAt: 1e20 },
      { id: "b", title: "0.1.0", body: "", status: "Released", createdAt: Date.UTC(2026, 9, 1) },
    ]);
    const store = createLocalStore<Item[]>({ key: "k", seed: SEED, parse: parseItems, serialize: JSON.stringify, storage: () => ({ getItem: () => broken, setItem: () => {} }) });
    root = createRoot(host);
    act(() => root.render(<ChangelogPage store={store} />));
    expect(titles()).toEqual(["9.9.9", "0.1.0"]);
    const metas = [...host.querySelectorAll(".rs-entry-meta")].map((m) => m.textContent);
    expect(metas[0]).toBe("Date unknown");
    expect(host.querySelectorAll("time")).toHaveLength(1);
  });
});

describe("changelog page", () => {
  it("refuses a blank title with an inline error and focuses the field", () => {
    submit();
    expect(host.querySelector('[role="alert"]')?.textContent).toBe("Give the release a version or title.");
    expect(document.activeElement).toBe(field("Version"));
    type(field("Version"), "0");
    expect(host.querySelector('[role="alert"]')).toBeNull();
  });

  it("adds a release on top with its date and state, and saves it", () => {
    type(field("Version"), "0.3.0");
    type(field("What changed"), "Reader shell");
    submit();
    expect(titles()[0]).toBe("0.3.0");
    expect(host.querySelector(".rs-entry time")?.getAttribute("dateTime")).toBe("2026-11-19");
    expect(JSON.parse(saved.k)[0].title).toBe("0.3.0");
    expect(host.querySelector('.rs-sr[role="status"]')?.textContent).toBe("Added “0.3.0”.");
  });

  it("searches live, counts what shows and clears", () => {
    type(host.querySelector<HTMLInputElement>('input[type="search"]')!, "initial");
    expect(titles()).toEqual(["0.1.0"]);
    expect(host.querySelector(".rs-count")?.textContent).toContain("Showing 1 of 2 releases");
    type(host.querySelector<HTMLInputElement>('input[type="search"]')!, "zzz");
    expect(host.textContent).toContain("Nothing matches");
    press(button("Clear search"));
    expect(titles()).toHaveLength(2);
  });

  it("returns focus to the search field after Clear search", () => {
    const search = host.querySelector<HTMLInputElement>('input[type="search"]')!;
    type(search, "zzz");
    press(button("Clear search"));
    expect(document.activeElement).toBe(search);
    expect(search.value).toBe("");
  });

  it("removes every line, then offers to restore the samples", () => {
    press(host.querySelector('button[aria-label="Remove 0.2.0"]')!);
    press(host.querySelector('button[aria-label="Remove 0.1.0"]')!);
    expect(host.textContent).toContain("No releases yet");
    press(button("Restore the sample lines"));
    expect(titles()).toEqual(["0.2.0", "0.1.0"]);
    expect(document.activeElement).toBe(host.querySelector('input[type="search"]'));
  });

  it("does not overwrite releases another tab stored after this tab emptied its list", () => {
    press(host.querySelector('button[aria-label="Remove 0.2.0"]')!);
    press(host.querySelector('button[aria-label="Remove 0.1.0"]')!);
    expect(host.textContent).toContain("No releases yet");
    saved.k = JSON.stringify([{ id: "t", title: "3.0.0", body: "", status: "Released", createdAt: Date.UTC(2026, 10, 19) }]);
    press(button("Restore the sample lines"));
    expect(titles()).toEqual(["3.0.0"]);
    expect(JSON.parse(saved.k)).toHaveLength(1);
  });

  it("keeps the add form disabled in server HTML and enables it once hydrated", () => {
    const html = renderToString(<ChangelogPage />);
    const form = html.slice(html.indexOf("<form"), html.indexOf("</form>"));
    expect(form.match(/disabled=""/g)).toHaveLength(4);
    expect(host.querySelectorAll("form [disabled]")).toHaveLength(0);
  });
});
