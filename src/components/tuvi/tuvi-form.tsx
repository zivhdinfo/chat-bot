"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TuViInfo, CHI_GIO } from "@/types/tuvi";

interface TuViFormProps {
  onSubmit: (info: TuViInfo) => void;
  initialData?: TuViInfo | null;
}

export function TuViForm({ onSubmit, initialData }: TuViFormProps) {
  const [formData, setFormData] = useState<Partial<TuViInfo>>({
    hoTen: initialData?.hoTen || "",
    ngaySinh: initialData?.ngaySinh || undefined,
    thangSinh: initialData?.thangSinh || undefined,
    namSinh: initialData?.namSinh || undefined,
    gioSinh: initialData?.gioSinh || "",
    gioiTinh: initialData?.gioiTinh || "nam",
    amLich: initialData?.amLich || false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.hoTen?.trim()) {
      newErrors.hoTen = "Vui lòng nhập họ tên";
    }

    if (!formData.ngaySinh || formData.ngaySinh < 1 || formData.ngaySinh > 31) {
      newErrors.ngaySinh = "Ngày không hợp lệ (1-31)";
    }

    if (!formData.thangSinh || formData.thangSinh < 1 || formData.thangSinh > 12) {
      newErrors.thangSinh = "Tháng không hợp lệ (1-12)";
    }

    if (!formData.namSinh || formData.namSinh < 1900 || formData.namSinh > new Date().getFullYear()) {
      newErrors.namSinh = "Năm không hợp lệ";
    }

    if (!formData.gioSinh) {
      newErrors.gioSinh = "Vui lòng chọn giờ sinh";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData as TuViInfo);
    }
  };

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 125 }, (_, i) => currentYear - i);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-2 border-amber-500/20 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white">
              <Sparkles className="h-6 w-6" />
            </div>
            <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Nhập Thông Tin Ngày Sinh
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Họ tên */}
            <div className="space-y-2">
              <Label htmlFor="hoTen" className="flex items-center gap-2 text-base font-medium">
                <User className="h-4 w-4 text-amber-600" />
                Họ và Tên
              </Label>
              <Input
                id="hoTen"
                value={formData.hoTen}
                onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })}
                placeholder="Nhập họ tên đầy đủ"
                className="h-12 text-base border-amber-200 focus:border-amber-500 focus:ring-amber-500"
              />
              {errors.hoTen && (
                <p className="text-sm text-red-500">{errors.hoTen}</p>
              )}
            </div>

            {/* Ngày tháng năm sinh */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-base font-medium">
                <Calendar className="h-4 w-4 text-amber-600" />
                Ngày Tháng Năm Sinh
              </Label>
              <div className="grid grid-cols-3 gap-3">
                {/* Ngày */}
                <Select
                  value={formData.ngaySinh?.toString()}
                  onValueChange={(v) => setFormData({ ...formData, ngaySinh: parseInt(v) })}
                >
                  <SelectTrigger className="h-12 border-amber-200">
                    <SelectValue placeholder="Ngày" />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map((day) => (
                      <SelectItem key={day} value={day.toString()}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Tháng */}
                <Select
                  value={formData.thangSinh?.toString()}
                  onValueChange={(v) => setFormData({ ...formData, thangSinh: parseInt(v) })}
                >
                  <SelectTrigger className="h-12 border-amber-200">
                    <SelectValue placeholder="Tháng" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month} value={month.toString()}>
                        Tháng {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Năm */}
                <Select
                  value={formData.namSinh?.toString()}
                  onValueChange={(v) => setFormData({ ...formData, namSinh: parseInt(v) })}
                >
                  <SelectTrigger className="h-12 border-amber-200">
                    <SelectValue placeholder="Năm" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {(errors.ngaySinh || errors.thangSinh || errors.namSinh) && (
                <p className="text-sm text-red-500">
                  {errors.ngaySinh || errors.thangSinh || errors.namSinh}
                </p>
              )}
            </div>

            {/* Giờ sinh */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-base font-medium">
                <Clock className="h-4 w-4 text-amber-600" />
                Giờ Sinh (Chi Giờ)
              </Label>
              <Select
                value={formData.gioSinh}
                onValueChange={(v) => setFormData({ ...formData, gioSinh: v })}
              >
                <SelectTrigger className="h-12 border-amber-200">
                  <SelectValue placeholder="Chọn giờ sinh" />
                </SelectTrigger>
                <SelectContent>
                  {CHI_GIO.map((gio) => (
                    <SelectItem key={gio.value} value={gio.value}>
                      {gio.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.gioSinh && (
                <p className="text-sm text-red-500">{errors.gioSinh}</p>
              )}
            </div>

            {/* Giới tính và Âm/Dương lịch */}
            <div className="grid grid-cols-2 gap-4">
              {/* Giới tính */}
              <div className="space-y-2">
                <Label className="text-base font-medium">Giới Tính</Label>
                <Select
                  value={formData.gioiTinh}
                  onValueChange={(v: "nam" | "nu") => setFormData({ ...formData, gioiTinh: v })}
                >
                  <SelectTrigger className="h-12 border-amber-200">
                    <SelectValue placeholder="Chọn giới tính" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nam">Nam</SelectItem>
                    <SelectItem value="nu">Nữ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Âm lịch / Dương lịch */}
              <div className="space-y-2">
                <Label className="text-base font-medium">Loại Lịch</Label>
                <div className="flex items-center justify-between h-12 px-4 rounded-md border border-amber-200 bg-background">
                  <span className={`text-sm ${!formData.amLich ? "text-amber-600 font-medium" : "text-muted-foreground"}`}>
                    Dương lịch
                  </span>
                  <Switch
                    checked={formData.amLich}
                    onCheckedChange={(checked) => setFormData({ ...formData, amLich: checked })}
                    className="data-[state=checked]:bg-amber-500"
                  />
                  <span className={`text-sm ${formData.amLich ? "text-amber-600 font-medium" : "text-muted-foreground"}`}>
                    Âm lịch
                  </span>
                </div>
              </div>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-amber-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/30"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Bắt Đầu Luận Giải Tử Vi
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}

