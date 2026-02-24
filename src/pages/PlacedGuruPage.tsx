import { useUser, useClerk } from '@clerk/clerk-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, BadgeCheck, TrendingUp, Clock, LogOut, CalendarDays, CheckCircle2, XCircle, Hourglass, Loader2, Calendar, ArrowLeft, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import Header from '@/components/Header';
import GuruProfileForm from './placed-guru/GuruProfileForm';
import { supabase } from '@/integrations/supabase/client';
import { Expert } from './connect/ExpertCard';

/* ── Profile mini-card ─────────────────────────────────────────────── */

const MyExpertCard = ({
  expert,
  onEdit,
}: {
  expert: Expert;
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
  status: string;
  experts: { name: string; photo_url: string | null } | null;
}

const BookingsPanel = ({ userId }: { userId: string }) => {
  const [bookings, setBookings] = useState<ExpertBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

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
      .select('*, experts(name, photo_url)')
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

  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 shadow-sm border border-stone-100 flex flex-col items-center text-center">
        <CalendarDays className="w-8 h-8 text-stone-300 mb-3" />
        <p className="text-stone-400 text-sm font-['Inter']">No bookings yet.</p>
      </div>
    );
  }

  const order = ['paid', 'confirmed', 'declined'];
  const sorted = [...bookings].sort(
    (a, b) => order.indexOf(a.status) - order.indexOf(b.status)
  );

  return (
    <div className="space-y-3">
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
          </div>
        );
      })}
    </div>
  );
};

/* ── Management panel ──────────────────────────────────────────────── */

type View = 'list' | 'add' | 'edit';

const ManagementPanel = ({ userId }: { userId: string }) => {
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'profiles' | 'bookings'>('profiles');
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
    <div className="max-w-2xl mx-auto px-6 pt-28 pb-12">
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
          <h1 className="text-3xl font-['Merriweather'] text-stone-900 tracking-tight">
            {tab === 'profiles' ? headingMap[view] : 'Bookings'}
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
          <button
            onClick={() => signOut().then(() => navigate('/connect'))}
            title="Sign out"
            className="p-2.5 bg-stone-100 text-stone-500 rounded-xl hover:bg-red-50 hover:text-red-500 active:scale-95 transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-stone-100 rounded-2xl mb-6">
        {([['profiles', 'My Profiles'], ['bookings', 'Bookings']] as const).map(([key, label]) => (
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
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100">
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
