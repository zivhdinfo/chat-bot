"use client";

import { useState, useEffect, useCallback } from "react";
import { ChatSession, ChatMessage } from "@/types/chat";

const CHAT_SESSIONS_KEY = "ai-learning-chat-sessions";
const CURRENT_SESSION_KEY = "ai-learning-current-session";

export function useChatSessions() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load sessions from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const storedSessions = localStorage.getItem(CHAT_SESSIONS_KEY);
      const storedCurrentId = localStorage.getItem(CURRENT_SESSION_KEY);
      
      if (storedSessions) {
        const parsed: ChatSession[] = JSON.parse(storedSessions);
        setSessions(parsed);
      }
      
      if (storedCurrentId) {
        setCurrentSessionId(storedCurrentId);
      }
    } catch (error) {
      console.error("Failed to load chat sessions", error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save sessions to localStorage
  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return;
    
    localStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(sessions));
  }, [sessions, isHydrated]);

  // Save current session ID
  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return;
    
    if (currentSessionId) {
      localStorage.setItem(CURRENT_SESSION_KEY, currentSessionId);
    } else {
      localStorage.removeItem(CURRENT_SESSION_KEY);
    }
  }, [currentSessionId, isHydrated]);

  const createSession = useCallback((title?: string): ChatSession => {
    const id = crypto.randomUUID();
    const now = Date.now();
    
    const newSession: ChatSession = {
      id,
      title: title || `Chat ${new Date().toLocaleDateString("vi-VN")}`,
      messages: [{
        id: "assistant-welcome",
        role: "assistant",
        content: "Xin chào! Mình là AI Learning Assistant. Hãy đặt câu hỏi về việc học hoặc yêu cầu nhắc lịch học nhé.",
        createdAt: now,
      }],
      createdAt: now,
      updatedAt: now,
    };

    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(id);
    
    return newSession;
  }, []);

  const deleteSession = useCallback((sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    
    if (currentSessionId === sessionId) {
      const remainingSessions = sessions.filter(s => s.id !== sessionId);
      if (remainingSessions.length > 0) {
        setCurrentSessionId(remainingSessions[0].id);
      } else {
        // Create a new session if no sessions remain
        const newSession = createSession();
        setCurrentSessionId(newSession.id);
      }
    }
  }, [currentSessionId, sessions, createSession]);

  const updateSessionTitle = useCallback((sessionId: string, title: string) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, title, updatedAt: Date.now() }
        : session
    ));
  }, []);

  const addMessageToSession = useCallback((sessionId: string, message: ChatMessage) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { 
            ...session, 
            messages: [...session.messages, message],
            updatedAt: Date.now()
          }
        : session
    ));
  }, []);

  const updateMessageInSession = useCallback((sessionId: string, messageId: string, content: string) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { 
            ...session, 
            messages: session.messages.map(msg => 
              msg.id === messageId ? { ...msg, content } : msg
            ),
            updatedAt: Date.now()
          }
        : session
    ));
  }, []);

  const getCurrentSession = useCallback((): ChatSession | null => {
    if (!currentSessionId) return null;
    return sessions.find(s => s.id === currentSessionId) || null;
  }, [currentSessionId, sessions]);

  const switchToSession = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId);
  }, []);

  // Initialize with a default session if none exist
  useEffect(() => {
    if (isHydrated && sessions.length === 0 && !currentSessionId) {
      createSession();
    }
  }, [isHydrated, sessions.length, currentSessionId, createSession]);

  return {
    sessions,
    currentSessionId,
    currentSession: getCurrentSession(),
    isHydrated,
    createSession,
    deleteSession,
    updateSessionTitle,
    addMessageToSession,
    updateMessageInSession,
    switchToSession,
  };
}
