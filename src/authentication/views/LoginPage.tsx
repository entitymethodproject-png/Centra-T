import React, { useState, useMemo } from 'react';
import styles from './LoginPage.module.css';
import { AuthController } from '../controllers/auth.controller';
import { AuthService, InvalidCredentialsError } from '../services/auth.service';
import { UsersService, InvalidEmailError } from '../../users/services/users.service';
import { TooManyRequestsError } from '../services/throttler.service';
import { RegisterTab } from './RegisterTab';

export interface LoginPageProps {
  authController?: AuthController;
  usersService?: UsersService;
  defaultTab?: 'login' | 'register';
  onNavigateToWorkspace?: () => void;
  onSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  authController: propAuthController,
  usersService: propUsersService,
  defaultTab = 'login',
  onNavigateToWorkspace,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab);

  // Compartir la misma instancia en memoria para que RegisterTab y AuthController sincronicen usuarios
  const usersService = useMemo(
    () => propUsersService || new UsersService(),
    [propUsersService]
  );
  const authController = useMemo(
    () => propAuthController || new AuthController(new AuthService(usersService)),
    [propAuthController, usersService]
  );

  // Estados del formulario de Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState<{ email: boolean; password: boolean }>({
    email: false,
    password: false,
  });
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    global?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Validación auxiliar de email
  const validateEmailValue = (val: string): string | undefined => {
    const trimmed = val.trim();
    if (!trimmed) {
      return 'El correo electrónico es obligatorio';
    }
    try {
      UsersService.validateEmail(trimmed);
      return undefined;
    } catch (err) {
      if (err instanceof InvalidEmailError) {
        return err.message;
      }
      return 'Formato de email no válido';
    }
  };

  // Manejo de cambios (Doctrina Empática: no advertir en el primer tipeo)
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    if (touched.email) {
      setErrors((prev) => ({ ...prev, email: validateEmailValue(val) }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    if (touched.password) {
      setErrors((prev) => ({
        ...prev,
        password: val.trim() ? undefined : 'La contraseña es obligatoria',
      }));
    }
  };

  // Manejo de desenfoque (onBlur)
  const handleEmailBlur = () => {
    setTouched((prev) => ({ ...prev, email: true }));
    setErrors((prev) => ({ ...prev, email: validateEmailValue(email) }));
  };

  const handlePasswordBlur = () => {
    setTouched((prev) => ({ ...prev, password: true }));
    setErrors((prev) => ({
      ...prev,
      password: password.trim() ? undefined : 'La contraseña es obligatoria',
    }));
  };

  // Envío del formulario de Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    setErrors((prev) => ({ ...prev, global: undefined }));

    const emailError = validateEmailValue(email);
    const passwordError = password.trim() ? undefined : 'La contraseña es obligatoria';

    if (emailError || passwordError) {
      setErrors({
        email: emailError,
        password: passwordError,
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await authController.login({ email, password });
      if (response && response.statusCode === 200) {
        setIsSuccess(true);
        if (onSuccess) {
          onSuccess();
        }
        if (onNavigateToWorkspace) {
          onNavigateToWorkspace();
        }
      }
    } catch (err: unknown) {
      const error = err as { statusCode?: number; message?: string };
      if (err instanceof InvalidCredentialsError || error?.statusCode === 401) {
        setErrors((prev) => ({ ...prev, global: 'Credenciales incorrectas' }));
      } else if (err instanceof TooManyRequestsError || error?.statusCode === 429) {
        setErrors((prev) => ({
          ...prev,
          global: 'Demasiados intentos fallidos. Bloqueado temporalmente durante 15 minutos',
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          global: error?.message || 'Error inesperado al iniciar sesión',
        }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.authCard}>
        {/* Cabecera de Marca */}
        <div className={styles.header}>
          <h1 className={styles.brandTitle}>Centra-T</h1>
          <p className={styles.brandSubtitle}>Gestor Doméstico Integral y Planificador Temporal</p>
        </div>

        {/* Selector de Pestañas */}
        <div className={styles.tabList} role="tablist" aria-label="Opciones de autenticación">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'login'}
            className={`${styles.tabButton} ${activeTab === 'login' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('login')}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'register'}
            className={`${styles.tabButton} ${activeTab === 'register' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('register')}
          >
            Crear Cuenta
          </button>
        </div>

        {/* Vista Pestaña Iniciar Sesión */}
        {activeTab === 'login' && (
          <div className={styles.tabContent} role="tabpanel">
            {errors.global && (
              <div role="alert" className={styles.globalError}>
                {errors.global}
              </div>
            )}

            {isSuccess && (
              <div role="status" className={styles.successMessage}>
                Acceso concedido. Entrando al Workspace...
              </div>
            )}

            <form onSubmit={handleLoginSubmit} noValidate className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="login-email" className={styles.label}>
                  Correo Electrónico
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  disabled={isLoading}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'login-email-error' : undefined}
                  className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                  placeholder="tu.email@ejemplo.com"
                  onChange={handleEmailChange}
                  onBlur={handleEmailBlur}
                />
                {errors.email && (
                  <span id="login-email-error" role="alert" className={styles.errorMessage}>
                    {errors.email}
                  </span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="login-password" className={styles.label}>
                  Contraseña
                </label>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  disabled={isLoading}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'login-password-error' : undefined}
                  className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                  placeholder="Tu contraseña"
                  onChange={handlePasswordChange}
                  onBlur={handlePasswordBlur}
                />
                {errors.password && (
                  <span id="login-password-error" role="alert" className={styles.errorMessage}>
                    {errors.password}
                  </span>
                )}
              </div>

              <button type="submit" disabled={isLoading} className={styles.submitButton}>
                {isLoading ? (
                  <span className={styles.loadingWrapper}>
                    <span className={styles.spinner} />
                    Accediendo...
                  </span>
                ) : (
                  'Entrar'
                )}
              </button>
            </form>

            <div className={styles.switchSection}>
              <span className={styles.switchText}>¿No tienes una cuenta?</span>
              <button
                type="button"
                className={styles.switchButton}
                onClick={() => setActiveTab('register')}
              >
                Regístrate
              </button>
            </div>
          </div>
        )}

        {/* Vista Pestaña Crear Cuenta */}
        {activeTab === 'register' && (
          <div className={styles.tabContent} role="tabpanel">
            <RegisterTab
              usersService={usersService}
              onSuccess={(createdUser) => {
                setEmail(createdUser.email);
                setTimeout(() => setActiveTab('login'), 1000);
              }}
              onSwitchToLogin={() => setActiveTab('login')}
            />
          </div>
        )}
      </div>
    </div>
  );
};
