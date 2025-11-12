export const authApi = {
  login: async (email, password) => {
    await new Promise(resolve => setTimeout(resolve, 800)); // Имитация задержки

    if (!navigator.onLine) {
      throw new Error('Network error: No internet connection');
    }

    if (email === 'test@mail.com' && password === 'password') {
      return { success: true, userId: '123' };
    }
    
    throw new Error('Invalid email or password');
  },

  verifyTwoFactor: async (code) => {
    await new Promise(resolve => setTimeout(resolve, 600));

    if (!navigator.onLine) {
      throw new Error('Network error: No internet connection');
    }

    if (code === '123456') {
      return { success: true };
    }
    
    throw new Error('Invalid code');
  },

  requestNewCode: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));

    if (!navigator.onLine) {
      throw new Error('Network error: No internet connection');
    }

    // Имитация отправки нового кода
    return { success: true, message: 'New code sent' };
  }
};
