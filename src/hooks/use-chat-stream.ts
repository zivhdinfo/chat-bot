"use client";

import { useCallback, useState } from "react";
import { ChatMessage } from "@/types/chat";

export function useChatStream() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);

  const sendMessage = useCallback(async (
    messages: ChatMessage[],
    onMessageUpdate: (messageId: string, content: string) => void,
    onComplete: (messageId: string, finalContent: string) => void,
    onError: (error: string) => void,
    model?: string,
    attachments?: { type: 'image'; data: string; name: string }[],
    enableResearch?: boolean
  ) => {
    setIsStreaming(true);
    
    // Create a temporary message ID for streaming
    const tempMessageId = crypto.randomUUID();
    setStreamingMessageId(tempMessageId);
    
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.map(({ role, content }) => ({ role, content })),
          model: model || "gpt-5-nano",
          currentTime: new Date().toLocaleString('vi-VN', {
            timeZone: 'Asia/Ho_Chi_Minh',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }),
          attachments,
          enableResearch,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();
      let accumulatedContent = "";

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              onComplete(tempMessageId, accumulatedContent);
              setIsStreaming(false);
              setStreamingMessageId(null);
              return;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                accumulatedContent += parsed.content;
                onMessageUpdate(tempMessageId, accumulatedContent);
              }
            } catch (e) {
              // Ignore parsing errors for individual chunks
            }
          }
        }
      }

      // Fallback completion
      onComplete(tempMessageId, accumulatedContent);
    } catch (error) {
      console.error("Chat stream error:", error);
      onError(error instanceof Error ? error.message : "Đã có lỗi xảy ra");
    } finally {
      setIsStreaming(false);
      setStreamingMessageId(null);
    }
  }, []);

  return {
    sendMessage,
    isStreaming,
    streamingMessageId,
  };
}
