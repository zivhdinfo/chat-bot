"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Bot } from "lucide-react";

export function ChatSkeleton() {
  return (
    <div className="flex gap-3 p-4">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="bg-secondary text-secondary-foreground">
          <Bot className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>

      <Card className="max-w-[80%] shadow-sm bg-muted/50">
        <CardContent className="p-3">
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="mt-2">
            <Skeleton className="h-3 w-12" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
