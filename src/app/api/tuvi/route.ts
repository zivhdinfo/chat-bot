import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { TuViRequestBody, BASIC_CATEGORIES, DETAIL_CATEGORIES } from "@/types/tuvi";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Các model được phép sử dụng (chính xác từ OpenAI)
const ALLOWED_MODELS = [
  "gpt-5-nano-2025-08-07",
  "gpt-5-mini-2025-08-07", 
  "gpt-5-2025-08-07",
  "gpt-5.1-2025-11-13",
  "chatgpt-4o-latest"
];

// Hàm tạo prompt cho luận giải tử vi
function createTuViPrompt(body: TuViRequestBody, hasImage: boolean): string {
  const { tuViInfo, categoryId, subCategoryId, currentTime } = body;
  const currentYear = new Date().getFullYear();
  
  // Tìm category
  let categoryTitle = "";
  let categoryDesc = "";
  
  // Kiểm tra trong basic categories
  const basicCat = BASIC_CATEGORIES.find(c => c.id === categoryId);
  if (basicCat) {
    categoryTitle = basicCat.title;
    categoryDesc = basicCat.description;
  }
  
  // Kiểm tra trong detail categories
  if (!basicCat) {
    for (const detailCat of DETAIL_CATEGORIES) {
      if (detailCat.id === categoryId) {
        const subItem = detailCat.items.find(i => i.id === subCategoryId);
        if (subItem) {
          categoryTitle = `${detailCat.title} - ${subItem.title}`;
          categoryDesc = subItem.description;
        }
        break;
      }
    }
  }

  const timeInfo = currentTime ? `\n- Thời gian hiện tại: ${currentTime}` : "";
  
  // Nếu có ảnh, prompt khác
  if (hasImage) {
    return `Bạn là chuyên gia tử vi đẩu số hàng đầu Việt Nam với hơn 40 năm kinh nghiệm. Bạn được đào tạo bài bản về Tử Vi Đẩu Số, Tứ Trụ Bát Tự, và Ngũ Hành.

THÔNG TIN ĐƯƠNG SỐ:
- Họ tên: ${tuViInfo.hoTen}
- Năm hiện tại: ${currentYear}${timeInfo}

QUAN TRỌNG: NGƯỜI DÙNG ĐÃ CUNG CẤP ẢNH LÁ SỐ TỬ VI.

⚠️ HƯỚNG DẪN ĐỌC ẢNH LÁ SỐ (RẤT QUAN TRỌNG):
1. **ĐỌC CHÍNH XÁC NGÀY THÁNG TRÊN ẢNH**: Hãy đọc kỹ và ghi lại CHÍNH XÁC ngày tháng năm sinh hiển thị trên ảnh lá số.
   - Thường có 2 dạng: ngày âm lịch và ngày dương lịch
   - Đọc từng con số một cách cẩn thận, không suy đoán
   - Ghi rõ: "Ngày âm lịch: DD/MM/YYYY" và "Ngày dương lịch: DD/MM/YYYY" (nếu có)

2. **KHÔNG ĐƯỢC TỰ CHUYỂN ĐỔI NGÀY**: Chỉ ghi lại những gì THẤY TRỰC TIẾP trên ảnh. KHÔNG tự tính toán hay chuyển đổi âm-dương lịch.

3. **NẾU KHÔNG RÕ, HÃY NÓI RÕ**: Nếu không đọc được rõ số nào, hãy ghi "không rõ" thay vì đoán.

CHỦ ĐỀ LUẬN GIẢI: ${categoryTitle}
MÔ TẢ: ${categoryDesc}

YÊU CẦU:
1. **ĐẦU TIÊN - ĐỌC THÔNG TIN TRÊN ẢNH**: 
   - Đọc và ghi lại CHÍNH XÁC ngày sinh âm lịch (nếu có)
   - Đọc và ghi lại CHÍNH XÁC ngày sinh dương lịch (nếu có)
   - Đọc giờ sinh (chi giờ)
   - Đọc năm can chi (ví dụ: Giáp Thân, Ất Dậu...)
   - Liệt kê các sao chính trong từng cung

2. Hãy luận giải CHI TIẾT, SÂU SẮC và CỤ THỂ cho chủ đề trên dựa trên ảnh lá số
3. Sử dụng kiến thức Tử Vi Đẩu Số truyền thống kết hợp với Tứ Trụ Bát Tự
4. Đưa ra các sao chính, sao phụ liên quan và ý nghĩa của chúng
5. Phân tích theo các giai đoạn: quá khứ (nếu phù hợp), hiện tại, và tương lai
6. Đưa ra lời khuyên thiết thực và hướng hóa giải nếu có điều xấu
7. Sử dụng ngôn ngữ dễ hiểu, tránh thuật ngữ quá chuyên môn không giải thích
8. Độ dài: 800-1500 từ, chia thành các phần rõ ràng với heading

FORMAT PHẢN HỒI:
- Sử dụng markdown
- **BẮT BUỘC** bắt đầu với phần "## 📝 THÔNG TIN TRÊN LÁ SỐ" ghi lại chính xác những gì đọc được từ ảnh
- Có các heading phân chia rõ ràng (##, ###)
- Có danh sách bullet points khi cần
- Có phần KẾT LUẬN & LỜI KHUYÊN ở cuối
- Tông giọng: chuyên nghiệp, thân thiện, tích cực nhưng khách quan

Hãy bắt đầu luận giải:`;
  }

  // Không có ảnh, dùng thông tin nhập tay
  const gioiTinhText = tuViInfo.gioiTinh === "nam" ? "Nam" : tuViInfo.gioiTinh === "nu" ? "Nữ" : "Chưa xác định";
  const lichText = tuViInfo.amLich ? "Âm lịch" : "Dương lịch";
  const tuoiHienTai = tuViInfo.namSinh ? currentYear - tuViInfo.namSinh : "Chưa xác định";
  
  return `Bạn là chuyên gia tử vi đẩu số hàng đầu Việt Nam với hơn 40 năm kinh nghiệm. Bạn được đào tạo bài bản về Tử Vi Đẩu Số, Tứ Trụ Bát Tự, và Ngũ Hành.

THÔNG TIN ĐƯƠNG SỐ:
- Họ tên: ${tuViInfo.hoTen}
- Ngày sinh: ${tuViInfo.ngaySinh || "?"}/${tuViInfo.thangSinh || "?"}/${tuViInfo.namSinh || "?"} (${lichText})
- Giờ sinh: ${tuViInfo.gioSinh || "Chưa xác định"}
- Giới tính: ${gioiTinhText}
- Năm hiện tại: ${currentYear}
- Tuổi hiện tại: ${tuoiHienTai}${timeInfo}

CHỦ ĐỀ LUẬN GIẢI: ${categoryTitle}
MÔ TẢ: ${categoryDesc}

YÊU CẦU:
1. Hãy luận giải CHI TIẾT, SÂU SẮC và CỤ THỂ cho chủ đề trên
2. Sử dụng kiến thức Tử Vi Đẩu Số truyền thống kết hợp với Tứ Trụ Bát Tự
3. Đưa ra các sao chính, sao phụ liên quan và ý nghĩa của chúng
4. Phân tích theo các giai đoạn: quá khứ (nếu phù hợp), hiện tại, và tương lai
5. Đưa ra lời khuyên thiết thực và hướng hóa giải nếu có điều xấu
6. Sử dụng ngôn ngữ dễ hiểu, tránh thuật ngữ quá chuyên môn không giải thích
7. Độ dài: 800-1500 từ, chia thành các phần rõ ràng với heading

FORMAT PHẢN HỒI:
- Sử dụng markdown
- Có các heading phân chia rõ ràng (##, ###)
- Có danh sách bullet points khi cần
- Có phần KẾT LUẬN & LỜI KHUYÊN ở cuối
- Tông giọng: chuyên nghiệp, thân thiện, tích cực nhưng khách quan

Hãy bắt đầu luận giải:`;
}

