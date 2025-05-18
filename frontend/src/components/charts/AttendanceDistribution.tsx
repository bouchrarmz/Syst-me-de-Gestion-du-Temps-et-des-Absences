import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { timeEntryService } from "@/services/api"; // Importer le service API
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";

const AttendanceDistribution = () => {
  const [distributionData, setDistributionData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDistributionData = async () => {
      setIsLoading(true);
      try {
        // Récupérer les données de distribution de présence (ex: pour aujourd'hui par défaut)
        const stats = await timeEntryService.getStats(); // Appel API réel

        // Vérifier si les données de distribution existent
        if (stats && stats.distribution && stats.distribution.total_employees > 0) {
          const { presences, delays, absences, total_employees } = stats.distribution;
          
          // Calculer les pourcentages
          const presencePercentage = (presences / total_employees) * 100;
          const delayPercentage = (delays / total_employees) * 100;
          const absencePercentage = (absences / total_employees) * 100;
          // Optionnel: Calculer le pourcentage de "non pointé" ou "inconnu"
          // const unaccountedPercentage = 100 - presencePercentage - delayPercentage - absencePercentage;

          const formattedData = [
            { name: 'Présences', value: parseFloat(presencePercentage.toFixed(1)) },
            { name: 'Retards', value: parseFloat(delayPercentage.toFixed(1)) },
            { name: 'Absences', value: parseFloat(absencePercentage.toFixed(1)) },
            // { name: 'Non Pointé', value: parseFloat(unaccountedPercentage.toFixed(1)) } // Si besoin
          ].filter(item => item.value > 0); // Filtrer les catégories avec 0% pour ne pas encombrer

          setDistributionData(formattedData);
        } else if (stats && stats.distribution && stats.distribution.total_employees === 0) {
           setDistributionData([]); // Aucun employé actif
           toast.info("Aucun employé actif trouvé pour calculer la distribution.");
        } else {
          console.warn("Format de données inattendu pour la distribution:", stats);
          setDistributionData([]); // Mettre à vide si le format est incorrect
          toast.warning("Les données de distribution n'ont pas pu être chargées correctement.");
        }

      } catch (error) {
        console.error("Erreur lors de la récupération des données de distribution:", error);
        toast.error("Erreur lors du chargement de la distribution des présences");
        setDistributionData([]); // Garder vide en cas d'erreur
      } finally {
        setIsLoading(false);
      }
    };

    fetchDistributionData();
  }, []); // Le tableau vide signifie que cela s'exécute une seule fois au montage

  const COLORS = ['#008000', '#DAA520', '#ff4d4f', '#8884d8']; // Ajout d'une couleur pour 'Non Pointé' si besoin

  const renderPieChart = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-[300px]">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          Chargement des données...
        </div>
      );
    }

    // Vérifier si toutes les valeurs sont à 0 ou si le tableau est vide
    if (!distributionData || distributionData.length === 0 || distributionData.every(d => d.value === 0)) {
      return <div className="text-center h-[300px] flex items-center justify-center">Aucune donnée de distribution disponible.</div>;
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={distributionData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {distributionData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name) => [
              typeof value === "number" ? `${value.toFixed(1)}%` : value,
              name
            ]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="w-full h-[300px]">
      {renderPieChart()}
    </div>
  );
};

export default AttendanceDistribution;

