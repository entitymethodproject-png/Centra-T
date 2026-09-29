import '@testing-library/jest-dom/vitest';
import { beforeEach } from 'vitest';
import { InMemoryUserRepository } from '../users/repositories/user.repository';
import { InMemoryTaskRepository } from '../tasks/repositories/task.repository';

beforeEach(() => {
  InMemoryUserRepository.clear();
  InMemoryTaskRepository.clear();
  if (typeof window !== 'undefined') {
    window.localStorage?.clear();
    window.sessionStorage?.clear();
  }
});
