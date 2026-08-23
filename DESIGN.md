# Changelog design direction

## Product world
Changelog is a local release queue. It records what moved the product forward and lets the owner append or remove a line without needing a CMS.

## Visual direction
- Seed: 44f7e22c — assigned cracktro scroller queue direction.
- Material: black void, bitmap face, subtle depth grid, one amber caret.
- Typography: serif release titles with tiny mono queue metadata.
- Composition: a release stream and compose line replace the generic card stack.

## Interaction
- Search remains a live grep across title, body, and status.
- Add and delete preserve the current localStorage model.
- Released state is amber; draft state stays quiet.
- Responsive view collapses each release into a readable queue line.

## Constraints
- Preserve browser-local persistence and the existing seed entries.
- State copy must stay honest: no CMS, no backend, no invented release cadence.
- Keep the page keyboard- and screen-reader-friendly with labels on controls.
- Avoid excessive containers, pills, and decorative chrome.

