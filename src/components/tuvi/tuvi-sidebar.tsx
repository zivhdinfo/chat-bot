"use client";

import { useRouter } from "next/navigation";
import {
  Compass,
  Home,
  Sparkles,
  Star,
  Calendar,
  User,
  Settings,
  HelpCircle,
} from "lucide-react";
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
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TuViInfo } from "@/types/tuvi";

interface TuViSidebarProps {
  tuViInfo: TuViInfo | null;
}

const navigationItems = [
  {
    title: "Trang chủ",
    icon: Home,
    href: "/dashboard",
  },
  {
    title: "Luận Giải Tử Vi",
    icon: Sparkles,
    href: "/tuvi",
    isActive: true,
  },
];

const tuViFeatures = [
  {
    title: "Cơ Bản",
    icon: Star,
    description: "17 mục luận giải",
  },
  {
    title: "Tài Bạch",
    icon: Compass,
    description: "8 mục chuyên sâu",
  },
  {
    title: "Quan Lộc",
    icon: Compass,
    description: "8 mục chuyên sâu",
  },
  {
    title: "Sức Khỏe",
    icon: Compass,
    description: "8 mục chuyên sâu",
  },
  {
    title: "Con Cái",
    icon: Compass,
    description: "8 mục chuyên sâu",
  },
  {
    title: "Hôn Nhân",
    icon: Compass,
    description: "8 mục chuyên sâu",
  },
];

export function TuViSidebar({ tuViInfo }: TuViSidebarProps) {
  const router = useRouter();

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white">
            <Compass className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-bold text-lg bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Tử Vi AI
            </h2>
            <p className="text-xs text-muted-foreground">Powered by GPT-4o</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Điều hướng</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={item.isActive}
                    onClick={() => router.push(item.href)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Info */}
        {tuViInfo && (
          <SidebarGroup>
            <SidebarGroupLabel>Thông tin đương số</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-2 py-3 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200/50 space-y-2">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-amber-500 text-white text-xs">
                      {tuViInfo.hoTen.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{tuViInfo.hoTen}</p>
                    <p className="text-xs text-muted-foreground">
                      {tuViInfo.gioiTinh === "nam" ? "Nam" : "Nữ"}
                    </p>
                  </div>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span>
                      {tuViInfo.ngaySinh || "?"}/{tuViInfo.thangSinh || "?"}/{tuViInfo.namSinh || "?"}
                    </span>
                  </div>
                  {tuViInfo.gioSinh && (
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span>
                        Giờ {tuViInfo.gioSinh.charAt(0).toUpperCase() + tuViInfo.gioSinh.slice(1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Features */}
        <SidebarGroup>
          <SidebarGroupLabel>Các chủ đề luận giải</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {tuViFeatures.map((feature) => (
                <SidebarMenuItem key={feature.title}>
                  <SidebarMenuButton className="h-auto py-2">
                    <feature.icon className="h-4 w-4 text-amber-500" />
                    <div className="flex-1">
                      <span className="text-sm">{feature.title}</span>
                      <p className="text-xs text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <HelpCircle className="h-4 w-4" />
              <span>Hướng dẫn</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Settings className="h-4 w-4" />
              <span>Cài đặt</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

