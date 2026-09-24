import { Prisma } from "@prisma/client";

const RETRYABLE_CODES = new Set(["P1001", 
  "P1002", 
  "P1017", 
  "P2024", 
  "P2028"]);

function isRetryableDatabaseError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return RETRYABLE_CODES.has(error.code);
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }

  const message = error instanceof Error 
    ? error.message 
    : String(error);
  return /connection|closed|timeout|can't reach database|server has closed/i.test(message);
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, 
    ms));
}

export async function withDatabaseRetry<T>(
  operation: () => Promise<T>,
  options: { retries?: number; delayMs?: number } = {},
): Promise<T> {
  const retries = options.retries 
    ?? 1;
  const delayMs = options.delayMs 
    ?? 350;

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (!isRetryableDatabaseError(error) 
        || attempt === retries) throw error;
      await delay(delayMs * (attempt + 1));
    }
  }

  throw lastError;
}

export async function safePublicQuery<T>(
  operation: () => Promise<T>,
  fallback: T,
  label: string,
): Promise<T> {
  try {
    return await withDatabaseRetry(operation, 
      { retries: 1, 
      delayMs: 450 });
  } catch (error) {
    console.error(`[database:${label}]`, 
      error);
    return fallback;
  }
}
