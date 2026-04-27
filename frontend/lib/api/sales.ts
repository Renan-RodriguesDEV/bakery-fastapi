/**
 * 💰 VENDAS - API endpoints para gerenciamento de vendas/compras
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const salesApi = {
  /**
   * Buscar todas as vendas (Admin)
   * @param token - JWT access token
   * @returns Array de vendas
   */
  getAllSales: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/sales/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  },

  /**
   * Buscar vendas com filtros
   * @param filters - { user_id?, product_id?, was_paid? }
   * @param token - JWT access token
   * @returns Array de vendas filtradas
   */
  getSalesFiltered: async (
    filters: {
      user_id?: number;
      product_id?: number;
      was_paid?: boolean;
    },
    token: string
  ) => {
    const params = new URLSearchParams();
    if (filters.user_id) params.append('user_id', filters.user_id.toString());
    if (filters.product_id)
      params.append('product_id', filters.product_id.toString());
    if (filters.was_paid !== undefined)
      params.append('was_paid', filters.was_paid.toString());

    const response = await fetch(
      `${API_BASE_URL}/sales/all?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.json();
  },

  /**
   * Buscar uma venda específica
   * @param id - ID da venda
   * @param token - JWT access token
   * @returns Dados da venda
   */
  getSale: async (id: number, token: string) => {
    const response = await fetch(`${API_BASE_URL}/sales/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  },

  /**
   * Criar venda / Finalizar compra
   * @param data - { user_id, product_id, count, was_paid }
   * @param token - JWT access token
   * @returns Dados da venda criada
   */
  createSale: async (
    data: {
      user_id: number;
      product_id: number;
      count: number;
      was_paid: boolean;
      created_at?: string;
    },
    token: string
  ) => {
    const response = await fetch(`${API_BASE_URL}/sales/create`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  /**
   * Marcar uma venda como paga
   * @param id - ID da venda
   * @param token - JWT access token
   * @returns Dados da venda atualizada
   */
  markSaleAsPaid: async (id: number, token: string) => {
    const response = await fetch(`${API_BASE_URL}/sales/update/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ was_paid: true }),
    });
    return response.json();
  },

  /**
   * Marcar múltiplas vendas como pagas
   * @param saleIds - Array de IDs das vendas
   * @param token - JWT access token
   * @returns Array com resultados de cada atualização
   */
  markMultipleSalesAsPaid: async (
    saleIds: number[],
    token: string
  ) => {
    const results = await Promise.all(
      saleIds.map((id) =>
        fetch(`${API_BASE_URL}/sales/update/${id}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ was_paid: true }),
        }).then((res) => res.json())
      )
    );
    return results;
  },

  /**
   * Deletar uma venda
   * @param id - ID da venda
   * @param token - JWT access token
   * @returns Confirmação de deleção
   */
  deleteSale: async (id: number, token: string) => {
    const response = await fetch(`${API_BASE_URL}/sales/delete/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return { error: 'Erro ao deletar venda' };
    }

    return { success: true };
  },

  /**
   * Deletar múltiplas vendas
   * @param ids - IDs das vendas
   * @param token - JWT access token
   */
  deleteMultipleSales: async (ids: number[], token: string) => {
    const results = await Promise.all(
      ids.map(async (id) => {
        const response = await fetch(`${API_BASE_URL}/sales/delete/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        return {
          id,
          ok: response.ok,
        };
      })
    );

    return results;
  },

  /**
   * Atualizar parcialmente uma venda
   * @param id - ID da venda
   * @param data - { count?, was_paid? }
   * @param token - JWT access token
   * @returns Dados da venda atualizada
   */
  updateSale: async (
    id: number,
    data: {
      count?: number;
      was_paid?: boolean;
    },
    token: string
  ) => {
    const response = await fetch(`${API_BASE_URL}/sales/update/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};
