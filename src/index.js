import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Монтируем компоненты в существующие контейнеры статического HTML
const loginFormContainer = document.getElementById('react-login-form');
const twoFactorFormContainer = document.getElementById('react-2fa-form');
const toastContainer = document.getElementById('react-toast-container');

if (loginFormContainer && twoFactorFormContainer && toastContainer) {
  // Создаем скрытый корневой контейнер для React (не отображается на странице)
  const rootContainer = document.createElement('div');
  rootContainer.style.display = 'none';
  document.body.appendChild(rootContainer);
  
  const root = ReactDOM.createRoot(rootContainer);
  root.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <App 
          loginContainer={loginFormContainer}
          twoFactorContainer={twoFactorFormContainer}
          toastContainer={toastContainer}
        />
      </QueryClientProvider>
    </React.StrictMode>
  );
} else {
  console.error('Не найдены контейнеры для React компонентов');
}
