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

// Base URL para a API
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '' // URL vazia para usar paths relativos em produção
  : 'http://localhost:5001/api';

// Função para fazer requisições à API
export async function apiRequest(method: string, endpoint: string, data?: any) {
  // Em produção, usar paths relativos
  let url = process.env.NODE_ENV === 'production'
    ? endpoint
    : endpoint.startsWith('/api') 
      ? `http://localhost:5001${endpoint}`
      : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;

  // Adicionar sessionId como query parameter se estiver disponível e for um GET
  if (method === 'GET') {
    const auth = localStorage.getItem("learnflix_auth");
    if (auth) {
      try {
        const user = JSON.parse(auth);
        if (user.sessionId) {
          const separator = url.includes('?') ? '&' : '?';
          url += `${separator}sessionId=${user.sessionId}`;
        }
      } catch (error) {
        console.error('Error parsing auth data:', error);
      }
    }
  }
  
  console.log('Making API request to:', url);
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    credentials: 'include',
  };

  if (data) {
    options.body = JSON.stringify(data);
    console.log('Request data:', data);
  }

  try {
    console.log('Request options:', options);
    const response = await fetch(url, options);
    const responseData = await response.json();
    console.log('API Response:', responseData);
    
    if (!response.ok) {
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        errorData: responseData
      });
      throw new Error(responseData.message || `Erro HTTP ${response.status}`);
    }

    return responseData;
  } catch (error) {
    console.error('API Request failed:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Erro de conexão com o servidor. Verifique sua internet e tente novamente.');
    }
    throw error;
  }
}