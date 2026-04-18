import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, ChevronDown, Loader2 } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const CATEGORIES = [
  "Payment issue",
  "Technical problem",
  "Feature request",
  "Account help",
  "Other",
];

export default function CustomerSupport() {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState(user?.primaryEmailAddress?.emailAddress ?? "");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast.error("Please describe your issue.");
      return;
    }
    if (!email.trim()) {
      toast.error("Please enter your email.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("messages").insert({
        expert_id: null,
        sender_name: user?.fullName || "Anonymous",
        sender_email: email.trim(),
        subject: category || "Support Request",
        body: message.trim(),
      });

      if (error) throw error;

      setSubmitted(true);
      setMessage("");
      setCategory("");
    } catch {
      toast.error("Failed to send. Email us at support@harrytheblaze.site");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => setSubmitted(false), 400);
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-[200] w-13 h-13 flex items-center justify-center rounded-full bg-stone-900 text-white shadow-lg hover:bg-stone-700 active:scale-95 transition-colors"
        style={{ width: 52, height: 52 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        aria-label="Support"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
              <X className="w-5 h-5" />
            </motion.span>
          ) : (
            <motion.span key="msg" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}>
              <MessageCircle className="w-5 h-5" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed bottom-24 right-6 z-[199] w-[320px] rounded-3xl bg-white border border-stone-100 shadow-2xl overflow-hidden"
            style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between" style={{ background: "#fcfcf9" }}>
              <div>
                <p className="font-['Merriweather'] font-bold text-[14px] text-stone-900">Support</p>
                <p className="font-['Inter'] text-[11px] text-stone-400 mt-0.5">We reply within 24 hours</p>
              </div>
              <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50 border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-['Inter'] text-[10px] font-semibold text-emerald-700">Online</span>
              </span>
            </div>

            <div className="p-5">
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-6 space-y-3"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
                      <Send className="w-5 h-5 text-emerald-600" />
                    </div>
                    <p className="font-['Merriweather'] font-bold text-stone-900 text-[15px]">Message sent!</p>
                    <p className="font-['Inter'] text-[12px] text-stone-500">We'll get back to you at<br /><span className="font-semibold text-stone-700">{email}</span></p>
                    <button
                      onClick={handleClose}
                      className="mt-2 text-[12px] font-['Inter'] font-medium text-stone-500 underline underline-offset-2"
                    >
                      Close
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                    {/* Category */}
                    <div className="relative">
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full appearance-none bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 font-['Inter'] text-[13px] text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-300 pr-8"
                      >
                        <option value="">Select a topic</option>
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-3 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
                    </div>

                    {/* Email */}
                    <input
                      type="email"
                      placeholder="Your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 font-['Inter'] text-[13px] text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300"
                    />

                    {/* Message */}
                    <textarea
                      placeholder="Describe your issue..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={3}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 font-['Inter'] text-[13px] text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300 resize-none"
                    />

                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-stone-900 text-white font-['Inter'] font-semibold text-[13px] hover:bg-stone-700 active:scale-[0.98] transition-all disabled:opacity-60"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-3.5 h-3.5" /> Send message</>}
                    </button>

                    <p className="text-center font-['Inter'] text-[11px] text-stone-400">
                      Or email us at{" "}
                      <a href="mailto:support@harrytheblaze.site" className="text-stone-600 underline underline-offset-2">
                        support@harrytheblaze.site
                      </a>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
