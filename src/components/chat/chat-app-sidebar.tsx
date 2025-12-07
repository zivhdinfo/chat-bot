"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { 
  Plus, 
  MessageSquare, 
  MoreHorizontal, 
  Pencil, 
  Trash2,
  Bot,
  Clock,
  Settings,
  Sparkles,
  Compass
} from "lucide-react";
import Link from "next/link";
import { ChatSession } from "@/types/chat";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

interface ChatAppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onCreateSession: () => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onRenameSession: (sessionId: string, title: string) => void;
}

export function ChatAppSidebar({
  sessions,
  currentSessionId,
  onCreateSession,
  onSelectSession,
  onDeleteSession,
  onRenameSession,
  ...props
}: ChatAppSidebarProps) {
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const handleRename = (session: ChatSession) => {
    setEditingSessionId(session.id);
    setEditTitle(session.title);
  };

  const handleSaveRename = () => {
    if (editingSessionId && editTitle.trim()) {
      onRenameSession(editingSessionId, editTitle.trim());
    }
    setEditingSessionId(null);
    setEditTitle("");
  };

  const handleCancelRename = () => {
    setEditingSessionId(null);
    setEditTitle("");
  };

  // Group sessions by date
  const groupedSessions = React.useMemo(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const groups = {
      today: [] as ChatSession[],
      yesterday: [] as ChatSession[],
      lastWeek: [] as ChatSession[],
      older: [] as ChatSession[],
    };

    sessions.forEach((session) => {
      const sessionDate = new Date(session.updatedAt);
      if (sessionDate.toDateString() === today.toDateString()) {
        groups.today.push(session);
      } else if (sessionDate.toDateString() === yesterday.toDateString()) {
        groups.yesterday.push(session);
      } else if (sessionDate >= lastWeek) {
        groups.lastWeek.push(session);
      } else {
        groups.older.push(session);
      }
    });

    return groups;
  }, [sessions]);

  const renderSessionGroup = (title: string, sessions: ChatSession[]) => {
    if (sessions.length === 0) return null;

    return (
      <SidebarGroup key={title}>
        <SidebarGroupLabel>{title}</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {sessions.map((session) => (
              <SidebarMenuItem key={session.id}>
                {editingSessionId === session.id ? (
                  <div className="flex items-center gap-1 px-2 py-1">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveRename();
                        if (e.key === "Escape") handleCancelRename();
                      }}
                      className="h-6 text-sm"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleSaveRename}
                      className="h-6 w-6 p-0"
                    >
                      ✓
                    </Button>
                  </div>
                ) : (
                  <SidebarMenuButton
                    asChild
                    isActive={currentSessionId === session.id}
                    className="group"
                  >
                    <div className="flex items-center justify-between w-full">
                      <button
                        onClick={() => onSelectSession(session.id)}
                        className="flex items-center gap-2 flex-1 text-left min-w-0"
                      >
                        <MessageSquare className="h-4 w-4 shrink-0" />
                        <span className="truncate text-sm">{session.title}</span>
                      </button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleRename(session)}>
                            <Pencil className="h-3 w-3 mr-2" />
                            Đổi tên
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDeleteSession(session.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-3 w-3 mr-2" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center justify-between p-2 bg-gradient-to-r from-muted/20 to-muted/10 rounded-lg mx-2 mt-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-primary to-primary/80 rounded-lg shadow-sm">
              <Bot className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
              AI Learning Assistant
            </span>
          </div>
          <ThemeToggle />
        </div>
        
        <div className="px-2 pb-2">
          <Button
            onClick={onCreateSession}
            className="w-full justify-start gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-sm transition-all duration-200"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            Cuộc trò chuyện mới
          </Button>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        {/* Features Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Tính năng</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/tuvi" className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span>Luận Giải Tử Vi</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Chat Sessions */}
        {renderSessionGroup("Hôm nay", groupedSessions.today)}
        {renderSessionGroup("Hôm qua", groupedSessions.yesterday)}
        {renderSessionGroup("Tuần trước", groupedSessions.lastWeek)}
        {renderSessionGroup("Cũ hơn", groupedSessions.older)}
        
        {sessions.length === 0 && (
          <SidebarGroup>
            <SidebarGroupContent>
              <div className="text-center text-muted-foreground text-sm p-4">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Chưa có cuộc trò chuyện nào</p>
                <p className="text-xs mt-1">Tạo cuộc trò chuyện mới để bắt đầu</p>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      
      <SidebarRail />
    </Sidebar>
  );
}
