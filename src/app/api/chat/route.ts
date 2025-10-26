import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

type ChatRequestMessage = {
  role: "user" | "assistant";
  content: string;
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function isChatMessageArray(value: unknown): value is ChatRequestMessage[] {
  if (!Array.isArray(value)) {
    return false;
  }

  return value.every((item) => {
    if (!item || typeof item !== "object") {
      return false;
    }
    const { role, content } = item as Record<string, unknown>;
    return (
      (role === "user" || role === "assistant") && typeof content === "string"
    );
  });
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY" },
        { status: 500 }
      );
    }

    const body = (await req.json()) as { messages?: unknown };
    const { messages } = body;

    if (!isChatMessageArray(messages)) {
      return NextResponse.json(
        { error: "Invalid messages payload" },
        { status: 400 }
      );
    }

    const response = await openai.responses.create({
      model: "gpt-5-nano",
      input: [
        {
          role: "system",
          content:
            "Bạn là AI Learning Assistant giúp người dùng học tập hiệu quả. Trả lời súc tích, tập trung vào việc học.",
        },
        ...messages,
      ],
      temperature: 0.7,
    });

    const reply =
      response.output_text?.trim() ??
      response.output?.map((item) => item.content?.map((c) => c.text).join(" ")).join(" ") ??
      "";

    if (!reply) {
      return NextResponse.json(
        { error: "No response from model" },
        { status: 500 }
      );
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API error", error);
    return NextResponse.json(
      { error: "Failed to fetch completion" },
      { status: 500 }
    );
  }
}
