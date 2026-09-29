import { Item, ItemModulo } from '../entities/item.entity';

export interface IItemRepository {
  save(item: Item): Promise<Item>;
  findById(userId: string, id: string): Promise<Item | null>;
  findAllByUser(userId: string, modulo?: ItemModulo): Promise<Item[]>;
  delete(userId: string, id: string): Promise<boolean>;
  bulkSchedulePending(userId: string, modulo: ItemModulo, fechaProgramada: Date): Promise<Item[]>;
  clear(): void;
}

const sharedItemsStore = new Map<string, Item>();

function hydrateFromStorage(store: Map<string, Item>): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const raw =
      window.localStorage.getItem('centrat_items_db') ||
      window.localStorage.getItem('centrat_tasks_db');
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      for (const t of parsed) {
        if (t && typeof t.id === 'string' && typeof t.userId === 'string') {
          store.set(t.id, {
            ...t,
            modulo: t.modulo || 'tasks',
            fechaProgramada: t.fechaProgramada ? new Date(t.fechaProgramada) : null,
            createdAt: new Date(t.createdAt),
            updatedAt: new Date(t.updatedAt),
          });
        }
      }
    }
  } catch {
    // Puramente en memoria ante error de parseo
  }
}

hydrateFromStorage(sharedItemsStore);

export class InMemoryItemRepository implements IItemRepository {
  private items: Map<string, Item>;

  constructor(customStore?: Map<string, Item>) {
    this.items = customStore || sharedItemsStore;
  }

  async save(item: Item): Promise<Item> {
    this.items.set(item.id, { ...item });
    this.persist();
    return { ...item };
  }

  async findById(userId: string, id: string): Promise<Item | null> {
    const item = this.items.get(id);
    if (!item || item.userId !== userId) {
      return null;
    }
    return { ...item };
  }

  async findAllByUser(userId: string, modulo?: ItemModulo): Promise<Item[]> {
    const result: Item[] = [];
    for (const item of this.items.values()) {
      if (item.userId === userId && (!modulo || item.modulo === modulo)) {
        result.push({ ...item });
      }
    }
    return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async delete(userId: string, id: string): Promise<boolean> {
    const item = this.items.get(id);
    if (!item || item.userId !== userId) {
      return false;
    }
    const removed = this.items.delete(id);
    if (removed) {
      this.persist();
    }
    return removed;
  }

  async bulkSchedulePending(
    userId: string,
    modulo: ItemModulo = 'shopping',
    fechaProgramada: Date
  ): Promise<Item[]> {
    const updatedItems: Item[] = [];
    for (const [id, item] of this.items.entries()) {
      if (item.userId === userId && item.modulo === modulo && !item.completado && !item.comprado) {
        const updated: Item = {
          ...item,
          fechaProgramada: new Date(fechaProgramada),
          updatedAt: new Date(),
        };
        this.items.set(id, updated);
        updatedItems.push({ ...updated });
      }
    }
    this.persist();
    return updatedItems;
  }

  private persist(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const arr = Array.from(this.items.values());
        window.localStorage.setItem('centrat_items_db', JSON.stringify(arr));
        window.localStorage.setItem('centrat_tasks_db', JSON.stringify(arr));
      } catch {
        // Ignorar excepciones de cuota
      }
    }
  }

  clear(): void {
    this.items.clear();
    sharedItemsStore.clear();
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem('centrat_items_db');
        window.localStorage.removeItem('centrat_tasks_db');
      } catch {
        // Ignorar excepciones de cuota
      }
    }
  }

  static clear(): void {
    sharedItemsStore.clear();
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem('centrat_items_db');
        window.localStorage.removeItem('centrat_tasks_db');
      } catch {
        // Ignorar excepciones de cuota
      }
    }
  }
}

// Clases derivadas como tipos y constructores reales para TypeScript
export class InMemoryTaskRepository extends InMemoryItemRepository {}
export class InMemoryShoppingRepository extends InMemoryItemRepository {}
export class InMemoryCleaningRepository extends InMemoryItemRepository {}

export type ITaskRepository = IItemRepository;
export type IShoppingRepository = IItemRepository;
export type ICleaningRepository = IItemRepository;
