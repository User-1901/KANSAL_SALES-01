export interface ServerAppError {
  message: string;
  statusCode: number;
  code?: string;
}

export function parseSupabaseServerError(error: unknown, fallbackMessage = 'Database service error'): ServerAppError {
  if (!error) return { message: fallbackMessage, statusCode: 500 };

  if (typeof error === 'object' && error !== null) {
    const errObj = error as Record<string, unknown>;
    const code = typeof errObj.code === 'string' ? errObj.code : undefined;
    const rawMessage = typeof errObj.message === 'string' ? errObj.message : fallbackMessage;

    // Log complete error internally for server debugging
    console.error('[Supabase Server Operation Error]:', error);

    // Map common PostgreSQL error codes to standard HTTP status codes
    if (code === '23505') {
      // Unique violation
      return { message: 'A record with this information already exists.', statusCode: 409, code };
    } else if (code === '23503') {
      // Foreign key violation
      return { message: 'Referenced entity does not exist.', statusCode: 400, code };
    } else if (code === 'PGRST116') {
      // Row not found
      return { message: 'Resource not found.', statusCode: 404, code };
    }

    return { message: rawMessage, statusCode: 500, code };
  }

  return { message: fallbackMessage, statusCode: 500 };
}
