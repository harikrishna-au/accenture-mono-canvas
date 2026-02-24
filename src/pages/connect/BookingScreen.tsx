import React, { useState, useEffect, useCallback } from 'react';
import {
  X, ChevronLeft, BadgeCheck, TrendingUp, Tag,
  Clock, Calendar, ArrowRight, Check, Link2,
} from 'lucide-react';
import { toast } from 'sonner';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Expert } from './ExpertCard';
import CalendarPicker from './CalendarPicker';
import TimeSlotPicker, { TimeSlot } from './TimeSlotPicker';
import BookingForm, { BookingFormData } from './BookingForm';
import PaymentHandler from './PaymentHandler';
import BookingSuccess from './BookingSuccess';

type Step = 'details' | 'date' | 'time' | 'form' | 'payment' | 'success';

interface AvailabilityWindow {
  day_of_week: number;
  start_time: string;
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

const STEP_ORDER: Step[] = ['details', 'date', 'time', 'form', 'payment', 'success'];

const FLOW_STEPS: Step[] = ['details', 'date', 'time', 'form', 'payment'];

const STEP_TITLE: Record<Step, string> = {
  details: 'Expert Profile',
  date: 'Pick a Date',
  time: 'Choose a Slot',
  form: 'Your Details',
  payment: 'Confirm & Pay',
  success: 'Booking Confirmed',
};

const STEP_SHORT: Record<Step, string> = {
  details: 'Expert',
  date: 'Date',
  time: 'Time',
  form: 'Details',
  payment: 'Pay',
  success: 'Done',
};

const COMPANY_STYLES: Record<string, { pill: string; dot: string; heroBg: string }> = {
  Accenture: {
    pill: 'bg-violet-50 text-violet-700 border border-violet-100',
    dot: 'bg-violet-500',
    heroBg: 'from-violet-50/50 via-[#fcfcf9]/30 to-[#fcfcf9]',
  },
  Infosys: {
    pill: 'bg-blue-50 text-blue-700 border border-blue-100',
    dot: 'bg-blue-500',
    heroBg: 'from-blue-50/50 via-[#fcfcf9]/30 to-[#fcfcf9]',
  },
  TCS: {
    pill: 'bg-cyan-50 text-cyan-700 border border-cyan-100',
    dot: 'bg-cyan-500',
    heroBg: 'from-cyan-50/50 via-[#fcfcf9]/30 to-[#fcfcf9]',
  },
  Cognizant: {
    pill: 'bg-sky-50 text-sky-700 border border-sky-100',
    dot: 'bg-sky-500',
    heroBg: 'from-sky-50/50 via-[#fcfcf9]/30 to-[#fcfcf9]',
  },
};

const DEFAULT_STYLE = {
  pill: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  dot: 'bg-emerald-500',
  heroBg: 'from-emerald-50/50 via-[#fcfcf9]/30 to-[#fcfcf9]',
};

interface BookingScreenProps {
  expert: Expert;
  onClose: () => void;
}

const BookingScreen = ({ expert, onClose }: BookingScreenProps) => {
  const [step, setStep] = useState<Step>('details');
  const [availabilityWindows, setAvailabilityWindows] = useState<AvailabilityWindow[]>([]);
  const [availableDays, setAvailableDays] = useState<number[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [formData, setFormData] = useState<BookingFormData>({ name: '', email: '', message: '' });

  const style = expert.company ? (COMPANY_STYLES[expert.company] ?? DEFAULT_STYLE) : DEFAULT_STYLE;

  const placedAgo = expert.interview_date
    ? formatDistanceToNow(parseISO(expert.interview_date), { addSuffix: true })
    : null;

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

  const handleCopyLink = () => {
    const url = `${window.location.origin}/connect/${expert.id}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Link copied!', { description: 'Share this profile with anyone.' });
    });
  };

  const currentIdx = STEP_ORDER.indexOf(step);
  const canGoBack = step !== 'details' && step !== 'success';

  return (
    <div className="fixed inset-0 z-[100] bg-[#fcfcf9] flex flex-col animate-slide-in-right">

      {/* ── Top navigation bar ── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 bg-white/90 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-2.5">
          {canGoBack ? (
            <button
              onClick={handleBack}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 transition-colors text-stone-500"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-8 h-8" />
          )}
          <span className="text-sm font-['Merriweather'] text-stone-900">{STEP_TITLE[step]}</span>
        </div>

        {step !== 'success' && (
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopyLink}
              title="Copy shareable link"
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 transition-colors text-stone-400"
            >
              <Link2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 transition-colors text-stone-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* ── Step flow indicator ── */}
      {step !== 'success' && (
        <div className="flex items-center justify-center px-6 py-4 bg-white border-b border-stone-50 flex-shrink-0">
          {FLOW_STEPS.map((s, i) => {
            const sIdx = STEP_ORDER.indexOf(s);
            const isDone = sIdx < currentIdx;
            const isActive = s === step;
            const nextIdx = STEP_ORDER.indexOf(FLOW_STEPS[i + 1]);

            return (
              <React.Fragment key={s}>
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium font-['Inter'] transition-all duration-300 ${
                      isDone
                        ? 'bg-stone-900 text-white'
                        : isActive
                        ? 'bg-stone-900 text-white ring-4 ring-stone-900/10'
                        : 'bg-stone-100 text-stone-400'
                    }`}
                  >
                    {isDone ? <Check className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  <span
                    className={`text-[10px] font-['Inter'] transition-colors duration-200 ${
                      isActive
                        ? 'text-stone-700 font-semibold'
                        : isDone
                        ? 'text-stone-500'
                        : 'text-stone-300'
                    }`}
                  >
                    {STEP_SHORT[s]}
                  </span>
                </div>

                {i < FLOW_STEPS.length - 1 && (
                  <div
                    className={`h-px w-8 mb-4 mx-1.5 transition-colors duration-500 ${
                      nextIdx <= currentIdx ? 'bg-stone-800' : 'bg-stone-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* ── Context strip (shows expert + selection summary after details) ── */}
      {step !== 'details' && step !== 'success' && (
        <div className="flex items-center gap-3 px-5 py-2.5 bg-stone-50/80 border-b border-stone-100 flex-shrink-0">
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
          <p className="text-xs font-['Inter'] text-stone-500">
            <span className="font-medium text-stone-700">{expert.name}</span>
            {selectedDate && (
              <span> · {format(selectedDate, 'EEE, MMM d')}</span>
            )}
            {selectedSlot && (
              <span className="text-stone-400"> · {selectedSlot.start}</span>
            )}
          </p>
        </div>
      )}

      {/* ── Scrollable content area ── */}
      <div className="flex-1 overflow-y-auto">

        {/* ════ DETAILS STEP ════ */}
        {step === 'details' && (
          <div className="max-w-2xl mx-auto w-full pb-12">

            {/* Hero banner */}
            <div className={`bg-gradient-to-b ${style.heroBg} pt-10 pb-8 px-6 flex flex-col items-center text-center border-b border-stone-100/60`}>
              {expert.photo_url ? (
                <img
                  src={expert.photo_url}
                  alt={expert.name}
                  className="w-28 h-28 rounded-3xl object-cover shadow-xl mb-5 border-4 border-white ring-1 ring-stone-100"
                />
              ) : (
                <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center text-4xl font-['Merriweather'] text-stone-500 shadow-xl mb-5 border-4 border-white">
                  {expert.name.charAt(0)}
                </div>
              )}

              <h2 className="text-2xl font-['Merriweather'] text-stone-900 leading-tight">
                {expert.name}
              </h2>

              {expert.title && (
                <p className="text-sm text-stone-500 mt-1.5 font-['Inter'] max-w-xs leading-relaxed">
                  {expert.title}
                </p>
              )}

              {placedAgo && (
                <div className="flex items-center gap-1.5 mt-2.5 text-stone-400 font-['Inter']">
                  <Calendar className="w-3 h-3" />
                  <span className="text-xs">Placed {placedAgo}</span>
                </div>
              )}

              {/* Badges */}
              <div className="flex items-center gap-2 mt-5 flex-wrap justify-center">
                {expert.company && (
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${style.pill} font-['Inter']`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                    <BadgeCheck className="w-3 h-3" />
                    Placed at {expert.company}
                  </div>
                )}
                {expert.package_lpa && (
                  <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-xs font-semibold text-emerald-600 font-['Inter']">
                    <TrendingUp className="w-3 h-3" />
                    ₹{expert.package_lpa} LPA
                  </div>
                )}
                {expert.proof_url && (
                  <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-xs font-semibold text-emerald-600 font-['Inter']">
                    <BadgeCheck className="w-3 h-3" />
                    Placement Verified
                  </div>
                )}
              </div>
            </div>

            {/* Body content */}
            <div className="px-6 pt-8 space-y-8">

              {/* About */}
              {expert.bio && (
                <div>
                  <h3 className="text-[11px] uppercase tracking-widest text-stone-400 font-semibold font-['Inter'] mb-3">
                    About
                  </h3>
                  <p className="text-stone-700 text-[15px] leading-relaxed font-['Inter']">
                    {expert.bio}
                  </p>
                </div>
              )}

              {/* Skills */}
              {expert.skills && expert.skills.length > 0 && (
                <div>
                  <h3 className="text-[11px] uppercase tracking-widest text-stone-400 font-semibold font-['Inter'] mb-3">
                    Skills & Topics
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {expert.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-stone-600 rounded-full text-xs font-medium border border-stone-200 font-['Inter'] shadow-sm"
                      >
                        <Tag className="w-2.5 h-2.5 text-stone-400" />
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Session card */}
              <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4.5 h-4.5 text-stone-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-stone-800 font-['Inter']">20-minute session</p>
                    <p className="text-xs text-stone-400 font-['Inter'] mt-0.5">1-on-1 voice or video call</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-['Merriweather'] text-stone-900">₹{expert.price_inr}</p>
                  <p className="text-[11px] text-stone-400 font-['Inter']">one-time</p>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={() => setStep('date')}
                className="w-full py-4 bg-stone-900 text-white rounded-2xl text-[15px] font-semibold font-['Inter'] hover:bg-stone-700 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
              >
                Book a Session
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ════ DATE STEP ════ */}
        {step === 'date' && (
          <div className="max-w-lg mx-auto px-5 py-6">
            {availableDays.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-stone-400 text-sm font-['Inter']">
                  This expert hasn't set their availability yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-stone-400 font-['Inter'] text-center">
                  Available days are highlighted
                </p>
                <CalendarPicker
                  availableDays={availableDays}
                  selectedDate={selectedDate}
                  onSelect={handleDateSelect}
                />
              </div>
            )}
          </div>
        )}

        {/* ════ TIME STEP ════ */}
        {step === 'time' && (
          <div className="max-w-lg mx-auto px-5 py-6">
            <TimeSlotPicker
              slots={slots}
              selectedSlot={selectedSlot}
              onSelect={handleSlotSelect}
              loading={slotsLoading}
            />
          </div>
        )}

        {/* ════ FORM STEP ════ */}
        {step === 'form' && (
          <div className="max-w-lg mx-auto px-5 py-6 space-y-5">
            <BookingForm data={formData} onChange={setFormData} />
            <button
              onClick={() => setStep('payment')}
              disabled={!formData.name.trim() || !formData.email.trim() || !formData.message.trim()}
              className="w-full py-3.5 bg-stone-900 text-white rounded-xl text-sm font-semibold font-['Inter'] hover:bg-stone-700 active:scale-95 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue to Payment
            </button>
          </div>
        )}

        {/* ════ PAYMENT STEP ════ */}
        {step === 'payment' && selectedDate && selectedSlot && (
          <div className="max-w-lg mx-auto px-5 py-6">
            <PaymentHandler
              expert={expert}
              date={selectedDate}
              slot={selectedSlot}
              formData={formData}
              onSuccess={() => setStep('success')}
              onError={() => {}}
            />
          </div>
        )}

        {/* ════ SUCCESS STEP ════ */}
        {step === 'success' && selectedDate && selectedSlot && (
          <div className="max-w-lg mx-auto px-5 py-6">
            <BookingSuccess
              expertName={expert.name}
              date={selectedDate}
              startTime={selectedSlot.start}
              endTime={selectedSlot.end}
              userEmail={formData.email}
              onClose={onClose}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingScreen;
