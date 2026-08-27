"use server";

import { z } from "zod";
import { buildKnowledgeBase } from "./knowledge";
import { findBestMatch } from "./search";

const AskSchema = z.object({
  question: z.string().min(1).max(300),
});

export type ChatbotAnswer = {
  answer: string;
  link?: { href: string; label: string };
  matched: boolean;
};

const FALLBACK_ANSWER: ChatbotAnswer = {
  answer:
    "I don't have an approved answer for that yet. Please get in touch and a member of the team will help.",
  link: { href: "/contact", label: "Contact us" },
  matched: false,
};

/**
 * Answers store/product questions from approved content only (see
 * lib/chatbot/knowledge.ts). This is a keyword matcher, not a language
 * model — it cannot invent ingredients, medical/safety advice, or
 * order-specific data. Order lookups are deliberately NOT handled here
 * — see /track-order, which requires order number + postcode.
 */
export async function askChatbot(input: unknown): Promise<ChatbotAnswer> {
  const parsed = AskSchema.safeParse(input);
  if (!parsed.success) return FALLBACK_ANSWER;

  const knowledgeBase = await buildKnowledgeBase();
  const match = findBestMatch(parsed.data.question, knowledgeBase);
  if (!match) return FALLBACK_ANSWER;

  return { answer: match.entry.answer, link: match.entry.link, matched: true };
}
