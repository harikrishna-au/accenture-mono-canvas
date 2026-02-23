import React from 'react';
import { CheckCircle2, Calendar, Clock, Mail } from 'lucide-react';
import { format } from 'date-fns';

interface BookingSuccessProps {
  expertName: string;
  date: Date;
  startTime: string;
  endTime: string;
  userEmail: string;
  onClose: () => void;
}

const BookingSuccess = ({ expertName, date, startTime, endTime, userEmail, onClose }: BookingSuccessProps) => {
  return (
    <div className="flex flex-col items-center text-center py-4 space-y-6">
      {/* Icon */}
      <div className="relative mt-2">
        <div className="absolute inset-0 bg-amber-200 rounded-full blur-2xl opacity-60" />
        <div className="relative w-20 h-20 bg-amber-50 border border-amber-100 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-amber-500" />
        </div>
      </div>

      {/* Title */}
      <div>
        <h3 className="text-2xl font-['Merriweather'] text-stone-900 mb-2">Payment received!</h3>
        <p className="text-stone-500 text-sm leading-relaxed font-['Inter']">
          Your request has been sent to{' '}
          <span className="font-semibold text-stone-700">{expertName}</span>.
          You'll be notified once they confirm.
        </p>
      </div>

      {/* Details card */}
      <div className="w-full bg-stone-50 border border-stone-100 rounded-2xl p-4 space-y-3 text-left">
        <div className="flex items-center gap-3 text-sm font-['Inter']">
          <div className="w-7 h-7 bg-white rounded-lg border border-stone-200 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-3.5 h-3.5 text-stone-500" />
          </div>
          <span className="text-stone-700 font-medium">{format(date, 'EEEE, MMMM d, yyyy')}</span>
        </div>
        <div className="flex items-center gap-3 text-sm font-['Inter']">
          <div className="w-7 h-7 bg-white rounded-lg border border-stone-200 flex items-center justify-center flex-shrink-0">
            <Clock className="w-3.5 h-3.5 text-stone-500" />
          </div>
          <span className="text-stone-700">
            {startTime} – {endTime}{' '}
            <span className="text-stone-400">(20 min)</span>
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm font-['Inter']">
          <div className="w-7 h-7 bg-white rounded-lg border border-stone-200 flex items-center justify-center flex-shrink-0">
            <Mail className="w-3.5 h-3.5 text-stone-500" />
          </div>
          <span className="text-stone-500">
            Confirmation sent to{' '}
            <span className="text-stone-700 font-medium">{userEmail}</span>
          </span>
        </div>
      </div>

      <p className="text-stone-400 text-xs max-w-xs leading-relaxed font-['Inter']">
        Check "My Bookings" on the connect page anytime to track your booking status.
      </p>

      <button
        onClick={onClose}
        className="w-full py-3 bg-stone-900 text-white rounded-xl text-sm font-medium font-['Inter'] hover:bg-stone-700 active:scale-95 transition-all duration-200"
      >
        Done
      </button>
    </div>
  );
};

export default BookingSuccess;
