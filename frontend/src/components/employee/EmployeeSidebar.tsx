
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Calendar,
  ClipboardCheck,
  User,
  FileText,
  Settings,
  LogOut,
  Send,
} from "lucide-react";
import { toast } from "sonner";

const EmployeeSidebar = () => {
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

  const handleNavigation = (tab: string) => {
    navigate(`/employee/dashboard?tab=${tab}`);
  };

  const isActive = (tab: string) => currentTab === tab;

  return (
    <aside className="w-16 md:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen flex flex-col">
      <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-[#33C3F0] dark:text-[#6E59A5] flex items-center">
          <ClipboardCheck className="mr-0 md:mr-2" />
          <span className="hidden md:inline">OCP Time Tracker</span>
        </h1>
      </div>
      
      <nav className="flex-1 p-2 md:p-4 space-y-1 md:space-y-2">
        <Button
          variant={isActive("overview") ? "default" : "ghost"}
          className="w-full justify-center md:justify-start"
          onClick={() => handleNavigation("overview")}
        >
          <LayoutDashboard className="h-5 w-5 md:mr-2" />
          <span className="hidden md:inline">Tableau de bord</span>
        </Button>
        
        <Button
          variant={isActive("attendance") ? "default" : "ghost"}
          className="w-full justify-center md:justify-start"
          onClick={() => handleNavigation("attendance")}
        >
          <Calendar className="h-5 w-5 md:mr-2" />
          <span className="hidden md:inline">Mes pointages</span>
        </Button>
        
        <Button
          variant={isActive("justifications") ? "default" : "ghost"}
          className="w-full justify-center md:justify-start"
          onClick={() => handleNavigation("justifications")}
        >
          <Send className="h-5 w-5 md:mr-2" />
          <span className="hidden md:inline">Justificatifs</span>
        </Button>
        
        <Button
          variant={isActive("profile") ? "default" : "ghost"}
          className="w-full justify-center md:justify-start"
          onClick={() => handleNavigation("profile")}
        >
          <User className="h-5 w-5 md:mr-2" />
          <span className="hidden md:inline">Mon profil</span>
        </Button>
        
        <Button
          variant={isActive("settings") ? "default" : "ghost"}
          className="w-full justify-center md:justify-start"
          onClick={() => handleNavigation("settings")}
        >
          <Settings className="h-5 w-5 md:mr-2" />
          <span className="hidden md:inline">Paramètres</span>
        </Button>
      </nav>
      
      <div className="p-2 md:p-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="outline"
          className="w-full justify-center md:justify-start"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 md:mr-2" />
          <span className="hidden md:inline">Déconnexion</span>
        </Button>
      </div>
    </aside>
  );
};

export default EmployeeSidebar;
