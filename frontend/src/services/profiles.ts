import { supabase } from '../lib/supabase';
import type { Profile } from '../types/database';
import { AVATARS_BUCKET } from '../constants/storage';

export const profilesService = {
  /**
   * Fetch profile for current authenticated user
   */
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * Update profile information
   */
  async updateProfile(userId: string, updates: Partial<Pick<Profile, 'full_name' | 'phone' | 'avatar_url'>>): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Upload user avatar image to Supabase Storage
   */
  async uploadAvatar(userId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(AVATARS_BUCKET)
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(filePath);
    return data.publicUrl;
  },
};
