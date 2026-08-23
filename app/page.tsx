"use client";
/* eslint-disable react-hooks/set-state-in-effect -- localStorage hydration intentionally happens after mount. */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, ChevronRight, Command, Plus, Search, Terminal, Trash2 } from "lucide-react";

type Item = { id: string; title: string; body: string; status: string; createdAt: number };
const SEED: Item[] = [{ title: "0.2.0", body: "Added mini-apps", status: "Released" }, { title: "0.1.0", body: "Initial utilities", status: "Released" }].map((item, index) => ({ ...item, id: String(index + 1), createdAt: Date.now() - index * 86400000 }));
const statuses = ["Draft", "Released"];

function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  useEffect(() => { let timer: number | undefined; try { const raw = localStorage.getItem(key); if (raw) { const parsed = JSON.parse(raw) as T; timer = window.setTimeout(() => setValue(parsed), 0); } } catch { /* local-only state */ } setReady(true); return () => { if (timer) window.clearTimeout(timer); }; }, [key]);
  useEffect(() => { if (ready) localStorage.setItem(key, JSON.stringify(value)); }, [key, ready, value]);
  return [value, setValue] as const;
}

export default function Home() {
  const [items, setItems] = useLocalStorage<Item[]>("changelog-v1", SEED);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState({ title: "", body: "", status: "Released" });
  const filtered = useMemo(() => items.filter((item) => `${item.title} ${item.body} ${item.status}`.toLowerCase().includes(query.toLowerCase())), [items, query]);
  const add = () => { if (!draft.title.trim()) return; setItems((current) => [{ ...draft, id: crypto.randomUUID(), createdAt: Date.now() }, ...current]); setDraft({ title: "", body: "", status: "Released" }); };
  const remove = (id: string) => setItems((current) => current.filter((item) => item.id !== id));

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
          <div className="changelog-compose"><div className="changelog-compose-label"><Plus size={14} /><span>append new line</span></div><input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="version or release title" aria-label="Release title" /><input value={draft.body} onChange={(event) => setDraft({ ...draft, body: event.target.value })} placeholder="what changed?" aria-label="Release details" /><select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value })} aria-label="Release status">{statuses.map((status) => <option key={status}>{status}</option>)}</select><button onClick={add} aria-label="Add release note">commit <ChevronRight size={14} /></button></div>
          <div className="changelog-queue-head"><span>LINE</span><span>RELEASE</span><span>DETAIL</span><span>STATE</span><span /></div>
          <ol className="changelog-queue">{filtered.map((item, index) => <li key={item.id} className="changelog-line"><span className="changelog-line-number">{String(index + 1).padStart(2, "0")}</span><div className="changelog-release"><strong>{item.title}</strong><small>{new Date(item.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()}</small></div><p>{item.body}</p><span className={`changelog-status ${item.status === "Released" ? "is-released" : ""}`}><i />{item.status}</span><button className="changelog-delete" onClick={() => remove(item.id)} aria-label={`Delete ${item.title}`}><Trash2 size={14} /></button></li>)}</ol>
          {filtered.length === 0 && <div className="changelog-empty"><Command size={18} /><span>no matching release signal</span></div>}
        </section>
        <div className="changelog-scroll-hint"><ArrowDown size={14} /> end of current queue <span>·</span> local-only by design</div>
      </main>
      <footer className="changelog-footer"><span>CHANGELOG / BOOKCHAOWALIT</span><span>data stays in this browser</span></footer>
    </div>
  );
}
