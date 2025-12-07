"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Sparkles, Copy, Check, RefreshCw, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface TuViResultProps {
  title: string;
  content: string;
  isStreaming: boolean;
  onRegenerate?: () => void;
}

export function TuViResult({
  title,
  content,
  isStreaming,
  onRegenerate,
}: TuViResultProps) {
  const [copied, setCopied] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when streaming
  useEffect(() => {
    if (isStreaming && contentRef.current) {
      const scrollArea = contentRef.current.closest('[data-radix-scroll-area-viewport]');
      if (scrollArea) {
        scrollArea.scrollTop = scrollArea.scrollHeight;
      }
    }
  }, [content, isStreaming]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("Đã sao chép nội dung");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Không thể sao chép");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col border-2 border-violet-200/50 dark:border-violet-800/30 bg-gradient-to-br from-violet-50/30 to-purple-50/30 dark:from-violet-950/20 dark:to-purple-950/20">
        <CardHeader className="flex-shrink-0 pb-3 border-b">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <span className="text-lg bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  Kết Quả Luận Giải
                </span>
                <p className="text-sm font-normal text-muted-foreground mt-0.5">
                  {title}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isStreaming && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang phân tích...
                </div>
              )}
              {!isStreaming && content && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="gap-2"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    {copied ? "Đã sao chép" : "Sao chép"}
                  </Button>
                  {onRegenerate && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onRegenerate}
                      className="gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Làm mới
                    </Button>
                  )}
                </>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-0 min-h-0">
          <ScrollArea className="h-full">
            <div ref={contentRef} className="p-6">
              {content ? (
                <div className="prose prose-violet dark:prose-invert max-w-none prose-headings:text-violet-700 dark:prose-headings:text-violet-400 prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3 prose-h3:text-lg prose-h3:mt-4 prose-h3:mb-2 prose-p:text-foreground prose-li:text-foreground prose-strong:text-violet-600 dark:prose-strong:text-violet-400">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content}
                  </ReactMarkdown>
                  {isStreaming && (
                    <span className="inline-block w-2 h-5 bg-violet-500 animate-pulse ml-1" />
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="p-4 rounded-full bg-violet-100 dark:bg-violet-900/30 mb-4">
                    <Sparkles className="h-8 w-8 text-violet-500" />
                  </div>
                  <h3 className="text-lg font-medium text-muted-foreground">
                    Chưa có kết quả
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Chọn một mục luận giải để bắt đầu
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Loading skeleton
export function TuViResultSkeleton() {
  return (
    <Card className="h-full flex flex-col border-2 border-violet-200/50 dark:border-violet-800/30">
      <CardHeader className="flex-shrink-0 pb-3 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-muted animate-pulse" />
          <div className="space-y-2">
            <div className="w-32 h-5 bg-muted animate-pulse rounded" />
            <div className="w-48 h-4 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-6">
        <div className="space-y-4">
          <div className="h-6 w-3/4 bg-muted animate-pulse rounded" />
          <div className="h-4 w-full bg-muted animate-pulse rounded" />
          <div className="h-4 w-full bg-muted animate-pulse rounded" />
          <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
          <div className="h-6 w-1/2 bg-muted animate-pulse rounded mt-6" />
          <div className="h-4 w-full bg-muted animate-pulse rounded" />
          <div className="h-4 w-4/5 bg-muted animate-pulse rounded" />
        </div>
      </CardContent>
    </Card>
  );
}

