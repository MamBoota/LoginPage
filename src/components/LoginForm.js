import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { getValidationErrors, validateEmail, validatePassword } from '../validation';
import Spinner from './Spinner';

const LoginForm = React.memo(({ 
  onSubmit, 
  isLoading = false, 
  error = null, 
  isOnline = true, 
  onErrorChange = null 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Очищаем ошибки API при изменении полей
  useEffect(() => {
    if (error && onErrorChange) {
      onErrorChange();
    }
  }, [email, password, error, onErrorChange]);

  // Валидация при изменении значений для touched полей
  useEffect(() => {
    if (!touched.email && !touched.password) {
      // Если поля еще не были touched, не показываем ошибки
      return;
    }

    const formData = { email, password };
    const validationErrors = getValidationErrors(formData);
    
    // Обновляем ошибки только для touched полей
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      
      if (touched.email) {
        if (validationErrors.email) {
          newErrors.email = validationErrors.email;
        } else {
          delete newErrors.email;
        }
      }
      
      if (touched.password) {
        if (validationErrors.password) {
          newErrors.password = validationErrors.password;
        } else {
          delete newErrors.password;
        }
      }
      
      return newErrors;
    });
  }, [email, password, touched]);

  const handleEmailChange = useCallback((e) => {
    const value = e.target.value;
    setEmail(value);
    // Не устанавливаем touched здесь - только при blur
  }, []);

  const handlePasswordChange = useCallback((e) => {
    const value = e.target.value;
    setPassword(value);
    // Не устанавливаем touched здесь - только при blur
  }, []);

  const handleBlur = useCallback((field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    // Валидация произойдет автоматически через useEffect
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    // Устанавливаем все поля как touched
    setTouched({ email: true, password: true });
    
    const formData = { email, password };
    const validationErrors = getValidationErrors(formData);
    
    // Проверяем наличие ошибок
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Если ошибок нет, очищаем состояние ошибок и отправляем форму
    setErrors({});
    onSubmit(email, password);
  }, [email, password, onSubmit]);

  // Проверка валидности формы - оба поля должны быть непустыми и валидными
  const isFormValid = useMemo(() => {
    return email.trim() !== '' && 
           password.trim() !== '' && 
           validateEmail(email) && 
           validatePassword(password);
  }, [email, password]);

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="form-input">
        <div className="input-wrapper">
          <svg className="input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 8C9.65685 8 11 6.65685 11 5C11 3.34315 9.65685 2 8 2C6.34315 2 5 3.34315 5 5C5 6.65685 6.34315 8 8 8Z" stroke="rgba(0, 0, 0, 0.45)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 13.3333C2 11.1242 3.79086 9.33333 6 9.33333H10C12.2091 9.33333 14 11.1242 14 13.3333" stroke="rgba(0, 0, 0, 0.45)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <input
            type="email"
            className={`input-field ${errors.email ? 'error' : ''}`}
            placeholder="Email"
            value={email}
            onChange={handleEmailChange}
            onBlur={() => handleBlur('email')}
            required
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
        </div>
        {errors.email && (
          <div id="email-error" className="error-message" role="alert">
            {errors.email}
          </div>
        )}
      </div>

      <div className="form-item">
        <div className="input-wrapper">
          <svg className="input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="3" y="7" width="10" height="7" rx="1" stroke="rgba(0, 0, 0, 0.45)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 7V5C5 3.34315 6.34315 2 8 2C9.65685 2 11 3.34315 11 5V7" stroke="rgba(0, 0, 0, 0.45)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="8" cy="10.5" r="0.5" fill="rgba(0, 0, 0, 0.45)"/>
          </svg>
          <input
            type="password"
            className={`input-field password-input ${errors.password ? 'error' : ''}`}
            placeholder="Password"
            value={password}
            onChange={handlePasswordChange}
            onBlur={() => handleBlur('password')}
            required
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
          />
        </div>
        {errors.password && (
          <div id="password-error" className="error-message" role="alert">
            {errors.password}
          </div>
        )}
      </div>

      <button
        type="submit"
        className={`submit-button ${isFormValid && !isLoading ? 'primary-button' : 'disabled'}`}
        disabled={isLoading || !isFormValid}
        aria-label="Submit login form"
      >
        {isLoading ? <Spinner /> : 'Log in'}
      </button>

      {!isOnline && (
        <div className="network-error" role="alert">
          <span>⛔</span> No internet connection
        </div>
      )}

      {error && (
        <div className="input-caption error-message" role="alert">
          {error}
        </div>
      )}
    </form>
  );
});

LoginForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
  isOnline: PropTypes.bool,
  onErrorChange: PropTypes.func,
};

LoginForm.displayName = 'LoginForm';

export default LoginForm;