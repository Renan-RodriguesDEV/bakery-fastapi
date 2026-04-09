/**
 * 🛒 PRODUTOS - API endpoints para gerenciamento de produtos
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

import type { Category } from "@/lib/api/categories";

// Interface do produto conforme backend
export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: Category;
  validity: string;
  image?: string | null;
}

export interface ProductCreate {
  name: string;
  price: number;
  stock: number;
  category_id: number;
  validity: string;
}

export const productsApi = {
  /**
   * Buscar todos os produtos
   * @param token - JWT access token
   * @returns Array de produtos
   */
  getAllProducts: async (token: string): Promise<Product[]> => {
    const response = await fetch(`${API_BASE_URL}/products/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Erro ao buscar produtos');
    }
    return response.json();
  },

  /**
   * Buscar um produto específico (Admin)
   * @param id - ID do produto
   * @param token - JWT access token
   * @returns Dados do produto
   */
  getProduct: async (id: number, token: string): Promise<Product> => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Erro ao buscar produto');
    }
    return response.json();
  },

  /**
   * Criar novo produto (Admin)
   * @param data - Dados do produto
   * @param token - JWT access token
   * @returns Dados do produto criado
   */
  createProduct: async (data: ProductCreate, token: string): Promise<Product> => {
    const response = await fetch(`${API_BASE_URL}/products/create`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Erro ao criar produto');
    }
    return response.json();
  },

  /**
   * Atualizar produto (Admin) - PUT (todos os campos obrigatórios)
   * @param id - ID do produto
   * @param data - Dados do produto
   * @param token - JWT access token
   * @returns Dados atualizados
   */
  updateProduct: async (id: number, data: ProductCreate, token: string): Promise<Product> => {
    const response = await fetch(`${API_BASE_URL}/products/update/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Erro ao atualizar produto');
    }
    return response.json();
  },

  /**
   * Atualizar produto parcialmente (Admin) - PATCH
   * @param id - ID do produto
   * @param data - Dados parciais do produto
   * @param token - JWT access token
   * @returns Dados atualizados
   */
  updateProductPartial: async (
    id: number,
    data: Partial<ProductCreate>,
    token: string
  ): Promise<Product> => {
    const response = await fetch(`${API_BASE_URL}/products/update/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Erro ao atualizar produto');
    }
    return response.json();
  },

  /**
   * Deletar produto (Admin)
   * @param id - ID do produto
   * @param token - JWT access token
   * @returns true se deletado com sucesso
   */
  deleteProduct: async (id: number, token: string): Promise<boolean> => {
    const response = await fetch(`${API_BASE_URL}/products/delete/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.status === 204;
  },

  /**
   * Upload de imagem do produto (Admin)
   * @param productId - ID do produto
   * @param file - Arquivo de imagem
   * @param token - JWT access token
   * @returns Base64 da imagem
   */
  uploadProductImage: async (
    productId: number,
    file: File,
    token: string
  ): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE_URL}/products/image/${productId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Erro ao fazer upload da imagem');
    }
    return response.json();
  },

  /**
   * Buscar imagem do produto (Admin)
   * @param productId - ID do produto
   * @param token - JWT access token
   * @returns Base64 da imagem
   */
  getProductImage: async (productId: number, token: string): Promise<string | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/image/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        return null;
      }
      return response.json();
    } catch {
      return null;
    }
  },
};
