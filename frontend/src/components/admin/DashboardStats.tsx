import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Clock, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { userService, timeEntryService } from "@/services/api"; // Importer les services API
import { toast } from "sonner";

const DashboardStats = () => {
  const [statsData, setStatsData] = useState({
    totalEmployees: 0,
    presentToday: 0,
    lateToday: 0,
    absentToday: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        // Récupérer le nombre total d'employés
        const users = await userService.getAll();
        const totalEmployees = users.length;

        // Récupérer les statistiques de présence du jour
        // Note: L'API timeEntryService.getStats() doit être implémentée ou ajustée
        // pour retourner les présences, retards, et absences du jour.
        // En attendant, nous simulons avec des données basées sur le nombre total d'employés.
        // Idéalement, l'API /time-entries-stats devrait fournir ces chiffres.
        
        // Simulation (à remplacer par un appel API réel à getStats)
        // const attendanceStats = await timeEntryService.getStats({ date: new Date().toISOString().split('T')[0] });
        // setStatsData({
        //   totalEmployees: totalEmployees,
        //   presentToday: attendanceStats.present || 0,
        //   lateToday: attendanceStats.late || 0,
        //   absentToday: attendanceStats.absent || 0,
        // });

        // Simulation simple en attendant l'API getStats
        const present = Math.floor(totalEmployees * 0.85); // 85% présents
        const late = Math.floor(totalEmployees * 0.10); // 10% en retard
        const absent = totalEmployees - present - late; // Le reste absent

        setStatsData({
          totalEmployees: totalEmployees,
          presentToday: present,
          lateToday: late,
          absentToday: absent,
        });

      } catch (error) {
        console.error("Erreur lors de la récupération des statistiques:", error);
        toast.error("Erreur lors du chargement des statistiques du tableau de bord");
        // Garder des valeurs par défaut en cas d'erreur
        setStatsData({ totalEmployees: 0, presentToday: 0, lateToday: 0, absentToday: 0 });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const stats = [
    {
      title: "Employés",
      value: statsData.totalEmployees.toString(),
      // La notion de 'change' nécessiterait des données historiques, non géré ici
      change: "", 
      icon: Users,
      color: "text-[#008000]",
    },
    {
      title: "Présences aujourd'hui",
      value: statsData.presentToday.toString(),
      change: statsData.totalEmployees > 0 ? `${Math.round((statsData.presentToday / statsData.totalEmployees) * 100)}%` : "0%",
      icon: CheckCircle2,
      color: "text-[#008000]",
    },
    {
      title: "Retards aujourd'hui",
      value: statsData.lateToday.toString(),
      change: statsData.totalEmployees > 0 ? `${Math.round((statsData.lateToday / statsData.totalEmployees) * 100)}%` : "0%",
      icon: Clock,
      color: "text-[#DAA520]",
    },
    {
      title: "Absences aujourd'hui",
      value: statsData.absentToday.toString(),
      change: statsData.totalEmployees > 0 ? `${Math.round((statsData.absentToday / statsData.totalEmployees) * 100)}%` : "0%",
      icon: AlertCircle,
      color: "text-red-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-6">
      {isLoading ? (
         Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-6 flex justify-between items-center animate-pulse">
              <div>
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-6 bg-gray-300 rounded w-12 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-8"></div>
              </div>
              <div className="rounded-full p-3 bg-gray-200 h-12 w-12"></div>
            </CardContent>
          </Card>
        ))
      ) : (
        stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</h3>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{stat.change}</p>
              </div>
              <div className={`rounded-full p-3 bg-gray-100 dark:bg-gray-800 ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default DashboardStats;

