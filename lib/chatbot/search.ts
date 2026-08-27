import { tokenize, type KnowledgeEntry } from "./knowledge";

export type MatchResult = { entry: KnowledgeEntry; score: number };

/**
 * Deliberately simple keyword-overlap scoring, not a language model —
 * the bot can only ever surface one of the pre-approved answers in the
 * knowledge base, never generate new text. A low/zero score means "we
 * don't have an approved answer for that."
 */
export function findBestMatch(question: string, entries: KnowledgeEntry[]): MatchResult | null {
  const queryTokens = tokenize(question);
  if (queryTokens.length === 0) return null;

  let best: MatchResult | null = null;

  for (const entry of entries) {
    const entryTokenSet = new Set(entry.keywords);
    let score = 0;
    for (const token of queryTokens) {
      if (entryTokenSet.has(token)) score += 1;
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { entry, score };
    }
  }

  // Require at least some real overlap relative to the question length
  // so a single incidental shared word on a long question doesn't win.
  if (best && best.score / queryTokens.length < 0.2) return null;

  return best;
}
