import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../services/supabase';

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

export default function AuthScreen({ isDark }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const dark = isDark;

  async function handleOAuth() {
    setError('');
    setOauthLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: REDIRECT_URL },
    });
    if (error) setError(error.message);
    setOauthLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setInfo('');
    setLoading(true);
    try {
      if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: REDIRECT_URL });
        if (error) throw error;
        setInfo('Te enviamos un email para restablecer tu contraseña.');
      } else if (mode === 'register') {
        if (password !== confirmPassword) throw new Error('Las contraseñas no coinciden.');
        if (!firstName.trim()) throw new Error('El nombre es obligatorio.');
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { first_name: firstName.trim(), last_name: lastName.trim(), full_name: `${firstName.trim()} ${lastName.trim()}`.trim() } },
        });
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

  const fieldCls = `w-full px-4 py-3.5 text-sm font-medium outline-none transition-colors ${
    dark
      ? 'bg-transparent text-white placeholder:text-slate-500'
      : 'bg-transparent text-slate-800 placeholder:text-slate-400'
  }`;

  const dividerColor = dark ? 'border-white/10' : 'border-slate-200';
  const cardBg = dark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200';

  const titles = {
    login: 'Iniciar sesión',
    register: 'Crear cuenta',
    forgot: 'Recuperar contraseña',
  };

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center px-6 ${dark ? 'bg-[#050505] text-slate-200' : 'bg-[#f8fafc] text-slate-800'}`}>
      {/* Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm flex flex-col gap-8">

        {/* Logo */}
        <div className="flex flex-col items-center gap-4 pt-4">
          <img
            src="/header-logo.png"
            alt="MyProgress"
            className="w-16 h-16 rounded-2xl object-cover drop-shadow-lg"
          />
          <div className="text-center">
            <h1 className="text-[1.6rem] font-black italic tracking-tight">
              <span className="text-purple-500">My</span>
              <span className={dark ? 'text-slate-100' : 'text-slate-800'}>Progress</span>
            </h1>
          </div>
        </div>

        {/* Title */}
        <div className="text-center">
          <h2 className={`text-2xl font-black ${dark ? 'text-white' : 'text-slate-900'}`}>
            {titles[mode]}
          </h2>
          {mode === 'login' && (
            <p className={`text-sm mt-1 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
              Ingresá tus datos para continuar
            </p>
          )}
        </div>

        {/* Form card */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Name fields (register only) */}
          {mode === 'register' && (
            <div className={`flex gap-3`}>
              <div className={`flex-1 rounded-2xl border overflow-hidden ${cardBg}`}>
                <input
                  type="text"
                  placeholder="Nombre *"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  required
                  className={fieldCls}
                />
              </div>
              <div className={`flex-1 rounded-2xl border overflow-hidden ${cardBg}`}>
                <input
                  type="text"
                  placeholder="Apellido"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className={fieldCls}
                />
              </div>
            </div>
          )}

          {/* Email + Password card */}
          <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
            {/* Email */}
            <div>
              <label className={`block px-4 pt-3 text-[10px] font-bold tracking-widest uppercase ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                Email
              </label>
              <input
                type="email"
                placeholder="nombre@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className={`${fieldCls} pt-0.5 pb-3`}
              />
            </div>

            {/* Divider */}
            {mode !== 'forgot' && <div className={`border-t ${dividerColor}`} />}

            {/* Password */}
            {mode !== 'forgot' && (
              <div className="relative">
                <label className={`block px-4 pt-3 text-[10px] font-bold tracking-widest uppercase ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Contraseña
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className={`${fieldCls} pt-0.5 pb-3 pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className={`absolute right-4 top-1/2 -translate-y-1/4 ${dark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            )}

            {/* Confirm password (register only) */}
            {mode === 'register' && (
              <>
                <div className={`border-t ${dividerColor}`} />
                <div className="relative">
                  <label className={`block px-4 pt-3 text-[10px] font-bold tracking-widest uppercase ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Repetir contraseña
                  </label>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    className={`${fieldCls} pt-0.5 pb-3 pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    className={`absolute right-4 top-1/2 -translate-y-1/4 ${dark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Forgot password link */}
          {mode === 'login' && (
            <div className="text-right -mt-2">
              <button type="button" onClick={() => setMode('forgot')} className={`text-xs font-semibold ${dark ? 'text-slate-400 hover:text-purple-400' : 'text-slate-500 hover:text-purple-600'}`}>
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}

          {error && <p className="text-red-400 text-sm font-medium">{error}</p>}
          {info && <p className="text-green-400 text-sm font-medium">{info}</p>}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-bold text-sm transition-colors disabled:opacity-50 shadow-lg shadow-purple-600/25"
          >
            {loading ? 'Cargando...' : mode === 'login' ? 'Iniciar sesión' : mode === 'register' ? 'Crear cuenta' : 'Enviar email'}
          </button>
        </form>

        {/* Register / Back links */}
        <div className={`text-center text-sm ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
          {mode === 'login' && (
            <span>
              ¿No tenés cuenta?{' '}
              <button onClick={() => setMode('register')} className="font-bold text-purple-500 hover:text-purple-400">
                Registrate
              </button>
            </span>
          )}
          {(mode === 'register' || mode === 'forgot') && (
            <button onClick={() => setMode('login')} className="font-bold text-purple-500 hover:text-purple-400">
              ← Volver al inicio de sesión
            </button>
          )}
        </div>

        {/* Divider */}
        {mode !== 'forgot' && (
          <>
            <div className="flex items-center gap-3 -my-2">
              <div className={`flex-1 border-t ${dividerColor}`} />
              <span className={`text-xs font-medium ${dark ? 'text-slate-500' : 'text-slate-400'}`}>o continuá con</span>
              <div className={`flex-1 border-t ${dividerColor}`} />
            </div>

            {/* Google */}
            <button
              type="button"
              disabled={oauthLoading}
              onClick={handleOAuth}
              className={`w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl border text-sm font-semibold transition-colors disabled:opacity-50 ${
                dark ? 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {oauthLoading
                ? <div className="w-4 h-4 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                : <GoogleIcon />}
              Continuar con Google
            </button>
          </>
        )}

      </div>
    </div>
  );
}
