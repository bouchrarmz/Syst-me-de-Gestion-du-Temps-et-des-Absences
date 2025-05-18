
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ClipboardCheck } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Rediriger l'utilisateur en fonction de son rôle s'il est déjà connecté
  useEffect(() => {
    if (user?.isAuthenticated) {
      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/employee/dashboard");
      }
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <ClipboardCheck size={60} className="text-[#008000]" />
        </div>
        <h1 className="text-4xl font-bold text-[#008000]">OCP Time Tracker</h1>
        <p className="text-xl text-gray-600 mt-2">
          Système de Gestion de Pointage des Agents
        </p>
      </div>

      <div className="w-full max-w-md px-6">
        <Button 
          className="w-full bg-[#008000] hover:bg-[#006400] text-lg py-6"
          onClick={() => navigate("/login")}
        >
          Accéder à l'application
        </Button>
        
        <div className="mt-8 text-center text-gray-500">
          <p>Développé pour l'Office Chérifien des Phosphates</p>
          <p className="mt-2">© 2023 OCP Group. Tous droits réservés.</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
