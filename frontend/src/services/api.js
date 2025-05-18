import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

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

// Service d'authentification
export const authService = {
  // Connexion utilisateur
  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      if (response.data.access_token) {
        localStorage.setItem('auth_token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur de connexion' };
    }
  },

  // Déconnexion utilisateur
  logout: async () => {
    try {
      await axios.post(`${API_URL}/logout`);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  },

  // Récupérer l'utilisateur actuel
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated: () => {
    return !!localStorage.getItem('auth_token');
  }
};

// Service de gestion des utilisateurs
export const userService = {
  // Récupérer tous les utilisateurs
  getAll: async () => {
    try {
      const response = await axios.get(`${API_URL}/users`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des utilisateurs' };
    }
  },

  // Récupérer un utilisateur par son ID
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération de l\'utilisateur' };
    }
  },

  // Créer un nouvel utilisateur
  create: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/users`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la création de l\'utilisateur' };
    }
  },

  // Mettre à jour un utilisateur
  update: async (id, userData) => {
    try {
      const response = await axios.put(`${API_URL}/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la mise à jour de l\'utilisateur' };
    }
  },

  // Supprimer un utilisateur
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la suppression de l\'utilisateur' };
    }
  }
};

// Service de gestion des pointages
export const timeEntryService = {
  // Récupérer tous les pointages
  getAll: async (filters = {}) => {
    try {
      const response = await axios.get(`${API_URL}/time-entries`, { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des pointages' };
    }
  },

  // Récupérer un pointage par son ID
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/time-entries/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération du pointage' };
    }
  },

  // Créer un nouveau pointage (entrée)
  clockIn: async (userId, period) => {
    const date = new Date().toISOString().split('T')[0];
    const time = new Date().toTimeString().split(' ')[0].substring(0, 5);
    
    try {
      const payload = {
        user_id: userId,
        date: date,
        time_in: time,
        period: period,
        status: 'in_progress'
      };
      
      console.log('Payload pour clockIn:', payload);
      
      const response = await axios.post(`${API_URL}/time-entries`, payload);
      return response.data;
    } catch (error) {
      console.error('Détails de l\'erreur clockIn:', error.response?.data);
      throw error.response?.data || { message: 'Erreur lors de l\'enregistrement du pointage d\'entrée' };
    }
  },

  // Mettre à jour un pointage (sortie)
  clockOut: async (id) => {
    const time = new Date().toTimeString().split(' ')[0].substring(0, 5);
    
    try {
      const payload = {
        time_out: time,
        status: 'completed'
      };
      
      console.log('Payload pour clockOut:', payload);
      
      const response = await axios.put(`${API_URL}/time-entries/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error('Détails de l\'erreur clockOut:', error.response?.data);
      throw error.response?.data || { message: 'Erreur lors de l\'enregistrement du pointage de sortie' };
    }
  },

  // Récupérer les statistiques de pointage
  getStats: async (filters = {}) => {
    try {
      const response = await axios.get(`${API_URL}/time-entries-stats`, { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des statistiques' };
    }
  }
};

// Service de gestion des absences
export const absenceService = {
  // Récupérer toutes les absences
  getAll: async (filters = {}) => {
    try {
      const response = await axios.get(`${API_URL}/absences`, { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des absences' };
    }
  },

  // Récupérer une absence par son ID
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/absences/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération de l\'absence' };
    }
  },

  // Créer une nouvelle demande d'absence
  create: async (formData) => {
    try {
      console.log('Envoi de la demande d\'absence');
      
      if (formData instanceof FormData) {
        const response = await axios.post(`${API_URL}/absences`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        return response.data;
      } else {
        if (!formData.user_id || !formData.start_date || !formData.end_date || 
            !formData.type || !formData.reason) {
          throw { message: 'Données incomplètes pour la création d\'une absence' };
        }
        
        if (!['sick', 'vacation', 'personal', 'other'].includes(formData.type)) {
          throw { message: 'Type d\'absence invalide' };
        }
        
        const response = await axios.post(`${API_URL}/absences`, formData);
        return response.data;
      }
    } catch (error) {
      console.error('Détails de l\'erreur création absence:', error.response?.data);
      throw error.response?.data || { message: 'Erreur lors de la création de la demande d\'absence' };
    }
  },

  // Mettre à jour une absence
  update: async (id, absenceData) => {
    try {
      const response = await axios.put(`${API_URL}/absences/${id}`, absenceData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la mise à jour de l\'absence' };
    }
  },

  // Approuver une absence
  approve: async (id, data) => {
    try {
      const response = await axios.post(`${API_URL}/absences/${id}/approve`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de l\'approbation de l\'absence' };
    }
  },

  // Rejeter une absence
  reject: async (id, data) => {
    try {
      const response = await axios.post(`${API_URL}/absences/${id}/reject`, data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors du rejet de l\'absence:', error.response?.data);
      throw error.response?.data || { message: 'Erreur lors du rejet de l\'absence' };
    }
  }
};

// Service de gestion des départements
export const departmentService = {
  // Récupérer tous les départements
  getAll: async () => {
    try {
      const response = await axios.get(`${API_URL}/departments`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des départements' };
    }
  },

  // Récupérer un département par son ID
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/departments/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération du département' };
    }
  },

  // Créer un nouveau département
  create: async (departmentData) => {
    try {
      const response = await axios.post(`${API_URL}/departments`, departmentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la création du département' };
    }
  },

  // Mettre à jour un département
  update: async (id, departmentData) => {
    try {
      const response = await axios.put(`${API_URL}/departments/${id}`, departmentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la mise à jour du département' };
    }
  },

  // Supprimer un département
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/departments/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la suppression du département' };
    }
  },

  // Récupérer les utilisateurs d'un département
  getUsers: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/departments/${id}/users`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des utilisateurs du département' };
    }
  }
};

// Service de gestion des notifications
export const notificationService = {
  // Récupérer toutes les notifications
  getAll: async () => {
    try {
      const response = await axios.get(`${API_URL}/notifications`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des notifications' };
    }
  },

  // Marquer une notification comme lue
  markAsRead: async (id) => {
    try {
      const response = await axios.put(`${API_URL}/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la mise à jour de la notification' };
    }
  },

  // Marquer toutes les notifications comme lues
  markAllAsRead: async () => {
    try {
      const response = await axios.put(`${API_URL}/notifications/read-all`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la mise à jour des notifications' };
    }
  },

  // Obtenir le nombre de notifications non lues
  getUnreadCount: async () => {
    try {
      const response = await axios.get(`${API_URL}/notifications/unread-count`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération du nombre de notifications' };
    }
  }
};