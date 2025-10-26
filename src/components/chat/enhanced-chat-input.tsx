"use client";

import { ArrowRight, Bot, Check, ChevronDown, Paperclip, X, Search, Image as ImageIcon } from "lucide-react";
import { useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const OPENAI_SVG = (
    <div className="w-4 h-4">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="256"
            height="260"
            preserveAspectRatio="xMidYMid"
            viewBox="0 0 256 260"
            aria-label="OpenAI icon"
            className="dark:hidden block w-full h-full"
        >
            <title>OpenAI Icon Light</title>
            <path d="M239.184 106.203a64.716 64.716 0 0 0-5.576-53.103C219.452 28.459 191 15.784 163.213 21.74A65.586 65.586 0 0 0 52.096 45.22a64.716 64.716 0 0 0-43.23 31.36c-14.31 24.602-11.061 55.634 8.033 76.74a64.665 64.665 0 0 0 5.525 53.102c14.174 24.65 42.644 37.324 70.446 31.36a64.72 64.72 0 0 0 48.754 21.744c28.481.025 53.714-18.361 62.414-45.481a64.767 64.767 0 0 0 43.229-31.36c14.137-24.558 10.875-55.423-8.083-76.483Zm-97.56 136.338a48.397 48.397 0 0 1-31.105-11.255l1.535-.87 51.67-29.825a8.595 8.595 0 0 0 4.247-7.367v-72.85l21.845 12.636c.218.111.37.32.409.563v60.367c-.056 26.818-21.783 48.545-48.601 48.601Zm-104.466-44.61a48.345 48.345 0 0 1-5.781-32.589l1.534.921 51.722 29.826a8.339 8.339 0 0 0 8.441 0l63.181-36.425v25.221a.87.87 0 0 1-.358.665l-52.335 30.184c-23.257 13.398-52.97 5.431-66.404-17.803ZM23.549 85.38a48.499 48.499 0 0 1 25.58-21.333v61.39a8.288 8.288 0 0 0 4.195 7.316l62.874 36.272-21.845 12.636a.819.819 0 0 1-.767 0L41.353 151.53c-23.211-13.454-31.171-43.144-17.804-66.405v.256Zm179.466 41.695-63.08-36.63L161.73 77.86a.819.819 0 0 1 .768 0l52.233 30.184a48.6 48.6 0 0 1-7.316 87.635v-61.391a8.544 8.544 0 0 0-4.4-7.213Zm21.742-32.69-1.535-.922-51.619-30.081a8.39 8.39 0 0 0-8.492 0L99.98 99.808V74.587a.716.716 0 0 1 .307-.665l52.233-30.133a48.652 48.652 0 0 1 72.236 50.391v.205ZM88.061 139.097l-21.845-12.585a.87.87 0 0 1-.41-.614V65.685a48.652 48.652 0 0 1 79.757-37.346l-1.535.87-51.67 29.825a8.595 8.595 0 0 0-4.246 7.367l-.051 72.697Zm11.868-25.58 28.138-16.217 28.188 16.218v32.434l-28.086 16.218-28.188-16.218-.052-32.434Z" />
        </svg>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="256"
            height="260"
            preserveAspectRatio="xMidYMid"
            viewBox="0 0 256 260"
            aria-label="OpenAI icon"
            className="hidden dark:block w-full h-full"
        >
            <title>OpenAI Icon Dark</title>
            <path
                fill="#fff"
                d="M239.184 106.203a64.716 64.716 0 0 0-5.576-53.103C219.452 28.459 191 15.784 163.213 21.74A65.586 65.586 0 0 0 52.096 45.22a64.716 64.716 0 0 0-43.23 31.36c-14.31 24.602-11.061 55.634 8.033 76.74a64.665 64.665 0 0 0 5.525 53.102c14.174 24.65 42.644 37.324 70.446 31.36a64.72 64.72 0 0 0 48.754 21.744c28.481.025 53.714-18.361 62.414-45.481a64.767 64.767 0 0 0 43.229-31.36c14.137-24.558 10.875-55.423-8.083-76.483Zm-97.56 136.338a48.397 48.397 0 0 1-31.105-11.255l1.535-.87 51.67-29.825a8.595 8.595 0 0 0 4.247-7.367v-72.85l21.845 12.636c.218.111.37.32.409.563v60.367c-.056 26.818-21.783 48.545-48.601 48.601Zm-104.466-44.61a48.345 48.345 0 0 1-5.781-32.589l1.534.921 51.722 29.826a8.339 8.339 0 0 0 8.441 0l63.181-36.425v25.221a.87.87 0 0 1-.358.665l-52.335 30.184c-23.257 13.398-52.97 5.431-66.404-17.803ZM23.549 85.38a48.499 48.499 0 0 1 25.58-21.333v61.39a8.288 8.288 0 0 0 4.195 7.316l62.874 36.272-21.845 12.636a.819.819 0 0 1-.767 0L41.353 151.53c-23.211-13.454-31.171-43.144-17.804-66.405v.256Zm179.466 41.695-63.08-36.63L161.73 77.86a.819.819 0 0 1 .768 0l52.233 30.184a48.6 48.6 0 0 1-7.316 87.635v-61.391a8.544 8.544 0 0 0-4.4-7.213Zm21.742-32.69-1.535-.922-51.619-30.081a8.39 8.39 0 0 0-8.492 0L99.98 99.808V74.587a.716.716 0 0 1 .307-.665l52.233-30.133a48.652 48.652 0 0 1 72.236 50.391v.205ZM88.061 139.097l-21.845-12.585a.87.87 0 0 1-.41-.614V65.685a48.652 48.652 0 0 1 79.757-37.346l-1.535.87-51.67 29.825a8.595 8.595 0 0 0-4.246 7.367l-.051 72.697Zm11.868-25.58 28.138-16.217 28.188 16.218v32.434l-28.086 16.218-28.188-16.218-.052-32.434Z"
            />
        </svg>
    </div>
);

interface EnhancedChatInputProps {
  onSendMessage: (message: string, model: string, attachments?: { type: 'image'; data: string; name: string }[], enableResearch?: boolean) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
}

export function EnhancedChatInput({
  onSendMessage,
  isLoading = false,
  placeholder = "Nhập câu hỏi học tập hoặc yêu cầu nhắc học...",
  className,
}: EnhancedChatInputProps) {
  const [value, setValue] = useState("");
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 72,
    maxHeight: 300,
  });
  const [selectedModel, setSelectedModel] = useState("gpt-5-nano");
  const [attachedImages, setAttachedImages] = useState<{ type: 'image'; data: string; name: string }[]>([]);
  const [enableResearch, setEnableResearch] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const AI_MODELS = [
    { id: "gpt-5-nano", name: "GPT-5 Nano", icon: OPENAI_SVG },
    { id: "gpt-5-mini", name: "GPT-5 Mini", icon: OPENAI_SVG },
    { id: "gpt-5", name: "GPT-5", icon: OPENAI_SVG },
    { id: "gpt-5-pro", name: "GPT-5 Pro", icon: OPENAI_SVG },
  ];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) {
        toast.error('Chỉ hỗ trợ file ảnh');
        return;
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File ảnh quá lớn (tối đa 10MB)');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setAttachedImages(prev => [...prev, {
          type: 'image',
          data: base64,
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setAttachedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const trimmedValue = value.trim();
    if (!trimmedValue || isLoading) return;

    // Check if research is supported for selected model
    const supportsResearch = selectedModel !== "gpt-5-nano";
    const finalEnableResearch = enableResearch && supportsResearch;

    onSendMessage(trimmedValue, selectedModel, attachedImages, finalEnableResearch);
    setValue("");
    setAttachedImages([]);
    setEnableResearch(false);
    adjustHeight(true);
  };

  const selectedModelData = AI_MODELS.find(m => m.id === selectedModel) || AI_MODELS[0];

  return (
    <div className={cn("w-full", className)}>
      <div className="bg-background/80 border border-border/50 rounded-2xl p-1.5 shadow-sm">
        <div className="relative flex flex-col">
          <div className="overflow-y-auto" style={{ maxHeight: "400px" }}>
            <Textarea
              value={value}
              placeholder={placeholder}
              className={cn(
                "w-full rounded-xl rounded-b-none px-4 py-3 bg-background/50 border border-border/30 resize-none",
                "focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0 focus-visible:border-primary/50",
                "placeholder:text-muted-foreground/70 text-foreground",
                "min-h-[72px]"
              )}
              ref={textareaRef}
              onKeyDown={handleKeyDown}
              onChange={(e) => {
                setValue(e.target.value);
                adjustHeight();
              }}
              disabled={isLoading}
            />

            {/* Image Attachments */}
            {attachedImages.length > 0 && (
              <div className="px-4 pb-3">
                <div className="flex flex-wrap gap-2">
                  {attachedImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image.data}
                        alt={image.name}
                        className="w-16 h-16 object-cover rounded-lg border border-border/50"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 rounded-b-lg truncate">
                        {image.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="h-14 bg-background/50 border border-t-0 border-border/30 rounded-b-xl flex items-center">
            <div className="absolute left-3 right-3 bottom-3 flex items-center justify-between w-[calc(100%-24px)]">
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 h-8 px-3 text-xs rounded-lg hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 bg-background/80 border-border/60 shadow-sm"
                    >
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={selectedModel}
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          transition={{ duration: 0.15 }}
                          className="flex items-center gap-2"
                        >
                          {selectedModelData.icon}
                          {selectedModelData.name}
                          <ChevronDown className="w-3 h-3 opacity-50" />
                        </motion.div>
                      </AnimatePresence>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="min-w-[12rem] p-1">
                    {AI_MODELS.map((model) => (
                      <DropdownMenuItem
                        key={model.id}
                        onSelect={() => setSelectedModel(model.id)}
                        className="flex items-center justify-between gap-2 rounded-md px-2 py-2 hover:bg-accent/50 focus:bg-accent/50"
                      >
                        <div className="flex items-center gap-2">
                          {model.icon}
                          <span>{model.name}</span>
                        </div>
                        {selectedModel === model.id && (
                          <Check className="w-4 h-4 text-primary" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <div className="h-4 w-px bg-border/60 mx-0.5" />
                
                {/* Image Upload */}
                <label
                  className={cn(
                    "rounded-lg p-2 bg-background/60 border border-border/40 cursor-pointer",
                    "hover:bg-muted/80 focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30",
                    "text-muted-foreground hover:text-foreground transition-all"
                  )}
                  aria-label="Upload image"
                >
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                  />
                  <ImageIcon className="w-4 h-4 transition-colors" />
                </label>

                {/* Research Toggle */}
                {selectedModel !== "gpt-5-nano" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEnableResearch(!enableResearch)}
                    className={cn(
                      "h-8 px-2 text-xs rounded-lg border border-border/40",
                      enableResearch 
                        ? "bg-primary/10 text-primary border-primary/30" 
                        : "bg-background/60 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Search className="w-3 h-3 mr-1" />
                    Research
                  </Button>
                )}
              </div>
              
              <Button
                onClick={handleSubmit}
                disabled={!value.trim() || isLoading}
                size="icon"
                className="h-8 w-8 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm border border-primary/20"
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
