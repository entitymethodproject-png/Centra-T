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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    passwordConfirm?: string;
    global?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

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

    try {
      UsersService.validatePassword(password);
    } catch (err) {
      if (err instanceof WeakPasswordError) {
        setErrors((prev) => ({ ...prev, password: err.message }));
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
              name: email.trim().split('@')[0],
            }),
          });

          if (res.ok) {
            const data = await res.json();
            setIsSuccess(true);
            if (window.sessionStorage) {
              window.sessionStorage.setItem('centrat_auth', 'true');
            }
            if (onSuccess) onSuccess(data.user);
            return;
          }

          if (res.status === 409) {
            setErrors({
              global: 'No ha sido posible completar el registro. Compruebe los datos o intente iniciar sesión',
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
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem('centrat_auth', 'true');
      }
      if (onSuccess) {
        onSuccess(createdUser);
      }
    } catch (err) {
      if (err instanceof UserAlreadyExistsError) {
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

      {isSuccess && (
        <div role="status" className={styles.successMessage}>
          Cuenta creada correctamente. Redirigiendo...
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className={styles.form}>
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
            placeholder="Mínimo 8 caracteres (mayús, núm, símb)"
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
