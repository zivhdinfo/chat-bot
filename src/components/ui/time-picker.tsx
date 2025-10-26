"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function TimePicker({ value, onChange, placeholder = "Chọn giờ", className }: TimePickerProps) {
  const [open, setOpen] = useState(false);

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  const [selectedHour, selectedMinute] = value ? value.split(':') : ['', ''];

  const handleTimeSelect = (hour: string, minute: string) => {
    const timeValue = `${hour}:${minute}`;
    onChange?.(timeValue);
    setOpen(false);
  };

  const formatDisplayTime = (timeValue: string) => {
    if (!timeValue) return placeholder;
    const [hour, minute] = timeValue.split(':');
    const hourNum = parseInt(hour);
    const period = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
    return `${displayHour}:${minute} ${period}`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {formatDisplayTime(value || "")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-44 p-0" align="start">
        <div className="p-2">
          {/* Time Display */}
          <div className="text-center mb-2">
            <div className="text-lg font-mono bg-muted rounded p-2">
              {formatDisplayTime(value || "00:00")}
            </div>
          </div>

          <div className="flex gap-2">
            {/* Hours */}
            <div className="w-16">
              <div className="text-xs font-medium text-center mb-1">Giờ</div>
              <div 
                className="h-20 border rounded overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400"
                style={{ scrollbarWidth: 'thin' }}
              >
                <div className="p-0.5 space-y-0.5">
                  {hours.map((hour) => (
                    <button
                      key={hour}
                      className={`w-full text-xs h-5 rounded hover:bg-accent transition-colors ${
                        selectedHour === hour ? 'bg-primary text-primary-foreground' : ''
                      }`}
                      onClick={() => {
                        if (selectedMinute) {
                          handleTimeSelect(hour, selectedMinute);
                        } else {
                          onChange?.(`${hour}:00`);
                        }
                      }}
                    >
                      {hour}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Minutes */}
            <div className="w-16">
              <div className="text-xs font-medium text-center mb-1">Phút</div>
              <div 
                className="h-20 border rounded overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400"
                style={{ scrollbarWidth: 'thin' }}
              >
                <div className="p-0.5 space-y-0.5">
                  {minutes.filter((_, i) => i % 5 === 0).map((minute) => (
                    <button
                      key={minute}
                      className={`w-full text-xs h-5 rounded hover:bg-accent transition-colors ${
                        selectedMinute === minute ? 'bg-primary text-primary-foreground' : ''
                      }`}
                      onClick={() => {
                        if (selectedHour) {
                          handleTimeSelect(selectedHour, minute);
                        } else {
                          onChange?.(`00:${minute}`);
                        }
                      }}
                    >
                      {minute}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick time options */}
          <div className="mt-2 pt-2 border-t">
            <div className="grid grid-cols-3 gap-1">
              {['07:00', '12:00', '18:00', '19:00', '20:00', '21:00'].map((time) => (
                <Button
                  key={time}
                  variant="outline"
                  size="sm"
                  className="text-xs h-6 px-1"
                  onClick={() => {
                    onChange?.(time);
                    setOpen(false);
                  }}
                >
                  {formatDisplayTime(time)}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
