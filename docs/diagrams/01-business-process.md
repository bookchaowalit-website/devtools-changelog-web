# 01 — Business process (As-Is / To-Be)

devtools-changelog-web คือรายการ release notes ที่เก็บในเบราว์เซอร์ของผู้เยี่ยมชม (localStorage) เริ่มด้วยข้อมูลตัวอย่าง 2 บรรทัด ผู้ใช้เพิ่ม ค้นหา และลบบรรทัดได้ ไม่มี backend, ไม่ดึงข้อมูลจาก repo อื่น และ `/api/mcp` ไม่มี tool ให้เรียก

Last reviewed: 2026-11-28 · commit `06526b0`

## As-Is (จากโค้ดวันนี้)

```mermaid
flowchart LR
  V["Visitor browser"] --> PAGE["GET / (static page)"]
  PAGE --> SEED["server and hydration render SEED (2 sample lines, fixed dates)"]
  SEED --> LS["createLocalStore reads localStorage changelog-v1"]
  LS -->|"missing, bad JSON, storage blocked"| SEED2["fall back to SEED / in-memory"]
  LS -->|"first read only"| LIST["ChangelogPage list from cache (dates in UTC)"]
  LIST --> SEARCH["search title, details, state"]
  LIST --> ADD["add form: title, details, Draft or Released"]
  ADD -->|"blank title"| ERR["inline error, list unchanged"]
  ADD --> UPD["store.update re-reads stored list, then writes"]
  LIST --> DEL["remove a line"]
  DEL --> UPD
  UPD --> WR{"setItem"}
  WR -->|"ok"| LIST
  WR -->|"refused"| MEM["keep change in memory cache only, UI still shows it"]
  MEM --> LIST
  LIST -->|"list empty"| RESTORE["restore the 2 sample lines"]
  AGENT["MCP client"] --> RPC["POST /api/mcp JSON-RPC"]
  RPC -->|"initialize"| INFO["server info"]
  RPC -->|"tools/list"| NONE["empty tools list"]
  RPC -->|"tools/call, unknown method, bad JSON"| E400["HTTP 400 JSON-RPC error"]
  PAGE -.->|"errors only, if DSN set"| SENTRY["Sentry (request, user, breadcrumbs, extra, URL queries removed)"]
  PUSH["push or PR to main"] --> CI["GitHub CI: lint, typecheck, tests 93% gate, build, security scan (no deploy job)"]
  PUSH -.->|"separate path"| VDEP["Vercel deploy: CLI only, Git link points to old repo [ต้องยืนยัน]"]
```

Sources: `lib/changelog.ts`, `lib/local-store.ts`, `components/changelog-page.tsx`, `app/api/mcp/route.ts`, `next.config.ts` (`/more-projects` 308 to bookchaowalit.com), `lib/sentry.ts`, `.github/workflows/ci.yml`, `README.md`, `PRODUCT.md`

ข้อเท็จจริงสำคัญจากโค้ด:

- ข้อมูลอยู่ใน `localStorage` ของเบราว์เซอร์เดียว (`changelog-v1`) ล้างข้อมูลเว็บแล้วหาย ไม่มี export/sync
- ปุ่ม "Restore the sample lines" ใช้ได้เมื่อรายการว่าง; ถ้ามีคำค้นอยู่ตอนลบบรรทัดสุดท้าย ปุ่มนี้ซ่อนจนกว่าจะล้างคำค้น
- สอง tab เขียนพร้อมกันอาจทับกัน (ไม่มี lock) ตาม PRODUCT.md §Known limits
- ไม่มี workflow deploy ใน repo; ตาม PRODUCT.md (2026-10-23) deploy ด้วย Vercel CLI เท่านั้นและ Git link ชี้ repo เก่า [ต้องยืนยัน] สถานะวันนี้
- `NEXT_PUBLIC_SENTRY_DSN` บน production: [ต้องยืนยัน]; เมื่อเปิด Sentry เป็นข้อยกเว้นของ "ข้อมูลอยู่ในเบราว์เซอร์": error report ถูกส่งออก โดย `beforeSend` ลบ request, user, breadcrumbs, extra, contexts นอก platform, ตัด query/hash และลบ frame vars แต่ไม่ได้กรองข้อมูลอื่นในข้อความ error
- ถ้า `setItem` ถูกปฏิเสธ UI ยังแสดงรายการจาก cache ในหน่วยความจำ (ไม่ถูกบันทึก) และการอัปเดตถัดไปใช้ cache ที่ค้างอยู่แทนการอ่าน storage ใหม่ จนกว่าจะเขียนสำเร็จ

## To-Be (จาก PRODUCT.md §Live URL and deploy state)

```mermaid
flowchart LR
  PUSH["push to main"] --> CI["GitHub CI (checks only)"]
  PUSH --> GIT["Vercel Git link to devtools-changelog-web (not gated by CI unless Deployment Checks set [ต้องยืนยัน])"]
  GIT --> LIVE["changelog.bookchaowalit.com runs latest main"]
```

Sources: `PRODUCT.md` (owner action D9)

## Gap

| ID | As-Is → To-Be | Status | Owner | Evidence |
|---|---|---|---|---|
| G1 | deploy ด้วย CLI และ Git link ชี้ repo เก่า (push ไม่ deploy) → เชื่อม Vercel Git กับ `devtools-changelog-web` | decide | owner | `PRODUCT.md` owner action D9 [ต้องยืนยัน] สถานะปัจจุบัน |
| G2 | สอง tab เขียนพร้อมกันอาจทับกัน → owner ตัดสินว่าจะแก้ (ไม่มี To-Be เขียนไว้) | decide | owner | `PRODUCT.md` §Known limits (Codex 2026-11-20) |
| G3 | ปุ่ม restore ซ่อนเมื่อมีคำค้นและรายการว่าง → owner ตัดสินว่าจะแก้ (ไม่มี To-Be เขียนไว้) | decide | owner | `PRODUCT.md` §Known limits; `components/changelog-page.tsx` |

## Open questions

- Vercel Git link ของโปรเจกต์ `bookchaowalit-changelog-frontend` ยังชี้ repo เก่าอยู่หรือไม่
- `NEXT_PUBLIC_SENTRY_DSN` ตั้งบน production หรือไม่
