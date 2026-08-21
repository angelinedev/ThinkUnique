# Prompt: Inject the real ThinQnique '26 / SIH2026 problem statements

## What's attached
`data.ts` — a ready-to-use replacement for
`src/app/problem-statements/data.ts`, generated from the official released
problem statement list. 226 statements, each shaped to the existing
`ProblemStatement` type in `src/types/index.ts`:

```ts
{
  id: "SIH26001",              // official PS Number — used everywhere as the stable ID
  title: "...",                // Problem Statement Title
  description: "...",          // same text as title (no separate short/long version in the source data)
  category: "Software" | "Hardware",
  theme: "...",
  organization: "...",
  statement: "...",            // same text as title
}
```

Dropped from the source table: **S.No.** (not a stable identifier — PS
Number already is), **Submitted Idea(s) Count** (a live counter from the
national portal, not relevant to your college's internal tracking), and
**Deadline for Idea Submission** (identical "20 September 2026" for every
row — not worth repeating 226 times; this is your college's internal
hackathon, not the national SIH timeline, so don't let that date leak into
your own UI as if it were your deadline).

## Steps

1. **Replace the file.**
   Overwrite `src/app/problem-statements/data.ts` entirely with the
   attached `data.ts`. Nothing else needs to import differently — same
   export name (`problemStatements`), same type.

2. **Fix the stale copy in `src/app/problem-statements/page.tsx`.**
   This line is now wrong:
   > "There are 17 themes, each featuring a Software and a Hardware track.
   > Select a theme and start working on a problem statement of your choice
   > (you can take reference from previous year statements too)."

   It described last year's placeholder structure (17 themes × 2 tracks).
   The real data is 226 individual problem statements from ~40 different
   organizations, each already tagged Software or Hardware. Replace it with
   something like:
   > "226 problem statements across [N] organizations — filter by
   > Software/Hardware or search by ID, title, or ministry to find one for
   > your team."
   (The list component already supports search-by-ID/title/organization and
   category filtering — `src/components/problem-statements-list.tsx` — so
   this copy just needs to describe what's actually there now.)

3. **Optional: update the "Know More" external link.**
   Same file, currently links to `https://www.sih.gov.in/sih2025PS`. Check
   whether SIH has published a `sih2026PS` (or equivalent) page and update
   the URL/year if so — otherwise leave it, it still works as general SIH
   context.

4. **Do NOT touch:**
   - `src/services/google-sheets.ts` / `register/actions.ts` — no schema
     change, they already read `id`/`title` off whatever's in `data.ts`.
   - The registration form — it resolves `selectedProblem` by `id` via
     `problemStatements.find(p => p.id === problemId)`, which works
     unchanged against the new IDs (`SIH26001` etc. instead of `SW1`/`HW1`).

5. **Test after replacing:**
   - `/problem-statements` loads all 226, search and Hardware/Software
     filters work.
   - Click through to `/register?problemId=SIH26001` (or any real ID) and
     confirm the registration form picks up the correct title.
   - If you've already built the "update problem statement" flow from
     earlier (Team ID → pick new statement → sheet update), re-run that
     test end-to-end now against real statements, since it was only tested
     against placeholder data before.
