import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, test, expect, jest } from '@jest/globals';
import userEvent from '@testing-library/user-event';
import LoginForm from '../src/components/LoginForm';

describe('LoginForm', () => {
  test('renders login form correctly', () => {
    render(<LoginForm onSubmit={() => {}} isLoading={false} error={null} />);
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit login form' })).toBeInTheDocument();
  });

  test('calls onSubmit with correct values', async () => {
    const mockOnSubmit = jest.fn();
    const user = userEvent.setup({ delay: null });
    
    render(<LoginForm onSubmit={mockOnSubmit} isLoading={false} error={null} />);

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: 'Submit login form' });

    // Вводим валидные данные
    await act(async () => {
      await user.type(emailInput, 'test@mail.com');
    });
    
    await act(async () => {
      await user.type(passwordInput, 'password');
    });

    // Ждем, пока форма станет валидной и кнопка станет активной
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });

    // Нажимаем кнопку отправки
    await act(async () => {
      await user.click(submitButton);
    });

    // Проверяем, что onSubmit был вызван с правильными значениями
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith('test@mail.com', 'password');
    });
  });

  test('shows error message when error is provided', () => {
    render(
      <LoginForm
        onSubmit={() => {}}
        isLoading={false}
        error="Invalid credentials"
      />
    );
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });

  test('button is disabled when form is invalid', () => {
    render(<LoginForm onSubmit={() => {}} isLoading={false} error={null} />);
    const submitButton = screen.getByRole('button', { name: 'Submit login form' });
    expect(submitButton).toBeDisabled();
  });

  test('button is disabled when form has invalid email', async () => {
    const user = userEvent.setup({ delay: null });
    render(<LoginForm onSubmit={() => {}} isLoading={false} error={null} />);
    
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: 'Submit login form' });

    await act(async () => {
      await user.type(emailInput, 'invalid-email');
      await user.type(passwordInput, 'password');
    });

    // Кнопка должна быть disabled, так как email невалидный
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });
});
