import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { TuViInfo } from "@/types/tuvi";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Các model được phép sử dụng
const ALLOWED_MODELS = [
  "gpt-5-nano-2025-08-07",
  "gpt-5-mini-2025-08-07", 
  "gpt-5-2025-08-07",
  "gpt-5.1-2025-11-13",
  "chatgpt-4o-latest"
];

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface TuViChatRequestBody {
  tuViInfo: TuViInfo;
  categoryTitle: string;
  initialResult: string;
  conversationHistory: ChatMessage[];
  userMessage: string;
  model?: string;
  currentTime?: string;
  image?: string;
}

export async function POST(req: NextRequest) {
  // Tạo AbortController để xử lý khi client ngắt kết nối
  const abortController = new AbortController();
  
  req.signal.addEventListener("abort", () => {
    abortController.abort();
  });

  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY" },
        { status: 500 }
      );
    }

    const body = (await req.json()) as TuViChatRequestBody;
    const { 
      tuViInfo, 
      categoryTitle, 
      initialResult, 
      conversationHistory, 
      userMessage, 
      model = "gpt-5-nano-2025-08-07",
      currentTime,
      image
    } = body;

    if (!tuViInfo || !userMessage) {
      return NextResponse.json(
        { error: "Thiếu thông tin bắt buộc" },
        { status: 400 }
      );
    }

    // Validate model - nếu có ảnh thì dùng model hỗ trợ vision
    let selectedModel = ALLOWED_MODELS.includes(model) ? model : "gpt-5-nano-2025-08-07";
    if (image) {
      selectedModel = "chatgpt-4o-latest";
    }

    const currentYear = new Date().getFullYear();
    const timeInfo = currentTime ? `\nThời gian hiện tại: ${currentTime}` : "";

    // Build thông tin đương số dựa trên dữ liệu có sẵn
    let birthInfo = "";
    if (tuViInfo.ngaySinh && tuViInfo.thangSinh && tuViInfo.namSinh) {
      const gioiTinhText = tuViInfo.gioiTinh === "nam" ? "Nam" : tuViInfo.gioiTinh === "nu" ? "Nữ" : "Chưa xác định";
      const lichText = tuViInfo.amLich ? "Âm lịch" : "Dương lịch";
      birthInfo = `
- Ngày sinh: ${tuViInfo.ngaySinh}/${tuViInfo.thangSinh}/${tuViInfo.namSinh} (${lichText})
- Giờ sinh: ${tuViInfo.gioSinh || "Chưa xác định"}
- Giới tính: ${gioiTinhText}
- Tuổi hiện tại: ${currentYear - tuViInfo.namSinh}`;
    } else if (image) {
      birthInfo = `
(Thông tin ngày giờ sinh được xác định từ ảnh lá số trong kết quả luận giải ban đầu)`;
    }

    // System prompt với context đầy đủ
    const systemPrompt = `Bạn là chuyên gia tử vi đẩu số hàng đầu Việt Nam với hơn 40 năm kinh nghiệm. Bạn đang trong cuộc trò chuyện tư vấn tử vi.

THÔNG TIN ĐƯƠNG SỐ:
- Họ tên: ${tuViInfo.hoTen}
- Năm hiện tại: ${currentYear}${birthInfo}${timeInfo}

CHỦ ĐỀ ĐANG LUẬN GIẢI: ${categoryTitle}

KẾT QUẢ LUẬN GIẢI BAN ĐẦU (ĐÂY LÀ NGUỒN THÔNG TIN CHÍNH XÁC VỀ LÁ SỐ):
${initialResult}

---

HƯỚNG DẪN QUAN TRỌNG:
1. **LUÔN SỬ DỤNG THÔNG TIN TỪ KẾT QUẢ LUẬN GIẢI BAN ĐẦU**: Tất cả thông tin về ngày sinh, giờ sinh, các sao, cung vị đã được phân tích trong kết quả luận giải ban đầu. Hãy sử dụng những thông tin đó làm cơ sở.

2. **BỎ QUA thông tin ngày tháng được gửi lên**: Nếu có sự khác biệt giữa thông tin gửi lên và thông tin trong kết quả luận giải, hãy ưu tiên thông tin trong kết quả luận giải (vì đó là thông tin đã được xác định từ lá số thực tế).

3. **THAM CHIẾU KẾT QUẢ LUẬN GIẢI**: Khi trả lời câu hỏi, hãy tham chiếu đến những gì đã phân tích trong kết quả luận giải ban đầu. Ví dụ: "Như đã phân tích ở trên...", "Dựa trên lá số của bạn..."

4. **TRẢ LỜI CỤ THỂ**: Trả lời dựa trên lá số cụ thể của đương số, không trả lời chung chung.

5. **KIẾN THỨC CHUYÊN MÔN**: Kết hợp kiến thức Tử Vi Đẩu Số để đưa ra lời khuyên thiết thực.

Trả lời ngắn gọn, súc tích nhưng đầy đủ ý. Sử dụng markdown khi cần thiết.
Nếu câu hỏi không liên quan đến tử vi, hãy nhẹ nhàng hướng dẫn người dùng quay lại chủ đề.`;

    // Build messages array
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
    ];

    // Thêm conversation history
    for (const msg of conversationHistory) {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    }

    // Thêm tin nhắn mới của user
    messages.push({
      role: "user",
      content: userMessage,
    });

    // Streaming
    const stream = await openai.chat.completions.create({
      model: selectedModel,
      messages,
      stream: true,
      max_completion_tokens: 2048,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (abortController.signal.aborted) {
              controller.close();
              return;
            }
            
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              const data = `data: ${JSON.stringify({ content })}\n\n`;
              controller.enqueue(encoder.encode(data));
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch (error) {
          if (abortController.signal.aborted) {
            console.log("TuVi Chat API: Client disconnected");
          } else {
            console.error("TuVi Chat streaming error:", error);
            controller.error(error);
          }
        } finally {
          try {
            controller.close();
          } catch {
            // Controller đã đóng
          }
        }
      },
      cancel() {
        abortController.abort();
      }
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    if (abortController.signal.aborted) {
      return new Response(null, { status: 499 });
    }
    
    console.error("TuVi Chat API error", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi. Vui lòng thử lại." },
      { status: 500 }
    );
  }
}

