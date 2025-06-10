import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});

// Base URL para desenvolvimento local
export const API_BASE_URL = 'http://localhost:5000/api';

// Função para fazer requisições à API
export async function apiRequest(method: string, endpoint: string, data?: any) {
  const url = endpoint.startsWith('/api') ? `http://localhost:5000${endpoint}` : `${API_BASE_URL}${endpoint}`;
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
    throw new Error(errorData.message || `Erro ${response.status}`);
  }

  return response;
}