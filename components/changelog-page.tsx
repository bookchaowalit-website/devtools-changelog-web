"use client";

import { useMemo, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { EmptyState, Reader, ReaderFoot, ReaderHead, ReaderTop, ResultCount, SearchForm, Tags, formatDate } from "@/components/reader-shell";
import { createLocalStore, type LocalStore } from "@/lib/local-store";
import { EMPTY_DRAFT, SEED, STATUSES, STORAGE_KEY, addItem, filterItems, isoDay, parseItems, removeItem, type Draft, type Item, type ReleaseStatus } from "@/lib/changelog";

const defaultStore = createLocalStore({ key: STORAGE_KEY, seed: SEED, parse: parseItems, serialize: JSON.stringify });

function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `line-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Release notes on the Reader shell: add a line, search, remove; everything stays in this browser. */
export function ChangelogPage({ store = defaultStore, now = Date.now }: { store?: LocalStore<Item[]>; now?: () => number }) {
  const items = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);
  const visible = useMemo(() => filterItems(items, query.trim()), [items, query]);

  function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = draft.title.trim();
    if (!title) {
      setError("Give the release a version or title.");
      titleRef.current?.focus();
      return;
    }
    store.update((current) => addItem(current, draft, createId(), now()));
    setDraft(EMPTY_DRAFT);
    setError("");
    setQuery("");
    setNotice(`Added “${title}”.`);
  }
  function remove(item: Item) {
    store.update((current) => removeItem(current, item.id));
    setNotice(`Removed “${item.title}”.`);
  }
  function restoreSamples() {
    store.update(() => SEED);
    setNotice("Restored the two sample lines.");
  }

  return (
    <Reader>
      <ReaderTop name="Changelog" tagline="Release notes" links={[]} />
      <main id="main" className="rs-main">
        <ReaderHead eyebrow="Release notes" title="What moved the system forward" lede="A small release-notes list kept in this browser. Add a line at the end of the page when something ships; nothing is sent anywhere." />

        <section aria-labelledby="list-title">
          <div className="rs-section-head"><h2 id="list-title">Releases</h2></div>
          <div className="rs-toolbar">
            <SearchForm label="Search release notes" placeholder="Title, detail or state" value={query} onValueChange={setQuery} onClear={() => setQuery("")} />
            <ResultCount shown={visible.length} total={items.length} noun="release" query={query.trim() || undefined} />
          </div>
          {visible.length ? (
            <ul className="rs-list">
              {visible.map((item) => (
                <li key={item.id}>
                  <article className="rs-entry cl-entry">
                    <h3>{item.title}</h3>
                    <p className="rs-entry-meta"><time dateTime={isoDay(item.createdAt)}>{formatDate(isoDay(item.createdAt))}</time></p>
                    {item.body ? <p className="rs-entry-summary">{item.body}</p> : null}
                    <div className="cl-entry-foot">
                      <Tags tags={[item.status]} label="State" />
                      <button type="button" className="rs-plain cl-remove" aria-label={`Remove ${item.title}`} onClick={() => remove(item)}>Remove</button>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          ) : query.trim() ? (
            <EmptyState title="Nothing matches" headingLevel={3} action={<button type="button" className="rs-plain" onClick={() => setQuery("")}>Clear search</button>}>No release mentions “{query.trim()}”.</EmptyState>
          ) : (
            <EmptyState title="No releases yet" headingLevel={3} action={<button type="button" className="rs-plain" onClick={restoreSamples}>Restore the sample lines</button>}>Add the first release below, or bring back the two sample lines.</EmptyState>
          )}
        </section>
        <section aria-labelledby="add-title">
          <div className="rs-section-head"><h2 id="add-title">Add a release</h2></div>
          <form className="cl-form" onSubmit={add} noValidate>
            <label className="cl-field">
              <span>Version or title</span>
              <input ref={titleRef} value={draft.title} onChange={(event) => { setDraft({ ...draft, title: event.target.value }); if (error) setError(""); }} placeholder="0.3.0" autoComplete="off" aria-invalid={error ? true : undefined} aria-describedby={error ? "release-error" : undefined} />
            </label>
            <label className="cl-field cl-field-wide">
              <span>What changed</span>
              <input value={draft.body} onChange={(event) => setDraft({ ...draft, body: event.target.value })} placeholder="Added search to the queue" autoComplete="off" />
            </label>
            <label className="cl-field">
              <span>State</span>
              <select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as ReleaseStatus })}>
                {STATUSES.map((status) => <option key={status}>{status}</option>)}
              </select>
            </label>
            <div className="cl-submit"><button type="submit" className="rs-button">Add release</button></div>
            {error ? <p id="release-error" className="cl-error" role="alert">{error}</p> : null}
          </form>
        </section>

        <p className="rs-sr" role="status" aria-live="polite">{notice}</p>
      </main>
      <ReaderFoot source="https://github.com/bookchaowalit-website/devtools-changelog-web" note="The two starting lines (0.2.0 and 0.1.0) are sample copy. Lines you add are saved in this browser's localStorage only; clearing site data removes them." />
    </Reader>
  );
}
