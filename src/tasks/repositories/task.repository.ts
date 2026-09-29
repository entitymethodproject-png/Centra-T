import { TaskItem } from '../entities/task-item.entity';

export interface ITaskRepository {
  save(task: TaskItem): Promise<TaskItem>;
  findById(userId: string, id: string): Promise<TaskItem | null>;
  findAllByUser(userId: string): Promise<TaskItem[]>;
  delete(userId: string, id: string): Promise<boolean>;
}

const sharedTasksStore = new Map<string, TaskItem>();

function hydrateFromStorage(store: Map<string, TaskItem>): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const raw = window.localStorage.getItem('centrat_tasks_db');
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      for (const t of parsed) {
        if (t && typeof t.id === 'string' && typeof t.userId === 'string') {
          store.set(t.id, {
            ...t,
            fechaProgramada: t.fechaProgramada ? new Date(t.fechaProgramada) : null,
            createdAt: new Date(t.createdAt),
            updatedAt: new Date(t.updatedAt),
          });
        }
      }
    }
  } catch {
    // Si no está disponible o falla parseo, continúa puramente en memoria
  }
}

// Carga inicial persistente si se ejecuta en navegador
hydrateFromStorage(sharedTasksStore);

export class InMemoryTaskRepository implements ITaskRepository {
  private tasks: Map<string, TaskItem>;

  constructor(customStore?: Map<string, TaskItem>) {
    this.tasks = customStore || sharedTasksStore;
  }

  async save(task: TaskItem): Promise<TaskItem> {
    this.tasks.set(task.id, { ...task });
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const arr = Array.from(this.tasks.values());
        window.localStorage.setItem('centrat_tasks_db', JSON.stringify(arr));
      } catch {
        // ignore
      }
    }
    return { ...task };
  }

  async findById(userId: string, id: string): Promise<TaskItem | null> {
    const task = this.tasks.get(id);
    if (!task || task.userId !== userId) {
      return null;
    }
    return { ...task };
  }

  async findAllByUser(userId: string): Promise<TaskItem[]> {
    const result: TaskItem[] = [];
    for (const task of this.tasks.values()) {
      if (task.userId === userId) {
        result.push({ ...task });
      }
    }
    return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async delete(userId: string, id: string): Promise<boolean> {
    const task = this.tasks.get(id);
    if (!task || task.userId !== userId) {
      return false;
    }
    const removed = this.tasks.delete(id);
    if (removed && typeof window !== 'undefined' && window.localStorage) {
      try {
        const arr = Array.from(this.tasks.values());
        window.localStorage.setItem('centrat_tasks_db', JSON.stringify(arr));
      } catch {
        // ignore
      }
    }
    return removed;
  }

  static clear(): void {
    sharedTasksStore.clear();
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem('centrat_tasks_db');
      } catch {
        // ignore
      }
    }
  }
}
