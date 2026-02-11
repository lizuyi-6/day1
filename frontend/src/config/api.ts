/**
 * API Configuration
 * Centralized configuration for all API endpoints
 */

// Get API URL from environment variable or use default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const API_BASE_URL = API_URL;

export const API_CONFIG = {
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
} as const;

// API endpoints
export const API_ENDPOINTS = {
  // Workflow endpoints
  workflow: {
    base: () => `${API_CONFIG.baseURL}/workflow`,
    byId: (id: string) => `${API_CONFIG.baseURL}/workflow/${id}`,
    run: (id: string) => `${API_CONFIG.baseURL}/workflow/${id}/run`,
  },
  // Health check
  health: () => `${API_CONFIG.baseURL}/health`,
} as const;

// Helper function to build full URLs
export function buildUrl(path: string): string {
  return `${API_CONFIG.baseURL}${path.startsWith('/') ? '' : '/'}${path}`;
}
