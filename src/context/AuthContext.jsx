import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined); // undefined = loading

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const user = session?.user ?? null;
  const meta = user?.user_metadata ?? {};
  // Suporte email signup (first_name), Google OAuth (name / full_name), y fallback al email
  const rawName = meta.first_name
    || meta.name?.split(' ')[0]
    || meta.full_name?.split(' ')[0]
    || null;
  const firstName = rawName || null;

  return (
    <AuthContext.Provider value={{ session, user, loading: session === undefined, firstName }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
