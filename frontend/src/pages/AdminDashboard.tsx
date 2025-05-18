
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Clock, Users, AlertTriangle, FileText } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";
import DashboardStats from "@/components/admin/DashboardStats";
import EmployeeTable from "@/components/admin/EmployeeTable";
import AttendanceChart from "@/components/charts/AttendanceChart";
import AttendanceDistribution from "@/components/charts/AttendanceDistribution";
import AbsenceJustificationList from "@/components/admin/AbsenceJustificationList";
import AttendanceRegister from "@/components/admin/AttendanceRegister";
import ReportGenerator from "@/components/admin/ReportGenerator";
import Settings from "@/components/common/Settings";

const AdminDashboard = () => {
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  // Synchroniser l'onglet actif avec les paramètres d'URL
  useEffect(() => {
    if (tabParam && ["overview", "employees", "attendance", "justifications", "reports", "settings"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Mettre à jour l'URL lorsque l'onglet change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/admin/dashboard?tab=${value}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <AdminHeader />
        <main className="p-6 overflow-y-auto">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Tableau de bord</h1>
          
          <DashboardStats />
          
          <Tabs value={activeTab} className="mt-6" onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 mb-8">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="employees">Employés</TabsTrigger>
              <TabsTrigger value="attendance">Pointages</TabsTrigger>
              <TabsTrigger value="justifications">Justificatifs</TabsTrigger>
              <TabsTrigger value="reports">Rapports</TabsTrigger>
              <TabsTrigger value="settings">Paramètres</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="mr-2 h-5 w-5 text-[#008000]" />
                      Pointages récents
                    </CardTitle>
                    <CardDescription>Derniers enregistrements de présence</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AttendanceChart />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="mr-2 h-5 w-5 text-[#DAA520]" />
                      Distribution des présences
                    </CardTitle>
                    <CardDescription>Présences, retards et absences</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AttendanceDistribution />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="employees">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5 text-[#008000]" />
                    Liste des employés
                  </CardTitle>
                  <CardDescription>Gérez les comptes des agents</CardDescription>
                </CardHeader>
                <CardContent>
                  <EmployeeTable />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="attendance">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CalendarDays className="mr-2 h-5 w-5 text-[#008000]" />
                    Registre de pointage
                  </CardTitle>
                  <CardDescription>Suivi des entrées et sorties</CardDescription>
                </CardHeader>
                <CardContent>
                  <AttendanceRegister />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="justifications">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5 text-[#DAA520]" />
                    Justificatifs d'absence
                  </CardTitle>
                  <CardDescription>Gestion des demandes de justification</CardDescription>
                </CardHeader>
                <CardContent>
                  <AbsenceJustificationList />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-[#DAA520]" />
                    Rapports et statistiques
                  </CardTitle>
                  <CardDescription>Analyse des données de présence</CardDescription>
                </CardHeader>
                <CardContent>
                  <ReportGenerator />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-[#DAA520]" />
                    Paramètres
                  </CardTitle>
                  <CardDescription>Gérer les paramètres système</CardDescription>
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

export default AdminDashboard;
