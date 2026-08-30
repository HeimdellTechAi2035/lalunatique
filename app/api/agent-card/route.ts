import { NextResponse } from "next/server";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/utils/constants";

/**
 * A2A (Agent2Agent) Agent Card — https://a2a-protocol.org/latest/specification/
 * Served publicly at the protocol's well-known URI, /.well-known/agent-
 * card.json, via a rewrite in next.config.ts — this route lives at a
 * normal path because Next.js's typed-routes codegen breaks on a
 * literal `.well-known` folder name (dots in App Router segment names
 * produce invalid generated TypeScript; confirmed by trying it first).
 *
 * This is a good-faith, minimal implementation of an actively-evolving
 * open spec (Apache-2.0, Linux Foundation) — it declares one real,
 * working skill (answering questions from this store's own knowledge
 * catalogue, see lib/knowledge/) rather than claiming capabilities that
 * don't exist.
 */
export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const agentCard = {
    name: `${SITE_NAME} FAQ Agent`,
    description: `Answers questions about ${SITE_NAME} products, pricing, delivery and policies using ${SITE_NAME}'s own published catalogue and FAQ content. ${SITE_DESCRIPTION}`,
    url: `${baseUrl}/api/a2a`,
    provider: { organization: SITE_NAME, url: baseUrl },
    version: "0.1.0",
    supportedInterfaces: [
      {
        url: `${baseUrl}/api/a2a`,
        protocolBinding: "HTTP+JSON",
        protocolVersion: "1.0",
      },
    ],
    capabilities: {
      streaming: false,
      pushNotifications: false,
    },
    defaultInputModes: ["text/plain"],
    defaultOutputModes: ["text/plain"],
    skills: [
      {
        id: "answer-faq",
        name: "Answer store questions",
        description:
          "Answers questions about product categories, pricing, delivery, and store policies by matching against the store's published FAQ and catalogue content. Not a general-purpose assistant — out-of-scope questions get a pointer to the site rather than an invented answer.",
        tags: ["faq", "ecommerce", "customer-service"],
      },
    ],
  };

  return NextResponse.json(agentCard, {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
