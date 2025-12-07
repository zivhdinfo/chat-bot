// Thông tin ngày sinh để luận giải tử vi
export interface TuViInfo {
  hoTen: string;
  ngaySinh?: number; // 1-30 (optional khi có ảnh lá số)
  thangSinh?: number; // 1-12 (optional khi có ảnh lá số)
  namSinh?: number; // (optional khi có ảnh lá số)
  gioSinh?: string; // Chi giờ (Tý, Sửu, Dần, Mão, ...) (optional khi có ảnh lá số)
  gioiTinh?: "nam" | "nu"; // (optional khi có ảnh lá số)
  amLich?: boolean; // true nếu là ngày âm lịch
}

// Các mục luận giải cơ bản
export interface BasicCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
}

// Các mục luận giải chuyên sâu
export interface DetailCategory {
  id: string;
  title: string;
  description: string;
  items: {
    id: string;
    title: string;
    description: string;
  }[];
}

// Kết quả luận giải
export interface TuViResult {
  id: string;
  categoryId: string;
  title: string;
  content: string;
  createdAt: number;
}

// Request body cho API
export interface TuViRequestBody {
  tuViInfo: TuViInfo;
  categoryId: string;
  subCategoryId?: string;
  model?: string;
  image?: string; // Base64 encoded image
  currentTime?: string; // Thời gian hiện tại
}

// Chat message trong phiên
export interface TuViChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Phiên luận giải đã lưu
export interface TuViSession {
  id: string;
  tuViInfo: TuViInfo;
  categoryId: string;
  subCategoryId?: string;
  categoryTitle: string;
  content: string;
  model: string;
  createdAt: number;
  image?: string;
  chatMessages?: TuViChatMessage[];
}

// Chi giờ
export const CHI_GIO = [
  { value: "ty", label: "Tý (23h - 01h)", range: "23:00 - 01:00" },
  { value: "suu", label: "Sửu (01h - 03h)", range: "01:00 - 03:00" },
  { value: "dan", label: "Dần (03h - 05h)", range: "03:00 - 05:00" },
  { value: "mao", label: "Mão (05h - 07h)", range: "05:00 - 07:00" },
  { value: "thin", label: "Thìn (07h - 09h)", range: "07:00 - 09:00" },
  { value: "ti", label: "Tỵ (09h - 11h)", range: "09:00 - 11:00" },
  { value: "ngo", label: "Ngọ (11h - 13h)", range: "11:00 - 13:00" },
  { value: "mui", label: "Mùi (13h - 15h)", range: "13:00 - 15:00" },
  { value: "than", label: "Thân (15h - 17h)", range: "15:00 - 17:00" },
  { value: "dau", label: "Dậu (17h - 19h)", range: "17:00 - 19:00" },
  { value: "tuat", label: "Tuất (19h - 21h)", range: "19:00 - 21:00" },
  { value: "hoi", label: "Hợi (21h - 23h)", range: "21:00 - 23:00" },
];

