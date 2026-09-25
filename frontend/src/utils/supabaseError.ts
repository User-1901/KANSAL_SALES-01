export interface AppError {
  message: string;
  code?: string;
}

export function handleSupabaseError(error: unknown, fallbackMessage = 'An unexpected error occurred'): AppError {
  if (!error) return { message: fallbackMessage };

  if (typeof error === 'object' && error !== null) {
    const errObj = error as Record<string, unknown>;
    if (typeof errObj.message === 'string') {
      // Avoid exposing sensitive internal database details to users
      const rawMessage = errObj.message;
      if (rawMessage.includes('violates foreign key constraint') || rawMessage.includes('violates unique constraint')) {
        return {
          message: 'The requested operation could not be completed due to a data constraint.',
          code: typeof errObj.code === 'string' ? errObj.code : undefined,
        };
      }
      return {
        message: rawMessage,
        code: typeof errObj.code === 'string' ? errObj.code : undefined,
      };
    }
  }

  return { message: fallbackMessage };
}
