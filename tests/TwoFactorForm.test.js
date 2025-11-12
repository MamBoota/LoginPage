import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TwoFactorForm from '../src/components/TwoFactorForm';

describe('TwoFactorForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnGetNewCode = jest.fn();

  const defaultProps = {
    onSubmit: mockOnSubmit,
    onGetNewCode: mockOnGetNewCode,
    isLoading: false,
    error: null,
    onErrorChange: null,
    codeExpirationTime: 30000,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders two-factor form correctly', () => {
    render(<TwoFactorForm {...defaultProps} />);

    const codeGroup = screen.getByRole('group', {
      name: 'Two-factor authentication code',
    });
    expect(codeGroup).toBeInTheDocument();

    for (let i = 1; i <= 6; i++) {
      const input = screen.getByLabelText(`Code digit ${i}`);
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'text');
      expect(input).toHaveAttribute('maxLength', '1');
      expect(input).toHaveAttribute('pattern', '[0-9]');
    }

    const timer = screen.getByText(/Code expires in:/);
    expect(timer).toBeInTheDocument();
  });

  test('submits form with correct code', async () => {
    render(<TwoFactorForm {...defaultProps} />);

    for (let i = 0; i < 6; i++) {
      fireEvent.input(screen.getByLabelText(`Code digit ${i + 1}`), {
        target: { value: '1' },
      });
    }

    const submitButton = screen.getByRole('button', { name: 'Continue' });
    expect(submitButton).toBeEnabled();
    expect(submitButton).toHaveStyle('display: flex');

    await fireEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    expect(mockOnSubmit).toHaveBeenCalledWith('111111');
  });

  test('disables submit button when loading', () => {
    render(<TwoFactorForm {...defaultProps} isLoading={true} />);
    const submitButton = screen.queryByRole('button', { name: 'Continue' });
    expect(submitButton).toBeNull();
  });

  test('shows Get now button when code expires', () => {
    render(
      <TwoFactorForm {...defaultProps} codeExpirationTime={0} />
    );

    const continueButton = screen.queryByRole('button', { name: 'Continue' });
    expect(continueButton).toBeNull();

    const getNewCodeButton = screen.getByRole('button', { name: 'Get new code' });
    expect(getNewCodeButton).toBeInTheDocument();
    expect(getNewCodeButton).toBeEnabled();
  });

  test('does not submit with incomplete code', () => {
    render(<TwoFactorForm {...defaultProps} />);

    fireEvent.input(screen.getByLabelText('Code digit 1'), {
      target: { value: '1' },
    });

    const submitButton = screen.queryByRole('button', { name: 'Continue' });
    expect(submitButton).toBeNull();

    if (submitButton) fireEvent.click(submitButton);
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('shows error message when error prop is provided', () => {
    const errorMessage = 'Invalid code. Please÷ try again.';
    render(<TwoFactorForm {...defaultProps} error={errorMessage} />);

    const errorElement = screen.getByText(errorMessage);
    expect(errorElement).toBeInTheDocument();
    expect(errorElement).toHaveAttribute('role', 'alert');
  });

  test('clears error when code is changed', async () => {
    const mockOnErrorChange = jest.fn();

    render(
      <TwoFactorForm
        {...defaultProps}
        error="Test error"
        onErrorChange={mockOnErrorChange}
      />
    );

    // Ждём завершения инициализации
    await waitFor(() => {
      // Здесь можно проверить начальное состояние
    });

    const initialCallCount = mockOnErrorChange.mock.calls.length;

    // Меняем код
    fireEvent.input(screen.getByLabelText('Code digit 1'), {
      target: { value: '2' },
    });

    // Ждём вызова обработчика
    await waitFor(() => {
      expect(mockOnErrorChange).toHaveBeenCalledTimes(initialCallCount + 1);
    });
  });
});
