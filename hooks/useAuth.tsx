import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCurrentUser, type CurrentUser } from '@/util/api';

const TOKEN_KEY = 'token';
const CHANGE_EVENT = 'cd-auth-change';

function readToken(): string | null {
  if (typeof window === 'undefined') return null;
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

/** Store or clear the token, and tell every mounted component (and other tabs) about it. */
export function setStoredToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch { /* private mode */ }
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(CHANGE_EVENT));
}

interface AuthValue {
  /** null until mounted on the client, then the token or '' */
  token: string | null;
  ready: boolean;
  user: CurrentUser | null;
  loadingUser: boolean;
  signIn: (token: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const sync = () => setToken(readToken() || '');
    sync();
    setReady(true);
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener('storage', sync); // sign-in/out in another tab
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const { data: user, isLoading } = useQuery({
    queryKey: ['current-user', token],
    queryFn: getCurrentUser,
    enabled: !!token,
    staleTime: 5 * 60_000,
    retry: false,
  });

  const signIn = useCallback((t: string) => setStoredToken(t), []);
  const signOut = useCallback(() => {
    setStoredToken(null);
    queryClient.removeQueries({ queryKey: ['current-user'] });
  }, [queryClient]);

  const value = useMemo<AuthValue>(
    () => ({ token, ready, user: (token && user) || null, loadingUser: !!token && isLoading, signIn, signOut }),
    [token, ready, user, isLoading, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Outside the provider (isolated component tests) this degrades to plain localStorage. */
export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (ctx) return ctx;
  const token = readToken();
  return {
    token: token || '',
    ready: true,
    user: null,
    loadingUser: false,
    signIn: (t) => setStoredToken(t),
    signOut: () => setStoredToken(null),
  };
}
