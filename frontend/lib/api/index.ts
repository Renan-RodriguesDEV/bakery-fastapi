/**
 * 🔌 API Integrations Index
 * Exports all API functions for easy importing
 */

export { authApi } from './auth';
export { usersApi } from './users';
export { productsApi } from './products';
export { cartApi } from './cart';
export { salesApi } from './sales';
export { agentApi } from './agent';

/**
 * Exemplo de uso:
 *
 * import { authApi, productsApi, usersApi } from '@/lib/api';
 *
 * // Login
 * const loginResponse = await authApi.login({
 *   username: 'user@example.com',
 *   password: 'password123'
 * });
 *
 * // Buscar produtos
 * const products = await productsApi.getAllProducts(token);
 *
 * // Buscar usuário atual
 * const user = await usersApi.getCurrentUser(token);
 */
