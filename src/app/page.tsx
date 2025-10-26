"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Toaster, toast } from "sonner";

type ChatRole = "user" | "assistant";

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
}

interface Reminder {
  id: string;
  subject: string;
  time: number;
  notified: boolean;
}

interface ParsedReminder {
  subject: string;
  scheduledFor: Date;
}

const REMINDER_STORAGE_KEY = "ai-learning-reminders";

const initialAssistantMessage: ChatMessage = {
  id: "assistant-welcome",
  role: "assistant",
  content:
    "Xin chào! Mình là AI Learning Assistant. Hãy đặt câu hỏi về việc học hoặc yêu cầu nhắc lịch học nhé.",
  createdAt: Date.now(),
};

const allowedKeywords = [
  "học",
  "ôn",
  "bài",
  "lịch",
  "study",
  "lesson",
  "homework",
  "nhắc",
  "thi",
  "kiểm tra",
];

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([initialAssistantMessage]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const sanitizedInput = useMemo(() => inputValue.trim(), [inputValue]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const stored = window.localStorage.getItem(REMINDER_STORAGE_KEY);
      if (stored) {
        const parsed: Reminder[] = JSON.parse(stored);
        setReminders(parsed);
      }
    } catch (error) {
      console.error("Failed to load reminders", error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !isHydrated) {
      return;
    }
    window.localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(reminders));
  }, [reminders, isHydrated]);

  const ensureNotificationPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return;
    }
    if (Notification.permission === "default") {
      try {
        await Notification.requestPermission();
      } catch (error) {
        console.error("Notification permission request failed", error);
      }
    }
  }, []);

  const notifyReminder = useCallback(
    async (reminder: Reminder) => {
      if (typeof window === "undefined") {
        return;
      }

      const body = `Đến giờ học ${reminder.subject}!`;

      if ("Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification("Đến giờ học rồi! 📚", { body });
        } else if (Notification.permission === "default") {
          const permission = await Notification.requestPermission();
          if (permission === "granted") {
            new Notification("Đến giờ học rồi! 📚", { body });
          }
        }
      }

      toast.success(`⏰ ${body}`, {
        duration: 5000,
      });
    },
    []
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const checkReminders = () => {
      const now = Date.now();
      setReminders((prev) => {
        let hasUpdates = false;
        const updated = prev.map((reminder) => {
          if (!reminder.notified && reminder.time <= now) {
            hasUpdates = true;
            void notifyReminder(reminder);
            return { ...reminder, notified: true };
          }
          return reminder;
        });
        if (hasUpdates) {
          window.localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(updated));
        }
        return updated;
      });
    };

    // Check immediately and then every minute.
    checkReminders();
    const interval = window.setInterval(checkReminders, 60_000);

    return () => {
      window.clearInterval(interval);
    };
  }, [notifyReminder]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const createChatMessage = useCallback((role: ChatRole, content: string): ChatMessage => {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${role}-${Date.now()}`;
    return {
      id,
      role,
      content,
      createdAt: Date.now(),
    };
  }, []);

  const parseReminder = useCallback((text: string): ParsedReminder | null => {
    const reminderRegex =
      /nhắc\s+(?:tôi|mình|em|anh|chị)?\s*học\s+(?<subject>.+?)\s+lúc\s+(?<time>.+)/i;
    const matches = text.match(reminderRegex);
    if (!matches || !matches.groups) {
      return null;
    }

    const subject = matches.groups.subject?.replace(/[.!?]+$/, "").trim();
    const timeText = matches.groups.time?.trim().toLowerCase();

    if (!subject || !timeText) {
      return null;
    }

    const targetDate = interpretTimePhrase(timeText);
    if (!targetDate) {
      return null;
    }

    if (targetDate.getTime() <= Date.now()) {
      return null;
    }

    return { subject, scheduledFor: targetDate };
  }, []);

  const handleReminderDetection = useCallback(
    async (text: string) => {
      const parsed = parseReminder(text);
      if (!parsed) {
        return;
      }

      await ensureNotificationPermission();

      const reminder: Reminder = {
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `reminder-${Date.now()}`,
        subject: parsed.subject,
        time: parsed.scheduledFor.getTime(),
        notified: false,
      };

      setReminders((prev) => [...prev, reminder]);
      toast.success("✅ Đã lưu nhắc học!");
    },
    [ensureNotificationPermission, parseReminder]
  );

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!sanitizedInput) {
        return;
      }

      setErrorMessage(null);
      setIsLoading(true);

      const userMessage = createChatMessage("user", sanitizedInput);
      const nextMessages = [...messages, userMessage];
      setMessages(nextMessages);
      setInputValue("");

      void handleReminderDetection(sanitizedInput);

      const normalizedInput = sanitizedInput.toLowerCase();
      const isAllowed = allowedKeywords.some((keyword) => normalizedInput.includes(keyword));

      if (!isAllowed) {
        const guardMessage = createChatMessage(
          "assistant",
          "Xin lỗi, tôi chỉ hỗ trợ các chức năng trong chatbot học tập. 🧠"
        );
        setMessages((prev) => [...prev, guardMessage]);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: nextMessages.map(({ role, content }) => ({ role, content })),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error ?? "Đã có lỗi xảy ra");
        }

        const data: { reply?: string } = await response.json();
        const replyText =
          data.reply?.trim() ?? "Xin lỗi, mình chưa thể trả lời ngay bây giờ.";

        const assistantMessage = createChatMessage("assistant", replyText);
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        console.error("Gọi API thất bại", error);
        const fallback = createChatMessage(
          "assistant",
          "Mình gặp lỗi khi kết nối tới máy chủ. Vui lòng thử lại sau nhé!"
        );
        setMessages((prev) => [...prev, fallback]);
        setErrorMessage(error instanceof Error ? error.message : "Đã có lỗi xảy ra");
      } finally {
        setIsLoading(false);
      }
    },
    [createChatMessage, handleReminderDetection, messages, sanitizedInput]
  );

  return (
    <div className="min-h-screen bg-slate-100 py-10 font-sans text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Toaster position="top-right" richColors />
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 rounded-3xl bg-white/90 p-6 shadow-2xl ring-1 ring-slate-200 backdrop-blur dark:bg-slate-900/80 dark:ring-slate-800">
        <header className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            AI Learning Assistant Chatbot
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Hỏi đáp về học tập và đặt lịch nhắc học thông minh.
          </p>
        </header>

        <section className="flex min-h-[50vh] flex-col gap-3 rounded-2xl bg-slate-50/80 p-4 shadow-inner dark:bg-slate-800/60">
          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex w-full ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-relaxed shadow ${
                    message.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-green-500 text-white"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl bg-green-500/80 px-4 py-2 text-xs font-medium text-white">
                  <span className="h-2 w-2 animate-ping rounded-full bg-white" />
                  AI đang suy nghĩ...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {errorMessage && (
            <p className="text-xs text-rose-500">⚠️ {errorMessage}</p>
          )}

          <form onSubmit={handleSubmit} className="mt-2 flex gap-3">
            <input
              aria-label="Nhập tin nhắn"
              className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-75 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-700/40"
              placeholder="Nhập câu hỏi học tập hoặc yêu cầu nhắc học..."
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-blue-500 dark:hover:bg-blue-400"
              disabled={isLoading}
            >
              {isLoading ? "Đang gửi..." : "Gửi"}
            </button>
          </form>
        </section>

        {reminders.length > 0 && (
          <aside className="rounded-2xl bg-slate-100/70 p-4 text-xs text-slate-600 shadow-sm dark:bg-slate-800/70 dark:text-slate-300">
            <h2 className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
              Nhắc học sắp tới
            </h2>
            <ul className="space-y-1">
              {reminders
                .filter((reminder) => reminder.time > Date.now())
                .sort((a, b) => a.time - b.time)
                .slice(0, 5)
                .map((reminder) => (
                  <li key={reminder.id}>
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      {reminder.subject}
                    </span>{" "}
                    -{" "}
                    <time dateTime={new Date(reminder.time).toISOString()}>
                      {new Date(reminder.time).toLocaleString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </time>
                  </li>
                ))}
              {reminders.filter((reminder) => reminder.time > Date.now()).length === 0 && (
                <li>Không có lịch nhắc nào sắp tới.</li>
              )}
            </ul>
          </aside>
        )}
      </div>
    </div>
  );
}

function interpretTimePhrase(timeText: string): Date | null {
  const now = new Date();
  const target = new Date(now);
  target.setSeconds(0);
  target.setMilliseconds(0);

  const normalized = timeText.toLowerCase();

  let explicitDate = false;

  if (normalized.includes("ngày kia")) {
    target.setDate(target.getDate() + 2);
    explicitDate = true;
  } else if (normalized.includes("mai")) {
    target.setDate(target.getDate() + 1);
    explicitDate = true;
  } else if (normalized.includes("hôm nay")) {
    explicitDate = true;
  }

  const specificDateMatch = normalized.match(/ngày\s*(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/);
  if (specificDateMatch) {
    const day = parseInt(specificDateMatch[1]!, 10);
    const month = parseInt(specificDateMatch[2]!, 10) - 1;
    const year = specificDateMatch[3]
      ? parseInt(specificDateMatch[3]!, 10)
      : target.getFullYear();
    target.setFullYear(year, month, day);
    explicitDate = true;
  }

  let hour: number | null = null;
  let minute = 0;

  const timeWithMinutesMatch = normalized.match(
    /(\d{1,2})\s*(?:h|giờ|:)\s*(\d{1,2})?/
  );

  if (timeWithMinutesMatch) {
    hour = parseInt(timeWithMinutesMatch[1]!, 10);
    if (timeWithMinutesMatch[2]) {
      minute = parseInt(timeWithMinutesMatch[2]!, 10);
    }
  } else {
    const hourOnlyMatch = normalized.match(/(\d{1,2})\s*(?:h|giờ)/);
    if (hourOnlyMatch) {
      hour = parseInt(hourOnlyMatch[1]!, 10);
      minute = 0;
    }
  }

  if (hour === null || Number.isNaN(hour) || hour > 23) {
    return null;
  }

  if (
    (normalized.includes("chiều") ||
      normalized.includes("tối") ||
      normalized.includes("đêm") ||
      normalized.includes("pm") ||
      normalized.includes("p.m")) &&
    hour < 12
  ) {
    hour += 12;
  }

  if (normalized.includes("sáng") && hour === 12) {
    hour = 0;
  }

  target.setHours(hour, minute, 0, 0);

  if (!explicitDate && target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }

  return target;
}
