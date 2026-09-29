import { CleaningItem } from '../entities/cleaning-item.entity';

export interface ICleaningRepository {
  save(item: CleaningItem): Promise<CleaningItem>;
  findAllByUser(userId: string): Promise<CleaningItem[]>;
  findById(userId: string, id: string): Promise<CleaningItem | null>;
  delete(userId: string, id: string): Promise<boolean>;
}

export class InMemoryCleaningRepository implements ICleaningRepository {
  private items: Map<string, CleaningItem> = new Map();

  async save(item: CleaningItem): Promise<CleaningItem> {
    this.items.set(item.id, { ...item });
    return { ...item };
  }

  async findAllByUser(userId: string): Promise<CleaningItem[]> {
    return Array.from(this.items.values()).filter((item) => item.userId === userId);
  }

  async findById(userId: string, id: string): Promise<CleaningItem | null> {
    const item = this.items.get(id);
    if (!item || item.userId !== userId) {
      return null;
    }
    return { ...item };
  }

  async delete(userId: string, id: string): Promise<boolean> {
    const item = this.items.get(id);
    if (!item || item.userId !== userId) {
      return false;
    }
    return this.items.delete(id);
  }

  clear(): void {
    this.items.clear();
  }
}
