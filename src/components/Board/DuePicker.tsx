import { useState, useEffect } from "react";
import { DatePicker } from "@mantine/dates";
import dayjs from "dayjs";
import "@mantine/dates/styles.css";

interface DuePickerProps {
  dueDate?: Date | null;
  onChange: (date: Date | null) => void;
}

export default function DuePicker({ dueDate, onChange }: DuePickerProps) {
  const getCurrentTime = () => dayjs().format("HH:mm");

  const [date, setDate] = useState<Date | null>(dueDate ?? null);
  const [time, setTime] = useState<string>(
    dueDate ? dayjs(dueDate).format("HH:mm") : getCurrentTime()
  );

  useEffect(() => {
    setDate(dueDate ?? null);

    if (dueDate) {
      setTime(dayjs(dueDate).format("HH:mm"));
    } else {
      setTime(getCurrentTime());
    }
  }, [dueDate]);

  const handleDateChange = (d: Date | null) => {
    setDate(d);

    if (!d) {
      onChange(null);
      return;
    }

    let selectedTime = time;

    if (!date) {
      selectedTime = getCurrentTime();
      setTime(selectedTime);
    }

    const [h, m] = selectedTime.split(":").map(Number);
    onChange(dayjs(d).hour(h).minute(m).toDate());
  };

  const handleTimeChange = (value: string) => {
    setTime(value);
    if (!date) return;

    const [h, m] = value.split(":").map(Number);
    onChange(dayjs(date).hour(h).minute(m).toDate());
  };

  return (
    <div className="w-72 space-y-3">
      <div className="text-sm font-medium text-gray-700">Ngày hết hạn</div>

      <DatePicker
        value={date}
        onChange={(value) => handleDateChange(value as Date | null)}
        locale="vi"
        firstDayOfWeek={1}
        size="sm"
      />

      <div className="flex gap-2 pt-2">
        <input
          type="text"
          readOnly
          value={date ? dayjs(date).format("DD/MM/YYYY") : ""}
          placeholder="DD/MM/YYYY"
          className="w-1/2 rounded-md border px-2 py-1 text-sm"
        />
        <input
          type="time"
          value={time}
          onChange={(e) => handleTimeChange(e.target.value)}
          disabled={!date}
          className="w-1/2 rounded-md border px-2 py-1 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
}
