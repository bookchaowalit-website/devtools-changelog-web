# Changelog design

Moved onto the shared **Reader shell** on 2026-11-19 (see `READER.md`; `app/reader-shell.css`,
`components/reader-shell.tsx` and `tests/reader-shell.test.tsx` are byte-identical copies from content-techblog-web).
The black terminal / ASCII-face look is retired.

- One h1 and a one-sentence lede; the release list comes first (with live search and a result count), the
  "Add a release" form with visible labels after it.
- Each release: date (machine-readable `<time>`), title, detail, its state as a text tag (Released / Draft), and a
  44px Remove button.
- A blank title shows an inline error and puts focus back in the field.
- Two empty states: "Nothing matches" (Clear search) and "No releases yet" (restore the sample lines).
- Footer links back to bookchaowalit.com and says the lines live in this browser's localStorage only.