export async function POST(req: NextRequest) {
  // Tạo AbortController để xử lý khi client ngắt kết nối
  const abortController = new AbortController();
  
  // Lắng nghe sự kiện abort từ request
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

    const body = (await req.json()) as TuViRequestBody;
    const { tuViInfo, categoryId, model = "gpt-5-nano-2025-08-07", image } = body;

    // Validate required fields
    if (!tuViInfo || !categoryId) {
      return NextResponse.json(
        { error: "Thiếu thông tin bắt buộc" },
        { status: 400 }
      );
    }

    // Nếu có ảnh lá số, chỉ cần họ tên
    // Nếu không có ảnh, cần đầy đủ thông tin
    if (!image) {
      if (!tuViInfo.hoTen || !tuViInfo.ngaySinh || !tuViInfo.thangSinh || 
          !tuViInfo.namSinh || !tuViInfo.gioSinh || !tuViInfo.gioiTinh) {
        return NextResponse.json(
          { error: "Vui lòng điền đầy đủ thông tin ngày giờ sinh hoặc tải lên ảnh lá số" },
          { status: 400 }
        );
      }
    } else {
      // Có ảnh, chỉ cần họ tên
      if (!tuViInfo.hoTen) {
        return NextResponse.json(
          { error: "Vui lòng nhập họ tên" },
          { status: 400 }
        );
      }
    }

    // Validate model
    let selectedModel = ALLOWED_MODELS.includes(model) ? model : "gpt-5-nano-2025-08-07";
    
    // Tạo prompt
    const hasImage = !!image;
    
    // Nếu có ảnh, sử dụng model hỗ trợ vision
    // chatgpt-4o-latest hỗ trợ vision tốt nhất
    if (hasImage) {
      selectedModel = "chatgpt-4o-latest";
    }
    
    const prompt = createTuViPrompt(body, hasImage);

    // Build messages array
    type MessageContent = string | Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }>;
    
    let userContent: MessageContent;
    
    if (hasImage) {
      userContent = [
        { type: "text" as const, text: prompt },
        { type: "image_url" as const, image_url: { url: image } }
      ];
    } else {
      userContent = prompt;
    }

    // Streaming với xử lý abort
    const stream = await openai.chat.completions.create({
      model: selectedModel,
      messages: [
        {
          role: "system",
          content: "Bạn là chuyên gia tử vi đẩu số hàng đầu Việt Nam. Hãy luận giải chi tiết, sâu sắc và có trách nhiệm. Nếu có ảnh lá số, hãy phân tích chi tiết các sao và cung trên ảnh.",
        },
        {
          role: "user",
          content: userContent,
        },
      ],
      stream: true,
      max_completion_tokens: 4096,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            // Kiểm tra nếu đã abort
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
          // Nếu là lỗi abort, không log error
          if (abortController.signal.aborted) {
            console.log("TuVi API: Client disconnected");
          } else {
            console.error("TuVi streaming error:", error);
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
    // Nếu là lỗi abort, trả về 499 (Client Closed Request)
    if (abortController.signal.aborted) {
      return new Response(null, { status: 499 });
    }
    
    console.error("TuVi API error", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi luận giải. Vui lòng thử lại." },
      { status: 500 }
    );
  }
}
