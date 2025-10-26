"use client";

import { Reminder } from "@/types/chat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Bell } from "lucide-react";

interface ReminderPanelProps {
  reminders: Reminder[];
}

export function ReminderPanel({ reminders }: ReminderPanelProps) {
  const upcomingReminders = reminders
    .filter((reminder) => reminder.time > Date.now() && !reminder.notified)
    .sort((a, b) => a.time - b.time)
    .slice(0, 5);

  if (upcomingReminders.length === 0) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
          <Bell className="h-4 w-4" />
          Nhắc học sắp tới
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcomingReminders.map((reminder) => (
          <div
            key={reminder.id}
            className="flex items-center justify-between p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-blue-100 dark:border-blue-800/50"
          >
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-blue-500" />
              <div>
                <p className="font-medium text-sm text-slate-900 dark:text-slate-100">
                  {reminder.subject}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {new Date(reminder.time).toLocaleString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              {getTimeUntil(reminder.time)}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function getTimeUntil(timestamp: number): string {
  const now = Date.now();
  const diff = timestamp - now;
  
  if (diff < 0) return "Đã qua";
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} ngày`;
  if (hours > 0) return `${hours} giờ`;
  if (minutes > 0) return `${minutes} phút`;
  
  return "Sắp tới";
}
