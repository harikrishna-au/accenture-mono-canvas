import { useUser } from '@clerk/clerk-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, BadgeCheck, TrendingUp, Clock, CalendarDays, CheckCircle2, XCircle, Hourglass, Loader2, Calendar, ArrowLeft, X, Video, CalendarCheck, MessageCircle, Mail } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import Header from '@/components/Header';
import GuruProfileForm from './placed-guru/GuruProfileForm';
import { supabase } from '@/integrations/supabase/client';
import { Expert } from './connect/ExpertCard';

/* ── Profile mini-card ─────────────────────────────────────────────── */

function startGoogleOAuth(expertId: string) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const redirectUri = `${window.location.origin}/oauth/google/callback`;
  const scope = 'https://www.googleapis.com/auth/meetings.space.created';
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent&state=${expertId}`;
  window.location.href = url;
}

const MyExpertCard = ({
  expert,
  onEdit,
}: {
  expert: Expert & { google_refresh_token?: string | null };
  onEdit: () => void;
}) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 flex items-start gap-4">
    <div className="flex-shrink-0">
      {expert.photo_url ? (
        <img
          src={expert.photo_url}
          alt={expert.name}
          className="w-12 h-12 rounded-xl object-cover"
        />
      ) : (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center text-lg font-['Merriweather'] text-stone-500">
          {expert.name.charAt(0)}
        </div>
      )}
    </div>

    <div className="flex-1 min-w-0">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-['Merriweather'] text-stone-900 truncate">{expert.name}</h3>
          {expert.title && (
            <p className="text-xs text-stone-500 mt-0.5 font-['Inter'] line-clamp-1">{expert.title}</p>
          )}
        </div>
        <button
          onClick={onEdit}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-stone-50 border border-stone-200 text-stone-600 rounded-xl text-xs font-medium font-['Inter'] hover:bg-stone-100 active:scale-95 transition-all"
        >
          <Pencil className="w-3 h-3" />
          Edit
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-2">
        {expert.company && (
          <span className="inline-flex items-center gap-1 text-xs text-stone-500 font-['Inter']">
            <BadgeCheck className="w-3 h-3 text-emerald-500" />
            {expert.company}
          </span>
        )}
        {expert.package_lpa && (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-['Inter']">
            <TrendingUp className="w-3 h-3" />
            ₹{expert.package_lpa} LPA
          </span>
        )}
        <span className="inline-flex items-center gap-1 text-xs text-stone-400 font-['Inter']">
          <Clock className="w-3 h-3" />
          ₹{expert.price_inr} / session
        </span>
      </div>

      {expert.skills && expert.skills.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {expert.skills.slice(0, 3).map((skill, i) => (
            <span
              key={i}
              className="px-2 py-0.5 bg-stone-50 border border-stone-100 text-stone-600 text-xs rounded-full font-['Inter']"
            >
              {skill}
            </span>
          ))}
          {expert.skills.length > 3 && (
            <span className="px-2 py-0.5 text-stone-400 text-xs font-['Inter']">
              +{expert.skills.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Google Meet connection status */}
      <div className="mt-3 pt-3 border-t border-stone-100">
        {expert.google_refresh_token ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-['Inter']">
            <Video className="w-3 h-3" />
            Google Meet connected
          </span>
        ) : (
          <button
            onClick={() => startGoogleOAuth(expert.id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-xl text-xs font-medium font-['Inter'] active:scale-95 transition-all"
          >
            <Video className="w-3 h-3" />
            Connect Google for Meet links
          </button>
        )}
      </div>
    </div>
  </div>
);

/* ── Booking status config ─────────────────────────────────────────── */

const BOOKING_STATUS: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
  paid: {
    label: 'Awaiting Acceptance',
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
};

/* ── Expert bookings panel ─────────────────────────────────────────── */

interface ExpertBooking {
  id: string;
  expert_id: string;
  user_name: string;
  user_email: string;
  message: string | null;
  date: string;
  start_time: string;
  end_time: string;
  meet_link: string | null;
  status: string;
  experts: { name: string; photo_url: string | null; price_inr: number } | null;
}

const isMeetingEnded = (date: string, endTime: string) =>
  new Date(`${date}T${endTime}`) < new Date();

const BookingsPanel = ({ userId }: { userId: string }) => {
  const [bookings, setBookings] = useState<ExpertBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [meetLoading, setMeetLoading] = useState<string | null>(null);

  const generateMeetLink = async (bookingId: string) => {
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
        toast.error('Connect your Google account first — see your profile card.');
        return;
      }
      if (!res.ok) throw new Error(data.error || 'Failed');
      setBookings((prev) =>
        prev.map((b) => b.id === bookingId ? { ...b, meet_link: data.meet_link } : b)
      );
      toast.success('Meet link generated and emailed to both parties!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate Meet link');
    } finally {
      setMeetLoading(null);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    const { data: myExperts } = await supabase
      .from('experts')
      .select('id')
      .eq('user_id', userId);

    if (!myExperts || myExperts.length === 0) {
      setBookings([]);
      setLoading(false);
      return;
    }

    const ids = myExperts.map((e) => e.id);
    const { data } = await supabase
      .from('bookings')
      .select('*, experts(name, photo_url, price_inr)')
      .in('expert_id', ids)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

    setBookings((data as ExpertBooking[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchBookings(); }, []);

  const updateStatus = async (bookingId: string, status: 'confirmed' | 'declined') => {
    setUpdating(bookingId);
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId);

    if (error) {
      toast.error('Failed to update booking. Try again.');
    } else {
      toast.success(status === 'confirmed' ? 'Booking confirmed!' : 'Booking declined.');
      fetchBookings();
    }
    setUpdating(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-stone-200 border-t-stone-700 rounded-full animate-spin" />
      </div>
    );
  }

  // Split into active (upcoming) and ended
  const activeBookings = bookings.filter(
    (b) => b.status !== 'declined' && !isMeetingEnded(b.date, b.end_time)
  );
  const endedConfirmed = bookings.filter(
    (b) => b.status === 'confirmed' && isMeetingEnded(b.date, b.end_time)
  );

  // Income = sum of price_inr for every completed confirmed session
  const totalEarned = endedConfirmed.reduce(
    (sum, b) => sum + (b.experts?.price_inr ?? 0), 0
  );
  const upcoming = activeBookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'paid'
  ).length;

  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 shadow-sm border border-stone-100 flex flex-col items-center text-center">
        <CalendarDays className="w-8 h-8 text-stone-300 mb-3" />
        <p className="text-stone-400 text-sm font-['Inter']">No bookings yet.</p>
      </div>
    );
  }

  const order = ['paid', 'confirmed', 'declined'];
  const sorted = [...activeBookings].sort(
    (a, b) => order.indexOf(a.status) - order.indexOf(b.status)
  );

  return (
    <div className="space-y-4">
      {/* ── Income stats banner ── */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-stone-50">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-stone-400 font-['Inter']">
            Earnings Overview
          </p>
        </div>
        <div className="grid grid-cols-3 divide-x divide-stone-100">
          <div className="px-5 py-4 flex flex-col gap-0.5">
            <span className="text-[11px] text-stone-400 font-['Inter']">Total Earned</span>
            <span className="text-xl font-bold font-['Inter'] text-stone-900">
              ₹{totalEarned.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-stone-400 font-['Inter']">{endedConfirmed.length} session{endedConfirmed.length !== 1 ? 's' : ''} completed</span>
          </div>
          <div className="px-5 py-4 flex flex-col gap-0.5">
            <span className="text-[11px] text-stone-400 font-['Inter']">Upcoming</span>
            <span className="text-xl font-bold font-['Inter'] text-stone-900">{upcoming}</span>
            <span className="text-[10px] text-stone-400 font-['Inter']">session{upcoming !== 1 ? 's' : ''} scheduled</span>
          </div>
          <div className="px-5 py-4 flex flex-col gap-0.5">
            <span className="text-[11px] text-stone-400 font-['Inter']">Pending</span>
            <span className="text-xl font-bold font-['Inter'] text-amber-600">
              {activeBookings.filter((b) => b.status === 'paid').length}
            </span>
            <span className="text-[10px] text-stone-400 font-['Inter']">awaiting your accept</span>
          </div>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 shadow-sm border border-stone-100 flex flex-col items-center text-center">
          <CalendarDays className="w-7 h-7 text-stone-300 mb-3" />
          <p className="text-stone-400 text-sm font-['Inter']">No upcoming sessions.</p>
        </div>
      ) : null}

      {sorted.map((booking) => {
        const st = BOOKING_STATUS[booking.status] ?? BOOKING_STATUS.declined;
        const isPending = booking.status === 'paid';
        return (
          <div key={booking.id} className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-['Merriweather'] text-stone-900">{booking.user_name}</p>
                <p className="text-xs text-stone-400 font-['Inter'] mt-0.5">{booking.user_email}</p>
              </div>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium font-['Inter'] flex-shrink-0 ${st.cls}`}>
                {st.icon}
                {st.label}
              </span>
            </div>

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

            {booking.experts && (
              <p className="text-xs text-stone-400 font-['Inter']">
                For: <span className="text-stone-600 font-medium">{booking.experts.name}</span>
              </p>
            )}

            {booking.message && (
              <p className="text-xs text-stone-500 font-['Inter'] bg-stone-50 rounded-xl px-3 py-2 line-clamp-3">
                {booking.message}
              </p>
            )}

            {isPending && (
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => updateStatus(booking.id, 'confirmed')}
                  disabled={updating === booking.id}
                  className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-xs font-medium font-['Inter'] hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {updating === booking.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                  Accept
                </button>
                <button
                  onClick={() => updateStatus(booking.id, 'declined')}
                  disabled={updating === booking.id}
                  className="flex-1 py-2 bg-stone-100 text-stone-600 rounded-xl text-xs font-medium font-['Inter'] hover:bg-red-50 hover:text-red-600 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-3 h-3" />
                  Decline
                </button>
              </div>
            )}

            {/* Meet link */}
            {booking.meet_link ? (
              <a
                href={booking.meet_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 w-full py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-xl text-xs font-medium font-['Inter'] transition-colors"
              >
                <Video className="w-3 h-3" />
                Join Google Meet
              </a>
            ) : booking.status !== 'declined' ? (
              <button
                onClick={() => generateMeetLink(booking.id)}
                disabled={meetLoading === booking.id}
                className="flex items-center justify-center gap-1.5 w-full py-2 bg-stone-900 hover:bg-stone-700 text-white rounded-xl text-xs font-medium font-['Inter'] active:scale-95 transition-all disabled:opacity-60"
              >
                {meetLoading === booking.id
                  ? <Loader2 className="w-3 h-3 animate-spin" />
                  : <CalendarCheck className="w-3 h-3" />}
                {meetLoading === booking.id ? 'Generating...' : 'Generate Meet Link'}
              </button>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

/* ── Messages panel ────────────────────────────────────────────────── */

interface Message {
  id: string;
  sender_name: string;
  sender_email: string;
  subject: string | null;
  body: string;
  is_read: boolean;
  created_at: string;
  experts: { name: string } | null;
}

const MessagesPanel = ({ userId }: { userId: string }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data: myExperts } = await supabase
        .from('experts').select('id').eq('user_id', userId);
      if (!myExperts || myExperts.length === 0) { setLoading(false); return; }
      const ids = myExperts.map((e) => e.id);
      const { data } = await supabase
        .from('messages')
        .select('*, experts(name)')
        .in('expert_id', ids)
        .order('created_at', { ascending: false });
      setMessages((data as unknown as Message[]) || []);
      setLoading(false);
    };
    fetchMessages();
  }, [userId]);

  const markRead = async (id: string) => {
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, is_read: true } : m));
    await supabase.from('messages').update({ is_read: true }).eq('id', id);
  };

  const unreadCount = messages.filter((m) => !m.is_read).length;

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <div className="w-6 h-6 border-2 border-stone-200 border-t-stone-700 rounded-full animate-spin" />
    </div>
  );

  if (messages.length === 0) return (
    <div className="bg-white rounded-3xl p-12 shadow-sm border border-stone-100 flex flex-col items-center text-center">
      <MessageCircle className="w-8 h-8 text-stone-300 mb-3" />
      <p className="text-stone-400 text-sm font-['Inter']">No messages yet.</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {unreadCount > 0 && (
        <p className="text-xs text-stone-400 font-['Inter']">
          {unreadCount} unread message{unreadCount > 1 ? 's' : ''}
        </p>
      )}
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`bg-white rounded-2xl shadow-sm border transition-all ${msg.is_read ? 'border-stone-100' : 'border-stone-300'}`}
        >
          <button
            className="w-full text-left px-5 py-4 flex items-start justify-between gap-3"
            onClick={() => {
              setExpanded(expanded === msg.id ? null : msg.id);
              if (!msg.is_read) markRead(msg.id);
            }}
          >
            <div className="flex items-start gap-3 min-w-0">
              {!msg.is_read && (
                <span className="mt-1.5 w-2 h-2 bg-stone-800 rounded-full flex-shrink-0" />
              )}
              <div className="min-w-0">
                <p className={`text-sm font-['Inter'] truncate ${msg.is_read ? 'text-stone-600' : 'text-stone-900 font-semibold'}`}>
                  {msg.sender_name}
                  {msg.experts && <span className="text-stone-400 font-normal"> → {msg.experts.name}</span>}
                </p>
                {msg.subject && (
                  <p className="text-xs text-stone-500 font-['Inter'] mt-0.5 truncate">{msg.subject}</p>
                )}
                {!expanded && (
                  <p className="text-xs text-stone-400 font-['Inter'] mt-0.5 line-clamp-1">{msg.body}</p>
                )}
              </div>
            </div>
            <span className="text-xs text-stone-400 font-['Inter'] flex-shrink-0 mt-0.5">
              {format(parseISO(msg.created_at), 'MMM d')}
            </span>
          </button>

          {expanded === msg.id && (
            <div className="px-5 pb-4 space-y-3 border-t border-stone-50 pt-3">
              <p className="text-sm text-stone-700 font-['Inter'] leading-relaxed whitespace-pre-wrap">
                {msg.body}
              </p>
              <a
                href={`mailto:${msg.sender_email}?subject=Re: ${msg.subject ?? 'Your message'}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-900 text-white rounded-xl text-xs font-medium font-['Inter'] hover:bg-stone-700 active:scale-95 transition-all"
              >
                <Mail className="w-3 h-3" />
                Reply to {msg.sender_email}
              </a>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

/* ── Management panel ──────────────────────────────────────────────── */

type View = 'list' | 'add' | 'edit';

const ManagementPanel = ({ userId }: { userId: string }) => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'profiles' | 'bookings' | 'messages'>('profiles');
  const [view, setView] = useState<View>('list');
  const [experts, setExperts] = useState<Expert[]>([]);
  const [editingExpert, setEditingExpert] = useState<Expert | null>(null);
  const [fetching, setFetching] = useState(true);

  const fetchMyExperts = async () => {
    setFetching(true);
    try {
      const { data } = await supabase
        .from('experts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      setExperts((data as Expert[]) || []);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { fetchMyExperts(); }, []);

  const handleAddSuccess = () => { fetchMyExperts(); setView('list'); };
  const handleEditSuccess = () => { fetchMyExperts(); setView('list'); setEditingExpert(null); };
  const handleEdit = (expert: Expert) => { setEditingExpert(expert); setView('edit'); };
  const handleCancel = () => { setView('list'); setEditingExpert(null); };

  const headingMap: Record<View, string> = {
    list: 'My Profiles',
    add: 'Add Expert Profile',
    edit: 'Edit Profile',
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-12">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          {/* Back button — visible when in add/edit form */}
          {tab === 'profiles' && (view === 'add' || view === 'edit') && (
            <button
              onClick={handleCancel}
              className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 text-stone-600 rounded-xl text-sm font-medium font-['Inter'] hover:bg-stone-200 active:scale-95 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          )}
          <h1 className="text-2xl sm:text-3xl font-['Merriweather'] text-stone-900 tracking-tight">
            {tab === 'profiles' ? headingMap[view] : tab === 'bookings' ? 'Bookings' : 'Messages'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {tab === 'profiles' && view === 'list' && (
            <button
              onClick={() => setView('add')}
              className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 text-white rounded-xl text-sm font-medium font-['Inter'] hover:bg-stone-700 active:scale-95 transition-all whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Add Profile
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-stone-100 rounded-2xl mb-6">
        {([['profiles', 'My Profiles'], ['bookings', 'Bookings'], ['messages', 'Messages']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => { setTab(key); if (key === 'profiles') setView('list'); }}
            className={`flex-1 py-2 text-sm font-medium font-['Inter'] rounded-xl transition-all ${tab === key
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-500 hover:text-stone-700'
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'bookings' && <BookingsPanel userId={userId} />}
      {tab === 'messages' && <MessagesPanel userId={userId} />}

      {tab === 'profiles' && view === 'list' && (
        <>
          {fetching ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-stone-200 border-t-stone-700 rounded-full animate-spin" />
            </div>
          ) : experts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 shadow-sm border border-stone-100 flex flex-col items-center text-center">
              <p className="text-stone-400 text-sm font-['Inter'] mb-5">No expert profiles yet.</p>
              <button
                onClick={() => setView('add')}
                className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-xl text-sm font-medium font-['Inter'] hover:bg-stone-700 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Your First Profile
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {experts.map((expert) => (
                <MyExpertCard
                  key={expert.id}
                  expert={expert}
                  onEdit={() => handleEdit(expert)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'profiles' && (view === 'add' || view === 'edit') && (
        <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-stone-100">
          {/* Form header with X close button */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest font-['Inter']">
              {view === 'add' ? 'New Profile' : 'Editing Profile'}
            </p>
            <button
              onClick={handleCancel}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 active:scale-95 transition-all"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <GuruProfileForm
            key={editingExpert?.id ?? 'new'}
            userId={userId}
            expertId={view === 'edit' ? editingExpert?.id : undefined}
            initialData={view === 'edit' ? editingExpert : undefined}
            onSuccess={view === 'add' ? handleAddSuccess : handleEditSuccess}
            onCancel={handleCancel}
          />
        </div>
      )}
    </div>
  );
};

/* ── Root page ─────────────────────────────────────────────────────── */

const PlacedGuruPage = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();

  // Move redirect into a useEffect so it never fires during
  // unrelated re-renders (e.g. closing the form with the X button)
  useEffect(() => {
    if (isLoaded && !user) {
      navigate('/?redirect=/placed-guru', { replace: true });
    }
  }, [isLoaded, user]);

  // Still resolving Clerk session OR about to redirect
  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen bg-[#fcfcf9] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-stone-200 border-t-stone-700 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcf9]">
      <div className="w-full flex flex-col items-center z-50">
        <Header onStartTour={() => { }} />
      </div>
      <ManagementPanel userId={user.id} />
    </div>
  );
};

export default PlacedGuruPage;
