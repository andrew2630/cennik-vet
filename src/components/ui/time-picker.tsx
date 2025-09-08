"use client";

import { Clock } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useMemo } from "react";
import { getSettings } from "@/utils/settingsStorage";

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const buildBaseTimes = () =>
  Array.from({ length: 96 }, (_, i) => {
    const h = String(Math.floor(i / 4)).padStart(2, "0");
    const m = String((i % 4) * 15).padStart(2, "0");
    return `${h}:${m}`;
  });

export function TimePicker({ value, onChange, placeholder, disabled }: TimePickerProps) {
  const { language } = getSettings();
  const formatter = useMemo(
    () => new Intl.DateTimeFormat(language, { hour: "numeric", minute: "numeric" }),
    [language]
  );
  const baseTimes = useMemo(buildBaseTimes, []);
  const times = useMemo(() => {
    return value && !baseTimes.includes(value) ? [value, ...baseTimes] : baseTimes;
  }, [value, baseTimes]);
  const formatTime = (t: string) => formatter.format(new Date(`1970-01-01T${t}`));

  if (disabled) {
    return (
      <div className="h-9 px-3 py-2 flex items-center text-foreground">
        {value ? formatTime(value) : placeholder}
      </div>
    );
  }

  return (
    <Select value={value || undefined} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-full">
        <Clock className="mr-2 h-4 w-4" />
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {times.map(t => (
          <SelectItem key={t} value={t}>
            {formatTime(t)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
