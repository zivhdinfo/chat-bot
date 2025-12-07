"use client";

import { useState } from "react";
import { Reminder } from "@/types/chat";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TimePicker } from "@/components/ui/time-picker";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Clock, Bell, CheckCircle2, Calendar, Edit3, Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReminderSheetProps {
  reminders: Reminder[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateReminder?: (id: string, updates: Partial<Reminder>) => void;
  onDeleteReminder?: (id: string) => void;
  onCreateReminder?: (reminder: Omit<Reminder, 'id'>) => void;
}

export function ReminderSheet({ 
  reminders, 
  open, 
  onOpenChange,
  onUpdateReminder,
  onDeleteReminder,
  onCreateReminder 
}: ReminderSheetProps) {
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [newReminderSubject, setNewReminderSubject] = useState("");
  const [newReminderDate, setNewReminderDate] = useState<Date | undefined>(undefined);
  const [newReminderTime, setNewReminderTime] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [editDate, setEditDate] = useState<Date | undefined>(undefined);
  const [editTime, setEditTime] = useState("");

  const now = Date.now();
  
  const upcomingReminders = reminders
    .filter((reminder) => reminder.time > now && !reminder.notified)
    .sort((a, b) => a.time - b.time);
    
  const completedReminders = reminders
    .filter((reminder) => reminder.notified || reminder.time <= now)
    .sort((a, b) => b.time - a.time)
    .slice(0, 10); // Show last 10 completed

  const handleEditReminder = (reminder: Reminder) => {
    const reminderDate = new Date(reminder.time);
    setEditingReminder(reminder);
    setEditSubject(reminder.subject);
    setEditDate(reminderDate);
    setEditTime(format(reminderDate, "HH:mm"));
  };

  const handleSaveEdit = () => {
    if (editingReminder && editDate && editSubject.trim() && editTime && onUpdateReminder) {
      // Combine date and time
      const [hours, minutes] = editTime.split(':').map(Number);
      const combinedDate = new Date(editDate);
      combinedDate.setHours(hours, minutes, 0, 0);
        
      onUpdateReminder(editingReminder.id, {
        subject: editSubject.trim(),
        time: combinedDate.getTime(),
      });
      setEditingReminder(null);
      setEditSubject("");
      setEditDate(undefined);
      setEditTime("");
    }
  };

  const handleCreateReminder = () => {
    if (newReminderDate && newReminderSubject.trim() && newReminderTime && onCreateReminder) {
      // Combine date and time
      const [hours, minutes] = newReminderTime.split(':').map(Number);
      const combinedDate = new Date(newReminderDate);
      combinedDate.setHours(hours, minutes, 0, 0);
        
      onCreateReminder({
        subject: newReminderSubject.trim(),
        time: combinedDate.getTime(),
        notified: false,
      });
      setNewReminderSubject("");
      setNewReminderDate(undefined);
      setNewReminderTime("");
    }
  };

  const handleDeleteReminder = (id: string) => {
    if (onDeleteReminder) {
      onDeleteReminder(id);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] flex flex-col">
        <SheetHeader className="pb-4 space-y-3">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span>Lịch học của bạn</span>
            </SheetTitle>
          </div>
          
          <SheetDescription>
            Quản lý và theo dõi các lịch nhắc học tập
          </SheetDescription>
          
          {/* Add New Reminder Button */}
          <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-2">
                  <Plus className="h-3 w-3" />
                  Thêm
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Thêm lịch nhắc mới
                  </DialogTitle>
                  <DialogDescription>
                    Tạo lịch nhắc học tập để không bỏ lỡ bài học quan trọng
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-sm font-medium">
                      Môn học
                    </Label>
                    <Input
                      id="subject"
                      value={newReminderSubject}
                      onChange={(e) => setNewReminderSubject(e.target.value)}
                      placeholder="Ví dụ: Toán, Văn, Anh văn..."
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Ngày</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !newReminderDate && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {newReminderDate ? format(newReminderDate, "PPP", { locale: vi }) : "Chọn ngày"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={newReminderDate}
                          onSelect={setNewReminderDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Giờ</Label>
                    <TimePicker
                      value={newReminderTime}
                      onChange={setNewReminderTime}
                      placeholder="Chọn giờ nhắc"
                    />
                  </div>
                </div>
                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setNewReminderSubject("");
                      setNewReminderDate(undefined);
                      setNewReminderTime("");
                    }}
                  >
                    Hủy
                  </Button>
                  <Button
                    onClick={handleCreateReminder}
                    disabled={!newReminderSubject.trim() || !newReminderDate || !newReminderTime}
                    className="gap-2"
                  >
                    <Plus className="h-3 w-3" />
                    Tạo lịch nhắc
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="space-y-6 p-4">
            {/* Upcoming Reminders */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Bell className="h-4 w-4" />
                <h3 className="font-semibold text-sm">
                  Sắp tới ({upcomingReminders.length})
                </h3>
              </div>
              
              {upcomingReminders.length > 0 ? (
                <div className="space-y-3">
                  {upcomingReminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className="group p-4 bg-muted/50 rounded-lg border hover:bg-muted/70 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm mb-1">
                            {reminder.subject}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>
                              {new Date(reminder.time).toLocaleString("vi-VN", {
                                weekday: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                                day: "2-digit",
                                month: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {getTimeUntil(reminder.time)}
                          </Badge>
                          
                          {/* Action Buttons */}
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6"
                                  onClick={() => handleEditReminder(reminder)}
                                >
                                  <Edit3 className="h-3 w-3" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    <Edit3 className="h-4 w-4" />
                                    Chỉnh sửa lịch nhắc
                                  </DialogTitle>
                                  <DialogDescription>
                                    Cập nhật thông tin lịch nhắc học tập
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-subject" className="text-sm font-medium">
                                      Môn học
                                    </Label>
                                    <Input
                                      id="edit-subject"
                                      value={editSubject}
                                      onChange={(e) => setEditSubject(e.target.value)}
                                      placeholder="Tên môn học"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium">Ngày</Label>
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <Button
                                          variant="outline"
                                          className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !editDate && "text-muted-foreground"
                                          )}
                                        >
                                          <Calendar className="mr-2 h-4 w-4" />
                                          {editDate ? format(editDate, "PPP", { locale: vi }) : "Chọn ngày"}
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0">
                                        <CalendarComponent
                                          mode="single"
                                          selected={editDate}
                                          onSelect={setEditDate}
                                          initialFocus
                                        />
                                      </PopoverContent>
                                    </Popover>
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium">Giờ</Label>
                                    <TimePicker
                                      value={editTime}
                                      onChange={setEditTime}
                                      placeholder="Chọn giờ nhắc"
                                    />
                                  </div>
                                </div>
                                <DialogFooter className="gap-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setEditingReminder(null);
                                      setEditSubject("");
                                      setEditDate(undefined);
                                      setEditTime("");
                                    }}
                                  >
                                    Hủy
                                  </Button>
                                  <Button
                                    onClick={handleSaveEdit}
                                    disabled={!editSubject.trim() || !editDate || !editTime}
                                    className="gap-2"
                                  >
                                    <Edit3 className="h-3 w-3" />
                                    Lưu thay đổi
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Xóa lịch nhắc?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Bạn có chắc chắn muốn xóa lịch nhắc &quot;{reminder.subject}&quot;? 
                                    Hành động này không thể hoàn tác.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteReminder(reminder.id)}
                                  >
                                    Xóa
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">Không có lịch nhắc nào sắp tới</p>
                  <p className="text-xs mt-1 mb-3">
                    Thêm lịch nhắc mới hoặc chat với AI
                  </p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Plus className="h-3 w-3 mr-1" />
                        Thêm lịch nhắc
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          Thêm lịch nhắc mới
                        </DialogTitle>
                        <DialogDescription>
                          Tạo lịch nhắc học tập để không bỏ lỡ bài học quan trọng
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="subject" className="text-sm font-medium">
                            Môn học
                          </Label>
                          <Input
                            id="subject"
                            value={newReminderSubject}
                            onChange={(e) => setNewReminderSubject(e.target.value)}
                            placeholder="Ví dụ: Toán, Văn, Anh văn..."
                            className="w-full"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Ngày</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !newReminderDate && "text-muted-foreground"
                                )}
                              >
                                <Calendar className="mr-2 h-4 w-4" />
                                {newReminderDate ? format(newReminderDate, "PPP", { locale: vi }) : "Chọn ngày"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <CalendarComponent
                                mode="single"
                                selected={newReminderDate}
                                onSelect={setNewReminderDate}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Giờ</Label>
                          <TimePicker
                            value={newReminderTime}
                            onChange={setNewReminderTime}
                            placeholder="Chọn giờ nhắc"
                          />
                        </div>
                      </div>
                      <DialogFooter className="gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setNewReminderSubject("");
                            setNewReminderDate(undefined);
                            setNewReminderTime("");
                          }}
                        >
                          Hủy
                        </Button>
                        <Button
                          onClick={handleCreateReminder}
                          disabled={!newReminderSubject.trim() || !newReminderDate || !newReminderTime}
                          className="gap-2"
                        >
                          <Plus className="h-3 w-3" />
                          Tạo lịch nhắc
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>

            {completedReminders.length > 0 && (
              <>
                <Separator />
                
                {/* Completed Reminders */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="h-4 w-4" />
                    <h3 className="font-semibold text-sm">
                      Đã hoàn thành ({completedReminders.length})
                    </h3>
                  </div>
                  
                  <div className="space-y-2">
                    {completedReminders.map((reminder) => (
                      <div
                        key={reminder.id}
                        className="group p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm mb-1">
                              {reminder.subject}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>
                                {new Date(reminder.time).toLocaleString("vi-VN", {
                                  weekday: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  day: "2-digit",
                                  month: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {reminder.notified ? "Đã nhắc" : "Đã qua"}
                            </Badge>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Xóa lịch nhắc?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Bạn có chắc chắn muốn xóa lịch nhắc &quot;{reminder.subject}&quot;? 
                                    Hành động này không thể hoàn tác.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteReminder(reminder.id)}
                                  >
                                    Xóa
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
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
