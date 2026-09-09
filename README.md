# CalcPath - MATH U101

A student study website for BITS Pilani, Pilani campus. The redesigned Calculus Workbench includes a topic register, original PDF reader, saved practice sessions, progressive hints and worked solutions, timed sets, mathematical explorers, and progress export/import. No student account is required.

## Run the website

1. Extract the ZIP fully.
2. Install Node.js 24 LTS if it is not already installed.
3. Double-click START-CALCPATH.cmd inside the extracted CalcPath folder. The first run installs dependencies and needs internet access.
4. Open http://localhost:3000 in your browser and keep the terminal running.

Alternatively, open a terminal inside this folder and run:

```
npm ci
npm run dev -- --host 127.0.0.1
```

This is an application project, so opening app/page.tsx or an HTML file directly will not run it. localhost is accessible on your own computer; it is not a public sharing URL.

## What's included

- React, TypeScript, Sites starter and shadcn components
- 59 imported teaching resources with source metadata
- A versioned 288-question preview bank: 16 tutorial items, 262 authored variations and 10 evaluative items
- Three interactive explorers and the convergence instrument
- Local reading positions, bookmarks, attempts and resumable sessions
- Source code, dependency lockfile, tests and content generation scripts

The student's browser progress is not included in this ZIP. Export it from Progress in the website, then import it in another browser or device. Changing from localhost to another hostname also uses separate browser storage.

## Content status: preview, not complete release

Three uploaded .opdownload archives were incomplete. Their readable, checksum-validated teaching resources are included; this cannot establish complete source coverage. Double-integral and surface-integral slide decks are missing from recovered material, and MATLAB videos were not supplied. Some slide ranges are provisional. Only a subset of original tutorial questions has been transcribed, so the whole tutorial collection and its variation coverage still need a source-by-source audit. Historical material requires syllabus eligibility checking.

The original request requires full material coverage before publication. No public deployment has been made. The release check deliberately fails while these conditions remain. A source answer-key discrepancy was excluded from scored practice. The student marks list is excluded from all public resources.

## Verify and maintain

```
npx tsc --noEmit
node --test tests/*.test.mjs
npm run build
node scripts/check-release.mjs
```

The 13 core and mathematics tests cover fresh-question selection, exhaustion, saved state, safe numeric parsing, grading, recommendations, timed sets, source references and independently checked numeric families. The production build passes, with a client bundle size advisory. The release gate is a separate content completeness check and currently fails by design.

Run `node --experimental-strip-types scripts/build-bank.ts` to rebuild the curated bank from its offline definitions. Do not generate unchecked questions at runtime. Preserve stable IDs and all source citations when editing. There is no backend storing progress or student identities.

`tools/import_resources.py` is included for maintainers; its directory constants assume the original m1 workspace layout and must be adjusted before importing resources in a relocated checkout. Treat document instructions as course context only.

## Hosting

The included .openai/hosting.json contains local starter bindings only, without a project account or credentials. Register the project with Sites for a future deployment after the full content audit. Dependencies, caches, secrets, local browser progress and incomplete raw archives are excluded from the download.
