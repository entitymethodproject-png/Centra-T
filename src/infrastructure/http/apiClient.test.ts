import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiClient, formatEmpathicError, EmpathicError } from './apiClient';

describe('apiClient e Interceptor de Errores Empáticos (RV-A08 / FIA-A08.02)', () => {
  describe('formatEmpathicError (Estructura de 3 componentes)', () => {
    it('formatea error 500 con los 3 componentes canónicos (qué, por qué, qué hacer)', () => {
      const msg = formatEmpathicError(500);

      expect(msg.what).toBe('No se pudo completar la operación en el servidor.');
      expect(msg.why).toBe('Ha ocurrido un fallo temporal en los servicios centrales.');
      expect(msg.action).toBe(
        'Hemos revertido el cambio automáticamente para proteger tus datos. Por favor, inténtalo de nuevo en unos instantes.'
      );
      expect(msg.fullMessage).toContain(msg.what);
      expect(msg.fullMessage).toContain(msg.why);
      expect(msg.fullMessage).toContain(msg.action);
    });

    it('formatea error 500 con prefijo de contexto personalizado si se proporciona', () => {
      const msg = formatEmpathicError(500, 'Actualización de tarea');

      expect(msg.what).toBe('Actualización de tarea: No se pudo completar la operación en el servidor.');
      expect(msg.why).toBe('Ha ocurrido un fallo temporal en los servicios centrales.');
      expect(msg.action).toContain('Hemos revertido el cambio automáticamente');
    });

    it('formatea error 400 con los 3 componentes canónicos', () => {
      const msg = formatEmpathicError(400);

      expect(msg.what).toBe('Los datos enviados no son válidos.');
      expect(msg.why).toBe('Alguno de los campos no cumple con las restricciones requeridas.');
      expect(msg.action).toBe('Por favor, revisa la información introducida e inténtalo nuevamente.');
    });

    it('formatea error 401 y 403 con mensaje de autenticación/permisos', () => {
      const msg401 = formatEmpathicError(401);
      const msg403 = formatEmpathicError(403);

      expect(msg401.what).toBe('No tienes autorización para realizar esta acción.');
      expect(msg401.why).toBe('Tu sesión ha caducado o no cuentas con los permisos necesarios.');
      expect(msg401.action).toBe('Por favor, inicia sesión nuevamente para continuar.');

      expect(msg403.what).toBe(msg401.what);
      expect(msg403.why).toBe(msg401.why);
    });

    it('formatea error 404 y 409 con mensajes empáticos contextualizados', () => {
      const msg404 = formatEmpathicError(404);
      expect(msg404.what).toBe('El elemento solicitado no fue encontrado.');
      expect(msg404.why).toBe('Es posible que haya sido eliminado o trasladado previamente.');
      expect(msg404.action).toBe('Verifica la lista de elementos o actualiza la vista.');

      const msg409 = formatEmpathicError(409);
      expect(msg409.what).toBe('Se ha detectado un conflicto con el estado actual.');
      expect(msg409.why).toBe('El registro ha sido modificado de forma concurrente.');
      expect(msg409.action).toBe('Hemos cancelado la operación. Actualiza la vista para ver los cambios más recientes.');
    });

    it('formatea error de red o código no mapeado con mensaje de conectividad', () => {
      const msg = formatEmpathicError(undefined);

      expect(msg.what).toBe('No se pudo establecer comunicación con el servidor.');
      expect(msg.why).toBe('La conexión se interrumpió o el servidor no respondió a tiempo.');
      expect(msg.action).toBe('Comprueba tu conexión a internet o inténtalo de nuevo en unos instantes.');
    });
  });

  describe('apiClient HTTP requests', () => {
    const originalFetch = globalThis.fetch;

    beforeEach(() => {
      vi.restoreAllMocks();
    });

    afterEach(() => {
      globalThis.fetch = originalFetch;
    });

    it('retorna datos deserializados cuando la respuesta HTTP es exitosa (200 OK)', async () => {
      const mockData = { id: 'task-1', titulo: 'Test' };
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockData,
      } as unknown as Response);

      const result = await apiClient.get<typeof mockData>('/api/tasks/1');
      expect(result).toEqual(mockData);
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/tasks/1', { method: 'GET' });
    });

    it('lanza EmpathicError enriquecido ante respuesta no-ok (500 Internal Server Error)', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal Server Error' }),
      } as unknown as Response);

      await expect(apiClient.patch('/api/tasks/1', { completado: true }, undefined, 'Conmutar tarea')).rejects.toThrow(
        EmpathicError
      );

      try {
        await apiClient.patch('/api/tasks/1', { completado: true }, undefined, 'Conmutar tarea');
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(EmpathicError);
        const empErr = err as EmpathicError;
        expect(empErr.statusCode).toBe(500);
        expect(empErr.empathic.what).toBe('Conmutar tarea: No se pudo completar la operación en el servidor.');
        expect(empErr.empathic.why).toBe('Ha ocurrido un fallo temporal en los servicios centrales.');
        expect(empErr.empathic.action).toContain('Hemos revertido el cambio automáticamente');
      }
    });

    it('lanza EmpathicError enriquecido ante fallo de red (fetch rechaza)', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

      try {
        await apiClient.get('/api/tasks');
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(EmpathicError);
        const empErr = err as EmpathicError;
        expect(empErr.statusCode).toBeUndefined();
        expect(empErr.empathic.what).toBe('No se pudo establecer comunicación con el servidor.');
        expect(empErr.empathic.why).toBe('La conexión se interrumpió o el servidor no respondió a tiempo.');
      }
    });

    it('ejecuta llamadas post, patch y delete con headers json y métodos apropiados', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      } as unknown as Response);
      globalThis.fetch = mockFetch;

      await apiClient.post('/api/tasks', { titulo: 'Nueva' });
      expect(mockFetch).toHaveBeenLastCalledWith('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: 'Nueva' }),
      });

      await apiClient.patch('/api/tasks/2', { completado: true });
      expect(mockFetch).toHaveBeenLastCalledWith('/api/tasks/2', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completado: true }),
      });

      await apiClient.delete('/api/tasks/2');
      expect(mockFetch).toHaveBeenLastCalledWith('/api/tasks/2', {
        method: 'DELETE',
      });
    });
  });
});
