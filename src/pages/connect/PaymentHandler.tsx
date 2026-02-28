import React, { useState } from 'react';
import { Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Expert } from './ExpertCard';
import { TimeSlot } from './TimeSlotPicker';
import { BookingFormData } from './BookingForm';

interface PaymentHandlerProps {
  expert: Expert;
  date: Date;
  slot: TimeSlot;
  formData: BookingFormData;
  onSuccess: (meetLink: string | null) => void;
  onError: () => void;
}

const loadRazorpay = (): Promise<boolean> =>
  new Promise((resolve) => {
    if ((window as any).Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const PaymentHandler = ({ expert, date, slot, formData, onSuccess, onError }: PaymentHandlerProps) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error('Please fill in all fields before proceeding');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) {
        toast.error('Payment SDK failed to load. Check your internet connection.');
        setLoading(false);
        return;
      }

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-booking-order`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            amount: expert.price_inr,
            expert_id: expert.id,
            guest_email: formData.email,
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create order');
      }
      const order = await res.json();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount.toString(),
        currency: order.currency,
        name: 'Harry The Blaze',
        description: `20-min session with ${expert.name}`,
        order_id: order.id,
        prefill: { name: formData.name, email: formData.email },
        notes: {
          expert_id: expert.id,
          booking_date: format(date, 'yyyy-MM-dd'),
          start_time: slot.start,
        },
        theme: { color: '#1c1917' },
        handler: async (response: any) => {
          try {
            const bookingData = {
              expert_id: expert.id,
              user_name: formData.name,
              user_email: formData.email,
              message: formData.message,
              date: format(date, 'yyyy-MM-dd'),
              start_time: slot.start + ':00',
              end_time: slot.end + ':00',
              razorpay_order_id: response.razorpay_order_id,
            };

            const verifyRes = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-booking-payment`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  booking_data: bookingData,
                }),
              }
            );

            if (verifyRes.ok) {
              const verifyData = await verifyRes.json();
              onSuccess(verifyData.meet_link ?? null);
            } else {
              toast.error('Payment received but booking failed. Please contact support.');
              onError();
            }
          } catch {
            toast.error('Verification error. Please contact support.');
            onError();
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error(err.message || 'Payment failed. Please try again.');
      setLoading(false);
      onError();
    }
  };

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="bg-stone-50 border border-stone-100 rounded-2xl p-4 space-y-3">
        <div className="flex justify-between items-center text-sm font-['Inter']">
          <span className="text-stone-500">Session with</span>
          <span className="text-stone-800 font-semibold">{expert.name}</span>
        </div>
        <div className="flex justify-between items-center text-sm font-['Inter']">
          <span className="text-stone-500">Date</span>
          <span className="text-stone-700">{format(date, 'EEE, MMM d')}</span>
        </div>
        <div className="flex justify-between items-center text-sm font-['Inter']">
          <span className="text-stone-500">Time</span>
          <span className="text-stone-700">{slot.start} – {slot.end}</span>
        </div>
        <div className="flex justify-between items-center text-sm font-['Inter']">
          <span className="text-stone-500">Duration</span>
          <span className="text-stone-700">20 minutes</span>
        </div>
        <div className="h-px bg-stone-200" />
        <div className="flex justify-between items-center font-['Inter']">
          <span className="text-stone-700 font-semibold text-sm">Total</span>
          <span className="text-stone-900 font-bold text-xl">₹{expert.price_inr}</span>
        </div>
      </div>

      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full py-3.5 bg-stone-900 text-white rounded-xl text-sm font-medium font-['Inter'] hover:bg-stone-700 active:scale-95 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay ₹${expert.price_inr} & Confirm Booking`
        )}
      </button>

      <div className="flex items-center justify-center gap-1.5 text-xs text-stone-400 font-['Inter']">
        <Shield className="w-3 h-3" />
        <span>Secure payment via Razorpay</span>
      </div>
    </div>
  );
};

export default PaymentHandler;
