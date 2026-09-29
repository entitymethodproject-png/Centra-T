export interface EmpathicMessage {
  what: string;
  why: string;
  action: string;
  fullMessage: string;
}

export class EmpathicError extends Error {
  constructor(
    public readonly empathic: EmpathicMessage,
    public readonly statusCode?: number,
    public readonly originalError?: unknown
  ) {
    super(empathic.fullMessage);
    this.name = 'EmpathicError';
  }
}

export function formatEmpathicError(statusCode?: number, customContext?: string): EmpathicMessage {
  const contextPrefix = customContext ? `${customContext}: ` : '';

  if (statusCode === 500 || (statusCode && statusCode >= 500 && statusCode < 600)) {
    const what = `${contextPrefix}No se pudo completar la operación en el servidor.`;
    const why = 'Ha ocurrido un fallo temporal en los servicios centrales.';
    const action = 'Hemos revertido el cambio automáticamente para proteger tus datos. Por favor, inténtalo de nuevo en unos instantes.';
    return { what, why, action, fullMessage: `${what} ${why} ${action}` };
  }

  if (statusCode === 400) {
    const what = `${contextPrefix}Los datos enviados no son válidos.`;
    const why = 'Alguno de los campos no cumple con las restricciones requeridas.';
    const action = 'Por favor, revisa la información introducida e inténtalo nuevamente.';
    return { what, why, action, fullMessage: `${what} ${why} ${action}` };
  }

  if (statusCode === 401 || statusCode === 403) {
    const what = `${contextPrefix}No tienes autorización para realizar esta acción.`;
    const why = 'Tu sesión ha caducado o no cuentas con los permisos necesarios.';
    const action = 'Por favor, inicia sesión nuevamente para continuar.';
    return { what, why, action, fullMessage: `${what} ${why} ${action}` };
  }

  if (statusCode === 404) {
    const what = `${contextPrefix}El elemento solicitado no fue encontrado.`;
    const why = 'Es posible que haya sido eliminado o trasladado previamente.';
    const action = 'Verifica la lista de elementos o actualiza la vista.';
    return { what, why, action, fullMessage: `${what} ${why} ${action}` };
  }

  if (statusCode === 409) {
    const what = `${contextPrefix}Se ha detectado un conflicto con el estado actual.`;
    const why = 'El registro ha sido modificado de forma concurrente.';
    const action = 'Hemos cancelado la operación. Actualiza la vista para ver los cambios más recientes.';
    return { what, why, action, fullMessage: `${what} ${why} ${action}` };
  }

  // Fallo de red o genérico
  const what = `${contextPrefix}No se pudo establecer comunicación con el servidor.`;
  const why = 'La conexión se interrumpió o el servidor no respondió a tiempo.';
  const action = 'Comprueba tu conexión a internet o inténtalo de nuevo en unos instantes.';
  return { what, why, action, fullMessage: `${what} ${why} ${action}` };
}

export const apiClient = {
  formatError: formatEmpathicError,
  async request<T>(url: string, options: RequestInit = {}, customContext?: string): Promise<T> {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const empathic = formatEmpathicError(response.status, customContext);
        throw new EmpathicError(empathic, response.status);
      }
      return (await response.json()) as T;
    } catch (err: unknown) {
      if (err instanceof EmpathicError) throw err;
      const empathic = formatEmpathicError(undefined, customContext);
      throw new EmpathicError(empathic, undefined, err);
    }
  },
  get: <T>(url: string, options?: RequestInit, context?: string) =>
    apiClient.request<T>(url, { ...options, method: 'GET' }, context),
  post: <T>(url: string, body?: unknown, options?: RequestInit, context?: string) =>
    apiClient.request<T>(
      url,
      {
        ...options,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...options?.headers },
        body: body ? JSON.stringify(body) : undefined,
      },
      context
    ),
  patch: <T>(url: string, body?: unknown, options?: RequestInit, context?: string) =>
    apiClient.request<T>(
      url,
      {
        ...options,
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...options?.headers },
        body: body ? JSON.stringify(body) : undefined,
      },
      context
    ),
  delete: <T>(url: string, options?: RequestInit, context?: string) =>
    apiClient.request<T>(url, { ...options, method: 'DELETE' }, context),
};
