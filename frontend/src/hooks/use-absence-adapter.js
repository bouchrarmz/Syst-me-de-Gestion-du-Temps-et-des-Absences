import { useState, useEffect } from 'react';
import { absenceService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "sonner";

const useAbsenceAdapter = () => {
  const [absences, setAbsences] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Charger les absences de l'utilisateur
  const loadUserAbsences = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await absenceService.getAll({ user_id: user.id });
      setAbsences(data);
    } catch (err) {
      console.error('Erreur lors du chargement des absences:', err);
      setError(err.message || 'Erreur lors du chargement des absences');
      toast.error('Erreur lors du chargement des absences');
    } finally {
      setIsLoading(false);
    }
  };

  // Charger toutes les absences (pour les admins)
  const loadAllAbsences = async (filters = {}) => {
    if (!user || user.role !== 'admin') return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await absenceService.getAll(filters);
      setAbsences(data);
    } catch (err) {
      console.error('Erreur lors du chargement des absences:', err);
      setError(err.message || 'Erreur lors du chargement des absences');
      toast.error('Erreur lors du chargement des absences');
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les absences au chargement et quand l'utilisateur change
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        loadAllAbsences();
      } else {
        loadUserAbsences();
      }
    }
  }, [user]);

  // Créer une nouvelle demande d'absence
  const createAbsence = async (absenceData) => {
    if (!user) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = {
        ...absenceData,
        user_id: user.id
      };
      
      const newAbsence = await absenceService.create(data);
      setAbsences([...absences, newAbsence]);
      
      toast.success('Demande d\'absence créée avec succès');
      return newAbsence;
    } catch (err) {
      console.error('Erreur lors de la création de la demande d\'absence:', err);
      setError(err.message || 'Erreur lors de la création de la demande d\'absence');
      toast.error('Erreur lors de la création de la demande d\'absence');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Approuver une absence (pour les admins)
  const approveAbsence = async (id, comments = null) => {
    if (!user || user.role !== 'admin') return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedAbsence = await absenceService.approve(id, comments);
      
      // Mettre à jour la liste des absences
      setAbsences(absences.map(absence => 
        absence.id === id ? updatedAbsence : absence
      ));
      
      toast.success('Absence approuvée avec succès');
      return updatedAbsence;
    } catch (err) {
      console.error('Erreur lors de l\'approbation de l\'absence:', err);
      setError(err.message || 'Erreur lors de l\'approbation de l\'absence');
      toast.error('Erreur lors de l\'approbation de l\'absence');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Rejeter une absence (pour les admins)
  const rejectAbsence = async (id, comments = null) => {
    if (!user || user.role !== 'admin') return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedAbsence = await absenceService.reject(id, comments);
      
      // Mettre à jour la liste des absences
      setAbsences(absences.map(absence => 
        absence.id === id ? updatedAbsence : absence
      ));
      
      toast.success('Absence rejetée avec succès');
      return updatedAbsence;
    } catch (err) {
      console.error('Erreur lors du rejet de l\'absence:', err);
      setError(err.message || 'Erreur lors du rejet de l\'absence');
      toast.error('Erreur lors du rejet de l\'absence');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    absences,
    isLoading,
    error,
    loadUserAbsences,
    loadAllAbsences,
    createAbsence,
    approveAbsence,
    rejectAbsence
  };
};

export default useAbsenceAdapter;
