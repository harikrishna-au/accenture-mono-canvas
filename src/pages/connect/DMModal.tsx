import { useState } from 'react';
import { X, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Expert } from './ExpertCard';

interface DMModalProps {
  expert: Expert;
  onClose: () => void;
}

const DMModal = ({ expert, onClose }: DMModalProps) => {
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody]       = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

  const inputCls = "w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-transparent transition-all font-['Inter']";

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !body.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from('messages').insert({
        expert_id:    expert.id,
        sender_name:  name.trim(),
        sender_email: email.trim(),
        subject:      subject.trim() || null,
        body:         body.trim(),
      });
      if (error) throw error;
      setSent(true);
    } catch (err: any) {
      toast.error(err.message || 'Failed to send message. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#fcfcf9] w-full sm:max-w-[420px] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 bg-white flex-shrink-0">
          <div>
            <h2 className="text-sm font-['Merriweather'] text-stone-900">Message {expert.name}</h2>
            <p className="text-xs text-stone-400 font-['Inter'] mt-0.5">{expert.title}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 transition-colors text-stone-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {sent ? (
            <div className="flex flex-col items-center text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-['Merriweather'] text-stone-900 mb-1">Message Sent!</h3>
                <p className="text-stone-500 text-sm font-['Inter']">
                  {expert.name} will get back to you at <span className="font-medium text-stone-700">{email}</span>.
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3 bg-stone-900 text-white rounded-xl text-sm font-medium font-['Inter'] hover:bg-stone-700 active:scale-95 transition-all"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSend} className="space-y-4">
              <div className="flex gap-3">
                {expert.photo_url ? (
                  <img src={expert.photo_url} alt={expert.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-500 text-sm font-['Merriweather'] flex-shrink-0">
                    {expert.name.charAt(0)}
                  </div>
                )}
                <p className="text-xs text-stone-500 font-['Inter'] leading-relaxed self-center">
                  Your message will be visible to {expert.name} in their dashboard.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1.5 font-['Inter']">Your Name <span className="text-stone-400">*</span></label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rahul Sharma" className={inputCls} required />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1.5 font-['Inter']">Your Email <span className="text-stone-400">*</span></label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="rahul@example.com" className={inputCls} required />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1.5 font-['Inter']">Subject</label>
                <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Question about Accenture interview" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1.5 font-['Inter']">Message <span className="text-stone-400">*</span></label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={4}
                  placeholder="Ask anything about their placement journey, interview tips, or how they can help you..."
                  className={`${inputCls} resize-none`}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || !name.trim() || !email.trim() || !body.trim()}
                className="w-full py-3 bg-stone-900 text-white rounded-xl text-sm font-medium font-['Inter'] hover:bg-stone-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default DMModal;
