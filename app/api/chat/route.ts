import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  const username = process.env.N8N_WEBHOOK_USER;
  const password = process.env.N8N_WEBHOOK_PASSWORD;

  if (!webhookUrl || !username || !password) {
    return NextResponse.json(
      { ok: false, error: "n8n webhook configuration is missing" },
      { status: 500 },
    );
  }

  let details: Record<string, unknown> = {};
  try {
    details = await request.json();
  } catch {
    // The event can still be delivered with the server timestamp below.
  }

  const auth = Buffer.from(`${username}:${password}`).toString("base64");
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      event: "chat_opened",
      source: "site-chat",
      timestamp: new Date().toISOString(),
      ...details,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json(
      { ok: false, error: `n8n returned ${response.status}` },
      { status: 502 },
    );
  }

  const responseText = await response.text();
  let responseData: unknown = undefined;
  try {
    responseData = responseText ? JSON.parse(responseText) : undefined;
  } catch {
    responseData = undefined;
  }

  const reply =
    typeof responseData === "object" && responseData !== null && "reply" in responseData
      ? String(responseData.reply)
      : undefined;

  return NextResponse.json({ ok: true, reply, data: responseData });
}
