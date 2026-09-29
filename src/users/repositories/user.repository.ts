import { UserEntity } from '../entities/user.entity';

export interface IUserRepository {
  findByEmail(email: string): Promise<UserEntity | null>;
  findById(id: string): Promise<UserEntity | null>;
  save(user: UserEntity): Promise<UserEntity>;
}

// Almacén compartido en memoria para persistir usuarios en la aplicación y sincronizar con localStorage
const sharedUsersStore = new Map<string, UserEntity>();

function hydrateFromStorage(store: Map<string, UserEntity>): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const raw = window.localStorage.getItem('centrat_users_db');
    if (!raw) return;
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
  } catch {
    // Si no está disponible o falla parseo, continúa puramente en memoria
  }
}

// Carga inicial persistente si se ejecuta en navegador
hydrateFromStorage(sharedUsersStore);

export class InMemoryUserRepository implements IUserRepository {
  private users: Map<string, UserEntity>;

  constructor(customStore?: Map<string, UserEntity>) {
    this.users = customStore || sharedUsersStore;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const normalized = email.trim().toLowerCase();
    for (const user of this.users.values()) {
      if (user.email.trim().toLowerCase() === normalized) {
        return { ...user };
      }
    }
    return null;
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = this.users.get(id);
    return user ? { ...user } : null;
  }

  async save(user: UserEntity): Promise<UserEntity> {
    this.users.set(user.id, { ...user });
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const serialized = Array.from(this.users.values());
        window.localStorage.setItem('centrat_users_db', JSON.stringify(serialized));
      } catch {
        // ignore
      }
    }
    return { ...user };
  }

  static clear(): void {
    sharedUsersStore.clear();
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem('centrat_users_db');
      } catch {
        // ignore
      }
    }
  }
}
