import '@testing-library/jest-dom/vitest';
import { beforeEach } from 'vitest';
import { InMemoryUserRepository } from '../users/repositories/user.repository';

beforeEach(() => {
  InMemoryUserRepository.clear();
  if (typeof window !== 'undefined') {
    window.localStorage?.clear();
    window.sessionStorage?.clear();
  }
});
