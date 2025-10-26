"use client";

import { useState } from "react";
import { ChatMessage as ChatMessageType } from "@/types/chat";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Bot, User, ChevronDown, ChevronUp, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessageProps {
  message: ChatMessageType;
  isStreaming?: boolean;
}

export function ChatMessage({ message, isStreaming = false }: ChatMessageProps) {
  const isUser = message.role === "user";
  
  // Check if message is long (more than 500 characters)
  const isLongMessage = message.content.length > 500;
  const shouldCollapse = isLongMessage && !isStreaming;
  
  // Auto-collapse long messages when not streaming
  const [isCollapsed, setIsCollapsed] = useState(shouldCollapse);
  
  // Get preview content (first 200 characters)
  const previewContent = shouldCollapse && isCollapsed 
    ? message.content.substring(0, 200) + "..."
    : message.content;

  return (
    <div className={cn("flex gap-3 p-4", isUser && "flex-row-reverse")}>
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className={cn(
          "text-xs font-medium",
          isUser 
            ? "bg-primary text-primary-foreground" 
            : "bg-secondary text-secondary-foreground"
        )}>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      <Card className={cn(
        "max-w-[80%] shadow-sm",
        isUser 
          ? "bg-primary text-primary-foreground" 
          : "bg-muted/50"
      )}>
        <CardContent className="p-3">
          <div className="text-sm leading-relaxed">
            {isUser ? (
              <div className="space-y-3">
                {/* Hiển thị ảnh nếu có */}
                {message.attachments && message.attachments.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 max-w-md">
                    {message.attachments.map((attachment, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={attachment.data} 
                          alt={attachment.name}
                          className="rounded-lg border border-border/20 max-w-full h-auto object-cover"
                        />
                        <div className="text-xs text-muted-foreground mt-1 truncate">
                          {attachment.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="whitespace-pre-wrap">{previewContent}</div>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  ul: ({ children }) => <ul className="mb-2 last:mb-0 ml-4 list-disc">{children}</ul>,
                  ol: ({ children }) => <ol className="mb-2 last:mb-0 ml-4 list-decimal">{children}</ol>,
                  li: ({ children }) => <li className="mb-1">{children}</li>,
                  code: ({ children, className }) => {
                    const isInline = !className;
                    return isInline ? (
                      <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">{children}</code>
                    ) : (
                      <code className={`block bg-muted p-2 rounded text-xs font-mono overflow-x-auto ${className}`}>
                        {children}
                      </code>
                    );
                  },
                  pre: ({ children }) => <pre className="bg-muted p-2 rounded overflow-x-auto mb-2">{children}</pre>,
                  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                  em: ({ children }) => <em className="italic">{children}</em>,
                }}
                >
                  {previewContent}
                </ReactMarkdown>
              </div>
            )}
            {isStreaming && (
              <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1" />
            )}
          </div>

          {/* Collapse/Expand Controls */}
          {shouldCollapse && (
            <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border/50">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="h-7 px-2 text-xs"
              >
                {isCollapsed ? (
                  <>
                    <ChevronDown className="w-3 h-3 mr-1" />
                    Hiện thêm
                  </>
                ) : (
                  <>
                    <ChevronUp className="w-3 h-3 mr-1" />
                    Thu gọn
                  </>
                )}
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                    <Maximize2 className="w-3 h-3 mr-1" />
                    Xem toàn bộ
                  </Button>
                </DialogTrigger>
                <DialogContent 
                  className="sm:max-w-[70vw] max-w-[90vw] w-full max-h-[80vh] overflow-hidden p-0"
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
                  <DialogHeader className="p-6 pb-4">
                    <DialogTitle className="flex items-center gap-2">
                      {isUser ? (
                        <>
                          <User className="w-4 h-4" />
                          Tin nhắn của bạn
                        </>
                      ) : (
                        <>
                          <Bot className="w-4 h-4" />
                          Phản hồi của AI
                        </>
                      )}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="px-6 pb-6">
                    <Card className={cn(
                      "shadow-sm",
                      isUser 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted/50"
                    )}>
                      <CardContent className="p-4">
                        <div className="overflow-y-auto max-h-[55vh] pr-2" tabIndex={0}>
                          <div className="text-sm leading-relaxed">
                            {isUser ? (
                              <div className="space-y-3">
                                {/* Hiển thị ảnh nếu có */}
                                {message.attachments && message.attachments.length > 0 && (
                                  <div className="grid grid-cols-2 gap-2 max-w-md">
                                    {message.attachments.map((attachment, index) => (
                                      <div key={index} className="relative">
                                        <img 
                                          src={attachment.data} 
                                          alt={attachment.name}
                                          className="rounded-lg border border-border/20 max-w-full h-auto object-cover"
                                        />
                                        <div className="text-xs text-muted-foreground mt-1 truncate">
                                          {attachment.name}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <div className="whitespace-pre-wrap">{message.content}</div>
                              </div>
                            ) : (
                              <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0">
                                <ReactMarkdown 
                                  remarkPlugins={[remarkGfm]}
                                  components={{
                                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                    ul: ({ children }) => <ul className="mb-2 last:mb-0 ml-4 list-disc">{children}</ul>,
                                    ol: ({ children }) => <ol className="mb-2 last:mb-0 ml-4 list-decimal">{children}</ol>,
                                    li: ({ children }) => <li className="mb-1">{children}</li>,
                                    code: ({ children, className }) => {
                                      const isInline = !className;
                                      return isInline ? (
                                        <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">{children}</code>
                                      ) : (
                                        <code className={`block bg-muted p-2 rounded text-xs font-mono overflow-x-auto ${className}`}>
                                          {children}
                                        </code>
                                      );
                                    },
                                    pre: ({ children }) => <pre className="bg-muted p-2 rounded overflow-x-auto mb-2">{children}</pre>,
                                    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                                    em: ({ children }) => <em className="italic">{children}</em>,
                                  }}
                                >
                                  {message.content}
                                </ReactMarkdown>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className={cn(
                          "text-xs mt-3 pt-2 border-t opacity-70",
                          isUser 
                            ? "text-primary-foreground/70 border-primary-foreground/20" 
                            : "text-muted-foreground border-border/50"
                        )}>
                          {new Date(message.createdAt).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
          <div className={cn(
            "text-xs mt-2 opacity-70",
            isUser ? "text-primary-foreground/70" : "text-muted-foreground"
          )}>
            {new Date(message.createdAt).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
