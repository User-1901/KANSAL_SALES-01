import { supabase } from '../lib/supabase';
import type { User as SupabaseUser, Session, AuthChangeEvent } from '@supabase/supabase-js';
import type { Profile } from '../types/database';

export interface AuthStateResponse {
  user: SupabaseUser | null;
  profile: Profile | null;
  session: Session | null;
}

export const authService = {
  /**
   * Register a new user with Supabase Auth
   */
  async signUp(email: string, password: string, displayName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });
    if (error) throw error;
    return data;
  },

  /**
   * Log in user with Supabase Auth
   */
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  /**
   * Log out user from Supabase Auth
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Get current active user from Supabase Auth
   */
  async getCurrentUser(): Promise<SupabaseUser | null> {
    const { data } = await supabase.auth.getUser();
    return data.user;
  },

  /**
   * Get current auth session
   */
  async getSession(): Promise<Session | null> {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  /**
   * Listen to auth state changes (sign in, sign out, token refresh)
   */
  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};
