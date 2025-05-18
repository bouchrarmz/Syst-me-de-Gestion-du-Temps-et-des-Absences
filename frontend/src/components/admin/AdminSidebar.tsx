
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardCheck,
  FileBarChart,
  Settings,
  LogOut,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentTab = new URLSearchParams(location.search).get('tab') || "overview";

  const handleLogout = () => {
    toast.info("Déconnexion en cours...", {
      duration: 2000,
    });
    setTimeout(() => {
      localStorage.removeItem("user");
      navigate("/");
    }, 1000);
  };

  const isActive = (tab: string) => currentTab === tab;

  const handleNavigation = (tab: string) => {
    navigate(`/admin/dashboard?tab=${tab}`);
  };

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-[#008000] dark:text-[#4ADE80] flex items-center">
          <ClipboardCheck className="mr-2" />
          OCP Time Tracker
        </h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        <Button
          variant={isActive("overview") ? "default" : "ghost"}
          className="w-full justify-start"
          onClick={() => handleNavigation("overview")}
        >
          <LayoutDashboard className="mr-2 h-5 w-5" />
          Tableau de bord
        </Button>
        
        <Button
          variant={isActive("employees") ? "default" : "ghost"}
          className="w-full justify-start"
          onClick={() => handleNavigation("employees")}
        >
          <Users className="mr-2 h-5 w-5" />
          Employés
        </Button>
        
        <Button
          variant={isActive("attendance") ? "default" : "ghost"}
          className="w-full justify-start"
          onClick={() => handleNavigation("attendance")}
        >
          <Calendar className="mr-2 h-5 w-5" />
          Pointages
        </Button>
        
        <Button
          variant={isActive("justifications") ? "default" : "ghost"}
          className="w-full justify-start"
          onClick={() => handleNavigation("justifications")}
        >
          <AlertTriangle className="mr-2 h-5 w-5" />
          Justificatifs
        </Button>
        
        <Button
          variant={isActive("reports") ? "default" : "ghost"}
          className="w-full justify-start"
          onClick={() => handleNavigation("reports")}
        >
          <FileBarChart className="mr-2 h-5 w-5" />
          Rapports
        </Button>
        
        <Button
          variant={isActive("settings") ? "default" : "ghost"}
          className="w-full justify-start"
          onClick={() => handleNavigation("settings")}
        >
          <Settings className="mr-2 h-5 w-5" />
          Paramètres
        </Button>
      </nav>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-5 w-5" />
          Déconnexion
        </Button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
