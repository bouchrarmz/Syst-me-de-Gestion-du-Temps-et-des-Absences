import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/api";

// Define user interface
interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: "admin" | "employee";
  department?: string;
  position?: string;
  join_date?: string;
  status?: string;
  avatar?: string;
  isAuthenticated: boolean;
}

// Define context type
interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (username: string, password: string, role: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
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
            const adaptedUser = {
              ...storedUser,
              username: storedUser.name, // Adapter le nom du champ pour la compatibilité
              isAuthenticated: true
            };
            setUser(adaptedUser);
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
  }, []);

  // Login function
  const login = async (email: string, password: string, role: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.login(email, password);
      console.log('Login response:', response);
      const adaptedUser = {
        ...response.user,
        username: response.user.name, // Adapter le nom du champ pour la compatibilité
        isAuthenticated: true
      };
      setUser(adaptedUser);
      return true;
    } catch (err) {
      console.error('Erreur de connexion:', err);
      setError(err.message || 'Erreur de connexion');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    
    try {
      await authService.logout();
      setUser(null);
      navigate("/");
    } catch (err) {
      console.error('Erreur de déconnexion:', err);
      setError(err.message || 'Erreur de déconnexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, isLoading, setIsLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
