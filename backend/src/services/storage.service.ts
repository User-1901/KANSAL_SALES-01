import { supabaseAdmin } from '../lib/supabase.js';
import { parseSupabaseServerError } from '../utils/supabaseError.js';

export const storageServerService = {
  /**
   * Upload a file buffer directly to a Supabase Storage bucket (Server-side)
   */
  async uploadFile(
    bucket: string,
    filePath: string,
    fileBuffer: Buffer,
    contentType: string
  ): Promise<string> {
    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (error) throw parseSupabaseServerError(error, `Failed to upload file to ${bucket}`);

    const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  },

  /**
   * Delete a file from a Supabase Storage bucket
   */
  async deleteFile(bucket: string, filePath: string): Promise<void> {
    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .remove([filePath]);

    if (error) throw parseSupabaseServerError(error, `Failed to delete file from ${bucket}`);
  },
};
