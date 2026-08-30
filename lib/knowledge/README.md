# Knowledge catalogue & agent surface

This directory assembles a single, structured, publicly-fetchable
description of the business — products, categories, pricing, delivery,
policies and FAQs — from the same live data every page on the site
already renders from. It is never hand-maintained separately, so it
can't drift from what's actually true on the site.

## Why this exists

Grounded in Google's own [Guide to Optimizing for Generative AI
Features on Google
Search](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
(Search Central, last updated July 2026), and worth being precise
about what it does and doesn't do:

- **It is not a Google AI-citation mechanism.** Google's guide states
  plainly that AI Overviews/AI Mode use the same ranking systems as
  normal Search (retrieval-augmented generation over already-indexed,
  crawlable pages) — there is no separate "feed this to AI" channel,
  and the guide explicitly says an `llms.txt` file is ignored by
  Google Search. Nothing here changes how this site ranks in Google.
- **It is real infrastructure for the wider agent ecosystem** —
  Agent2Agent (A2A) and any other tool that would rather fetch one
  structured resource than crawl many HTML pages. `GET
  /api/knowledge-catalogue` is that resource; `/.well-known/agent-
  card.json` + `POST /api/a2a` (`answer.ts`) is a minimal, honestly-
  scoped A2A agent built on top of it.
- **Reviews, testimonials and call-transcript insights are absent on
  purpose.** This business has no real ones captured anywhere in this
  codebase yet (see `lib/reviews/mock-data.ts`, explicit sample-only
  content already excluded from search-facing structured data).
  Fabricating them here would defeat the entire point — an agent
  should be able to trust this catalogue precisely because nothing in
  it is invented. Add a real reviews/testimonials source and wire it
  in here once one exists.

## Files

- `catalogue.ts` — `getKnowledgeCatalogue()`, the aggregator.
- `answer.ts` — `answerQuestion()`, keyword-overlap matching against
  the catalogue's FAQ content. Not a language model; says so and
  points to the site when it can't find a good match, rather than
  guessing.
