"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Toaster, toast } from "sonner";
import { ChatMessage, Reminder, ParsedReminder } from "@/types/chat";
import { useChatSessions } from "@/hooks/use-chat-sessions";
import { useChatStream } from "@/hooks/use-chat-stream";
import { ChatAppSidebar } from "@/components/chat/chat-app-sidebar";
import { ChatMessage as ChatMessageComponent } from "@/components/chat/chat-message";
import { AITextLoading } from "@/components/kokonutui/ai-text-loading";
import { EnhancedChatInput } from "@/components/chat/enhanced-chat-input";
import { ReminderSheet } from "@/components/chat/reminder-sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Calendar, Bell } from "lucide-react";

const REMINDER_STORAGE_KEY = "ai-learning-reminders";


export default function DashboardPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<ChatMessage | null>(null);
  const [isReminderSheetOpen, setIsReminderSheetOpen] = useState(false);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const {
    sessions,
    currentSessionId,
    currentSession,
    isHydrated: sessionsHydrated,
    createSession,
    deleteSession,
    updateSessionTitle,
    addMessageToSession,
    switchToSession,
  } = useChatSessions();

  const { sendMessage, isStreaming } = useChatStream();

  // Load reminders from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

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

  // Save reminders to localStorage
  useEffect(() => {
    if (typeof window === "undefined" || !isHydrated) return;
    window.localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(reminders));
  }, [reminders, isHydrated]);

  const ensureNotificationPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "default") {
      try {
        await Notification.requestPermission();
      } catch (error) {
        console.error("Notification permission request failed", error);
      }
    }
  }, []);

  const notifyReminder = useCallback(async (reminder: Reminder) => {
    if (typeof window === "undefined") return;

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

    toast.success(`⏰ ${body}`, { duration: 5000 });
  }, []);

  // Check reminders periodically
  useEffect(() => {
    if (typeof window === "undefined") return;

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

    checkReminders();
    // Check every 10 seconds instead of 60 seconds for more accuracy
    const interval = window.setInterval(checkReminders, 10_000);
    return () => window.clearInterval(interval);
  }, [notifyReminder]);

  // Smooth auto scroll to bottom with throttling
  useEffect(() => {
    // Clear previous timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Throttle scroll updates to avoid lag
    scrollTimeoutRef.current = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ 
        behavior: "smooth",
        block: "end"
      });
    }, 150); // Only scroll every 150ms

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [currentSession?.messages, streamingMessage, isWaitingForResponse]);

  const createChatMessage = useCallback((role: "user" | "assistant", content: string): ChatMessage => {
    const id = crypto.randomUUID();
    return {
      id,
      role,
      content,
      createdAt: Date.now(),
    };
  }, []);

  const parseReminder = useCallback((text: string): ParsedReminder | null => {
    const reminderRegex = /nhắc\s+(?:tôi|mình|em|anh|chị)?\s*học\s+(.+?)\s+lúc\s+(.+)/i;
    const matches = text.match(reminderRegex);
    if (!matches || matches.length < 3) return null;

    const subject = matches[1]?.replace(/[.!?]+$/, "").trim();
    const timeText = matches[2]?.trim().toLowerCase();

    if (!subject || !timeText) return null;

    const targetDate = interpretTimePhrase(timeText);
    if (!targetDate || targetDate.getTime() <= Date.now()) return null;

    return { subject, scheduledFor: targetDate };
  }, []);

  const handleReminderDetection = useCallback(async (text: string) => {
    const parsed = parseReminder(text);
    if (!parsed) return;

    await ensureNotificationPermission();

    const reminder: Reminder = {
      id: crypto.randomUUID(),
      subject: parsed.subject,
      time: parsed.scheduledFor.getTime(),
      notified: false,
    };

    setReminders((prev) => [...prev, reminder]);
    toast.success("✅ Đã lưu nhắc học!");
  }, [ensureNotificationPermission, parseReminder]);

  const handleSendMessage = useCallback(async (message: string, model: string, attachments?: { type: 'image'; data: string; name: string }[], enableResearch?: boolean) => {
    if (!currentSession || !currentSessionId) return;

    const userMessage = createChatMessage("user", message);
    if (attachments && attachments.length > 0) {
      userMessage.attachments = attachments;
    }
    addMessageToSession(currentSessionId, userMessage);

    void handleReminderDetection(message);

    const messagesForAPI = [...currentSession.messages, userMessage];
    setIsWaitingForResponse(true);

    await sendMessage(
      messagesForAPI,
      (messageId, content) => {
        setIsWaitingForResponse(false);
        setStreamingMessage({
          id: messageId,
          role: "assistant",
          content,
          createdAt: Date.now(),
        });
      },
      (messageId, finalContent) => {
        setStreamingMessage(null);
        
        // Check for multiple reminder requests in AI response
        const reminderMatches = [...finalContent.matchAll(/REMINDER_REQUEST:\s*(.+?)\s+at\s+(\d{2}:\d{2})\s+(\d{2}\/\d{2}\/\d{4})/g)];
        
        if (reminderMatches.length > 0) {
          const createdReminders: string[] = [];
          const newReminders: Reminder[] = [];
          
          reminderMatches.forEach((match) => {
            const [, subject, time, date] = match;
            const [day, month, year] = date.split('/');
            const [hour, minute] = time.split(':');
            
            const reminderDate = new Date(
              parseInt(year),
              parseInt(month) - 1, // Month is 0-indexed
              parseInt(day),
              parseInt(hour),
              parseInt(minute)
            );
            
            // Create the reminder
            const newReminder: Reminder = {
              id: crypto.randomUUID(),
              subject: subject.trim(),
              time: reminderDate.getTime(),
              notified: false,
            };
            
            newReminders.push(newReminder);
            createdReminders.push(`"${subject}" lúc ${time} ngày ${date}`);
          });
          
          // Add all reminders to state and localStorage at once
          setReminders(prev => {
            const updated = [...prev, ...newReminders];
            localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(updated));
            return updated;
          });
          
          // Clean the response to remove all REMINDER_REQUEST parts
          const cleanContent = finalContent.replace(/REMINDER_REQUEST:[^\n]*\n?/g, '').trim();
          const reminderSummary = createdReminders.length === 1 
            ? `\n\n✅ Đã tạo lịch nhắc: ${createdReminders[0]}`
            : `\n\n✅ Đã tạo ${createdReminders.length} lịch nhắc:\n${createdReminders.map(r => `• ${r}`).join('\n')}`;
          
          const assistantMessage = createChatMessage("assistant", cleanContent + reminderSummary);
          addMessageToSession(currentSessionId, assistantMessage);
          
          toast.success(`Đã tạo ${createdReminders.length} lịch nhắc`);
        } else {
          const assistantMessage = createChatMessage("assistant", finalContent);
          addMessageToSession(currentSessionId, assistantMessage);
        }
      },
      (error) => {
        setIsWaitingForResponse(false);
        setStreamingMessage(null);
        const errorMessage = createChatMessage(
          "assistant",
          "Mình gặp lỗi khi kết nối tới máy chủ. Vui lòng thử lại sau nhé!"
        );
        addMessageToSession(currentSessionId, errorMessage);
        toast.error(error);
      },
      model,
      attachments,
      enableResearch
    );
  }, [currentSession, currentSessionId, createChatMessage, addMessageToSession, handleReminderDetection, sendMessage]);

  const handleUpdateReminder = useCallback((id: string, updates: Partial<Reminder>) => {
    setReminders(prev => prev.map(reminder => 
      reminder.id === id ? { ...reminder, ...updates } : reminder
    ));
  }, []);

  const handleDeleteReminder = useCallback((id: string) => {
    setReminders(prev => prev.filter(reminder => reminder.id !== id));
  }, []);

  const handleCreateReminder = useCallback((newReminder: Omit<Reminder, 'id'>) => {
    const reminder: Reminder = {
      ...newReminder,
      id: crypto.randomUUID(),
    };
    setReminders(prev => [...prev, reminder]);
  }, []);

  if (!isHydrated || !sessionsHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  const upcomingReminders = reminders.filter(r => r.time > Date.now() && !r.notified);

  return (
    <SidebarProvider>
      <Toaster position="top-right" richColors />
      
      <ChatAppSidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onCreateSession={() => createSession()}
        onSelectSession={(id) => switchToSession(id)}
        onDeleteSession={(id) => deleteSession(id)}
        onRenameSession={(id, title) => updateSessionTitle(id, title)}
      />
      
      <SidebarInset>
        {/* Header */}
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">
                  AI Learning Assistant
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {currentSession?.title || "Cuộc trò chuyện mới"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          
          {/* Header Actions */}
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsReminderSheetOpen(true)}
              className="relative"
            >
              <Calendar className="h-4 w-4" />
              {upcomingReminders.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                  {upcomingReminders.length}
                </span>
              )}
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="bg-muted/50 border flex flex-1 flex-col gap-6 min-h-0 rounded-xl shadow-sm text-card-foreground">
            <ScrollArea className="flex-1 p-4">
              <div className="max-w-4xl mx-auto space-y-4">
                {currentSession?.messages.map((message) => (
                  <ChatMessageComponent
                    key={message.id}
                    message={message}
                  />
                ))}
                
                {isWaitingForResponse && <AITextLoading />}
                
                {streamingMessage && (
                  <ChatMessageComponent
                    message={streamingMessage}
                    isStreaming={true}
                  />
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input inside main content */}
            <div className=" bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50 p-4 rounded-b-xl">
              <div className="max-w-4xl mx-auto">
                <EnhancedChatInput
                  onSendMessage={handleSendMessage}
                  isLoading={isStreaming}
                />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* Reminder Sheet */}
      <ReminderSheet
        reminders={reminders}
        open={isReminderSheetOpen}
        onOpenChange={setIsReminderSheetOpen}
        onUpdateReminder={handleUpdateReminder}
        onDeleteReminder={handleDeleteReminder}
        onCreateReminder={handleCreateReminder}
      />
    </SidebarProvider>
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

  const timeWithMinutesMatch = normalized.match(/(\d{1,2})\s*(?:h|giờ|:)\s*(\d{1,2})?/);

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

  if (hour === null || Number.isNaN(hour) || hour > 23) return null;

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