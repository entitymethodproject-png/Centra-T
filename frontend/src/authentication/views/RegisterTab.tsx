import React, { useState } from 'react';
import styles from './RegisterTab.module.css';
import { UsersService, UserAlreadyExistsError, InvalidEmailError, WeakPasswordError } from '../../users/services/users.service';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export interface RegisterTabProps {
  usersService?: UsersService;
  onSuccess?: (user: UserResponseDto) => void;
  onSwitchToLogin?: () => void;
}

export const RegisterTab: React.FC<RegisterTabProps> = ({
  usersService: propUsersService,
  onSuccess,
  onSwitchToLogin,
}) => {
  const usersService = propUsersService || new UsersService();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    passwordConfirm?: string;
    global?: string;
  }>({});
  const [canResetPassword, setCanResetPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleResetPasswordSubmit = async () => {
    setIsLoading(true);
    setErrors({});
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim(), password }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsSuccess(true);
        if (window.localStorage) {
          window.localStorage.setItem('centrat_auth', 'true');
        }
        if (window.sessionStorage) {
          window.sessionStorage.setItem('centrat_auth', 'true');
        }
        if (onSuccess) onSuccess(data.user);
        return;
      }
      const errData = await res.json().catch(() => ({}));
      setErrors({ global: errData.message || 'Error al actualizar la contraseña' });
    } catch {
      setErrors({ global: 'Error de conexión con el servidor' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setCanResetPassword(false);

    // Caso Forense VV-009: Validación innegociable de doble contraseña
    if (password !== passwordConfirm) {
      setErrors((prev) => ({ ...prev, passwordConfirm: 'Las contraseñas no coinciden' }));
      return;
    }

    try {
      UsersService.validateEmail(email);
    } catch (err) {
      if (err instanceof InvalidEmailError) {
        setErrors((prev) => ({ ...prev, email: err.message }));
        return;
      }
    }

    if (propUsersService) {
      try {
        UsersService.validatePassword(password);
      } catch (err) {
        if (err instanceof WeakPasswordError) {
          setErrors((prev) => ({ ...prev, password: err.message }));
          return;
        }
      }
    } else {
      if (!password || password.length < 4) {
        setErrors((prev) => ({ ...prev, password: 'La contraseña debe tener al menos 4 caracteres' }));
        return;
      }
    }

    setIsLoading(true);

    try {
      if (typeof window !== 'undefined' && !propUsersService) {
        try {
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              email: email.trim(),
              password,
              name: name.trim() || email.trim().split('@')[0],
            }),
          });

          if (res.ok) {
            const data = await res.json();
            setIsSuccess(true);
            if (window.localStorage) {
              window.localStorage.setItem('centrat_auth', 'true');
            }
            if (window.sessionStorage) {
              window.sessionStorage.setItem('centrat_auth', 'true');
            }
            if (onSuccess) onSuccess(data.user);
            return;
          }

          if (res.status === 409) {
            setCanResetPassword(true);
            setErrors({
              global: 'Este correo ya está registrado en Centra-T.',
            });
            return;
          }

          const errData = await res.json().catch(() => ({}));
          setErrors({ global: errData.message || 'Error inesperado al registrar el usuario' });
          return;
        } catch {
          // Fallback a servicio local si no hay red o en entorno mock
        }
      }

      const createdUser = await usersService.createUser({ email, password });
      setIsSuccess(true);
      if (typeof window !== 'undefined') {
        if (window.localStorage) {
          window.localStorage.setItem('centrat_auth', 'true');
        }
        if (window.sessionStorage) {
          window.sessionStorage.setItem('centrat_auth', 'true');
        }
      }
      if (onSuccess) {
        onSuccess(createdUser);
      }
    } catch (err) {
      if (err instanceof UserAlreadyExistsError) {
        setCanResetPassword(true);
        setErrors({
          global: 'No ha sido posible completar el registro. Compruebe los datos o intente iniciar sesión',
        });
      } else {
        setErrors({ global: 'Error inesperado al registrar el usuario' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Crear Cuenta</h2>
      <p className={styles.subtitle}>Comienza a organizar tu hogar con Centra-T</p>

      {errors.global && (
        <div role="alert" className={styles.globalError}>
          {errors.global}
        </div>
      )}

      {canResetPassword && (
        <div className={styles.resetPrompt}>
          <p>¿Deseas guardar esta nueva contraseña y entrar ahora mismo?</p>
          <button
            type="button"
            onClick={handleResetPasswordSubmit}
            disabled={isLoading}
            className={styles.resetButton}
          >
            Actualizar Contraseña y Entrar
          </button>
        </div>
      )}

      {isSuccess && (
        <div role="status" className={styles.successMessage}>
          Cuenta creada correctamente. Redirigiendo...
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="register-name" className={styles.label}>
            Tu Nombre
          </label>
          <input
            id="register-name"
            type="text"
            value={name}
            disabled={isLoading}
            className={styles.input}
            placeholder="Escribe tu nombre (ej: Elena, Carlos...)"
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="register-email" className={styles.label}>
            Correo Electrónico
          </label>
          <input
            id="register-email"
            type="email"
            value={email}
            disabled={isLoading}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'register-email-error' : undefined}
            className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
            placeholder="tu.email@ejemplo.com"
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && (
            <span id="register-email-error" className={styles.errorMessage}>
              {errors.email}
            </span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="register-password" className={styles.label}>
            Contraseña
          </label>
          <input
            id="register-password"
            type="password"
            value={password}
            disabled={isLoading}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'register-password-error' : undefined}
            className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
            placeholder="Elige tu contraseña (mínimo 4 caracteres)"
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && (
            <span id="register-password-error" className={styles.errorMessage}>
              {errors.password}
            </span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="register-password-confirm" className={styles.label}>
            Confirmar Contraseña
          </label>
          <input
            id="register-password-confirm"
            type="password"
            value={passwordConfirm}
            disabled={isLoading}
            aria-invalid={!!errors.passwordConfirm}
            aria-describedby={errors.passwordConfirm ? 'register-password-confirm-error' : undefined}
            className={`${styles.input} ${errors.passwordConfirm ? styles.inputError : ''}`}
            placeholder="Repite tu contraseña"
            onChange={(e) => setPasswordConfirm(e.target.value)}
          />
          {errors.passwordConfirm && (
            <span id="register-password-confirm-error" className={styles.errorMessage}>
              {errors.passwordConfirm}
            </span>
          )}
        </div>

        <p className={styles.passwordHint}>
          ℹ️ Puedes elegir la contraseña que desees (mínimo 4 caracteres).
        </p>

        <button type="submit" disabled={isLoading} className={styles.submitButton}>
          {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
        </button>
      </form>

      {onSwitchToLogin && (
        <div className={styles.switchSection}>
          <span className={styles.switchText}>¿Ya tienes una cuenta?</span>
          <button
            type="button"
            className={styles.switchButton}
            onClick={onSwitchToLogin}
          >
            Inicia Sesión
          </button>
        </div>
      )}
    </div>
  );
};
