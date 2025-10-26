"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";

export function AITextLoading() {
  return (
    <div className="flex gap-3 p-4">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="bg-secondary text-secondary-foreground">
          <Bot className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>

      <Card className="max-w-[80%] shadow-sm bg-muted/50">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Bot className="h-4 w-4" />
              <span>AI đang suy nghĩ</span>
            </div>
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
          
          <div className="mt-3 space-y-2">
            <div className="flex gap-2">
              <div className="h-3 bg-muted rounded animate-pulse" style={{ width: '60%' }}></div>
              <div className="h-3 bg-muted rounded animate-pulse" style={{ width: '30%' }}></div>
            </div>
            <div className="flex gap-2">
              <div className="h-3 bg-muted rounded animate-pulse" style={{ width: '40%' }}></div>
              <div className="h-3 bg-muted rounded animate-pulse" style={{ width: '50%' }}></div>
            </div>
            <div className="flex gap-2">
              <div className="h-3 bg-muted rounded animate-pulse" style={{ width: '70%' }}></div>
              <div className="h-3 bg-muted rounded animate-pulse" style={{ width: '20%' }}></div>
            </div>
          </div>
          
          <div className="text-xs mt-2 opacity-70 text-muted-foreground">
            {new Date().toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}