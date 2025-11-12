import { renderHook, act } from '@testing-library/react-hooks';
import { useAuth } from '../src/hooks/useAuth';
import { authApi } from 'mock';

jest.mock('../src/api/authApi', () => ({
  authApi: {
    login: jest.fn(),
    verifyTwoFactor: jest.fn(),
  },
}));

describe('useAuth hook', () => {
  test('handles successful login', async () => {
    const { result } = renderHook(() => useAuth());
    
    act(() => {
      result.current.login({ email: 'test@mail.com', password: 'password' });
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
    });

    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBeFalsy();
  });

  test('handles login error', async () => {
    authApi.login.mockRejectedValue(new Error('Invalid credentials'));
    
    const { result } = renderHook(() => useAuth());
    
    act(() => {
      result.current.login({ email: 'wrong@mail.com', password: 'wrong' });
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
    });

    expect(result.current.error).toBe('Invalid credentials');
    expect(result.current.isLoading).toBeFalsy();
  });
});
