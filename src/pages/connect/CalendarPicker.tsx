import React from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { isBefore, startOfToday } from 'date-fns';

interface CalendarPickerProps {
  availableDays: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  selectedDate: Date | undefined;
  onSelect: (date: Date | undefined) => void;
}

const CalendarPicker = ({ availableDays, selectedDate, onSelect }: CalendarPickerProps) => {
  const today = startOfToday();

  const isDisabled = (date: Date) => {
    if (isBefore(date, today)) return true;
    return !availableDays.includes(date.getDay());
  };

  return (
    <div className="flex justify-center rdp-connect">
      <style>{`
        .rdp-connect .rdp {
          --rdp-cell-size: 38px;
          --rdp-accent-color: #1c1917;
          --rdp-background-color: #f5f5f4;
          margin: 0;
          font-family: Inter, sans-serif;
          font-size: 0.875rem;
        }
        .rdp-connect .rdp-caption_label {
          font-family: Merriweather, serif;
          font-size: 0.9rem;
          font-weight: 400;
          color: #1c1917;
        }
        .rdp-connect .rdp-day_selected:not(.rdp-day_disabled) {
          background-color: #1c1917;
          color: white;
          border-radius: 10px;
          font-weight: 600;
        }
        .rdp-connect .rdp-day_selected:hover:not(.rdp-day_disabled) {
          background-color: #44403c;
        }
        .rdp-connect .rdp-day:hover:not(.rdp-day_disabled):not(.rdp-day_selected) {
          background-color: #f5f5f4;
          border-radius: 10px;
        }
        .rdp-connect .rdp-day_disabled {
          opacity: 0.25;
          cursor: not-allowed;
        }
        .rdp-connect .rdp-day_today:not(.rdp-day_selected) {
          font-weight: 700;
          color: #78716c;
        }
        .rdp-connect .rdp-day { border-radius: 10px; }
        .rdp-connect .rdp-nav_button {
          border-radius: 8px;
          color: #78716c;
        }
        .rdp-connect .rdp-nav_button:hover {
          background-color: #f5f5f4;
        }
        .rdp-connect .rdp-head_cell {
          color: #a8a29e;
          font-size: 0.75rem;
          font-weight: 500;
        }
      `}</style>
      <DayPicker
        mode="single"
        selected={selectedDate}
        onSelect={onSelect}
        disabled={isDisabled}
        showOutsideDays={false}
      />
    </div>
  );
};

export default CalendarPicker;
