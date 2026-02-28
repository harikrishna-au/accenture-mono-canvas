import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Expert } from './ExpertCard';
import CalendarPicker from './CalendarPicker';
import TimeSlotPicker, { TimeSlot } from './TimeSlotPicker';
import BookingForm, { BookingFormData } from './BookingForm';
import PaymentHandler from './PaymentHandler';
import BookingSuccess from './BookingSuccess';

type Step = 'date' | 'time' | 'form' | 'payment' | 'success';

interface AvailabilityWindow {
  day_of_week: number;
  start_time: string; // "HH:MM:SS" from Supabase
  end_time: string;
}

function parseTimeToMinutes(t: string): number {
  const parts = t.split(':');
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

function generateSlots(windows: AvailabilityWindow[], dayOfWeek: number): TimeSlot[] {
  const dayWindows = windows.filter((w) => w.day_of_week === dayOfWeek);
  const slots: TimeSlot[] = [];

  for (const win of dayWindows) {
    const startMins = parseTimeToMinutes(win.start_time);
    const endMins = parseTimeToMinutes(win.end_time);
    let current = startMins;

    while (current + 20 <= endMins) {
      const sh = Math.floor(current / 60).toString().padStart(2, '0');
      const sm = (current % 60).toString().padStart(2, '0');
      const eh = Math.floor((current + 20) / 60).toString().padStart(2, '0');
      const em = ((current + 20) % 60).toString().padStart(2, '0');
      slots.push({ start: `${sh}:${sm}`, end: `${eh}:${em}` });
      current += 20;
    }
  }

  return slots;
}

const STEP_ORDER: Step[] = ['date', 'time', 'form', 'payment', 'success'];
const STEP_LABELS: Record<Step, string> = {
  date: 'Pick a Date',
  time: 'Choose a Time',
  form: 'Your Details',
  payment: 'Confirm & Pay',
  success: 'Booking Confirmed',
};

interface BookingModalProps {
  expert: Expert;
  onClose: () => void;
}

const BookingModal = ({ expert, onClose }: BookingModalProps) => {
  const [step, setStep] = useState<Step>('date');
  const [availabilityWindows, setAvailabilityWindows] = useState<AvailabilityWindow[]>([]);
  const [availableDays, setAvailableDays] = useState<number[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [formData, setFormData] = useState<BookingFormData>({ name: '', email: '', message: '' });
  const [meetLink, setMeetLink] = useState<string | null>(null);

  // Fetch expert availability on mount
  useEffect(() => {
    supabase
      .from('availability')
      .select('day_of_week, start_time, end_time')
      .eq('expert_id', expert.id)
      .then(({ data }) => {
        if (data) {
          setAvailabilityWindows(data as AvailabilityWindow[]);
          setAvailableDays([...new Set(data.map((a: any) => a.day_of_week as number))]);
        }
      });
  }, [expert.id]);

  const loadSlots = useCallback(
    async (date: Date) => {
      setSlotsLoading(true);
      const dayOfWeek = date.getDay();
      const allSlots = generateSlots(availabilityWindows, dayOfWeek);
      const dateStr = format(date, 'yyyy-MM-dd');

      const { data: bookings } = await supabase
        .from('bookings')
        .select('start_time, end_time')
        .eq('expert_id', expert.id)
        .eq('date', dateStr)
        .in('status', ['confirmed', 'paid']);

      const bookedIntervals = (bookings || []).map((b: any) => ({
        start: parseTimeToMinutes(b.start_time as string),
        end: parseTimeToMinutes(b.end_time as string),
      }));

      const freeSlots = allSlots.filter((slot) => {
        const sStart = parseTimeToMinutes(slot.start);
        const sEnd = parseTimeToMinutes(slot.end);
        return !bookedIntervals.some((b) => sStart < b.end && sEnd > b.start);
      });

      setSlots(freeSlots);
      setSlotsLoading(false);
    },
    [availabilityWindows, expert.id]
  );

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    if (date) {
      setStep('time');
      loadSlots(date);
    }
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setStep('form');
  };

  const handleBack = () => {
    const idx = STEP_ORDER.indexOf(step);
    if (idx > 0) setStep(STEP_ORDER[idx - 1]);
  };

  const stepIndex = STEP_ORDER.indexOf(step);
  const canGoBack = step !== 'date' && step !== 'success';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && step !== 'success') onClose();
      }}
    >
      <div className="bg-[#fcfcf9] w-full sm:max-w-[420px] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95dvh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 bg-white flex-shrink-0">
          <div className="flex items-center gap-2.5">
            {canGoBack && (
              <button
                onClick={handleBack}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 transition-colors text-stone-500"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h2 className="text-sm font-['Merriweather'] text-stone-900 leading-tight">
                {STEP_LABELS[step]}
              </h2>
              {step !== 'success' && (
                <p className="text-xs text-stone-400 font-['Inter'] mt-0.5">{expert.name}</p>
              )}
            </div>
          </div>
          {step !== 'success' && (
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 transition-colors text-stone-400"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Progress bar */}
        {step !== 'success' && (
          <div className="flex gap-1 px-5 py-3 bg-white border-b border-stone-50 flex-shrink-0">
            {STEP_ORDER.filter((s) => s !== 'success').map((s, i) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                  i <= stepIndex - 1 ? 'bg-stone-800' : 'bg-stone-200'
                }`}
              />
            ))}
          </div>
        )}

        {/* Mini context bar (date + slot selected summary) */}
        {step !== 'success' && step !== 'date' && (
          <div className="flex items-center gap-3 px-5 py-2.5 bg-stone-50 border-b border-stone-100 flex-shrink-0">
            {expert.photo_url ? (
              <img
                src={expert.photo_url}
                alt={expert.name}
                className="w-7 h-7 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-stone-200 flex items-center justify-center text-stone-500 text-xs font-['Merriweather'] flex-shrink-0">
                {expert.name.charAt(0)}
              </div>
            )}
            <p className="text-xs text-stone-500 font-['Inter']">
              {selectedDate && (
                <span className="font-medium text-stone-700">{format(selectedDate, 'EEE, MMM d')}</span>
              )}
              {selectedSlot && (
                <span className="text-stone-500"> · {selectedSlot.start}</span>
              )}
            </p>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {step === 'date' && (
            <div className="space-y-3">
              {availableDays.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-stone-400 text-sm font-['Inter']">
                    This expert hasn't set their availability yet.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-xs text-stone-400 font-['Inter'] text-center">
                    Available days are highlighted
                  </p>
                  <CalendarPicker
                    availableDays={availableDays}
                    selectedDate={selectedDate}
                    onSelect={handleDateSelect}
                  />
                </>
              )}
            </div>
          )}

          {step === 'time' && (
            <TimeSlotPicker
              slots={slots}
              selectedSlot={selectedSlot}
              onSelect={handleSlotSelect}
              loading={slotsLoading}
            />
          )}

          {step === 'form' && (
            <div className="space-y-5">
              <BookingForm data={formData} onChange={setFormData} />
              <button
                onClick={() => setStep('payment')}
                disabled={!formData.name.trim() || !formData.email.trim() || !formData.message.trim()}
                className="w-full py-3 bg-stone-900 text-white rounded-xl text-sm font-medium font-['Inter'] hover:bg-stone-700 active:scale-95 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue to Payment
              </button>
            </div>
          )}

          {step === 'payment' && selectedDate && selectedSlot && (
            <PaymentHandler
              expert={expert}
              date={selectedDate}
              slot={selectedSlot}
              formData={formData}
              onSuccess={(link) => { setMeetLink(link); setStep('success'); }}
              onError={() => {}}
            />
          )}

          {step === 'success' && selectedDate && selectedSlot && (
            <BookingSuccess
              expertName={expert.name}
              date={selectedDate}
              startTime={selectedSlot.start}
              endTime={selectedSlot.end}
              userEmail={formData.email}
              meetLink={meetLink}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
