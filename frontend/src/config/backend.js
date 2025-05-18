import axios from 'axios';

// Configuration pour permettre les requêtes cross-origin
const corsConfig = {
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  },
  withCredentials: true
};

// Créer un fichier de configuration pour connecter le frontend au backend
export const backendConfig = {
  // URL de base de l'API
  apiUrl: 'http://localhost:8000/api',
  
  // Configuration CORS
  corsConfig: corsConfig,
  
  // Fonction pour initialiser axios avec le token d'authentification
  setupAxios: () => {
    // Configurer axios pour inclure les cookies dans les requêtes
    axios.defaults.withCredentials = true;

    // Intercepteur pour ajouter le token d'authentification à chaque requête
    axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    
    // Intercepteur pour gérer les erreurs d'authentification
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Erreur API:', error);
        if (error.response && error.response.status === 401) {
          // Rediriger vers la page de connexion si le token est expiré
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }
};
