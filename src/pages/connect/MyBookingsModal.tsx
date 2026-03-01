import { useState, useEffect } from 'react';
import { X, Loader2, Search, Calendar, Clock, CheckCircle2, XCircle, Hourglass, Video, CalendarCheck } from 'lucide-react';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';

interface Booking {
  id: string;
  user_name: string;
  user_email: string;
  message: string | null;
  date: string;
  start_time: string;
  end_time: string;
  meet_link: string | null;
  status: string;
  created_at: string;
  experts: { name: string; photo_url: string | null } | null;
}

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
  paid: {
    label: 'Awaiting Confirmation',
    icon: <Hourglass className="w-3 h-3" />,
    cls: 'bg-amber-50 text-amber-700 border border-amber-100',
  },
  confirmed: {
    label: 'Confirmed',
    icon: <CheckCircle2 className="w-3 h-3" />,
    cls: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  },
  declined: {
    label: 'Declined',
    icon: <XCircle className="w-3 h-3" />,
    cls: 'bg-red-50 text-red-600 border border-red-100',
  },
  cancelled: {
    label: 'Cancelled',
    icon: <XCircle className="w-3 h-3" />,
    cls: 'bg-stone-50 text-stone-500 border border-stone-200',
  },
};

interface MyBookingsModalProps {
  onClose: () => void;
}

const MyBookingsModal = ({ onClose }: MyBookingsModalProps) => {
  const { user: clerkUser } = useUser();
  const clerkEmail = clerkUser?.primaryEmailAddress?.emailAddress ?? '';

  const [email, setEmail] = useState(clerkEmail);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [meetLoading, setMeetLoading] = useState<string | null>(null);

  const fetchBookings = async (emailToSearch: string) => {
    if (!emailToSearch.trim()) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('bookings')
        .select('*, experts(name, photo_url)')
        .ilike('user_email', emailToSearch.trim())
        .order('date', { ascending: false })
        .returns<Booking[]>();
      setBookings((data as Booking[]) || []);
    } catch {
      setBookings([]);
    } finally {
      setFetched(true);
      setLoading(false);
    }
  };

  // Auto-fetch on open if Clerk email is available
  useEffect(() => {
    if (clerkEmail) {
      fetchBookings(clerkEmail);
    }
  }, [clerkEmail]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBookings(email);
  };

  const requestMeetLink = async (bookingId: string) => {
    setMeetLoading(bookingId);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-meet-link`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ booking_id: bookingId }),
        }
      );
      const data = await res.json();
      if (data.error === 'GOOGLE_NOT_CONNECTED') {
        toast.error('The expert hasn\'t connected their Google account yet. Please try again later.');
        return;
      }
      if (!res.ok) throw new Error(data.error || 'Failed to generate Meet link');

      // Update the booking in local state with the new meet_link
      setBookings((prev) =>
        prev.map((b) => b.id === bookingId ? { ...b, meet_link: data.meet_link } : b)
      );
      toast.success('Google Meet link sent to your email!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate Meet link');
    } finally {
      setMeetLoading(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#fcfcf9] w-full sm:max-w-[440px] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90dvh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 bg-white flex-shrink-0">
          <h2 className="text-sm font-['Merriweather'] text-stone-900">My Bookings</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 transition-colors text-stone-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {/* Email row — pre-filled from Clerk, still editable */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-transparent transition-all font-['Inter']"
            />
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="px-4 py-2.5 bg-stone-900 text-white rounded-xl text-sm font-medium font-['Inter'] hover:bg-stone-700 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </button>
          </form>

          {/* Results */}
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-5 h-5 animate-spin text-stone-400" />
            </div>
          ) : fetched && bookings.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-stone-400 text-sm font-['Inter']">No bookings found for this email.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((booking) => {
                const status = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.cancelled;
                return (
                  <div key={booking.id} className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 space-y-3">
                    {/* Expert + status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        {booking.experts?.photo_url ? (
                          <img
                            src={booking.experts.photo_url}
                            alt={booking.experts.name}
                            className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-500 text-xs font-['Merriweather'] flex-shrink-0">
                            {booking.experts?.name?.charAt(0) ?? '?'}
                          </div>
                        )}
                        <span className="text-sm font-['Merriweather'] text-stone-900">
                          {booking.experts?.name ?? 'Unknown Expert'}
                        </span>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium font-['Inter'] flex-shrink-0 ${status.cls}`}>
                        {status.icon}
                        {status.label}
                      </span>
                    </div>

                    {/* Date / time */}
                    <div className="flex items-center gap-4 text-xs text-stone-500 font-['Inter']">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(parseISO(booking.date), 'EEE, MMM d, yyyy')}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {booking.start_time.slice(0, 5)} – {booking.end_time.slice(0, 5)}
                      </span>
                    </div>

                    {/* Message */}
                    {booking.message && (
                      <p className="text-xs text-stone-500 font-['Inter'] line-clamp-2 bg-stone-50 rounded-lg px-3 py-2">
                        {booking.message}
                      </p>
                    )}

                    {/* Meet link / Request Meeting */}
                    {booking.meet_link ? (
                      <a
                        href={booking.meet_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 w-full py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-lg text-xs font-medium font-['Inter'] transition-colors"
                      >
                        <Video className="w-3 h-3" />
                        Join Google Meet
                      </a>
                    ) : (booking.status === 'paid' || booking.status === 'confirmed') ? (
                      <button
                        onClick={() => requestMeetLink(booking.id)}
                        disabled={meetLoading === booking.id}
                        className="flex items-center justify-center gap-1.5 w-full py-2 bg-stone-900 hover:bg-stone-700 active:scale-95 text-white rounded-lg text-xs font-medium font-['Inter'] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {meetLoading === booking.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <CalendarCheck className="w-3 h-3" />
                        )}
                        {meetLoading === booking.id ? 'Generating...' : 'Request Meeting'}
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBookingsModal;
