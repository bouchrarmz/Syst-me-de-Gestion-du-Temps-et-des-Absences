
import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "admin" | "employee";
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Si l'authentification est en cours, afficher un écran de chargement
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg">Chargement...</p>
      </div>
    );
  }

  // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
  if (!user || !user.isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Si un rôle spécifique est requis, vérifier que l'utilisateur a ce rôle
  if (requiredRole && user.role !== requiredRole) {
    // Rediriger vers le dashboard approprié pour l'utilisateur
    const redirectPath = user.role === "admin" ? "/admin/dashboard" : "/employee/dashboard";
    return <Navigate to={redirectPath} replace />;
  }

  // Si tout est ok, afficher le contenu protégé
  return <>{children}</>;
};

export default ProtectedRoute;
