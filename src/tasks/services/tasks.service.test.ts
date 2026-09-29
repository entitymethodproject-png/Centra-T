import { describe, it, expect, beforeEach } from 'vitest';
import { TasksService } from './tasks.service';
import {
  InvalidTaskTitleError,
  InvalidTaskDescriptionError,
  InvalidTaskPriorityError,
  TaskNotFoundError,
} from '../entities/task-item.entity';

describe('TasksService (Motor de Dominio y Decisión 2B)', () => {
  let tasksService: TasksService;
  const USER_A = 'usr-tenant-a';
  const USER_B = 'usr-tenant-b';

  beforeEach(() => {
    tasksService = new TasksService();
  });

  it('debe crear una tarea exitosamente con valores por defecto y sanitización', async () => {
    const task = await tasksService.createTask(USER_A, {
      titulo: '  Revisar instalación eléctrica  ',
    });

    expect(task.id).toBeDefined();
    expect(task.userId).toBe(USER_A);
    expect(task.modulo).toBe('tasks');
    expect(task.titulo).toBe('Revisar instalación eléctrica');
    expect(task.descripcion).toBe('');
    expect(task.prioridad).toBe('media');
    expect(task.completado).toBe(false);
    expect(task.fechaProgramada).toBeNull();
  });

  it('debe rechazar títulos vacíos o con solo espacios (400)', async () => {
    await expect(tasksService.createTask(USER_A, { titulo: '' })).rejects.toThrow(InvalidTaskTitleError);
    await expect(tasksService.createTask(USER_A, { titulo: '    ' })).rejects.toThrow(InvalidTaskTitleError);
  });

  it('debe rechazar títulos que superen los 120 caracteres (Decisión 2B)', async () => {
    const title120 = 'a'.repeat(120);
    const title121 = 'a'.repeat(121);

    const validTask = await tasksService.createTask(USER_A, { titulo: title120 });
    expect(validTask.titulo.length).toBe(120);

    await expect(tasksService.createTask(USER_A, { titulo: title121 })).rejects.toThrow(InvalidTaskTitleError);
  });

  it('debe rechazar descripciones que superen los 1000 caracteres (Decisión 2B)', async () => {
    const desc1000 = 'b'.repeat(1000);
    const desc1001 = 'b'.repeat(1001);

    const validTask = await tasksService.createTask(USER_A, {
      titulo: 'Tarea con descripción límite',
      descripcion: desc1000,
    });
    expect(validTask.descripcion.length).toBe(1000);

    await expect(
      tasksService.createTask(USER_A, {
        titulo: 'Tarea inválida',
        descripcion: desc1001,
      })
    ).rejects.toThrow(InvalidTaskDescriptionError);
  });

  it('debe rechazar prioridades desconocidas (400)', async () => {
    await expect(
      tasksService.createTask(USER_A, {
        titulo: 'Tarea prioridad rota',
        prioridad: 'urgente' as any,
      })
    ).rejects.toThrow(InvalidTaskPriorityError);
  });

  it('debe garantizar aislamiento multi-tenant en findAllByUser', async () => {
    await tasksService.createTask(USER_A, { titulo: 'Tarea A-1' });
    await tasksService.createTask(USER_A, { titulo: 'Tarea A-2' });
    await tasksService.createTask(USER_B, { titulo: 'Tarea B-1' });

    const tasksA = await tasksService.findAllByUser(USER_A);
    const tasksB = await tasksService.findAllByUser(USER_B);

    expect(tasksA.length).toBe(2);
    expect(tasksB.length).toBe(1);
    expect(tasksA.every((t) => t.userId === USER_A)).toBe(true);
    expect(tasksB[0].titulo).toBe('Tarea B-1');
  });

  it('debe rechazar acceso con 404 si un usuario intenta consultar o mutar una tarea ajena', async () => {
    const taskA = await tasksService.createTask(USER_A, { titulo: 'Secreto de A' });

    // Usuario B intenta leer la tarea de A
    await expect(tasksService.findById(USER_B, taskA.id)).rejects.toThrow(TaskNotFoundError);

    // Usuario B intenta hacer toggle de la tarea de A
    await expect(tasksService.toggleTaskStatus(USER_B, taskA.id)).rejects.toThrow(TaskNotFoundError);

    // Usuario B intenta editar la tarea de A
    await expect(tasksService.updateTask(USER_B, taskA.id, { titulo: 'Hack' })).rejects.toThrow(TaskNotFoundError);

    // Usuario B intenta borrar la tarea de A
    await expect(tasksService.deleteTask(USER_B, taskA.id)).rejects.toThrow(TaskNotFoundError);
  });

  it('debe alternar atómicamente el estado completado con toggleTaskStatus', async () => {
    const task = await tasksService.createTask(USER_A, { titulo: 'Comprar bombilla' });
    expect(task.completado).toBe(false);

    const completed = await tasksService.toggleTaskStatus(USER_A, task.id);
    expect(completed.completado).toBe(true);

    const pendingAgain = await tasksService.toggleTaskStatus(USER_A, task.id);
    expect(pendingAgain.completado).toBe(false);
  });

  it('debe actualizar campos selectivos y eliminar la tarea', async () => {
    const task = await tasksService.createTask(USER_A, { titulo: 'Original', prioridad: 'baja' });

    const updated = await tasksService.updateTask(USER_A, task.id, {
      titulo: 'Modificado',
      prioridad: 'alta',
    });
    expect(updated.titulo).toBe('Modificado');
    expect(updated.prioridad).toBe('alta');

    await tasksService.deleteTask(USER_A, task.id);
    await expect(tasksService.findById(USER_A, task.id)).rejects.toThrow(TaskNotFoundError);
  });
});
