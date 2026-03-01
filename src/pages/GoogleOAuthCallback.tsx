import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const GoogleOAuthCallback = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const code      = params.get('code');
    const expertId  = params.get('state');
    const error     = params.get('error');

    if (error) {
      setErrorMsg(error === 'access_denied' ? 'You cancelled the Google sign-in.' : error);
      setStatus('error');
      return;
    }

    if (!code || !expertId) {
      setErrorMsg('Missing code or expert ID in callback.');
      setStatus('error');
      return;
    }

    const exchange = async () => {
      try {
        const redirectUri = `${window.location.origin}/oauth/google/callback`;
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-oauth-exchange`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({ code, expert_id: expertId, redirect_uri: redirectUri }),
          }
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Exchange failed');

        setStatus('success');
        setTimeout(() => navigate('/placed-guru'), 2000);
      } catch (err: any) {
        setErrorMsg(err.message || 'Something went wrong.');
        setStatus('error');
      }
    };

    exchange();
  }, []);

  return (
    <div className="min-h-screen bg-[#fcfcf9] flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl p-10 shadow-sm border border-stone-100 flex flex-col items-center text-center max-w-sm w-full space-y-5">
        {status === 'loading' && (
          <>
            <Loader2 className="w-10 h-10 text-stone-400 animate-spin" />
            <p className="text-stone-600 text-sm font-['Inter']">Connecting your Google account...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-['Merriweather'] text-stone-900 mb-1">Google Connected!</h2>
              <p className="text-stone-500 text-sm font-['Inter']">You can now generate Google Meet links. Redirecting...</p>
            </div>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <h2 className="text-lg font-['Merriweather'] text-stone-900 mb-1">Connection Failed</h2>
              <p className="text-stone-500 text-sm font-['Inter']">{errorMsg}</p>
            </div>
            <button
              onClick={() => navigate('/placed-guru')}
              className="px-5 py-2.5 bg-stone-900 text-white rounded-xl text-sm font-medium font-['Inter'] hover:bg-stone-700 active:scale-95 transition-all"
            >
              Back to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default GoogleOAuthCallback;
