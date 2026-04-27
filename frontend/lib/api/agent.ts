/**
 * 🤖 IA AGENT - API endpoints para interação com o assistente de IA
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const agentApi = {
  /**
   * Fazer pergunta ao agente de IA
   * @param question - A pergunta a ser feita ao agente
   * @param token - Token de autenticação (opcional)
   * @returns Resposta do agente
   */
  askAgent: async (question: string, token?: string) => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/agent/ask-llm?question=${encodeURIComponent(question)}`, {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.statusText}`);
    }

    return response.json();
  },
};
