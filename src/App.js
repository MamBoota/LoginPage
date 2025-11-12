import React, { Suspense, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from './hooks/useAuth';
import { useToast } from './hooks/useToast';
import ToastContainer from './components/ToastContainer';
import Spinner from './components/Spinner';
import { authApi } from './api/authApi';

// Ленивая загрузка компонентов с обработкой ошибок
const LoginForm = React.lazy(() =>
  import('./components/LoginForm').catch((error) => {
    console.error('Ошибка загрузки LoginForm:', error);
    return {
      default: () => (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p>Ошибка загрузки формы входа. Пожалуйста, обновите страницу.</p>
        </div>
      ),
    };
  })
);

const TwoFactorForm = React.lazy(() =>
  import('./components/TwoFactorForm').catch((error) => {
    console.error('Ошибка загрузки TwoFactorForm:', error);
    return {
      default: () => (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p>Ошибка загрузки формы 2FA. Пожалуйста, обновите страницу.</p>
        </div>
      ),
    };
  })
);

const App = ({ loginContainer, twoFactorContainer, toastContainer }) => {
  const { login, verifyTwoFactor, isLoading, error, resetError, isOnline } = useAuth();
  const { toasts, showSuccess, showError, removeToast } = useToast();
  const [step, setStep] = useState('login'); // 'login' или '2fa'

  // Синхронизация шагов с видимостью статических контейнеров
  useEffect(() => {
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    
    if (step === 'login') {
      if (step1) step1.style.display = 'flex';
      if (step2) step2.style.display = 'none';
    } else {
      if (step1) step1.style.display = 'none';
      if (step2) step2.style.display = 'flex';
    }
  }, [step]);

  const handleLogin = useCallback(
    (email, password) => {
      login(
        { email, password },
        {
          onSuccess: () => {
            setStep('2fa');
            showSuccess('Авторизация успешна! Введите код двухфакторной аутентификации.');
          },
          onError: (err) => {
            showError(err.message || 'Ошибка авторизации');
          },
        }
      );
    },
    [login, showSuccess, showError]
  );

  const handle2FASubmit = useCallback(
    (code) => {
      verifyTwoFactor(code, {
        onSuccess: () => {
          showSuccess('Авторизация успешна! Добро пожаловать!', 5000);
        },
        onError: (err) => {
          showError(err.message || 'Неверный код');
        },
      });
    },
    [verifyTwoFactor, showSuccess, showError]
  );

  const handleGetNewCode = useCallback(async () => {
    try {
      await authApi.requestNewCode();
      showSuccess('Новый код отправлен! Проверьте ваше устройство.');
    } catch (err) {
      showError(err.message || 'Ошибка при запросе нового кода');
    }
  }, [showSuccess, showError]);

  const handleBack = useCallback(() => {
    setStep('login');
    resetError();
  }, [resetError]);

  // Рендерим кнопку "Назад" через портал
  const BackButton = () => (
    <button
      className="back-button"
      onClick={handleBack}
      aria-label="Go back"
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path
          d="M11.25 13.5L6.75 9L11.25 4.5"
          stroke="rgba(0, 0, 0, 0.88)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );

  if (!loginContainer || !twoFactorContainer || !toastContainer) {
    return <div>Ошибка: контейнеры не найдены</div>;
  }

  return (
    <>
      {/* Toast через портал */}
      {createPortal(
        <ToastContainer toasts={toasts} removeToast={removeToast} />,
        toastContainer
      )}

      {/* Кнопка "Назад" через портал */}
      {step === '2fa' && createPortal(<BackButton />, document.querySelector('#react-back-button') || document.body)}

      {/* Форма входа через портал */}
      {createPortal(
        <Suspense
          fallback={
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
              <Spinner />
            </div>
          }
        >
          {step === 'login' && (
            <LoginForm
              onSubmit={handleLogin}
              isLoading={isLoading}
              error={error}
              isOnline={isOnline}
              onErrorChange={resetError}
            />
          )}
        </Suspense>,
        loginContainer
      )}

      {/* Форма 2FA через портал */}
      {createPortal(
        <Suspense
          fallback={
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
              <Spinner />
            </div>
          }
        >
          {step === '2fa' && (
            <TwoFactorForm
              onSubmit={handle2FASubmit}
              onGetNewCode={handleGetNewCode}
              isLoading={isLoading}
              error={error}
              onErrorChange={resetError}
              codeExpirationTime={30000} // 30 секунд
            />
          )}
        </Suspense>,
        twoFactorContainer
      )}
    </>
  );
};

export default App;
