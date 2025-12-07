"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import { Toaster, toast } from "sonner";
import { ArrowLeft, Sparkles, ChevronRight, Loader2, Search, Check, Upload, Image as ImageIcon, X, History, Trash2, Clock } from "lucide-react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatAppSidebar } from "@/components/chat/chat-app-sidebar";
import { useChatSessions } from "@/hooks/use-chat-sessions";
import { useTuViSessions } from "@/hooks/use-tuvi-sessions";
import { TuViInfo, TuViSession, CHI_GIO, BASIC_CATEGORIES, DETAIL_CATEGORIES, GPT_MODELS } from "@/types/tuvi";
import { cn } from "@/lib/utils";

type Step = "form" | "categories" | "result" | "history";

export default function TuViPage() {
  const [step, setStep] = useState<Step>("form");
  const [tuViInfo, setTuViInfo] = useState<TuViInfo | null>(null);
  const [selectedModel, setSelectedModel] = useState("gpt-5-nano-2025-08-07");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string>("");
  const [resultContent, setResultContent] = useState("");
  const [resultTitle, setResultTitle] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentTuViSessionId, setCurrentTuViSessionId] = useState<string | null>(null);

  // Popover states
  const [openDay, setOpenDay] = useState(false);
  const [openMonth, setOpenMonth] = useState(false);
  const [openYear, setOpenYear] = useState(false);
  const [openGio, setOpenGio] = useState(false);
  const [openModel, setOpenModel] = useState(false);

  // Image upload
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AbortController ref cho việc cancel request
  const abortControllerRef = useRef<AbortController | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    hoTen: "",
    ngaySinh: "",
    thangSinh: "",
    namSinh: "",
    gioSinh: "",
    gioiTinh: "nam" as "nam" | "nu",
    amLich: false,
  });

  // Chat sessions for sidebar
  const {
    sessions,
    currentSessionId,
    createSession,
    deleteSession,
    updateSessionTitle,
    switchToSession,
  } = useChatSessions();

  // TuVi sessions
  const {
    sessions: tuViSessions,
    createSession: createTuViSession,
    updateSessionContent,
    deleteSession: deleteTuViSession,
    getSession: getTuViSession,
  } = useTuViSessions();

  // Cleanup khi unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const days = Array.from({ length: 31 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }));
  const months = Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: `Tháng ${i + 1}` }));
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 125 }, (_, i) => ({ value: String(currentYear - i), label: String(currentYear - i) }));

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error("Vui lòng chọn file ảnh");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        toast.success("Đã tải ảnh lên. AI sẽ phân tích ảnh lá số của bạn.");
      };
      reader.readAsDataURL(file);
    }
  };

  // Xử lý submit form
  const handleFormSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    // Nếu có ảnh lá số, chỉ cần họ tên
    // Nếu không có ảnh, bắt buộc đầy đủ thông tin
    if (!uploadedImage) {
      if (!formData.hoTen || !formData.ngaySinh || !formData.thangSinh || !formData.namSinh || !formData.gioSinh) {
        toast.error("Vui lòng điền đầy đủ thông tin hoặc tải lên ảnh lá số");
        return;
      }
    } else {
      if (!formData.hoTen) {
        toast.error("Vui lòng nhập họ tên");
        return;
      }
    }

    const info: TuViInfo = {
      hoTen: formData.hoTen,
      ngaySinh: formData.ngaySinh ? parseInt(formData.ngaySinh) : 1,
      thangSinh: formData.thangSinh ? parseInt(formData.thangSinh) : 1,
      namSinh: formData.namSinh ? parseInt(formData.namSinh) : 2000,
      gioSinh: formData.gioSinh || "ty",
      gioiTinh: formData.gioiTinh,
      amLich: formData.amLich,
    };
    
    setTuViInfo(info);
    setStep("categories");
  }, [formData, uploadedImage]);

  // Lấy title của category
  const getCategoryTitle = useCallback((categoryId: string, subCategoryId?: string): string => {
    const basicCat = BASIC_CATEGORIES.find(c => c.id === categoryId);
    if (basicCat) return basicCat.title;

    for (const detailCat of DETAIL_CATEGORIES) {
      if (detailCat.id === categoryId && subCategoryId) {
        const subItem = detailCat.items.find(i => i.id === subCategoryId);
        if (subItem) return subItem.title;
      }
    }
    return "Luận Giải";
  }, []);

  // Hàm lấy thời gian hiện tại chi tiết
  const getCurrentTimeString = useCallback(() => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Ho_Chi_Minh',
      timeZoneName: 'short'
    };
    return now.toLocaleString('vi-VN', options);
  }, []);

  // Xử lý chọn category và gọi API
  const handleSelectCategory = useCallback(async (categoryId: string, subCategoryId?: string) => {
    if (!tuViInfo) return;

    // Cancel request trước đó nếu có
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setSelectedCategoryId(categoryId);
    setSelectedSubCategoryId(subCategoryId || "");
    setResultContent("");
    setIsStreaming(true);
    setStep("result");
    setCurrentTuViSessionId(null);

    const title = getCategoryTitle(categoryId, subCategoryId);
    setResultTitle(title);

    try {
      const response = await fetch("/api/tuvi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tuViInfo,
          categoryId,
          subCategoryId,
          model: selectedModel,
          image: uploadedImage,
          currentTime: getCurrentTimeString(),
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error("Lỗi khi gọi API");

      const contentType = response.headers.get("content-type");
      
      if (contentType?.includes("text/event-stream")) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) throw new Error("Không thể đọc response");

        let fullContent = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;

              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  fullContent += parsed.content;
                  setResultContent(fullContent);
                }
              } catch {
                // Ignore parse errors
              }
            }
          }
        }

        // Lưu phiên sau khi hoàn thành
        if (fullContent && tuViInfo) {
          const session = createTuViSession(
            tuViInfo,
            categoryId,
            title,
            fullContent,
            selectedModel,
            subCategoryId,
            uploadedImage || undefined
          );
          setCurrentTuViSessionId(session.id);
        }
      } else {
        const data = await response.json();
        const content = data.content || "Không có kết quả";
        setResultContent(content);
        
        // Lưu phiên
        if (content && tuViInfo) {
          const session = createTuViSession(
            tuViInfo,
            categoryId,
            title,
            content,
            selectedModel,
            subCategoryId,
            uploadedImage || undefined
          );
          setCurrentTuViSessionId(session.id);
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log("Request cancelled");
        return;
      }
      console.error("Error:", error);
      toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
      setResultContent("Đã xảy ra lỗi. Vui lòng thử lại sau.");
    } finally {
      setIsStreaming(false);
    }
  }, [tuViInfo, selectedModel, getCategoryTitle, uploadedImage, getCurrentTimeString, createTuViSession]);

  // Xem lịch sử phiên
  const handleViewSession = useCallback((session: TuViSession) => {
    setTuViInfo(session.tuViInfo);
    setSelectedCategoryId(session.categoryId);
    setSelectedSubCategoryId(session.subCategoryId || "");
    setResultTitle(session.categoryTitle);
    setResultContent(session.content);
    setSelectedModel(session.model);
    setUploadedImage(session.image || null);
    setCurrentTuViSessionId(session.id);
    setStep("result");
  }, []);

  const handleBack = useCallback(() => {
    // Cancel request đang chạy nếu có
    if (abortControllerRef.current && isStreaming) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }

    if (step === "result") {
      setStep("categories");
      setResultContent("");
      setCurrentTuViSessionId(null);
    } else if (step === "categories") {
      setStep("form");
    } else if (step === "history") {
      setStep("form");
    }
  }, [step, isStreaming]);

  // Format thời gian
  const formatDate = useCallback((timestamp: number) => {
    return new Date(timestamp).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  return (
    <SidebarProvider>
      <Toaster position="top-right" richColors />
      
      <ChatAppSidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onCreateSession={() => createSession()}
        onSelectSession={(id) => switchToSession(id)}
        onDeleteSession={(id) => deleteSession(id)}
        onRenameSession={(id, title) => updateSessionTitle(id, title)}
      />
      
      <SidebarInset>
        {/* Header */}
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">AI Assistant</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Luận Giải Tử Vi
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          
          <div className="ml-auto flex items-center gap-2">
            {step === "form" && tuViSessions.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => setStep("history")}>
                <History className="h-4 w-4 mr-2" />
                Lịch sử ({tuViSessions.length})
              </Button>
            )}
            {step !== "form" && (
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
            )}
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="bg-muted/50 border flex flex-1 flex-col min-h-0 rounded-xl shadow-sm">
            <ScrollArea className="flex-1 p-4">
              <div className="max-w-3xl mx-auto">
                {/* Step 1: Form */}
                {step === "form" && (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <h1 className="text-2xl font-bold mb-2">Luận Giải Tử Vi Đẩu Số</h1>
                      <p className="text-muted-foreground">Nhập thông tin hoặc tải ảnh lá số để bắt đầu</p>
                    </div>

                    <Card>
                      <CardContent className="pt-6">
                        <form onSubmit={handleFormSubmit} className="space-y-4">
                          {/* Upload ảnh lá số */}
                          <div className="space-y-2">
                            <Label>Ảnh Lá Số</Label>
                            <input
                              type="file"
                              ref={fileInputRef}
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                            {uploadedImage ? (
                              <div className="relative">
                                <img 
                                  src={uploadedImage} 
                                  alt="Lá số" 
                                  className="w-full max-h-48 object-contain rounded-lg border"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="absolute top-2 right-2 h-6 w-6"
                                  onClick={() => setUploadedImage(null)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                                <p className="text-xs text-green-600 mt-2">
                                  ✓ Đã có ảnh lá số - AI sẽ tự phân tích thông tin từ ảnh
                                </p>
                              </div>
                            ) : (
                              <Button
                                type="button"
                                variant="outline"
                                className="w-full h-24 border-dashed"
                                onClick={() => fileInputRef.current?.click()}
                              >
                                <div className="flex flex-col items-center gap-2">
                                  <Upload className="h-6 w-6 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">
                                    Tải ảnh lá số (không cần nhập ngày giờ sinh)
                                  </span>
                                </div>
                              </Button>
                            )}
                          </div>

                          {!uploadedImage && (
                            <div className="text-center text-sm text-muted-foreground">
                              — hoặc nhập thông tin thủ công —
                            </div>
                          )}

                          <div className="space-y-2">
                            <Label>Họ và Tên <span className="text-red-500">*</span></Label>
                            <Input
                              value={formData.hoTen}
                              onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })}
                              placeholder="Nhập họ tên"
                              className="w-full"
                            />
                          </div>

                          {/* Các trường này ẩn nếu có ảnh */}
                          {!uploadedImage && (
                          <>
                          <div className="grid grid-cols-3 gap-3">
                            {/* Ngày */}
                            <div className="space-y-2">
                              <Label>Ngày</Label>
                              <Popover open={openDay} onOpenChange={setOpenDay}>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" className="w-full justify-between">
                                    {formData.ngaySinh || "Chọn ngày"}
                                    <Search className="h-4 w-4 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0" align="start">
                                  <Command>
                                    <CommandInput placeholder="Tìm ngày..." />
                                    <CommandList>
                                      <CommandEmpty>Không tìm thấy</CommandEmpty>
                                      <CommandGroup>
                                        {days.map((day) => (
                                          <CommandItem
                                            key={day.value}
                                            onSelect={() => {
                                              setFormData({ ...formData, ngaySinh: day.value });
                                              setOpenDay(false);
                                            }}
                                          >
                                            <Check className={cn("mr-2 h-4 w-4", formData.ngaySinh === day.value ? "opacity-100" : "opacity-0")} />
                                            {day.label}
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                            </div>

                            {/* Tháng */}
                            <div className="space-y-2">
                              <Label>Tháng</Label>
                              <Popover open={openMonth} onOpenChange={setOpenMonth}>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" className="w-full justify-between">
                                    {formData.thangSinh ? `Tháng ${formData.thangSinh}` : "Chọn tháng"}
                                    <Search className="h-4 w-4 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0" align="start">
                                  <Command>
                                    <CommandInput placeholder="Tìm tháng..." />
                                    <CommandList>
                                      <CommandEmpty>Không tìm thấy</CommandEmpty>
                                      <CommandGroup>
                                        {months.map((month) => (
                                          <CommandItem
                                            key={month.value}
                                            onSelect={() => {
                                              setFormData({ ...formData, thangSinh: month.value });
                                              setOpenMonth(false);
                                            }}
                                          >
                                            <Check className={cn("mr-2 h-4 w-4", formData.thangSinh === month.value ? "opacity-100" : "opacity-0")} />
                                            {month.label}
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                            </div>

                            {/* Năm */}
                            <div className="space-y-2">
                              <Label>Năm</Label>
                              <Popover open={openYear} onOpenChange={setOpenYear}>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" className="w-full justify-between">
                                    {formData.namSinh || "Chọn năm"}
                                    <Search className="h-4 w-4 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0" align="start">
                                  <Command>
                                    <CommandInput placeholder="Tìm năm..." />
                                    <CommandList>
                                      <CommandEmpty>Không tìm thấy</CommandEmpty>
                                      <CommandGroup>
                                        {years.map((year) => (
                                          <CommandItem
                                            key={year.value}
                                            onSelect={() => {
                                              setFormData({ ...formData, namSinh: year.value });
                                              setOpenYear(false);
                                            }}
                                          >
                                            <Check className={cn("mr-2 h-4 w-4", formData.namSinh === year.value ? "opacity-100" : "opacity-0")} />
                                            {year.label}
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                            </div>
                          </div>

                          {/* Giờ sinh */}
                          <div className="space-y-2">
                            <Label>Giờ Sinh (Chi Giờ)</Label>
                            <Popover open={openGio} onOpenChange={setOpenGio}>
                              <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-between">
                                  {formData.gioSinh ? CHI_GIO.find(g => g.value === formData.gioSinh)?.label : "Chọn giờ sinh"}
                                  <Search className="h-4 w-4 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-full p-0" align="start">
                                <Command>
                                  <CommandInput placeholder="Tìm giờ..." />
                                  <CommandList>
                                    <CommandEmpty>Không tìm thấy</CommandEmpty>
                                    <CommandGroup>
                                      {CHI_GIO.map((gio) => (
                                        <CommandItem
                                          key={gio.value}
                                          onSelect={() => {
                                            setFormData({ ...formData, gioSinh: gio.value });
                                            setOpenGio(false);
                                          }}
                                        >
                                          <Check className={cn("mr-2 h-4 w-4", formData.gioSinh === gio.value ? "opacity-100" : "opacity-0")} />
                                          {gio.label}
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            {/* Giới tính */}
                            <div className="space-y-2">
                              <Label>Giới Tính</Label>
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  variant={formData.gioiTinh === "nam" ? "default" : "outline"}
                                  className="flex-1"
                                  onClick={() => setFormData({ ...formData, gioiTinh: "nam" })}
                                >
                                  Nam
                                </Button>
                                <Button
                                  type="button"
                                  variant={formData.gioiTinh === "nu" ? "default" : "outline"}
                                  className="flex-1"
                                  onClick={() => setFormData({ ...formData, gioiTinh: "nu" })}
                                >
                                  Nữ
                                </Button>
                              </div>
                            </div>
                            {/* Loại lịch */}
                            <div className="space-y-2">
                              <Label>Loại Lịch</Label>
                              <div className="flex items-center justify-between h-10 px-3 rounded-md border bg-background">
                                <span className="text-sm text-muted-foreground">Dương</span>
                                <Switch
                                  checked={formData.amLich}
                                  onCheckedChange={(checked) => setFormData({ ...formData, amLich: checked })}
                                />
                                <span className="text-sm text-muted-foreground">Âm</span>
                              </div>
                            </div>
                          </div>
                          </>
                          )}

                          {/* Model AI */}
                          <div className="space-y-2">
                            <Label>Model AI</Label>
                            <Popover open={openModel} onOpenChange={setOpenModel}>
                              <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-between">
                                  {GPT_MODELS.find(m => m.value === selectedModel)?.label || "Chọn model"}
                                  <Search className="h-4 w-4 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-full p-0" align="start">
                                <Command>
                                  <CommandInput placeholder="Tìm model..." />
                                  <CommandList>
                                    <CommandEmpty>Không tìm thấy</CommandEmpty>
                                    <CommandGroup>
                                      {GPT_MODELS.map((model) => (
                                        <CommandItem
                                          key={model.value}
                                          onSelect={() => {
                                            setSelectedModel(model.value);
                                            setOpenModel(false);
                                          }}
                                        >
                                          <Check className={cn("mr-2 h-4 w-4", selectedModel === model.value ? "opacity-100" : "opacity-0")} />
                                          <div>
                                            <div>{model.label}</div>
                                            <div className="text-xs text-muted-foreground">{model.description}</div>
                                          </div>
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>

                          <Button type="submit" className="w-full">
                            Tiếp tục
                            <ChevronRight className="h-4 w-4 ml-2" />
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Step 2: Categories */}
                {step === "categories" && tuViInfo && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h1 className="text-xl font-bold mb-1">Chọn mục luận giải</h1>
                      <p className="text-sm text-muted-foreground">
                        {tuViInfo.hoTen} • {tuViInfo.ngaySinh}/{tuViInfo.thangSinh}/{tuViInfo.namSinh} • Giờ {tuViInfo.gioSinh}
                      </p>
                    </div>

                    {/* Basic Categories */}
                    <Card>
                      <CardContent className="pt-4">
                        <h3 className="font-semibold mb-3">Luận Giải Cơ Bản</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {BASIC_CATEGORIES.map((cat) => (
                            <Button
                              key={cat.id}
                              variant="ghost"
                              className="justify-start h-auto py-3 px-3 text-left"
                              onClick={() => handleSelectCategory(cat.id)}
                            >
                              <span className="mr-2">{cat.icon}</span>
                              <span className="text-sm truncate">{cat.title}</span>
                            </Button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Detail Categories */}
                    <Card>
                      <CardContent className="pt-4">
                        <h3 className="font-semibold mb-3">Luận Giải Chuyên Sâu</h3>
                        <Accordion type="single" collapsible className="w-full">
                          {DETAIL_CATEGORIES.map((cat) => (
                            <AccordionItem key={cat.id} value={cat.id}>
                              <AccordionTrigger className="text-sm hover:no-underline">
                                {cat.title} ({cat.items.length} mục)
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-1 pt-2">
                                  {cat.items.map((item) => (
                                    <Button
                                      key={item.id}
                                      variant="ghost"
                                      className="w-full justify-start h-auto py-2 px-3 text-left"
                                      onClick={() => handleSelectCategory(cat.id, item.id)}
                                    >
                                      <span className="text-xs">{item.title}</span>
                                    </Button>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Step History: Lịch sử luận giải */}
                {step === "history" && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h1 className="text-xl font-bold mb-1 flex items-center justify-center gap-2">
                        <History className="h-5 w-5" />
                        Lịch Sử Luận Giải
                      </h1>
                      <p className="text-sm text-muted-foreground">
                        {tuViSessions.length} phiên luận giải đã lưu
                      </p>
                    </div>

                    {tuViSessions.length === 0 ? (
                      <Card>
                        <CardContent className="py-12 text-center">
                          <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                          <p className="text-muted-foreground">Chưa có phiên luận giải nào</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-3">
                        {tuViSessions.map((session) => (
                          <Card 
                            key={session.id} 
                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => handleViewSession(session)}
                          >
                            <CardContent className="py-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-medium truncate">{session.categoryTitle}</h3>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {session.tuViInfo.hoTen} • {session.tuViInfo.ngaySinh}/{session.tuViInfo.thangSinh}/{session.tuViInfo.namSinh}
                                  </p>
                                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    {formatDate(session.createdAt)}
                                    <span className="px-1.5 py-0.5 bg-muted rounded text-xs">
                                      {GPT_MODELS.find(m => m.value === session.model)?.label || session.model}
                                    </span>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 shrink-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteTuViSession(session.id);
                                    toast.success("Đã xóa phiên luận giải");
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}

                    <Button variant="outline" onClick={() => setStep("form")} className="w-full">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Quay lại
                    </Button>
                  </div>
                )}

                {/* Step 3: Result */}
                {step === "result" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-semibold">{resultTitle}</h2>
                        {tuViInfo && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {tuViInfo.hoTen} • {tuViInfo.ngaySinh}/{tuViInfo.thangSinh}/{tuViInfo.namSinh}
                          </p>
                        )}
                      </div>
                      {isStreaming && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Đang phân tích...
                        </div>
                      )}
                    </div>

                    <Card>
                      <CardContent className="pt-6">
                        {resultContent ? (
                          <div className="prose dark:prose-invert max-w-none prose-sm">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {resultContent}
                            </ReactMarkdown>
                            {isStreaming && (
                              <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-32">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {!isStreaming && resultContent && (
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={handleBack}>
                          Chọn mục khác
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleSelectCategory(selectedCategoryId, selectedSubCategoryId)}
                        >
                          Luận lại
                        </Button>
                        {tuViSessions.length > 0 && (
                          <Button variant="ghost" onClick={() => setStep("history")}>
                            <History className="h-4 w-4 mr-2" />
                            Xem lịch sử
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
