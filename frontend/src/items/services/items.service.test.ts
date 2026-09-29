import { describe, it, expect, beforeEach } from 'vitest';
import { ItemsService } from './items.service';
import { InMemoryItemRepository } from '../repositories/item.repository';
import {
  InvalidItemTitleError,
  InvalidItemDescriptionError,
  InvalidItemPriorityError,
  InvalidScheduleDateError,
  ItemNotFoundError,
} from '../entities/item.entity';

describe('ItemsService (Motor de Dominio Unificado para Tareas, Compras y Limpiezas)', () => {
  let repository: InMemoryItemRepository;
  let service: ItemsService;
  const USER_A = 'usr-tenant-a';
  const USER_B = 'usr-tenant-b';

  beforeEach(() => {
    repository = new InMemoryItemRepository();
    repository.clear();
    service = new ItemsService(repository);
  });

  describe('Creación y Sanitización Polimórfica (tasks, shopping, cleaning)', () => {
    it('debe crear una tarea estándar en tasks con valores por defecto y sanitización', async () => {
      const item = await service.createItem(
        USER_A,
        {
          titulo: '  Revisar instalación eléctrica  ',
        },
        'tasks'
      );

      expect(item.id).toBeDefined();
      expect(item.userId).toBe(USER_A);
      expect(item.modulo).toBe('tasks');
      expect(item.titulo).toBe('Revisar instalación eléctrica');
      expect(item.descripcion).toBe('');
      expect(item.prioridad).toBe('media');
      expect(item.completado).toBe(false);
      expect(item.fechaProgramada).toBeNull();
    });

    it('debe crear un ítem de compra en shopping conservando compatibilidad nombre/titulo', async () => {
      const item = await service.createItem(
        USER_A,
        {
          nombre: 'Leche entera',
          descripcion: 'Pack de 6 botellas',
          prioridad: 'alta',
        },
        'shopping'
      );

      expect(item.modulo).toBe('shopping');
      expect(item.titulo).toBe('Leche entera');
      expect(item.nombre).toBe('Leche entera');
      expect(item.descripcion).toBe('Pack de 6 botellas');
      expect(item.prioridad).toBe('alta');
      expect(item.completado).toBe(false);
      expect(item.comprado).toBe(false);
    });

    it('debe crear un ítem de limpieza en cleaning', async () => {
      const item = await service.createItem(
        USER_A,
        {
          titulo: 'Desinfección de baños',
          prioridad: 'baja',
        },
        'cleaning'
      );

      expect(item.modulo).toBe('cleaning');
      expect(item.titulo).toBe('Desinfección de baños');
      expect(item.prioridad).toBe('baja');
    });
  });

  describe('Validaciones y Reglas Innegociables de Dominio', () => {
    it('debe rechazar títulos vacíos o que solo contengan espacios (400)', async () => {
      await expect(service.createItem(USER_A, { titulo: '' })).rejects.toThrow(
        InvalidItemTitleError
      );
      await expect(service.createItem(USER_A, { titulo: '    ' })).rejects.toThrow(
        InvalidItemTitleError
      );
    });

    it('debe rechazar títulos que superen los 120 caracteres (Decisión 2B)', async () => {
      const title120 = 'a'.repeat(120);
      const title121 = 'a'.repeat(121);

      const validItem = await service.createItem(USER_A, { titulo: title120 });
      expect(validItem.titulo.length).toBe(120);

      await expect(service.createItem(USER_A, { titulo: title121 })).rejects.toThrow(
        InvalidItemTitleError
      );
    });

    it('debe rechazar descripciones que superen los 1000 caracteres (Decisión 2B)', async () => {
      const desc1000 = 'b'.repeat(1000);
      const desc1001 = 'b'.repeat(1001);

      const valid = await service.createItem(USER_A, {
        titulo: 'Ítem válido',
        descripcion: desc1000,
      });
      expect(valid.descripcion.length).toBe(1000);

      await expect(
        service.createItem(USER_A, {
          titulo: 'Ítem inválido',
          descripcion: desc1001,
        })
      ).rejects.toThrow(InvalidItemDescriptionError);
    });

    it('debe validar y normalizar la prioridad (alta, media, baja)', async () => {
      const item = await service.createItem(USER_A, {
        titulo: 'Revisar filtros',
        prioridad: 'alta',
      });
      expect(item.prioridad).toBe('alta');

      await expect(
        service.createItem(USER_A, {
          titulo: 'Revisar filtros',
          prioridad: 'urgente' as any,
        })
      ).rejects.toThrow(InvalidItemPriorityError);
    });

    it('debe rechazar fechas pasadas anteriores al día actual (Decisión 1A)', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 2);

      await expect(
        service.createItem(USER_A, {
          titulo: 'Ítem con fecha pasada',
          fechaProgramada: pastDate,
        })
      ).rejects.toThrow(InvalidScheduleDateError);
    });

    it('debe aceptar fechas futuras u hoy como fecha programada válida', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);

      const item = await service.createItem(USER_A, {
        titulo: 'Ítem futuro',
        fechaProgramada: futureDate,
      });
      expect(item.fechaProgramada).not.toBeNull();
    });
  });

  describe('Aislamiento Multitenant por Usuario (Tenant Isolation)', () => {
    it('debe aislar los ítems de USER_A frente a USER_B en findAllByUser', async () => {
      await service.createItem(USER_A, { titulo: 'Tarea de A' });
      await service.createItem(USER_B, { titulo: 'Tarea de B' });

      const itemsA = await service.findAllByUser(USER_A);
      const itemsB = await service.findAllByUser(USER_B);

      expect(itemsA).toHaveLength(1);
      expect(itemsA[0].titulo).toBe('Tarea de A');

      expect(itemsB).toHaveLength(1);
      expect(itemsB[0].titulo).toBe('Tarea de B');
    });

    it('debe impedir que USER_B acceda o modifique ítems de USER_A', async () => {
      const itemA = await service.createItem(USER_A, { titulo: 'Secreto de A' });

      await expect(service.findById(USER_B, itemA.id)).rejects.toThrow(ItemNotFoundError);
      await expect(
        service.updateItem(USER_B, itemA.id, { titulo: 'Hackeado' })
      ).rejects.toThrow(ItemNotFoundError);
      await expect(service.deleteItem(USER_B, itemA.id)).rejects.toThrow(ItemNotFoundError);
    });
  });

  describe('Actualizaciones, Conmutación de Estado y Eliminación', () => {
    it('debe conmutar el estado completado/comprado de forma idempotente', async () => {
      const item = await service.createItem(USER_A, { titulo: 'Lavar cortinas' });
      expect(item.completado).toBe(false);

      const toggled1 = await service.toggleItemStatus(USER_A, item.id);
      expect(toggled1.completado).toBe(true);

      const toggled2 = await service.toggleItemStatus(USER_A, item.id);
      expect(toggled2.completado).toBe(false);
    });

    it('debe actualizar la descripción de un ítem correctamente', async () => {
      const item = await service.createItem(USER_A, { titulo: 'Aspirar alfombra' });
      const updated = await service.updateItem(USER_A, item.id, {
        descripcion: 'Usar boquilla estrecha',
      });

      expect(updated.descripcion).toBe('Usar boquilla estrecha');
    });

    it('debe eliminar un ítem existente y confirmar su desaparición', async () => {
      const item = await service.createItem(USER_A, { titulo: 'Tarea efímera' });
      await service.deleteItem(USER_A, item.id);

      await expect(service.findById(USER_A, item.id)).rejects.toThrow(ItemNotFoundError);
    });
  });

  describe('Asignación Masiva de Compras al Calendario (Caso Forense VV-006)', () => {
    it('debe asignar en bloque fecha programada a compras pendientes no programadas', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);

      await service.createItem(USER_A, { titulo: 'Pan' }, 'shopping');
      await service.createItem(USER_A, { titulo: 'Fruta' }, 'shopping');
      const yaCompletada = await service.createItem(USER_A, { titulo: 'Agua' }, 'shopping');
      await service.toggleItemStatus(USER_A, yaCompletada.id);

      const result = await service.bulkSchedule(
        USER_A,
        { fechaProgramada: futureDate },
        'shopping'
      );

      expect(result.scheduledCount).toBe(2);
      expect(result.items).toHaveLength(2);
      expect(result.items.every((i) => i.fechaProgramada !== null)).toBe(true);
    });
  });
});
