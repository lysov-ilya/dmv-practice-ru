# DMV Question Sources Research

Last checked: 2026-07-08

## Already Imported

- California DMV official Russian sample tests
  - URL: https://www.dmv.ca.gov/portal/driver-education-and-safety/educational-materials/sample-driver-license-dl-knowledge-tests/
  - Count imported: 40
  - Notes: Official public sample tests. Correct answers verified through DMV result pages.

- joshua-burnell-1/ca-dmv-prep
  - URL: https://github.com/joshua-burnell-1/ca-dmv-prep
  - File: `lib/questions.js`
  - Count imported: 108
  - License: no LICENSE file found
  - Notes: Questions are described as based on the 2026 California Driver Handbook, not actual DMV exams. Imported as translated/periphrased unofficial practice.

- DarrellTang/permit-gg
  - URL: https://github.com/DarrellTang/permit-gg
  - File: `supabase/seed.sql`
  - Count imported: 290
  - License: no LICENSE file found
  - Notes: California-specific, generated from 2026 California Driver Handbook. Imported as normalized English practice in `permit_gg_questions.js`; translation/periphrasing pass still recommended.

## Strong California Candidates For Next Import

- DarrellTang/permit-gg
  - URL: https://github.com/DarrellTang/permit-gg
  - File: `supabase/seed.sql`
  - Count found: 290 `INSERT INTO seed_questions`
  - License: no LICENSE file found
  - Notes: Imported as English staging/practice. Next step is Russian translation/periphrasing and near-duplicate cleanup.

- myrbriai/ca-dmv-quiz
  - URL: https://github.com/myrbriai/ca-dmv-quiz
  - File: `index.html`
  - Count found: 143 `{cat: ...}` questions
  - License: no LICENSE file found
  - Notes: California-specific one-page quiz. Many overlap with existing categories. Use for topic coverage and carefully deduplicate.

- finfitty/cadmv_quiz
  - URL: https://github.com/finfitty/cadmv_quiz
  - File: `index.html`
  - Count found: 60 `category:` questions
  - License: no LICENSE file found
  - Notes: California-specific one-page quiz. Smaller but includes under-18/provisional license questions.

- SHA152/ca-dmv-practice-test
  - URL: https://github.com/SHA152/ca-dmv-practice-test
  - File: `src/data/questions.ts`
  - Count: not fully counted yet
  - License: no LICENSE file found
  - Notes: TypeScript question bank. Repo includes large committed `node_modules`, so inspect only source files.

## Licensed But Not California-Specific

- nancylanxik/ny-permit-practice
  - URL: https://github.com/nancylanxik/ny-permit-practice
  - File: `index.html`
  - Description: 250+ NY permit questions
  - License: MIT
  - Notes: Good licensed material, but state-specific NY law differs from California. Only generic sign/safety questions should be considered, and all NY-specific distances/laws must be excluded.

- aisavetheworld/California-DMV-Written-Test-Practice-
  - URL: https://github.com/aisavetheworld/California-DMV-Written-Test-Practice-
  - File: `sample_data/dmv_quiz_bilingual.json`
  - Count seen: 8-page sample data
  - License: MIT
  - Notes: Small bilingual sample, useful as format/reference but not a major source.

## Recommendation

Next import order:

1. Translate/periphrase `permit_gg_questions.js` into Russian and remove near-duplicates.
2. `myrbriai/ca-dmv-quiz` — 143 CA-specific questions.
3. `finfitty/cadmv_quiz` — 60 CA-specific questions.
4. `SHA152/ca-dmv-practice-test` — inspect and count source data.
5. `nancylanxik/ny-permit-practice` — only after filtering out NY-specific rules.

The next implementation pass should parse these into a staging JSON, normalize answer order, remove near-duplicates, then translate/periphrase into Russian before appending to `extra_questions.js`.
