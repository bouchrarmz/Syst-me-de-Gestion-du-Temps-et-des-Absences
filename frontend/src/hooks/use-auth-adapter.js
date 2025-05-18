import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/api';

const useAuthAdapter = () => {
  const { user, setUser, isLoading, setIsLoading } = useAuth();
  const [error, setError] = useState(null);

  // Vérifier si l'utilisateur est déjà connecté au chargement
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        // Vérifier si un token existe dans le localStorage
        if (authService.isAuthenticated()) {
          // Récupérer l'utilisateur du localStorage
          const storedUser = authService.getCurrentUser();
          if (storedUser) {
            setUser(storedUser);
          }
        }
      } catch (err) {
        console.error('Erreur lors de la vérification de l\'authentification:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [setUser, setIsLoading]);

  // Fonction de connexion adaptée pour utiliser l'API
  const login = async (email, password, role) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.login(email, password);
      setUser(response.user);
      return true;
    } catch (err) {
      console.error('Erreur de connexion:', err);
      setError(err.message || 'Erreur de connexion');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de déconnexion adaptée pour utiliser l'API
  const logout = async () => {
    setIsLoading(true);
    
    try {
      await authService.logout();
      setUser(null);
    } catch (err) {
      console.error('Erreur de déconnexion:', err);
      setError(err.message || 'Erreur de déconnexion');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    login,
    logout,
    isLoading,
    error
  };
};

export default useAuthAdapter;
