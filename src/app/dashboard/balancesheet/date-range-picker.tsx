"use client";

import { addDays, format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useEffect,useState } from "react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type DateRangePickerProps = {
  onDateChange: (range: DateRange | undefined) => void;
  selectedRange?: DateRange; // Accept selected range as prop
};

export function DateRangePicker({ onDateChange, selectedRange }: DateRangePickerProps) {
  const [date, setDate] = useState<DateRange | undefined>(selectedRange);

  // Update state when selectedRange changes (important when loading from URL)
  useEffect(() => {
    setDate(selectedRange);
  }, [selectedRange]);

  const handleDateChange = (newDate: DateRange | undefined) => {
    setDate(newDate);
    onDateChange(newDate); // Pass the selected date range to the parent
  };

  return (
    <div className="grid gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn("w-[300px] justify-start text-left font-normal", !date && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
