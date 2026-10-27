/* import axios from 'axios';

// El export es obligatorio aquí 👇
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  withCredentials: true, // envía la cookie refreshToken
});

// Adjunta el accessToken a cada request si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}); */

import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  withCredentials: true, // Vital para que viaje la cookie del refresh token
});

// 1. Interceptor de Petición (Request)
// Adjunta el accessToken a cada request si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 2. Interceptor de Respuesta (Response)
// Atrapa los errores 401 (Token expirado) e intenta renovar la sesión
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response, // Si todo va bien, devolvemos la respuesta intacta
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401, no es la ruta de login/refresh, y no hemos intentado renovar aún
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/login') &&
      !originalRequest.url.includes('/auth/refresh')
    ) {
      
      if (isRefreshing) {
        // Si ya se está refrescando, encolamos esta petición hasta que termine
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Pedimos un nuevo token (la cookie viaja automáticamente por withCredentials)
        const { data } = await api.post('/auth/refresh');
        
        // Guardamos el nuevo token
        localStorage.setItem('accessToken', data.accessToken);
        
        // Actualizamos la petición original y liberamos la cola
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        processQueue(null, data.accessToken);
        
        return api(originalRequest);
      } catch (refreshError) {
        // Si el refresh falla (ej. cookie expiró a los 7 días), cerramos sesión
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        
        // Opcional: Recargar la página para que AuthContext se entere del logout
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);