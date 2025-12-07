"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, Sparkles, BookOpen, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  BASIC_CATEGORIES,
  DETAIL_CATEGORIES,
  BasicCategory,
  DetailCategory,
} from "@/types/tuvi";

interface TuViCategoriesProps {
  onSelectCategory: (categoryId: string, subCategoryId?: string) => void;
  selectedCategoryId?: string;
  selectedSubCategoryId?: string;
}

export function TuViCategories({
  onSelectCategory,
  selectedCategoryId,
  selectedSubCategoryId,
}: TuViCategoriesProps) {
  const [openCategories, setOpenCategories] = useState<string[]>([]);

  const toggleCategory = (categoryId: string) => {
    setOpenCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <div className="space-y-8">
      {/* Basic Categories */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <BookOpen className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Luận Giải Cơ Bản
          </h2>
          <Badge variant="secondary" className="ml-auto">
            {BASIC_CATEGORIES.length} mục
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {BASIC_CATEGORIES.map((category) => (
            <BasicCategoryCard
              key={category.id}
              category={category}
              isSelected={selectedCategoryId === category.id}
              onSelect={() => onSelectCategory(category.id)}
              variants={itemVariants}
            />
          ))}
        </div>
      </motion.div>

      {/* Detail Categories */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Luận Giải Chuyên Sâu
          </h2>
          <Badge variant="secondary" className="ml-auto">
            {DETAIL_CATEGORIES.length} chủ đề
          </Badge>
        </div>

        <div className="space-y-3">
          {DETAIL_CATEGORIES.map((category) => (
            <DetailCategoryCard
              key={category.id}
              category={category}
              isOpen={openCategories.includes(category.id)}
              onToggle={() => toggleCategory(category.id)}
              onSelectItem={(subId) => onSelectCategory(category.id, subId)}
              selectedCategoryId={selectedCategoryId}
              selectedSubCategoryId={selectedSubCategoryId}
              variants={itemVariants}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

interface BasicCategoryCardProps {
  category: BasicCategory;
  isSelected: boolean;
  onSelect: () => void;
  variants: typeof itemVariants;
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

function BasicCategoryCard({
  category,
  isSelected,
  onSelect,
  variants,
}: BasicCategoryCardProps) {
  return (
    <motion.div variants={variants}>
      <Card
        className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-emerald-300 group ${
          isSelected
            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 shadow-lg shadow-emerald-500/10"
            : "hover:bg-emerald-50/50 dark:hover:bg-emerald-950/10"
        }`}
        onClick={onSelect}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">{category.icon}</span>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                {category.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {category.description}
              </p>
            </div>
            <ArrowRight
              className={`h-4 w-4 flex-shrink-0 transition-all ${
                isSelected
                  ? "text-emerald-600 translate-x-0"
                  : "text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
              }`}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface DetailCategoryCardProps {
  category: DetailCategory;
  isOpen: boolean;
  onToggle: () => void;
  onSelectItem: (subId: string) => void;
  selectedCategoryId?: string;
  selectedSubCategoryId?: string;
  variants: typeof itemVariants;
}

function DetailCategoryCard({
  category,
  isOpen,
  onToggle,
  onSelectItem,
  selectedCategoryId,
  selectedSubCategoryId,
  variants,
}: DetailCategoryCardProps) {
  const categoryIcons: Record<string, string> = {
    "tai-bach-chuyen-sau": "💰",
    "quan-loc-chuyen-sau": "💼",
    "suc-khoe-chuyen-sau": "🏥",
    "tu-tuc-chuyen-sau": "👶",
    "hon-nhan-chuyen-sau": "💑",
  };

  const categoryColors: Record<string, { bg: string; text: string; border: string; hover: string }> = {
    "tai-bach-chuyen-sau": {
      bg: "bg-yellow-50 dark:bg-yellow-950/30",
      text: "text-yellow-700 dark:text-yellow-400",
      border: "border-yellow-300",
      hover: "hover:bg-yellow-50/50 dark:hover:bg-yellow-950/10",
    },
    "quan-loc-chuyen-sau": {
      bg: "bg-blue-50 dark:bg-blue-950/30",
      text: "text-blue-700 dark:text-blue-400",
      border: "border-blue-300",
      hover: "hover:bg-blue-50/50 dark:hover:bg-blue-950/10",
    },
    "suc-khoe-chuyen-sau": {
      bg: "bg-green-50 dark:bg-green-950/30",
      text: "text-green-700 dark:text-green-400",
      border: "border-green-300",
      hover: "hover:bg-green-50/50 dark:hover:bg-green-950/10",
    },
    "tu-tuc-chuyen-sau": {
      bg: "bg-pink-50 dark:bg-pink-950/30",
      text: "text-pink-700 dark:text-pink-400",
      border: "border-pink-300",
      hover: "hover:bg-pink-50/50 dark:hover:bg-pink-950/10",
    },
    "hon-nhan-chuyen-sau": {
      bg: "bg-rose-50 dark:bg-rose-950/30",
      text: "text-rose-700 dark:text-rose-400",
      border: "border-rose-300",
      hover: "hover:bg-rose-50/50 dark:hover:bg-rose-950/10",
    },
  };

  const colors = categoryColors[category.id] || {
    bg: "bg-violet-50 dark:bg-violet-950/30",
    text: "text-violet-700 dark:text-violet-400",
    border: "border-violet-300",
    hover: "hover:bg-violet-50/50",
  };

  return (
    <motion.div variants={variants}>
      <Collapsible open={isOpen} onOpenChange={onToggle}>
        <Card className={`transition-all duration-300 ${isOpen ? `${colors.border} ${colors.bg}` : ""}`}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-4">
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{categoryIcons[category.id] || "📋"}</span>
                  <div>
                    <span className={isOpen ? colors.text : ""}>{category.title}</span>
                    <p className="text-xs text-muted-foreground font-normal mt-0.5">
                      {category.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {category.items.length} mục
                  </Badge>
                  {isOpen ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>

          <AnimatePresence>
            {isOpen && (
              <CollapsibleContent forceMount>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <CardContent className="pt-0 pb-4">
                    <div className="space-y-2 pl-10">
                      {category.items.map((item, index) => {
                        const isSelected =
                          selectedCategoryId === category.id &&
                          selectedSubCategoryId === item.id;

                        return (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <Button
                              variant={isSelected ? "default" : "ghost"}
                              className={`w-full justify-start h-auto py-3 px-4 text-left ${
                                isSelected
                                  ? `bg-gradient-to-r from-violet-500 to-purple-600 text-white`
                                  : `${colors.hover}`
                              }`}
                              onClick={() => onSelectItem(item.id)}
                            >
                              <div className="flex flex-col items-start gap-1">
                                <span className="font-medium text-sm">{item.title}</span>
                                <span
                                  className={`text-xs ${
                                    isSelected ? "text-white/80" : "text-muted-foreground"
                                  }`}
                                >
                                  {item.description}
                                </span>
                              </div>
                            </Button>
                          </motion.div>
                        );
                      })}
                    </div>
                  </CardContent>
                </motion.div>
              </CollapsibleContent>
            )}
          </AnimatePresence>
        </Card>
      </Collapsible>
    </motion.div>
  );
}