// Danh sách các mục luận giải CƠ BẢN
export const BASIC_CATEGORIES: BasicCategory[] = [
  {
    id: "tong-quan",
    title: "1. Tổng Quan Lá Số (Mệnh & Thân)",
    description: "Phân tích cốt lõi tính cách, năng lực bẩm sinh, ưu nhược điểm và định hướng nền tảng của cuộc đời.",
    icon: "🌟",
  },
  {
    id: "tu-tru",
    title: "2. Luận Giải Tứ Trụ",
    description: "Tổng hợp các yếu tố ngày giờ sinh để đánh giá sâu về gia đạo, sức khỏe và sự nghiệp trọn đời.",
    icon: "🏛️",
  },
  {
    id: "phu-mau",
    title: "3. Luận Cung Phụ Mẫu",
    description: "Đánh giá mối quan hệ, sự tương trợ và mức độ ảnh hưởng của cha mẹ đối với cuộc sống đương số.",
    icon: "👨‍👩‍👧",
  },
  {
    id: "phuc-duc",
    title: "4. Luận Cung Phúc Đức",
    description: "Xem xét phúc phần tổ tiên để lại, đời sống nội tâm và căn cơ tinh thần giúp vượt qua khó khăn.",
    icon: "🙏",
  },
  {
    id: "dien-trach",
    title: "5. Luận Cung Điền Trạch",
    description: "Phân tích khả năng thừa kế, tự tạo dựng nhà cửa đất đai và sự ổn định của tài sản cố định.",
    icon: "🏠",
  },
  {
    id: "quan-loc",
    title: "6. Luận Cung Quan Lộc",
    description: "Định hướng nghề nghiệp phù hợp, đánh giá tham vọng và tiềm năng thăng tiến trong sự nghiệp.",
    icon: "💼",
  },
  {
    id: "no-boc",
    title: "7. Luận Cung Nô Bộc",
    description: "Nhận diện chất lượng bạn bè, đồng nghiệp và các rủi ro hoặc trợ lực từ các mối quan hệ xã hội.",
    icon: "🤝",
  },
  {
    id: "thien-di",
    title: "8. Luận Cung Thiên Di",
    description: "Dự báo vận hạn khi đi xa, khả năng thích nghi và các cơ hội hoặc thị phi từ môi trường bên ngoài.",
    icon: "✈️",
  },
  {
    id: "tat-ach",
    title: "9. Luận Cung Tật Ách",
    description: "Cảnh báo về các vấn đề sức khỏe tiềm ẩn, tai nạn và các bệnh tật dễ mắc phải trong đời.",
    icon: "🏥",
  },
  {
    id: "tai-bach",
    title: "10. Luận Cung Tài Bạch",
    description: "Đánh giá năng lực kiếm tiền, nguồn thu nhập chính và thói quen chi tiêu quản lý tài chính.",
    icon: "💰",
  },
  {
    id: "tu-tuc",
    title: "11. Luận Cung Tử Tức",
    description: "Dự đoán về đường con cái, khả năng sinh nở và mức độ hòa hợp giữa cha mẹ và con cái.",
    icon: "👶",
  },
  {
    id: "phu-the",
    title: "12. Luận Cung Phu Thê",
    description: "Phân tích đời sống hôn nhân, sự hòa hợp với bạn đời và tính ổn định của gia đạo.",
    icon: "💑",
  },
  {
    id: "huynh-de",
    title: "13. Luận Cung Huynh Đệ",
    description: "Xem xét tình cảm anh chị em trong gia đình và khả năng hỗ trợ lẫn nhau trong cuộc sống.",
    icon: "👥",
  },
  {
    id: "dai-han",
    title: "14. Vận Hạn 10 Năm (Đại Hạn)",
    description: "Dự báo xu hướng thịnh suy và các sự kiện bước ngoặt quan trọng trong giai đoạn 10 năm hiện tại.",
    icon: "📅",
  },
  {
    id: "tieu-han",
    title: "15. Vận Hạn Năm Nay (Tiểu Hạn)",
    description: "Chi tiết các biến động, cơ hội và rủi ro cần lưu ý nhất trong năm nay.",
    icon: "📆",
  },
  {
    id: "nam-sau",
    title: "16. Vận Hạn Năm Sau",
    description: "Chuẩn bị trước cho các diễn biến thuận lợi hoặc khó khăn sẽ đến trong năm kế tiếp.",
    icon: "🔮",
  },
  {
    id: "hai-nam-toi",
    title: "17. Dự Báo 2 Năm Tới",
    description: "Nhìn trước xu hướng vận hạn và sự kiện nổi bật sẽ diễn ra trong hai năm tiếp theo.",
    icon: "🎯",
  },
];

