"use client";

import { useState, useEffect, useCallback } from "react";
import { TuViSession, TuViInfo, TuViChatMessage } from "@/types/tuvi";

const TUVI_SESSIONS_KEY = "tuvi-sessions";

export function useTuViSessions() {
  const [sessions, setSessions] = useState<TuViSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load sessions from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = window.localStorage.getItem(TUVI_SESSIONS_KEY);
      if (stored) {
        const parsed: TuViSession[] = JSON.parse(stored);
        // Sắp xếp theo thời gian mới nhất
        parsed.sort((a, b) => b.createdAt - a.createdAt);
        setSessions(parsed);
      }
    } catch (error) {
      console.error("Failed to load tuvi sessions", error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save sessions to localStorage
  const saveSessions = useCallback((newSessions: TuViSession[]) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(TUVI_SESSIONS_KEY, JSON.stringify(newSessions));
  }, []);

  // Tạo phiên mới
  const createSession = useCallback((
    tuViInfo: TuViInfo,
    categoryId: string,
    categoryTitle: string,
    content: string,
    model: string,
    subCategoryId?: string,
    image?: string
  ): TuViSession => {
    const newSession: TuViSession = {
      id: crypto.randomUUID(),
      tuViInfo,
      categoryId,
      subCategoryId,
      categoryTitle,
      content,
      model,
      createdAt: Date.now(),
      image,
    };

    setSessions((prev) => {
      const updated = [newSession, ...prev];
      saveSessions(updated);
      return updated;
    });

    setCurrentSessionId(newSession.id);
    return newSession;
  }, [saveSessions]);

  // Cập nhật nội dung phiên
  const updateSessionContent = useCallback((sessionId: string, content: string) => {
    setSessions((prev) => {
      const updated = prev.map((s) =>
        s.id === sessionId ? { ...s, content } : s
      );
      saveSessions(updated);
      return updated;
    });
  }, [saveSessions]);

  // Cập nhật chat messages của phiên
  const updateSessionChatMessages = useCallback((sessionId: string, chatMessages: TuViChatMessage[]) => {
    setSessions((prev) => {
      const updated = prev.map((s) =>
        s.id === sessionId ? { ...s, chatMessages } : s
      );
      saveSessions(updated);
      return updated;
    });
  }, [saveSessions]);

  // Xóa phiên
  const deleteSession = useCallback((sessionId: string) => {
    setSessions((prev) => {
      const updated = prev.filter((s) => s.id !== sessionId);
      saveSessions(updated);
      return updated;
    });

    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
    }
  }, [currentSessionId, saveSessions]);

  // Lấy phiên theo ID
  const getSession = useCallback((sessionId: string): TuViSession | undefined => {
    return sessions.find((s) => s.id === sessionId);
  }, [sessions]);

  // Lấy phiên hiện tại
  const currentSession = currentSessionId ? getSession(currentSessionId) : null;

  // Lấy các phiên theo người dùng (theo họ tên)
  const getSessionsByUser = useCallback((hoTen: string): TuViSession[] => {
    return sessions.filter((s) => s.tuViInfo.hoTen === hoTen);
  }, [sessions]);

  // Xóa tất cả phiên
  const clearAllSessions = useCallback(() => {
    setSessions([]);
    setCurrentSessionId(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(TUVI_SESSIONS_KEY);
    }
  }, []);

  return {
    sessions,
    currentSessionId,
    currentSession,
    isHydrated,
    createSession,
    updateSessionContent,
    updateSessionChatMessages,
    deleteSession,
    getSession,
    getSessionsByUser,
    setCurrentSessionId,
    clearAllSessions,
  };
}

