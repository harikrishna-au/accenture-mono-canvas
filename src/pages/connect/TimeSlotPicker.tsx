import React from 'react';
import { Clock } from 'lucide-react';

export interface TimeSlot {
  start: string; // "HH:MM"
  end: string;   // "HH:MM"
}

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  selectedSlot: TimeSlot | null;
  onSelect: (slot: TimeSlot) => void;
  loading?: boolean;
}

const TimeSlotPicker = ({ slots, selectedSlot, onSelect, loading }: TimeSlotPickerProps) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <div className="animate-spin w-5 h-5 border-2 border-stone-200 border-t-stone-700 rounded-full" />
        <span className="text-stone-400 text-sm font-['Inter']">Loading slots...</span>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Clock className="w-5 h-5 text-stone-400" />
        </div>
        <p className="text-stone-500 text-sm font-medium font-['Inter']">No available slots</p>
        <p className="text-stone-400 text-xs mt-1 font-['Inter']">All slots on this date are booked. Try another day.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-stone-400 font-['Inter']">{slots.length} slot{slots.length !== 1 ? 's' : ''} available</p>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {slots.map((slot, i) => {
          const isSelected = selectedSlot?.start === slot.start;
          return (
            <button
              key={i}
              onClick={() => onSelect(slot)}
              className={`flex flex-col items-center py-3 px-2 rounded-xl text-xs font-medium border transition-all duration-200 font-['Inter'] ${
                isSelected
                  ? 'bg-stone-900 text-white border-stone-900 shadow-sm scale-95'
                  : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400 hover:bg-stone-50 hover:scale-95'
              }`}
            >
              <Clock className={`w-3 h-3 mb-1 ${isSelected ? 'text-white/60' : 'text-stone-400'}`} />
              {slot.start}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TimeSlotPicker;