// Danh sách các mục luận giải CHUYÊN SÂU
export const DETAIL_CATEGORIES: DetailCategory[] = [
  {
    id: "tai-bach-chuyen-sau",
    title: "Tài Bạch",
    description: "Phân tích chi tiết về tài vận và khả năng làm giàu",
    items: [
      {
        id: "tai-bach-chi-tiet",
        title: "1. Luận Tài Bạch chuyên sâu: Chi Tiết Tài Vận Trọn Đời",
        description: "Phân tích sâu khả năng làm giàu, tích lũy và các yếu tố tác động đến túi tiền của đương số.",
      },
      {
        id: "tu-tru-tai-bach",
        title: "2. Tứ Trụ Tài Bạch",
        description: "Phân tích gốc rễ sự giàu nghèo và diễn biến tài vận qua các giai đoạn cuộc đời.",
      },
      {
        id: "tai-chinh-dai-han-nay",
        title: "3. Tài Chính Đại Hạn Này",
        description: "Đánh giá xu hướng kiếm tiền dễ hay khó và độ ổn định tài sản trong 10 năm hiện tại.",
      },
      {
        id: "tai-chinh-dai-han-toi",
        title: "4. Tài Chính Đại Hạn Tới",
        description: "Dự báo triển vọng kinh tế và chuẩn bị cho các cơ hội hoặc rủi ro trong 10 năm tiếp theo.",
      },
      {
        id: "tai-chinh-nam-nay",
        title: "5. Tài Chính Năm Nay",
        description: "Khuyên nghị nên đầu tư hay giữ tiền, dự báo thu nhập và rủi ro mất mát trong năm nay.",
      },
      {
        id: "tai-van-12-thang",
        title: "6. Tài Vận 12 Tháng Năm Nay",
        description: "Chi tiết dòng tiền, nguồn thu phụ và hiệu quả đầu tư theo từng tháng trong năm nay.",
      },
      {
        id: "tai-chinh-nam-sau",
        title: "7. Tài Chính Năm Sau",
        description: "Dự báo xu hướng dòng tiền và các cơ hội kiếm tiền hoặc rủi ro trong năm tới.",
      },
      {
        id: "tai-van-12-thang-nam-sau",
        title: "8. Tài Vận 12 Tháng Năm Sau",
        description: "Lên kế hoạch tài chính và tìm kiếm cơ hội đột phá tiền bạc cho từng tháng của năm sau.",
      },
    ],
  },
  {
    id: "quan-loc-chuyen-sau",
    title: "Quan Lộc",
    description: "Phân tích chi tiết về sự nghiệp và công danh",
    items: [
      {
        id: "quan-loc-chi-tiet",
        title: "1. Luận Quan Lộc chuyên sâu: Chi tiết Sự Nghiệp & Công Danh",
        description: "Phân tích toàn diện về con đường sự nghiệp, khả năng thăng tiến và danh tiếng trong công việc.",
      },
      {
        id: "tu-tru-quan-loc",
        title: "2. Tứ Trụ Quan Lộc",
        description: "Đánh giá nền tảng sự nghiệp dựa trên ngũ hành và các yếu tố bẩm sinh.",
      },
      {
        id: "su-nghiep-dai-han-nay",
        title: "3. Sự Nghiệp Đại Hạn Này",
        description: "Phân tích cơ hội thăng tiến, thay đổi công việc trong 10 năm hiện tại.",
      },
      {
        id: "su-nghiep-dai-han-toi",
        title: "4. Sự Nghiệp Đại Hạn Tới",
        description: "Dự báo xu hướng phát triển sự nghiệp trong 10 năm tiếp theo.",
      },
      {
        id: "cong-viec-nam-nay",
        title: "5. Công Việc Năm Nay",
        description: "Chi tiết các biến động công việc, cơ hội và thách thức trong năm nay.",
      },
      {
        id: "van-trinh-su-nghiep-12-thang",
        title: "6. Vận Trình Sự Nghiệp 12 Tháng",
        description: "Phân tích chi tiết vận may sự nghiệp theo từng tháng trong năm.",
      },
      {
        id: "cong-viec-nam-sau",
        title: "7. Công Việc Năm Sau",
        description: "Dự báo xu hướng công việc và các cơ hội năm tới.",
      },
      {
        id: "uy-tin-danh-tieng-nam-sau",
        title: "8. Uy Tín & Danh Tiếng Năm Sau",
        description: "Đánh giá danh tiếng và uy tín trong công việc năm tới.",
      },
    ],
  },
  {
    id: "suc-khoe-chuyen-sau",
    title: "Sức Khỏe",
    description: "Phân tích chi tiết về sức khỏe và thể chất",
    items: [
      {
        id: "suc-khoe-chi-tiet",
        title: "1. Luận Sức Khoẻ chuyên sâu: Tổng Quan Sức Khỏe",
        description: "Đánh giá nền tảng thể chất, các bộ phận yếu trên cơ thể và xu hướng bệnh lý trọn đời.",
      },
      {
        id: "tu-tru-suc-khoe",
        title: "2. Tứ Trụ Sức Khỏe",
        description: "Dùng ngũ hành để tìm ra phương pháp cân bằng âm dương và phòng bệnh di truyền.",
      },
      {
        id: "suc-khoe-dai-han-nay",
        title: "3. Sức Khỏe Đại Hạn Này",
        description: "Cảnh báo các biến cố sức khỏe hoặc tai nạn cụ thể có thể xảy ra trong 10 năm này.",
      },
      {
        id: "suc-khoe-dai-han-toi",
        title: "4. Sức Khỏe Đại Hạn Tới",
        description: "Dự báo sự thay đổi của thể chất và các bệnh mãn tính trong giai đoạn 10 năm tiếp theo.",
      },
      {
        id: "suc-khoe-nam-nay",
        title: "5. Sức Khỏe Năm Nay",
        description: "Lời khuyên cụ thể về việc phòng tránh bệnh tật, tai nạn và chăm sóc tinh thần trong năm nay.",
      },
      {
        id: "tuoi-tho-duong-sinh",
        title: "6. Tuổi Thọ & Dưỡng Sinh",
        description: "Phân tích các yếu tố ảnh hưởng đến tuổi thọ và bí quyết nâng cao chất lượng sống khỏe.",
      },
      {
        id: "suc-khoe-nam-sau",
        title: "7. Sức Khỏe Năm Sau",
        description: "Chuẩn bị trước cho các vấn đề sức khỏe có thể nảy sinh trong năm tới.",
      },
      {
        id: "suc-khoe-tinh-than-nam-sau",
        title: "8. Sức Khỏe Tinh Thần Năm Sau",
        description: "Dự báo các áp lực tâm lý và phương pháp duy trì sự cân bằng tinh thần trong năm tới.",
      },
    ],
  },
  {
    id: "tu-tuc-chuyen-sau",
    title: "Hạn Sinh Con",
    description: "Phân tích chi tiết về đường con cái",
    items: [
      {
        id: "tu-tuc-chi-tiet",
        title: "1. Luận Hạn sinh con: Chi Tiết Đường Con Cái",
        description: "Tổng hợp về khả năng sinh sản, số lượng con và tương lai thành đạt của thế hệ sau.",
      },
      {
        id: "tu-tru-tu-tuc",
        title: "2. Tứ Trụ Tử Tức",
        description: "Đánh giá sâu về sức khỏe con cái và áp lực tài chính khi nuôi dưỡng theo ngũ hành.",
      },
      {
        id: "con-cai-dai-han-nay",
        title: "3. Con Cái Đại Hạn Này",
        description: "Cơ hội sinh thêm con hoặc các sự kiện quan trọng của con cái trong 10 năm hiện tại.",
      },
      {
        id: "con-cai-dai-han-toi",
        title: "4. Con Cái Đại Hạn Tới",
        description: "Dự báo về sự trưởng thành và các vấn đề của con cái trong giai đoạn tiếp theo.",
      },
      {
        id: "cau-con-nam-nay",
        title: "5. Cầu Con Năm Nay",
        description: "Xem xét tín hiệu thụ thai, hỷ tín hoặc sức khỏe thai kỳ trong năm nay.",
      },
      {
        id: "lich-trinh-con-cai-12-thang",
        title: "6. Lịch Trình Con Cái 12 Tháng",
        description: "Xác định tháng tốt để thụ thai hoặc tháng cần kiêng kỵ cho sức khỏe của mẹ và bé.",
      },
      {
        id: "cau-con-nam-sau",
        title: "7. Cầu Con Năm Sau",
        description: "Dự báo cơ hội sinh nở và chuẩn bị cho kế hoạch con cái trong năm tới.",
      },
      {
        id: "lich-trinh-con-cai-nam-sau",
        title: "8. Lịch Trình Con Cái Năm Sau",
        description: "Chi tiết vận hạn sinh nở theo từng tháng của năm sau.",
      },
    ],
  },
  {
    id: "hon-nhan-chuyen-sau",
    title: "Hôn Nhân",
    description: "Phân tích chi tiết về tình duyên và hôn nhân",
    items: [
      {
        id: "hon-nhan-chi-tiet",
        title: "1. Luận Chi tiết hôn nhân, tình duyên: Chi Tiết Tình Duyên",
        description: "Tổng quan về đường tình duyên, thời điểm kết hôn và mức độ thuận lợi trong tình cảm.",
      },
      {
        id: "chan-dung-ban-doi",
        title: "2. Chân Dung Bạn Đời (Tứ Trụ)",
        description: "Mô tả đặc điểm, hoàn cảnh gặp gỡ và tính cách của người vợ/chồng tương lai.",
      },
      {
        id: "tinh-cam-dai-han-nay",
        title: "3. Tình Cảm Đại Hạn Này",
        description: "Đánh giá độ bền vững của hôn nhân hoặc cơ hội kết hôn trong 10 năm hiện tại.",
      },
      {
        id: "tinh-cam-dai-han-toi",
        title: "4. Tình Cảm Đại Hạn Tới",
        description: "Dự báo không khí gia đình và các thử thách tình cảm trong giai đoạn tiếp theo.",
      },
      {
        id: "tinh-duyen-nam-nay",
        title: "5. Tình Duyên Năm Nay",
        description: "Xem xét vận đào hoa, cơ hội gặp gỡ hoặc biến động hôn nhân trong năm nay.",
      },
      {
        id: "chi-tiet-tinh-cam-nam-nay",
        title: "6. Chi Tiết Tình Cảm Năm Nay",
        description: "Phân tích sâu diễn biến tình cảm và phương hướng hóa giải mâu thuẫn trong năm.",
      },
      {
        id: "tinh-duyen-nam-sau",
        title: "7. Tình Duyên Năm Sau",
        description: "Dự báo các sự kiện tình cảm quan trọng và lời khuyên giữ gìn hạnh phúc năm tới.",
      },
      {
        id: "chi-tiet-tinh-cam-nam-sau",
        title: "8. Chi Tiết Tình Cảm Năm Sau",
        description: "Lên kế hoạch và chuẩn bị tâm lý cho các vấn đề tình duyên trong năm tiếp theo.",
      },
    ],
  },
];

// Các model GPT (chính xác từ OpenAI 2025)
export const GPT_MODELS = [
  { value: "gpt-5-nano-2025-08-07", label: "GPT-5 Nano", description: "Nhanh nhất, tiết kiệm" },
  { value: "gpt-5-mini-2025-08-07", label: "GPT-5 Mini", description: "Cân bằng tốc độ & chất lượng" },
  { value: "gpt-5-2025-08-07", label: "GPT-5", description: "Thông minh, chi tiết" },
  { value: "gpt-5.1-2025-11-13", label: "GPT-5.1", description: "Mới nhất, cao cấp nhất" },
  { value: "chatgpt-4o-latest", label: "ChatGPT-4o", description: "GPT-4o mới nhất" },
];

