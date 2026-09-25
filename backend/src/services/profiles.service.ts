import { supabaseAdmin } from '../lib/supabase.js';
import type { Profile } from '../types/database.js';
import { parseSupabaseServerError } from '../utils/supabaseError.js';

export const profilesServerService = {
  /**
   * Get user profile by ID
   */
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw parseSupabaseServerError(error, 'Failed to fetch user profile');
    return data;
  },

  /**
   * Check if a user has admin role (Server-side validation)
   */
  async isAdmin(userId: string): Promise<boolean> {
    const profile = await this.getProfile(userId);
    return profile?.role === 'admin' || profile?.role === 'super_admin';
  },

  /**
   * Update user role (Super Admin / Server operation)
   */
  async updateUserRole(userId: string, role: Profile['role']): Promise<Profile> {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw parseSupabaseServerError(error, 'Failed to update user role');
    return data;
  },
};
