import "server-only";
import { getKnowledgeCatalogue } from "./catalogue";

const STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "do", "does", "did", "i", "my", "me",
  "you", "your", "it", "its", "to", "of", "for", "and", "or", "in", "on", "at", "how",
  "what", "why", "when", "where", "can", "should", "will", "with", "if",
]);

function significantWords(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOPWORDS.has(w)),
  );
}

/**
 * Honest scope: this is keyword-overlap matching against the site's own
 * FAQ content, not a language model — it answers well when a question
 * closely matches something already in the FAQ, and says so plainly
 * when it can't find a good match rather than guessing. Backs both the
 * A2A agent (lib/../app/api/a2a) and could back an in-page chat widget
 * later without needing a different data source.
 */
export async function answerQuestion(question: string): Promise<{ answer: string; sourceUrl?: string }> {
  const catalogue = await getKnowledgeCatalogue();
  const queryWords = significantWords(question);

  let bestScore = 0;
  let bestAnswer: string | null = null;

  for (const faq of catalogue.faqs) {
    const faqWords = significantWords(faq.question);
    let overlap = 0;
    for (const w of queryWords) {
      if (faqWords.has(w)) overlap += 1;
    }
    const score = queryWords.size > 0 ? overlap / queryWords.size : 0;
    if (score > bestScore) {
      bestScore = score;
      bestAnswer = faq.answer;
    }
  }

  if (bestAnswer && bestScore >= 0.5) {
    return { answer: bestAnswer, sourceUrl: `${catalogue.business.url}/faq` };
  }

  return {
    answer:
      `I couldn't find a specific answer to that in our FAQ. You can browse our products at ${catalogue.business.url}/shop, ` +
      `see our pricing guide at ${catalogue.pricing.pricingGuideUrl}, or contact us at ${catalogue.business.contactEmail}.`,
  };
}
