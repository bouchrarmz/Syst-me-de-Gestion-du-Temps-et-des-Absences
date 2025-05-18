
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-[#008000]">404</h1>
        <h2 className="text-3xl font-semibold mt-4 mb-6">Page non trouvée</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <Button
          className="bg-[#008000] hover:bg-[#006400]"
          onClick={() => navigate("/")}
        >
          Retour à l'accueil
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
