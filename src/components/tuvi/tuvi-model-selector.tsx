"use client";

import { motion } from "framer-motion";
import { Bot, Zap, Brain, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { GPT_MODELS } from "@/types/tuvi";

interface TuViModelSelectorProps {
  selectedModel: string;
  onSelectModel: (model: string) => void;
}

const modelIcons: Record<string, React.ReactNode> = {
  "gpt-4o": <Sparkles className="h-5 w-5" />,
  "gpt-4o-mini": <Zap className="h-5 w-5" />,
  "o1": <Brain className="h-5 w-5" />,
  "o1-mini": <Brain className="h-4 w-4" />,
  "gpt-4-turbo": <Bot className="h-5 w-5" />,
};

const modelColors: Record<string, string> = {
  "gpt-4o": "from-emerald-500 to-teal-600",
  "gpt-4o-mini": "from-blue-500 to-cyan-600",
  "o1": "from-purple-500 to-violet-600",
  "o1-mini": "from-pink-500 to-rose-600",
  "gpt-4-turbo": "from-amber-500 to-orange-600",
};

const modelBadges: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  "gpt-4o": { label: "Khuyên dùng", variant: "default" },
  "gpt-4o-mini": { label: "Nhanh", variant: "secondary" },
  "o1": { label: "Cao cấp", variant: "destructive" },
  "o1-mini": { label: "Suy luận", variant: "outline" },
  "gpt-4-turbo": { label: "Mạnh", variant: "secondary" },
};

export function TuViModelSelector({
  selectedModel,
  onSelectModel,
}: TuViModelSelectorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="border-2 border-sky-200/50 dark:border-sky-800/30 bg-gradient-to-br from-sky-50/30 to-blue-50/30 dark:from-sky-950/20 dark:to-blue-950/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="p-2 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white">
              <Bot className="h-5 w-5" />
            </div>
            <span className="bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
              Chọn Mô Hình AI
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={selectedModel}
            onValueChange={onSelectModel}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
          >
            {GPT_MODELS.map((model) => {
              const isSelected = selectedModel === model.value;
              const colorClass = modelColors[model.value] || "from-gray-500 to-gray-600";
              const badge = modelBadges[model.value];

              return (
                <motion.div
                  key={model.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Label
                    htmlFor={model.value}
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? `border-sky-500 bg-sky-50 dark:bg-sky-950/30 shadow-lg shadow-sky-500/10`
                        : `border-transparent bg-background/50 hover:bg-muted/50 hover:border-sky-200`
                    }`}
                  >
                    <RadioGroupItem
                      value={model.value}
                      id={model.value}
                      className="mt-1 sr-only"
                    />
                    <div
                      className={`p-2 rounded-lg bg-gradient-to-br ${colorClass} text-white flex-shrink-0`}
                    >
                      {modelIcons[model.value] || <Bot className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{model.label}</span>
                        {badge && (
                          <Badge variant={badge.variant} className="text-xs px-2 py-0">
                            {badge.label}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {model.description}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-sky-500 flex-shrink-0 mt-2" />
                    )}
                  </Label>
                </motion.div>
              );
            })}
          </RadioGroup>
        </CardContent>
      </Card>
    </motion.div>
  );
}

