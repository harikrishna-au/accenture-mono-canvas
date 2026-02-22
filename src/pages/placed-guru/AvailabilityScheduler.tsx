import React from 'react';
import { Plus, X } from 'lucide-react';

export interface TimeWindow {
  start: string; // "HH:MM"
  end: string;   // "HH:MM"
}

// key is day_of_week (0=Sun … 6=Sat)
export type WeeklyAvailability = Record<number, TimeWindow[]>;

const DAYS = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
];

interface AvailabilitySchedulerProps {
  value: WeeklyAvailability;
  onChange: (val: WeeklyAvailability) => void;
}

const AvailabilityScheduler = ({ value, onChange }: AvailabilitySchedulerProps) => {
  const addWindow = (day: number) => {
    const existing = value[day] || [];
    onChange({ ...value, [day]: [...existing, { start: '10:00', end: '12:00' }] });
  };

  const updateWindow = (day: number, idx: number, field: 'start' | 'end', val: string) => {
    const windows = [...(value[day] || [])];
    windows[idx] = { ...windows[idx], [field]: val };
    onChange({ ...value, [day]: windows });
  };

  const removeWindow = (day: number, idx: number) => {
    const windows = (value[day] || []).filter((_, i) => i !== idx);
    const updated = { ...value };
    if (windows.length === 0) {
      delete updated[day];
    } else {
      updated[day] = windows;
    }
    onChange(updated);
  };

  return (
    <div className="space-y-2.5">
      <label className="block text-sm font-medium text-stone-700 font-['Inter']">
        Weekly Availability
      </label>

      <div className="space-y-2">
        {DAYS.map(({ label, value: dayNum }) => {
          const windows = value[dayNum] || [];
          const isActive = windows.length > 0;

          return (
            <div
              key={dayNum}
              className={`rounded-2xl border transition-colors ${
                isActive ? 'border-stone-200 bg-white' : 'border-stone-100 bg-stone-50/50'
              }`}
            >
              <div className="flex items-start gap-2 px-4 py-3">
                {/* Day label */}
                <span
                  className={`text-sm font-medium font-['Inter'] w-9 pt-2 flex-shrink-0 ${
                    isActive ? 'text-stone-800' : 'text-stone-400'
                  }`}
                >
                  {label}
                </span>

                {/* Time windows */}
                <div className="flex-1 flex flex-col gap-2 pt-0.5">
                  {windows.map((win, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="time"
                        value={win.start}
                        onChange={(e) => updateWindow(dayNum, idx, 'start', e.target.value)}
                        className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-300 transition-all font-['Inter']"
                      />
                      <span className="text-stone-400 text-xs">–</span>
                      <input
                        type="time"
                        value={win.end}
                        onChange={(e) => updateWindow(dayNum, idx, 'end', e.target.value)}
                        className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-300 transition-all font-['Inter']"
                      />
                      <button
                        type="button"
                        onClick={() => removeWindow(dayNum, idx)}
                        className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-red-50 text-stone-400 hover:text-red-400 transition-colors flex-shrink-0"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {windows.length === 0 && (
                    <span className="text-xs text-stone-400 font-['Inter'] py-1">Unavailable</span>
                  )}
                </div>

                {/* Add button */}
                <button
                  type="button"
                  onClick={() => addWindow(dayNum)}
                  className="w-7 h-7 mt-0.5 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 transition-colors flex-shrink-0"
                  title={`Add time window for ${label}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-stone-400 font-['Inter']">
        Sessions are 20 minutes. Each window is split into consecutive 20-min slots automatically.
      </p>
    </div>
  );
};

export default AvailabilityScheduler;
