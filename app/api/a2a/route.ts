import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { answerQuestion } from "@/lib/knowledge/answer";

/**
 * A2A (Agent2Agent) message endpoint — implements the `SendMessage`
 * JSON-RPC 2.0 method (see the agent card at
 * /.well-known/agent-card.json) for the one real skill this agent has:
 * answering a text question from this store's own published knowledge
 * catalogue (lib/knowledge/). Task-based/streaming responses, file/data
 * Parts, and every other A2A method are deliberately not implemented —
 * this declares itself capable of exactly what it does and nothing more.
 *
 * The A2A spec is young and still settling (Apache-2.0, Linux
 * Foundation, first released April 2025) — different published pages
 * of it disagree on details like role casing ("user" vs "ROLE_USER").
 * This handler accepts either rather than gambling on one being final.
 */
type JsonRpcRequest = {
  jsonrpc?: string;
  method?: string;
  params?: { message?: { messageId?: string; role?: string; parts?: { text?: string }[] } };
  id?: string | number | null;
};

function jsonRpcError(id: string | number | null | undefined, code: number, message: string) {
  return NextResponse.json({ jsonrpc: "2.0", id: id ?? null, error: { code, message } }, { status: 200 });
}

export async function GET() {
  return NextResponse.json({
    protocol: "A2A",
    method: "POST",
    note: "This endpoint accepts JSON-RPC 2.0 SendMessage requests. See /.well-known/agent-card.json for the agent's capabilities.",
  });
}

export async function POST(request: NextRequest) {
  let body: JsonRpcRequest;
  try {
    body = await request.json();
  } catch {
    return jsonRpcError(null, -32700, "Parse error: request body must be valid JSON");
  }

  if (body.jsonrpc !== "2.0") {
    return jsonRpcError(body.id, -32600, "Invalid Request: jsonrpc must be \"2.0\"");
  }

  if (body.method !== "SendMessage") {
    return jsonRpcError(body.id, -32601, `Method not found: "${body.method}". This agent only supports "SendMessage".`);
  }

  const incomingText = body.params?.message?.parts?.find((p) => typeof p.text === "string")?.text;
  if (!incomingText) {
    return jsonRpcError(body.id, -32602, "Invalid params: params.message.parts must include at least one text part");
  }

  const { answer, sourceUrl } = await answerQuestion(incomingText);

  return NextResponse.json({
    jsonrpc: "2.0",
    id: body.id ?? null,
    result: {
      messageId: randomUUID(),
      role: "agent",
      parts: [{ text: sourceUrl ? `${answer}\n\nSource: ${sourceUrl}` : answer }],
    },
  });
}
