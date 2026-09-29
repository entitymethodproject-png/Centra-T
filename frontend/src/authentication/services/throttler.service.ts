export class TooManyRequestsError extends Error {
  readonly statusCode = 429;
  readonly retryAfterSeconds: number;

  constructor(retryAfterSeconds = 900) {
    super('Demasiados intentos fallidos. Bloqueado temporalmente durante 15 minutos');
    this.name = 'TooManyRequestsError';
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

interface ThrottleRecord {
  failedAttempts: number;
  blockedUntil?: number;
}

export class ThrottlerService {
  private static readonly MAX_FAILED_ATTEMPTS = 5;
  private static readonly BLOCK_WINDOW_MS = 15 * 60 * 1000; // 15 minutos

  private records = new Map<string, ThrottleRecord>();

  checkBlocked(key: string): void {
    const record = this.records.get(key);
    if (!record || !record.blockedUntil) return;

    const now = Date.now();
    if (now < record.blockedUntil) {
      const remainingSeconds = Math.ceil((record.blockedUntil - now) / 1000);
      throw new TooManyRequestsError(remainingSeconds);
    } else {
      // Bloqueo expirado
      this.records.delete(key);
    }
  }

  recordFailure(key: string): void {
    const record = this.records.get(key) || { failedAttempts: 0 };
    record.failedAttempts += 1;

    if (record.failedAttempts >= ThrottlerService.MAX_FAILED_ATTEMPTS) {
      record.blockedUntil = Date.now() + ThrottlerService.BLOCK_WINDOW_MS;
    }

    this.records.set(key, record);
  }

  recordSuccess(key: string): void {
    this.records.delete(key);
  }

  getFailedAttempts(key: string): number {
    return this.records.get(key)?.failedAttempts || 0;
  }
}
