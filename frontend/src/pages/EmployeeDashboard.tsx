
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, User, Clock, FileText, Send, Home, FileBarChart } from "lucide-react";
import EmployeeHeader from "@/components/employee/EmployeeHeader";
import EmployeeSidebar from "@/components/employee/EmployeeSidebar";
import PersonalStats from "@/components/employee/PersonalStats";
import AttendanceCalendar from "@/components/employee/AttendanceCalendar";
import PersonalAttendanceChart from "@/components/charts/PersonalAttendanceChart";
import EmployeeProfile from "@/components/employee/EmployeeProfile";
import AbsenceJustification from "@/components/employee/AbsenceJustification";
import WorkHoursStats from "@/components/employee/WorkHoursStats";
import FilterableAttendanceTable from "@/components/employee/FilterableAttendanceTable";
import Settings from "@/components/common/Settings";
import TimeClockSystem from "@/components/employee/TimeClockSystem";
import { useSearchParams, useNavigate } from "react-router-dom";

const EmployeeDashboard = () => {
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  // Synchroniser l'onglet actif avec les paramètres d'URL
  useEffect(() => {
    if (tabParam && ["overview", "attendance", "justifications", "profile", "settings"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Mettre à jour l'URL lorsque l'onglet change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/employee/dashboard?tab=${value}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col md:flex-row">
      <EmployeeSidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <EmployeeHeader />
        <main className="p-4 md:p-6 overflow-y-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Tableau de bord</h1>
          
          {/* Système de pointage - affiché en haut de la page */}
          <div className="mb-6">
            <TimeClockSystem />
          </div>
          
          <PersonalStats />
          
          <Tabs value={activeTab} className="mt-6" onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-8">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Vue d'ensemble</span>
                <span className="sm:hidden">Accueil</span>
              </TabsTrigger>
              <TabsTrigger value="attendance" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">Mes pointages</span>
                <span className="sm:hidden">Pointages</span>
              </TabsTrigger>
              <TabsTrigger value="justifications" className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">Justificatifs</span>
                <span className="sm:hidden">Justifier</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Mon profil</span>
                <span className="sm:hidden">Profil</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Paramètres</span>
                <span className="sm:hidden">Param.</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="mr-2 h-5 w-5 text-[#33C3F0] dark:text-[#6E59A5]" />
                      Mes heures récentes
                    </CardTitle>
                    <CardDescription>Historique des derniers 7 jours</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PersonalAttendanceChart />
                  </CardContent>
                </Card>
                
                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CalendarDays className="mr-2 h-5 w-5 text-[#33C3F0] dark:text-[#6E59A5]" />
                      Calendrier mensuel
                    </CardTitle>
                    <CardDescription>Aperçu de vos présences</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AttendanceCalendar />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="attendance" className="space-y-6">
              <WorkHoursStats />
              
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-[#33C3F0] dark:text-[#6E59A5]" />
                    Historique de pointage
                  </CardTitle>
                  <CardDescription>Consultez vos heures de présence</CardDescription>
                </CardHeader>
                <CardContent>
                  <FilterableAttendanceTable />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="justifications">
              <AbsenceJustification />
            </TabsContent>
            
            <TabsContent value="profile">
              <EmployeeProfile />
            </TabsContent>
            
            <TabsContent value="settings">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-[#33C3F0] dark:text-[#6E59A5]" />
                    Paramètres
                  </CardTitle>
                  <CardDescription>Gérez vos préférences</CardDescription>
                </CardHeader>
                <CardContent>
                  <Settings />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
