import { useState, useEffect } from 'react';
import { Plus, Pencil, BadgeCheck, TrendingUp, Clock, LogOut } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import Header from '@/components/Header';
import GuruLoginForm from './placed-guru/GuruLoginForm';
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

/* ── Management panel (only shown when signed in) ──────────────────── */

type View = 'list' | 'add' | 'edit';

const ManagementPanel = ({ user, onSignOut }: { user: User; onSignOut: () => void }) => {
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
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setExperts((data as Expert[]) || []);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchMyExperts();
  }, []);

  const handleAddSuccess = () => {
    fetchMyExperts();
    setView('list');
  };

  const handleEditSuccess = () => {
    fetchMyExperts();
    setView('list');
    setEditingExpert(null);
  };

  const handleEdit = (expert: Expert) => {
    setEditingExpert(expert);
    setView('edit');
  };

  const handleCancel = () => {
    setView('list');
    setEditingExpert(null);
  };

  const headingMap: Record<View, string> = {
    list: 'My Profiles',
    add: 'Add Expert Profile',
    edit: 'Edit Profile',
  };

  return (
    <div className="max-w-2xl mx-auto px-6 pt-28 pb-12">
      {/* Top bar */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-['Merriweather'] text-stone-900 tracking-tight">
            {headingMap[view]}
          </h1>
          <p className="text-stone-400 text-sm font-['Inter'] mt-2">
            {view === 'list' ? (
              <>
                Your expert profiles on{' '}
                <a href="/connect" className="text-stone-600 hover:underline transition-colors">
                  /connect
                </a>
                .
              </>
            ) : (
              <>
                Changes appear immediately on{' '}
                <a href="/connect" className="text-stone-600 hover:underline transition-colors">
                  /connect
                </a>
                .
              </>
            )}
          </p>
        </div>

        {view === 'list' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('add')}
              className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 text-white rounded-xl text-sm font-medium font-['Inter'] hover:bg-stone-700 active:scale-95 transition-all whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Add Profile
            </button>
            <button
              onClick={onSignOut}
              title="Sign out"
              className="p-2.5 bg-stone-100 text-stone-500 rounded-xl hover:bg-stone-200 active:scale-95 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* List view */}
      {view === 'list' && (
        <>
          {fetching ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-stone-200 border-t-stone-700 rounded-full animate-spin" />
            </div>
          ) : experts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 shadow-sm border border-stone-100 flex flex-col items-center text-center">
              <p className="text-stone-400 text-sm font-['Inter'] mb-5">
                No expert profiles yet.
              </p>
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

      {/* Add / Edit form */}
      {(view === 'add' || view === 'edit') && (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100">
          <GuruProfileForm
            key={editingExpert?.id ?? 'new'}
            userId={user.id}
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
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check existing session
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setChecking(false);
    });

    // Listen for auth changes (login / logout / email confirmation redirect)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      // Clean the access_token hash from the URL after email confirmation
      if (_event === 'SIGNED_IN' && window.location.hash.includes('access_token')) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  // Still resolving session
  if (checking) {
    return (
      <div className="min-h-screen bg-[#fcfcf9] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-stone-200 border-t-stone-700 rounded-full animate-spin" />
      </div>
    );
  }

  // Not signed in → show login
  if (!user) {
    return <GuruLoginForm onSuccess={() => {}} />;
  }

  // Signed in → show management panel
  return (
    <div className="min-h-screen bg-[#fcfcf9]">
      <div className="w-full flex flex-col items-center z-50">
        <Header onStartTour={() => {}} />
      </div>
      <ManagementPanel user={user} onSignOut={handleSignOut} />
    </div>
  );
};

export default PlacedGuruPage;
