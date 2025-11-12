import { useState, useEffect, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/authApi';

export const useAuth = () => {
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Централизованная обработка ошибок
  const handleError = useCallback((err, options) => {
    const errorMessage = !isOnline
      ? 'No internet connection. Please check your network.'
      : err?.message || 'An error occurred';

    setError(errorMessage);

    // Вызываем пользовательский обработчик ошибок, если он есть
    if (options?.onError) {
      options.onError(err);
    }
  }, [isOnline]);

  const handleSuccess = useCallback((options) => {
    setError(null);
    
    // Вызываем пользовательский обработчик успеха, если он есть
    if (options?.onSuccess) {
      options.onSuccess();
    }
  }, []);

  const loginMutation = useMutation({
    mutationFn: ({ email, password }) => authApi.login(email, password),
  });

  const twoFactorMutation = useMutation({
    mutationFn: (code) => authApi.verifyTwoFactor(code),
  });

  const login = useCallback((variables, options = {}) => {
    loginMutation.mutate(variables, {
      onError: (err) => handleError(err, options),
      onSuccess: () => handleSuccess(options),
    });
  }, [loginMutation, handleError, handleSuccess]);

  const verifyTwoFactor = useCallback((variables, options = {}) => {
    twoFactorMutation.mutate(variables, {
      onError: (err) => handleError(err, options),
      onSuccess: () => handleSuccess(options),
    });
  }, [twoFactorMutation, handleError, handleSuccess]);

  return {
    login,
    verifyTwoFactor,
    isLoading: loginMutation.isPending || twoFactorMutation.isPending,
    error,
    resetError: () => setError(null),
    isOnline,
  };
};
