/**
 * 📚 CATEGORIAS - API endpoints para categorias de produtos
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Category {
  id: number;
  name: string;
}

export interface CategoryCreate {
  name: string;
}

export const categoriesApi = {
  getAllCategories: async (token: string): Promise<Category[]> => {
    const response = await fetch(`${API_BASE_URL}/categories/all`,{
      headers:{
        Authorization:`Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Erro ao buscar categorias");
    }
    return response.json();
  },

  createCategory: async (data: CategoryCreate, token: string): Promise<Category> => {
    const response = await fetch(`${API_BASE_URL}/categories/create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Erro ao criar categoria");
    }

    return response.json();
  },

  deleteCategory: async (categoryId: number, token: string): Promise<boolean> => {
    const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok && response.status !== 204) {
      const error = await response.json();
      throw new Error(error.detail || "Erro ao deletar categoria");
    }

    return response.status === 204;
  },
};