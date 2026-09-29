import { ShoppingItem } from '../entities/shopping-item.entity';

export interface IShoppingRepository {
  save(item: ShoppingItem): Promise<ShoppingItem>;
  findAllByUser(userId: string): Promise<ShoppingItem[]>;
  findById(userId: string, id: string): Promise<ShoppingItem | null>;
  delete(userId: string, id: string): Promise<void>;
  bulkSchedulePending(userId: string, fechaProgramada: Date): Promise<ShoppingItem[]>;
  clear(): void;
}

export class InMemoryShoppingRepository implements IShoppingRepository {
  private static store: Map<string, ShoppingItem> = new Map();

  async save(item: ShoppingItem): Promise<ShoppingItem> {
    InMemoryShoppingRepository.store.set(item.id, { ...item });
    return { ...item };
  }

  async findAllByUser(userId: string): Promise<ShoppingItem[]> {
    const list: ShoppingItem[] = [];
    for (const item of InMemoryShoppingRepository.store.values()) {
      if (item.userId === userId) {
        list.push({ ...item });
      }
    }
    return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findById(userId: string, id: string): Promise<ShoppingItem | null> {
    const item = InMemoryShoppingRepository.store.get(id);
    if (!item || item.userId !== userId) {
      return null;
    }
    return { ...item };
  }

  async delete(userId: string, id: string): Promise<void> {
    const item = InMemoryShoppingRepository.store.get(id);
    if (item && item.userId === userId) {
      InMemoryShoppingRepository.store.delete(id);
    }
  }

  async bulkSchedulePending(userId: string, fechaProgramada: Date): Promise<ShoppingItem[]> {
    const updatedItems: ShoppingItem[] = [];
    for (const [id, item] of InMemoryShoppingRepository.store.entries()) {
      if (item.userId === userId && !item.comprado) {
        const updated: ShoppingItem = {
          ...item,
          fechaProgramada: new Date(fechaProgramada),
          updatedAt: new Date(),
        };
        InMemoryShoppingRepository.store.set(id, updated);
        updatedItems.push({ ...updated });
      }
    }
    return updatedItems;
  }

  clear(): void {
    InMemoryShoppingRepository.store.clear();
  }
}
