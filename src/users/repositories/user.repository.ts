import { UserEntity } from '../entities/user.entity';

export interface IUserRepository {
  findByEmail(email: string): Promise<UserEntity | null>;
  findById(id: string): Promise<UserEntity | null>;
  save(user: UserEntity): Promise<UserEntity>;
}

// Usuario de demostración preconfigurado para acceso inmediato en desarrollo y evaluación
export const DEFAULT_DEMO_USER: UserEntity = {
  id: 'usr-demo-elena-001',
  email: 'elena@centrat.local',
  passwordHash: '$2b$12$XL7tMK5Wh1nbl1wbmheD/.xVlDytaTJCvpHGutlNRjO3dbc/kYHAO', // Password123!
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

// Almacén compartido en memoria para persistir usuarios en la aplicación y sincronizar con localStorage
const sharedUsersStore = new Map<string, UserEntity>();

export function seedDemoUser(store: Map<string, UserEntity>): void {
  if (!store.has(DEFAULT_DEMO_USER.id)) {
    store.set(DEFAULT_DEMO_USER.id, { ...DEFAULT_DEMO_USER });
  }
}

function persistToStorage(store: Map<string, UserEntity>): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const serialized = Array.from(store.values());
      window.localStorage.setItem('centrat_users_db', JSON.stringify(serialized));
    } catch {
      // ignore
    }
  }
}

function hydrateFromStorage(store: Map<string, UserEntity>): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    seedDemoUser(store);
    return;
  }
  try {
    const raw = window.localStorage.getItem('centrat_users_db');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        for (const u of parsed) {
          if (u && typeof u.id === 'string' && typeof u.email === 'string') {
            store.set(u.id, {
              ...u,
              createdAt: new Date(u.createdAt),
              updatedAt: new Date(u.updatedAt),
            });
          }
        }
      }
    }
  } catch {
    // Si no está disponible o falla parseo, continúa puramente en memoria
  }
  // Garantizar que el usuario demo siempre exista
  seedDemoUser(store);
}

// Carga inicial persistente si se ejecuta en navegador o módulo
hydrateFromStorage(sharedUsersStore);

export class InMemoryUserRepository implements IUserRepository {
  private users: Map<string, UserEntity>;

  constructor(customStore?: Map<string, UserEntity>) {
    this.users = customStore || sharedUsersStore;
    if (this.users.size === 0) {
      seedDemoUser(this.users);
    }
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    if (this.users.size === 0) {
      hydrateFromStorage(this.users);
    }
    const normalized = email.trim().toLowerCase();
    for (const user of this.users.values()) {
      if (user.email.trim().toLowerCase() === normalized) {
        return { ...user };
      }
    }
    return null;
  }

  async findById(id: string): Promise<UserEntity | null> {
    if (this.users.size === 0) {
      hydrateFromStorage(this.users);
    }
    const user = this.users.get(id);
    return user ? { ...user } : null;
  }

  async save(user: UserEntity): Promise<UserEntity> {
    this.users.set(user.id, { ...user });
    persistToStorage(this.users);
    return { ...user };
  }

  static clear(): void {
    sharedUsersStore.clear();
    seedDemoUser(sharedUsersStore);
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem('centrat_users_db');
        persistToStorage(sharedUsersStore);
      } catch {
        // ignore
      }
    }
  }
}

