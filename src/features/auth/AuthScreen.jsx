import { useState } from 'react';
import { supabase } from '../../services/supabase';
import MyProgressLogo from '../../components/brand/MyProgressLogo';

const REDIRECT_URL = window.location.origin;

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
      <path d="M14.94 13.27c-.28.63-.57 1.21-.93 1.74-.49.7-.89 1.18-1.2 1.44-.48.44-1 .67-1.56.68-.4 0-.88-.11-1.44-.35-.56-.23-1.07-.34-1.54-.34-.49 0-1.02.11-1.59.34-.57.24-1.03.36-1.38.37-.54.02-1.07-.22-1.59-.7-.34-.28-.76-.78-1.26-1.5-.54-.77-.98-1.67-1.33-2.7C1.04 11.17.88 10.1.88 9.06c0-1.19.26-2.22.78-3.07a4.56 4.56 0 0 1 1.63-1.65 4.37 4.37 0 0 1 2.2-.62c.43 0 1 .13 1.7.4.7.27 1.15.4 1.34.4.15 0 .65-.16 1.5-.47.8-.29 1.48-.41 2.03-.37 1.5.12 2.63.71 3.37 1.79-1.34.81-2 1.96-1.99 3.44.01 1.15.43 2.1 1.26 2.86.37.35.79.62 1.26.81-.1.29-.21.57-.32.84zM11.76 1c0 .9-.33 1.74-.98 2.5-.79.92-1.74 1.46-2.77 1.37-.01-.1-.02-.21-.02-.32 0-.86.38-1.78 1.04-2.53.33-.38.75-.7 1.26-.95.51-.25.99-.38 1.44-.39.01.11.03.22.03.32z"/>
    </svg>
  );
}

export default function AuthScreen({ isDark }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(null);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const bg = isDark ? 'bg-[#050505] text-slate-200' : 'bg-[#f8fafc] text-slate-800';
  const cardBg = isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200';
  const inputCls = `w-full px-4 py-3 rounded-xl text-sm outline-none transition border ${
    isDark
      ? 'bg-white/5 border-white/10 text-slate-200 placeholder:text-slate-500 focus:border-purple-500'
      : 'bg-slate-100 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-purple-500'
  }`;
  const divider = isDark ? 'border-white/10 text-slate-500' : 'border-slate-200 text-slate-400';
  const oauthBtn = isDark
    ? 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10'
    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50';

  async function handleOAuth(provider) {
    setError('');
    setOauthLoading(provider);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: REDIRECT_URL },
    });
    if (error) setError(error.message);
    setOauthLoading(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: REDIRECT_URL });
        if (error) throw error;
        setInfo('Te enviamos un email para restablecer tu contraseña.');
      } else if (mode === 'register') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setInfo('Revisá tu email para confirmar tu cuenta.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center px-6 ${bg}`}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-purple-600/20 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <MyProgressLogo size={48} />
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">MyProgress</h1>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {mode === 'login' && 'Iniciá sesión para continuar'}
              {mode === 'register' && 'Creá tu cuenta gratis'}
              {mode === 'forgot' && 'Recuperá tu contraseña'}
            </p>
          </div>
        </div>

        {/* Card */}
        <div className={`rounded-2xl border p-6 space-y-4 ${cardBg}`}>

          {/* OAuth buttons — solo en login y register */}
          {mode !== 'forgot' && (
            <div className="space-y-2">
              <button
                type="button"
                disabled={!!oauthLoading}
                onClick={() => handleOAuth('google')}
                className={`w-full flex items-center justify-center gap-3 py-3 rounded-xl border text-sm font-semibold transition disabled:opacity-50 ${oauthBtn}`}
              >
                {oauthLoading === 'google'
                  ? <div className="w-4 h-4 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                  : <GoogleIcon />}
                Continuar con Google
              </button>

              {/* Divider */}
              <div className={`flex items-center gap-3 pt-1 ${divider}`}>
                <div className={`flex-1 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`} />
                <span className="text-xs">o con email</span>
                <div className={`flex-1 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`} />
              </div>
            </div>
          )}

          {/* Email/password form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputCls}
            />
            {mode !== 'forgot' && (
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={inputCls}
              />
            )}
            {error && <p className="text-red-400 text-sm">{error}</p>}
            {info && <p className="text-green-400 text-sm">{info}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-semibold text-sm transition disabled:opacity-50"
            >
              {loading ? 'Cargando...' : mode === 'login' ? 'Iniciar sesión' : mode === 'register' ? 'Crear cuenta' : 'Enviar email'}
            </button>
          </form>

          {/* Links */}
          <div className={`text-xs text-center space-y-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {mode === 'login' && (
              <>
                <button onClick={() => setMode('forgot')} className="underline hover:text-purple-400 block w-full">
                  Olvidé mi contraseña
                </button>
                <span>
                  ¿No tenés cuenta?{' '}
                  <button onClick={() => setMode('register')} className="underline hover:text-purple-400">
                    Registrate
                  </button>
                </span>
              </>
            )}
            {(mode === 'register' || mode === 'forgot') && (
              <button onClick={() => setMode('login')} className="underline hover:text-purple-400">
                Volver al inicio de sesión
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
