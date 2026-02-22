import React, { useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle2, Loader2, X, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import PhotoUploader from './PhotoUploader';
import AvailabilityScheduler, { WeeklyAvailability } from './AvailabilityScheduler';

const MAIN_COMPANIES = ['Accenture', 'Infosys', 'TCS', 'Cognizant'] as const;

const GuruProfileForm = () => {
  // Core info
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [price, setPrice] = useState(100);
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>([]);

  // Placement info
  const [company, setCompany] = useState('');
  const [customCompany, setCustomCompany] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [packageLpa, setPackageLpa] = useState('');
  const [proofUrl, setProofUrl] = useState('');

  // Availability
  const [availability, setAvailability] = useState<WeeklyAvailability>({});

  // UI
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) {
      setSkills((prev) => [...prev, s]);
      setSkillInput('');
    }
  };

  const resetForm = () => {
    setName(''); setTitle(''); setBio(''); setPhotoUrl(''); setPrice(100);
    setSkills([]); setSkillInput('');
    setCompany(''); setCustomCompany(''); setInterviewDate('');
    setPackageLpa(''); setProofUrl('');
    setAvailability({});
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Expert name is required'); return; }
    if (!company) { toast.error('Please select the company they got placed into'); return; }

    const resolvedCompany = company === 'Other' ? customCompany.trim() : company;
    if (company === 'Other' && !customCompany.trim()) {
      toast.error('Please enter the company name');
      return;
    }

    setLoading(true);
    try {
      // Insert expert row
      const { data: expertData, error: expertError } = await supabase
        .from('experts')
        .insert({
          name: name.trim(),
          title: title.trim() || null,
          bio: bio.trim() || null,
          photo_url: photoUrl || null,
          skills: skills.length > 0 ? skills : null,
          price_inr: price,
          company: resolvedCompany,
          interview_date: interviewDate || null,
          package_lpa: packageLpa ? parseFloat(packageLpa) : null,
          proof_url: proofUrl || null,
        })
        .select('id')
        .single();

      if (expertError) throw expertError;

      // Insert availability rows
      const availabilityRows = Object.entries(availability).flatMap(([dayStr, windows]) =>
        windows.map((w) => ({
          expert_id: expertData.id,
          day_of_week: Number(dayStr),
          start_time: `${w.start}:00`,
          end_time: `${w.end}:00`,
        }))
      );

      if (availabilityRows.length > 0) {
        const { error: availError } = await supabase.from('availability').insert(availabilityRows);
        if (availError) throw availError;
      }

      setSuccess(true);
      toast.success('Expert profile created and live on /connect!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-transparent transition-all font-['Inter']";
  const labelCls = "block text-sm font-medium text-stone-700 mb-1.5 font-['Inter']";
  const sectionLabel =
    "text-xs font-semibold text-stone-400 uppercase tracking-widest mb-4 font-['Inter']";

  if (success) {
    return (
      <div className="flex flex-col items-center text-center py-10 space-y-5">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-200 rounded-full blur-2xl opacity-60" />
          <div className="relative w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-['Merriweather'] text-stone-900 mb-1">Profile Created!</h2>
          <p className="text-stone-500 text-sm font-['Inter']">
            The expert is now live on{' '}
            <a href="/connect" className="text-stone-700 font-medium hover:underline">/connect</a>.
          </p>
        </div>
        <button
          onClick={resetForm}
          className="px-6 py-2.5 bg-stone-900 text-white rounded-xl text-sm font-medium font-['Inter'] hover:bg-stone-700 active:scale-95 transition-all"
        >
          Add Another Expert
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* ── Basic Info ─────────────────────────────────────────────── */}
      <div>
        <p className={sectionLabel}>Basic Info</p>
        <div className="flex items-start gap-5">
          <PhotoUploader value={photoUrl} onChange={setPhotoUrl} label="Profile Photo" />
          <div className="flex-1 space-y-3">
            <div>
              <label className={labelCls}>Full Name <span className="text-stone-400">*</span></label>
              <input
                type="text" value={name} required
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Title / Qualifications</label>
              <input
                type="text" value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. SDE at Accenture · IIT Delhi '24"
                className={inputCls}
              />
            </div>
          </div>
        </div>
        <div className="mt-4">
          <label className={labelCls}>Short Bio</label>
          <textarea
            value={bio} rows={3}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell students about yourself, your interview journey, and how you can help..."
            className={`${inputCls} resize-none`}
          />
        </div>
      </div>

      {/* ── Placement Details ──────────────────────────────────────── */}
      <div>
        <p className={sectionLabel}>Placement Details</p>
        <div className="space-y-5">

          {/* Company selector */}
          <div>
            <label className={labelCls}>Company Placed Into <span className="text-stone-400">*</span></label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {([...MAIN_COMPANIES, 'Other'] as const).map((c) => (
                <button
                  key={c} type="button"
                  onClick={() => { setCompany(c); if (c !== 'Other') setCustomCompany(''); }}
                  className={`py-2.5 px-3 rounded-xl text-sm font-medium border transition-all font-['Inter'] ${
                    company === c
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-400 hover:bg-stone-100'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            {company === 'Other' && (
              <input
                type="text" value={customCompany}
                onChange={(e) => setCustomCompany(e.target.value)}
                placeholder="Enter company name"
                className={`${inputCls} mt-2`}
              />
            )}
          </div>

          {/* Interview date + Package */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Interview / Drive Date</label>
              <input
                type="date" value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Package Offered</label>
              <div className="relative">
                <input
                  type="number" value={packageLpa}
                  onChange={(e) => setPackageLpa(e.target.value)}
                  placeholder="e.g. 8.5"
                  min={0} step={0.1}
                  className={`${inputCls} pr-12`}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-['Inter']">LPA</span>
              </div>
            </div>
          </div>

          {/* Proof upload */}
          <PhotoUploader
            value={proofUrl}
            onChange={setProofUrl}
            bucket="expert-proofs"
            accept="image/*,application/pdf"
            label="Proof of Selection"
            hint="Offer letter screenshot, selection email screenshot, etc. (image or PDF · max 10MB)"
          />
        </div>
      </div>

      {/* ── Skills ─────────────────────────────────────────────────── */}
      <div>
        <p className={sectionLabel}>Skills & Tags</p>
        <div className="flex flex-wrap gap-2 mb-2">
          {skills.map((skill, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-stone-100 text-stone-700 rounded-full text-xs font-medium font-['Inter']">
              {skill}
              <button type="button" onClick={() => setSkills((p) => p.filter((_, j) => j !== i))} className="text-stone-400 hover:text-red-400 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text" value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
            placeholder="Type a skill and press Enter (e.g. DSA, HR Interview, Accenture)"
            className={`${inputCls} flex-1`}
          />
          <button type="button" onClick={addSkill} className="px-3 py-2.5 bg-stone-100 text-stone-600 rounded-xl hover:bg-stone-200 transition-colors flex-shrink-0">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Session Settings ───────────────────────────────────────── */}
      <div>
        <p className={sectionLabel}>Session Settings</p>
        <div className="flex items-center gap-2">
          <span className="text-stone-500 text-sm font-['Inter']">₹</span>
          <input
            type="number" value={price} min={1}
            onChange={(e) => setPrice(Math.max(1, Number(e.target.value)))}
            className="w-28 px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 transition-all font-['Inter']"
          />
          <span className="text-stone-400 text-xs font-['Inter']">per 20-min session</span>
        </div>
      </div>

      {/* ── Availability ───────────────────────────────────────────── */}
      <div>
        <p className={sectionLabel}>Availability</p>
        <AvailabilityScheduler value={availability} onChange={setAvailability} />
      </div>

      {/* Submit */}
      <button
        type="submit" disabled={loading}
        className="w-full py-3.5 bg-stone-900 text-white rounded-xl text-sm font-medium font-['Inter'] hover:bg-stone-700 active:scale-95 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Creating Profile...</>
        ) : (
          'Create Expert Profile'
        )}
      </button>
    </form>
  );
};

export default GuruProfileForm;
