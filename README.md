# 🤖 AI Learning Assistant

**Chatbot học tập thông minh với tính năng nhắc lịch học**

## 📋 Giới thiệu dự án

Dự án bài tập cuối kỳ - **AI Learning Assistant** là một ứng dụng chat bot thông minh được thiết kế đặc biệt cho học sinh, sinh viên với khả năng:

- 💬 **Chat với AI** để hỗ trợ học tập
- ⏰ **Tự động nhắc lịch học** qua notification
- 📚 **Tạo lịch học thông minh** từ cuộc trò chuyện
- 🔍 **Tìm kiếm web** cho thông tin cập nhật
- 📸 **Phân tích hình ảnh** liên quan học tập
- 💾 **Lưu trữ nhiều phiên chat** riêng biệt

## 🛠️ Công nghệ sử dụng

### **Frontend & Framework**
- ⚡ **Next.js 15.5.6** (React 19.2.0) - App Router
- 🔷 **TypeScript** - Type safety
- 🎨 **Tailwind CSS 4** - Styling
- 🌙 **Next-themes** - Dark/Light mode

### **UI/UX Components**
- 🧩 **HeroUI + Radix UI** - Modern component library
- 🎭 **Framer Motion** - Smooth animations
- 🔔 **Sonner** - Toast notifications
- 📅 **React Day Picker** - Calendar integration

### **AI & Backend**
- 🧠 **OpenAI API** (GPT-5 series) - AI chat
- 🔍 **Web Search API** - Research capability
- 👁️ **Vision API** - Image analysis
- ⚡ **Streaming responses** - Real-time chat

### **State Management & Data**
- 🎣 **Custom React Hooks** - Chat sessions, streaming
- 🔄 **React Hook Form + Zod** - Form validation
- 💾 **Local Storage** - Data persistence
- 📝 **React Markdown** - Rich text rendering

## 🎨 UX/UI Design

### **Giao diện hiện đại**
- **Responsive Design**: Hoạt động tốt trên mọi thiết bị
- **Clean & Modern**: Giao diện sạch sẽ với HeroUI components
- **Smooth Animations**: Chuyển động mượt mà với Framer Motion
- **Accessibility**: Tuân thủ chuẩn accessibility

### **Trải nghiệm người dùng**
- **Sidebar Navigation**: Điều hướng dễ dàng giữa các phiên chat
- **Real-time Loading**: Hiển thị trạng thái loading khi AI đang trả lời
- **Toast Notifications**: Thông báo trạng thái các tác vụ
- **Calendar Integration**: Quản lý lịch học trực quan

## 💻 Logic & Code Architecture

### **Frontend Architecture**
```typescript
// Modern React patterns với TypeScript
- App Router (Next.js 15)
- Server & Client Components
- Custom hooks cho state management
- Type-safe API calls
```

### **State Management**
```typescript
// Chat sessions với localStorage
useChatSessions() // Quản lý phiên chat
useChatStream()  // Xử lý streaming responses
useAutoResizeTextarea() // UI enhancements
```

### **AI Integration**
```typescript
// OpenAI API với streaming
- Chat Completions API (regular chat)
- Responses API (research mode)
- Vision API (image analysis)
- Real-time streaming responses
```

### **Reminder System**
```typescript
// Tự động parse và tạo reminders
- Natural language processing
- Multiple reminders từ 1 tin nhắn
- Browser notifications
- Persistent storage
```

## 🚀 Cách chạy dự án

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build cho production
npm run build
npm start
```

**Yêu cầu**: Cần thiết lập `OPENAI_API_KEY` trong file `.env.local`

## ❓ Câu hỏi thường gặp

**Q: Dự án sử dụng công nghệ gì chính?**
A: Next.js 15 + React 19 + TypeScript + Tailwind CSS + OpenAI API

**Q: Tính năng chính của chatbot?**
A: Chat AI học tập, tự động tạo lịch nhắc học, tìm kiếm web, phân tích hình ảnh

**Q: Data có được lưu trữ ở đâu?**
A: Local Storage của browser để đảm bảo privacy và offline capability

**Q: Hỗ trợ những loại AI models nào?**
A: GPT-5 series (nano, mini, pro) với streaming responses real-time

**Q: Giao diện có responsive không?**
A: Có, thiết kế responsive hoạt động tốt trên mobile, tablet và desktop

---

*Đây là dự án bài tập cuối kỳ được phát triển với mục tiêu học tập và thực hành các công nghệ web hiện đại.*
