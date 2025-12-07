import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

type ChatRequestMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatRequestBody = {
  messages: ChatRequestMessage[];
  model?: string;
  currentTime?: string;
  attachments?: { type: 'image'; data: string; name: string }[];
  enableResearch?: boolean;
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

    const body = (await req.json()) as ChatRequestBody;
    const { messages, model = "gpt-5-nano", currentTime, attachments, enableResearch } = body;

    if (!isChatMessageArray(messages)) {
      return NextResponse.json(
        { error: "Invalid messages payload" },
        { status: 400 }
      );
    }

    // Validate model - Only GPT-5 Series
    const allowedModels = ["gpt-5-nano", "gpt-5-mini", "gpt-5", "gpt-5-pro"];
    const selectedModel = allowedModels.includes(model) ? model : "gpt-5-nano";

    const currentTimeInfo = currentTime ? `\n\nThời gian hiện tại: ${currentTime}` : '';
    
    // Prepare messages with vision support
    const processedMessages: OpenAI.Chat.ChatCompletionMessageParam[] = messages.map((msg, index) => {
      // Add attachments to the last user message
      if (msg.role === "user" && index === messages.length - 1 && attachments && attachments.length > 0) {
        return {
          role: "user" as const,
          content: [
            { type: "text" as const, text: msg.content },
            ...attachments.map(att => ({
              type: "image_url" as const,
              image_url: { url: att.data }
            }))
          ]
        };
      }
      if (msg.role === "user") {
        return { role: "user" as const, content: msg.content };
      }
      return { role: "assistant" as const, content: msg.content };
    });

    // Use Chat Completions API for all cases
    // Note: Responses API with web_search is temporarily disabled due to type issues
    {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _enableResearch = enableResearch; // Keep for future use
      const stream = await openai.chat.completions.create({
        model: selectedModel,
        messages: [
          {
            role: "system",
            content: `Bạn là AI Learning Assistant giúp người dùng học tập hiệu quả.${currentTimeInfo}

NHIỆM VỤ CHÍNH:
- Hỗ trợ học tập: giải thích bài học, hướng dẫn học, tạo lịch nhắc học
- Trả lời câu hỏi về kiến thức: toán, văn, anh, khoa học, lịch sử, v.v.
- Phân tích ảnh liên quan đến học tập (nếu có)

QUY TẮC TRẢ LỜI:
1. Nếu là câu hỏi học tập/kiến thức: Trả lời chi tiết, hữu ích
2. Nếu có ảnh: Phân tích và giải thích nội dung ảnh liên quan học tập
3. Nếu KHÔNG liên quan học tập: Trả lời ngắn gọn (1-2 câu) rồi hướng về học tập

TÍNH NĂNG NHẮC HỌC:
Khi người dùng yêu cầu tạo lịch nhắc, PHẢI phân tích TỪNG môn học và tạo REMINDER_REQUEST riêng:

BƯỚC 1: Xác định TẤT CẢ môn học user đề cập
BƯỚC 2: Tạo REMINDER_REQUEST cho MỖI môn học
BƯỚC 3: Nếu cùng thời gian, dùng chung thời gian đó

Format: "REMINDER_REQUEST: [subject] at [HH:MM DD/MM/YYYY]"

VÍ DỤ 1 - Khác thời gian:
User: "Nhắc tôi học toán 2 phút nữa và học lịch sử 5 phút nữa"
→ "REMINDER_REQUEST: Học toán at 15:32 25/10/2024
REMINDER_REQUEST: Học lịch sử at 15:35 25/10/2024"

VÍ DỤ 2 - Cùng thời gian:
User: "Nhắc tôi học toán và lý sau 1 phút nữa"  
→ "REMINDER_REQUEST: Học toán at 15:31 25/10/2024
REMINDER_REQUEST: Học lý at 15:31 25/10/2024"

LUÔN LUÔN tạo riêng từng môn học!`,
          },
          ...processedMessages,
        ],
        stream: true,
      });

      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content || '';
              if (content) {
                const data = `data: ${JSON.stringify({ content })}\n\n`;
                controller.enqueue(encoder.encode(data));
              }
            }
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          } catch (error) {
            controller.error(error);
          } finally {
            controller.close();
          }
        },
      });

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }
  } catch (error) {
    console.error("Chat API error", error);
    return NextResponse.json(
      { error: "Failed to fetch completion" },
      { status: 500 }
    );
  }
}
