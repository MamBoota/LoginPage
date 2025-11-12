import React, { useState, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import Spinner from './Spinner';
import { validateCode } from '../validation/index.js';

const TwoFactorForm = React.memo(({ 
  onSubmit, 
  onGetNewCode,
  isLoading = false, 
  error = null, 
  onErrorChange = null,
  codeExpirationTime = 30000 // 30 секунд по умолчанию (в миллисекундах)
}) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(codeExpirationTime); // время в миллисекундах
  const [isExpired, setIsExpired] = useState(false);

  // Создаём ref для каждого поля
  const inputRefs = useRef(
    Array(6)
      .fill()
      .map(() => React.createRef())
  );

  // Таймер обратного отсчета
  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1000) {
          setIsExpired(true);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Сброс таймера при получении нового кода
  const handleGetNewCode = useCallback(() => {
    if (onGetNewCode) {
      onGetNewCode();
      setTimeLeft(codeExpirationTime);
      setIsExpired(false);
      // Очищаем поля кода
      setCode(['', '', '', '', '', '']);
      // Фокус на первое поле
      if (inputRefs.current[0]?.current) {
        inputRefs.current[0].current.focus();
      }
    }
  }, [onGetNewCode, codeExpirationTime]);

  // Очищаем ошибки API при изменении кода
  useEffect(() => {
    if (error && onErrorChange) {
      onErrorChange();
    }
  }, [code, error, onErrorChange]);

  const handleInput = useCallback((index, value) => {
    const newCode = [...code];
    const digit = value.replace(/[^0-9]/g, '').slice(-1); // Берем только последний символ
    newCode[index] = digit;
    setCode(newCode);

    // Автоматический переход на следующее поле
    if (digit && index < 5 && inputRefs.current[index + 1]) {
      setTimeout(() => {
        inputRefs.current[index + 1]?.current?.focus();
      }, 0);
    }
  }, [code]);

  const handleKeyDown = useCallback((index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.current?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.current?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.current?.focus();
    }
  }, [code]);

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const pastedData = (e.clipboardData || window.clipboardData).getData('text');
    
    if (!pastedData) return;

    // Извлекаем только цифры и ограничиваем до 6 символов
    const digits = pastedData.replace(/[^0-9]/g, '').slice(0, 6);

    if (digits.length === 0) {
      // Если нет цифр, показываем визуальную обратную связь
      return;
    }

    const newCode = ['', '', '', '', '', ''];
    for (let i = 0; i < digits.length; i++) {
      newCode[i] = digits[i];
    }
    setCode(newCode);

    // Фокус на последнее заполненное поле или первое пустое
    const focusIndex = Math.min(digits.length, 1);
    setTimeout(() => {
      inputRefs.current[focusIndex]?.current?.focus();
    }, 0);

    // НЕ отправляем автоматически - ждем нажатия кнопки Continue
  }, []);

  const handleSubmit = useCallback((e) => {
    if (e) e.preventDefault();
    if (isExpired) return; // Не отправляем если код истек
    
    const codeStr = code.join('');
    if (codeStr.length !== 6) return;
    onSubmit(codeStr);
  }, [code, onSubmit, isExpired]);

  const isCodeValid = validateCode(code);
  const canContinue = isCodeValid && !isExpired && !isLoading;

  // Форматирование времени (MM:SS)
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const seconds = totalSeconds % 60;
    return `${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="code-inputs" role="group" aria-label="Two-factor authentication code">
        {code.map((digit, index) => (
          <input
            key={`code-input-${index}`}
            ref={inputRefs.current[index]}
            id={`code-${index}`}
            type="text"
            className="code-input"
            maxLength="1"
            pattern="[0-9]"
            inputMode="numeric"
            value={digit}
            onInput={(e) => handleInput(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            required
            disabled={isExpired}
            aria-label={`Code digit ${index + 1}`}
            aria-invalid={!isCodeValid && code.filter(c => c).length > 0}
          />
        ))}
      </div>

      {/* Таймер обратного отсчета */}
      {!isExpired && (
        <div className="code-timer" style={{ 
          textAlign: 'center', 
          fontSize: '14px', 
          color: 'rgba(0, 0, 0, 0.45)',
          marginTop: '8px'
        }}>
          Code expires in: {formatTime(timeLeft)} seconds
        </div>
      )}

      {error && (
        <div className="input-caption error-message" role="alert" style={{ display: 'flex' }}>
          {error}
        </div>
      )}

      {/* Кнопка Continue - показывается только когда код валиден и не истек */}
      {!isExpired && (
        <button
          type="submit"
          aria-label="Continue"
          className={`submit-button ${canContinue ? 'primary-button' : 'disabled'}`}
          disabled={!canContinue}
          style={{ display: canContinue ? 'flex' : 'none' }}
        >
          {isLoading ? <Spinner /> : 'Continue'}
        </button>
      )}

      {/* Кнопка Get now - показывается когда код истек */}
      {isExpired && onGetNewCode && (
        <button
          type="button"
          onClick={handleGetNewCode}
          aria-label="Get new code"
          className="submit-button primary-button"
          disabled={isLoading}
        >
          {isLoading ? <Spinner /> : 'Get now'}
        </button>
      )}
    </form>
  );
});

TwoFactorForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onGetNewCode: PropTypes.func,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
  onErrorChange: PropTypes.func,
  codeExpirationTime: PropTypes.number,
};

TwoFactorForm.displayName = 'TwoFactorForm';

export default TwoFactorForm;
