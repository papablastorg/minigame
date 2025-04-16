export const CONFIG = {
  BASE_URL: import.meta.env.VITE_BASE_URL || '/',
  BASE_API_URL: import.meta.env.VITE_BASE_API_URL || 'http://localhost:9000',
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:9000',
  ENV: import.meta.env.VITE_ENV || 'development',
};
