import { useState, useEffect } from 'react';
import { timeEntryService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "sonner";

const useTimeClockAdapter = () => {
  const [timeEntries, setTimeEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Taux horaire fixe (en DH)
  const HOURLY_RATE = 50;

  // Fonction utilitaire pour calculer la durée entre deux heures au format "HH:MM"
  const calculateDuration = (timeIn, timeOut) => {
    if (!timeIn || !timeOut) return { hours: 0, minutes: 0, formattedString: "00h00m" };

    // Convertir les heures en minutes
    const [inHours, inMinutes] = timeIn.split(':').map(Number);
    const [outHours, outMinutes] = timeOut.split(':').map(Number);
    
    const inTotalMinutes = inHours * 60 + inMinutes;
    const outTotalMinutes = outHours * 60 + outMinutes;
    
    // Calculer la différence en minutes
    let durationMinutes = outTotalMinutes - inTotalMinutes;
    
    // Gérer les cas où l'heure de sortie est le jour suivant
    if (durationMinutes < 0) {
      durationMinutes += 24 * 60; // Ajouter 24 heures en minutes
    }
    
    // Convertir en heures et minutes
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    
    // Formater la durée
    const formattedString = `${String(hours).padStart(2, '0')}h${String(minutes).padStart(2, '0')}m`;
    
    return { 
      hours, 
      minutes, 
      totalMinutes: durationMinutes,
      formattedString
    };
  };

  // Calculer le salaire en fonction de la durée
  const calculateSalary = (timeIn, timeOut) => {
    if (!timeIn || !timeOut) return 0;
    
    const { totalMinutes } = calculateDuration(timeIn, timeOut);
    // Convertir la durée en heures (avec décimales)
    const durationHours = totalMinutes / 60;
    
    // Calculer le salaire (taux horaire * durée en heures)
    return durationHours * HOURLY_RATE;
  };

  // Charger les pointages de l'utilisateur
  const loadTimeEntries = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const entries = await timeEntryService.getAll({ user_id: user.id });
      console.log("API response for getAll:", entries);
      
      // Vérifier si entries est un tableau
      let processedEntries = [];
      
      if (Array.isArray(entries)) {
        processedEntries = entries;
      } else if (entries && typeof entries === 'object') {
        // Si l'API retourne un objet avec une propriété data ou items
        processedEntries = entries.data || entries.items || [];
      }
      
      // S'assurer que les salaires sont correctement calculés
      // Cette étape est cruciale si le backend ne calcule pas les salaires
      const validatedEntries = processedEntries.map(entry => {
        // Si l'entrée a une heure d'entrée et de sortie mais pas de salaire calculé
        if (entry.time_in && entry.time_out && (
            entry.salary === undefined || 
            entry.salary === null || 
            typeof entry.salary !== 'number' ||
            isNaN(entry.salary) || 
            entry.salary <= 0
        )) {
          
          // Calculer le salaire
          const salary = calculateSalary(entry.time_in, entry.time_out);
          
          // Si la durée n'est pas calculée correctement
          if (!entry.total_hours) {
            const { formattedString } = calculateDuration(entry.time_in, entry.time_out);
            entry.total_hours = formattedString;
          }
          
          return { ...entry, salary: Number(salary) }; // Ensure salary is a number
        }
        
        // Also ensure salary is a number even if it exists
        if (entry.salary !== undefined && entry.salary !== null) {
          return { ...entry, salary: Number(entry.salary) };
        }
        
        return entry;
      });
      
      setTimeEntries(validatedEntries);
    } catch (err) {
      console.error('Erreur lors du chargement des pointages:', err);
      setError(err.message || 'Erreur lors du chargement des pointages');
      toast.error('Erreur lors du chargement des pointages');
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les pointages au chargement et quand l'utilisateur change
  useEffect(() => {
    if (user) {
      loadTimeEntries();
    }
  }, [user]);

  // Pointage d'entrée
  const clockIn = async (period) => {
    if (!user) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Calling clockIn API for period:", period);
      const newEntry = await timeEntryService.clockIn(user.id, period);
      console.log("API response for clockIn:", newEntry);
      
      // Forcer une mise à jour locale immédiate
      if (newEntry) {
        setTimeEntries(prevEntries => {
          const updatedEntries = [...prevEntries];
          
          // Vérifier si l'entrée existe déjà pour cette date et période
          const today = new Date().toISOString().split('T')[0];
          const existingIndex = updatedEntries.findIndex(e => 
            e.id === newEntry.id || 
            (e.date === today && e.period === period)
          );
          
          if (existingIndex >= 0) {
            // Remplacer l'entrée existante
            updatedEntries[existingIndex] = {...newEntry};
          } else {
            // Ajouter la nouvelle entrée
            updatedEntries.push({...newEntry});
          }
          
          return updatedEntries;
        });
      }
      
      // Notifier l'utilisateur
      toast.success(`Pointage d'entrée enregistré à ${newEntry.time_in}`, {
        description: `Période: ${period === 'morning' ? 'Matin' : 'Après-midi'}`
      });
      
      return newEntry;
    } catch (err) {
      console.error('Erreur lors du pointage d\'entrée:', err);
      setError(err.message || 'Erreur lors du pointage d\'entrée');
      toast.error('Erreur lors du pointage d\'entrée');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Pointage de sortie
  const clockOut = async (entryId) => {
    if (!entryId) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("[clockOut] Calling clockOut API for entryId:", entryId);
      const updatedEntry = await timeEntryService.clockOut(entryId);
      console.log("[clockOut] API response for clockOut:", updatedEntry);
      
      // Vérifier si l'API a bien retourné une heure de sortie
      if (!updatedEntry || !updatedEntry.time_out) {
        console.error("[clockOut] L'API n'a pas retourné d'heure de sortie valide:", updatedEntry);
        toast.error("Erreur: L'heure de sortie n'a pas été enregistrée correctement");
        return null;
      }
      
      // Vérifier si l'API n'a pas calculé le salaire
      // Si non, calculer localement le salaire
      let processedEntry = {...updatedEntry};
      
      if (processedEntry.time_in && processedEntry.time_out) {
        if (!processedEntry.salary || isNaN(processedEntry.salary) || processedEntry.salary <= 0) {
          processedEntry.salary = Number(calculateSalary(processedEntry.time_in, processedEntry.time_out));
        } else {
          // Ensure salary is a number
          processedEntry.salary = Number(processedEntry.salary);
        }
        
        if (!processedEntry.total_hours) {
          const { formattedString } = calculateDuration(processedEntry.time_in, processedEntry.time_out);
          processedEntry.total_hours = formattedString;
        }
      }
      
      // Mettre à jour l'état local avec l'entrée complète
      setTimeEntries(prevEntries => {
        const updatedEntries = [...prevEntries];
        const index = updatedEntries.findIndex(e => e.id === entryId);
        
        if (index !== -1) {
          updatedEntries[index] = processedEntry;
        }
        
        return updatedEntries;
      });
      
      // Notifier l'utilisateur avec le salaire calculé
      const salaryValue = typeof processedEntry.salary === 'number' ? 
        processedEntry.salary.toFixed(2) : 
        Number(processedEntry.salary || 0).toFixed(2);
      
      toast.success(`Pointage de sortie enregistré à ${processedEntry.time_out}`, {
        description: `Durée travaillée: ${processedEntry.total_hours || 'N/A'} | Salaire: ${salaryValue} DH`
      });
      
      return processedEntry;
    } catch (err) {
      console.error('[clockOut] Erreur lors du pointage de sortie:', err);
      setError(err.message || 'Erreur lors du pointage de sortie');
      toast.error('Erreur lors du pointage de sortie');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Récupérer les pointages du jour
  const getTodayEntries = () => {
    // Obtenir la date du jour au format YYYY-MM-DD
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    if (!Array.isArray(timeEntries)) {
      console.error("[getTodayEntries] timeEntries n'est pas un tableau:", timeEntries);
      return [];
    }

    // Filtrage strict par chaîne de date YYYY-MM-DD
    const todayEntries = timeEntries.filter(entry => {
      if (!entry || !entry.date) {
        return false;
      }

      // Extraire la partie date (YYYY-MM-DD) de entry.date
      const entryDateStr = entry.date.split("T")[0];
      return entryDateStr === todayStr;
    });

    return todayEntries;
  };

  // Récupérer le pointage du matin
  const getMorningEntry = () => {
    const todayEntries = getTodayEntries();

    // Recherche de l'entrée du matin
    const morningEntry = todayEntries.find(entry =>
      entry && (entry.period === "morning" || entry.period === "matin")
    );

    return morningEntry || null;
  };

  // Récupérer le pointage de l'après-midi
  const getAfternoonEntry = () => {
    const todayEntries = getTodayEntries();

    // Recherche de l'entrée de l'après-midi
    const afternoonEntry = todayEntries.find(entry =>
      entry && (entry.period === "afternoon" || entry.period === "après-midi" || entry.period === "apres-midi")
    );

    return afternoonEntry || null;
  };

  // Calculer le salaire journalier total
  const getTodayTotalSalary = () => {
    const todayEntries = getTodayEntries();
    
    // Calculer le salaire total
    let totalSalary = 0;
    
    todayEntries.forEach(entry => {
      // Si l'entrée a déjà un salaire calculé
      if (entry.salary && !isNaN(Number(entry.salary))) {
        totalSalary += Number(entry.salary);
      }
      // Si l'entrée a une heure d'entrée et de sortie mais pas de salaire calculé
      else if (entry.time_in && entry.time_out) {
        totalSalary += calculateSalary(entry.time_in, entry.time_out);
      }
    });
    
    return totalSalary;
  };

  return {
    timeEntries,
    isLoading,
    error,
    loadTimeEntries,
    clockIn,
    clockOut,
    getTodayEntries,
    getMorningEntry,
    getAfternoonEntry,
    getTodayTotalSalary,
    HOURLY_RATE
  };
};

export default useTimeClockAdapter;