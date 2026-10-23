"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { createLocalStore } from "@/lib/local-store";
import { EMPTY_DRAFT, SEED, STATUSES, STORAGE_KEY, addItem, filterItems, formatReleaseDate, parseItems, removeItem, type Draft, type ReleaseStatus } from "@/lib/changelog";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, ChevronRight, Command, Plus, Search, Terminal, Trash2 } from "lucide-react";

const store = createLocalStore({ key: STORAGE_KEY, seed: SEED, parse: parseItems, serialize: JSON.stringify });

export default function Home() {
  const items = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const filtered = useMemo(() => filterItems(items, query), [items, query]);
  const add = () => { if (!draft.title.trim()) return; store.update((current) => addItem(current, draft, crypto.randomUUID(), Date.now())); setDraft(EMPTY_DRAFT); };
  const remove = (id: string) => store.update((current) => removeItem(current, id));

  return (
    <div className="changelog-world">
      <header className="changelog-nav"><Link href="/" className="changelog-brand"><span>BOOK//</span> CHANGELOG</Link><span className="changelog-nav-state"><i /> local queue / browser state</span><Link href="/more-projects" className="changelog-nav-link">more projects <ArrowUpRight size={13} /></Link></header>
      <main className="changelog-main">
        <section className="changelog-hero"><div className="changelog-hero-face" aria-hidden="true">{`╭──────╮
│  ◉  │
│ ╱│╲ │
╰──────╯`}</div><div><p className="changelog-kicker"><Terminal size={13} /> RELEASE_STREAM / 001</p><h1>What moved<br /><em>the system forward.</em></h1><p>Small, honest release notes for the portfolio tools. No CMS, no ceremony — just the next signal in the queue.</p></div><div className="changelog-hero-index"><span>QUEUE</span><strong>{String(filtered.length).padStart(2, "0")}</strong><small>visible entries</small></div></section>

        <section className="changelog-workspace">
          <div className="changelog-toolbar"><div className="changelog-search"><Search size={14} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="grep release notes..." aria-label="Search changelog" /></div><span className="changelog-toolbar-count">{filtered.length} / {items.length} lines</span></div>
          <div className="changelog-compose"><div className="changelog-compose-label"><Plus size={14} /><span>append new line</span></div><input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="version or release title" aria-label="Release title" /><input value={draft.body} onChange={(event) => setDraft({ ...draft, body: event.target.value })} placeholder="what changed?" aria-label="Release details" /><select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as ReleaseStatus })} aria-label="Release status">{STATUSES.map((status) => <option key={status}>{status}</option>)}</select><button type="button" onClick={add} aria-label="Commit release note">commit <ChevronRight size={14} /></button></div>
          <div className="changelog-queue-head"><span>LINE</span><span>RELEASE</span><span>DETAIL</span><span>STATE</span><span /></div>
          <ol className="changelog-queue">{filtered.map((item, index) => <li key={item.id} className="changelog-line"><span className="changelog-line-number">{String(index + 1).padStart(2, "0")}</span><div className="changelog-release"><strong>{item.title}</strong><small>{formatReleaseDate(item.createdAt)}</small></div><p>{item.body}</p><span className={`changelog-status ${item.status === "Released" ? "is-released" : ""}`}><i />{item.status}</span><button type="button" className="changelog-delete" onClick={() => remove(item.id)} aria-label={`Delete ${item.title}`}><Trash2 size={14} /></button></li>)}</ol>
          {filtered.length === 0 && <div className="changelog-empty"><Command size={18} /><span>no matching release signal</span></div>}
        </section>
        <div className="changelog-scroll-hint"><ArrowDown size={14} /> end of current queue <span>·</span> local-only by design</div>
      </main>
      <footer className="changelog-footer"><span>CHANGELOG / BOOKCHAOWALIT</span><span>data stays in this browser</span></footer>
    </div>
  );
}
