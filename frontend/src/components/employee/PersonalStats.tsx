import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Calendar, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { timeEntryService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

const PersonalStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState([
    {
      title: "Présences ce mois",
      value: "0",
      change: "0%",
      icon: CheckCircle2,
      color: "text-[#008000]",
      bgColor: "bg-green-100/80 dark:bg-green-900/20"
    },
    {
      title: "Retards ce mois",
      value: "0",
      change: "0%",
      icon: Clock,
      color: "text-[#DAA520]",
      bgColor: "bg-yellow-100/80 dark:bg-yellow-900/20"
    },
    {
      title: "Absences ce mois",
      value: "0",
      change: "0%",
      icon: AlertCircle,
      color: "text-red-500",
      bgColor: "bg-red-100/80 dark:bg-red-900/20"
    },
    {
      title: "Heures travaillées",
      value: "0h",
      change: "Cette semaine: 0h",
      icon: Calendar,
      color: "text-blue-500",
      bgColor: "bg-blue-100/80 dark:bg-blue-900/20"
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Récupérer les statistiques depuis l'API
        const statsData = await timeEntryService.getStats({ user_id: user.id });
        
        // Mettre à jour les statistiques avec les données de l'API
        // Vérifier que les données existent avant de les utiliser
        setStats([
          {
            title: "Présences ce mois",
            value: statsData.presences_count !== undefined ? statsData.presences_count.toString() : "0",
            change: `${statsData.presence_percentage || 0}%`,
            icon: CheckCircle2,
            color: "text-[#008000]",
            bgColor: "bg-green-100/80 dark:bg-green-900/20"
          },
          {
            title: "Retards ce mois",
            value: statsData.late_count !== undefined ? statsData.late_count.toString() : "0",
            change: `${statsData.late_percentage || 0}%`,
            icon: Clock,
            color: "text-[#DAA520]",
            bgColor: "bg-yellow-100/80 dark:bg-yellow-900/20"
          },
          {
            title: "Absences ce mois",
            value: statsData.absences_count !== undefined ? statsData.absences_count.toString() : "0",
            change: `${statsData.absence_percentage || 0}%`,
            icon: AlertCircle,
            color: "text-red-500",
            bgColor: "bg-red-100/80 dark:bg-red-900/20"
          },
          {
            title: "Heures travaillées",
            value: `${statsData.total_hours || 0}h`,
            change: `Cette semaine: ${statsData.weekly_hours || 0}h`,
            icon: Calendar,
            color: "text-blue-500",
            bgColor: "bg-blue-100/80 dark:bg-blue-900/20"
          },
        ]);
      } catch (error) {
        console.error("Erreur lors de la récupération des statistiques:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-6">
      {isLoading ? (
        <div className="col-span-4 flex justify-center items-center p-6">
          <RefreshCw className="h-8 w-8 animate-spin text-[#33C3F0]" />
          <span className="ml-2 text-gray-500">Chargement des statistiques...</span>
        </div>
      ) : (
        stats.map((stat, index) => (
          <Card key={index} className="border dark:border-gray-700">
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
                <h3 className="text-2xl font-bold dark:text-white">{stat.value}</h3>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{stat.change}</p>
              </div>
              <div className={`rounded-full p-3 ${stat.bgColor} ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default PersonalStats;
