import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const PAGE = process.env.HOME_PAGE_MODULE ?? "@/app/page";

async function renderAt(iso: string) {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(iso));
  vi.resetModules();
  const { default: Home } = await import(/* @vite-ignore */ PAGE);
  return renderToString(<Home />);
}

afterEach(() => vi.useRealTimers());

describe("home page", () => {
  it("renders the seed release lines and the local-only notice", async () => {
    const html = await renderAt("2026-10-23T00:00:00Z");
    expect(html).toContain("What moved");
    expect(html).toContain("0.2.0");
    expect(html).toContain("Initial utilities");
    expect(html).toContain("02 OCT 2026");
    expect(html).toContain("data stays in this browser");
  });

  it("prints the same seed dates whenever the module loads (build-time prerender vs browser)", async () => {
    // The page is prerendered at build time; the seed used Date.now(), so the browser hydrated other dates.
    const built = await renderAt("2026-10-01T12:00:00Z");
    const visited = await renderAt("2026-10-23T12:00:00Z");
    expect(visited).toBe(built);
  });
});
