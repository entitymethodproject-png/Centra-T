import { UserEntity } from '../entities/user.entity';

export interface IUserRepository {
  findByEmail(email: string): Promise<UserEntity | null>;
  findById(id: string): Promise<UserEntity | null>;
  save(user: UserEntity): Promise<UserEntity>;
}

export class InMemoryUserRepository implements IUserRepository {
  private users: Map<string, UserEntity> = new Map();

  async findByEmail(email: string): Promise<UserEntity | null> {
    const normalized = email.trim().toLowerCase();
    for (const user of this.users.values()) {
      if (user.email === normalized) {
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
    return { ...user };
  }
}
