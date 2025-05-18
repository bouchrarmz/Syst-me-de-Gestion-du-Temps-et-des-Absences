import { useState, useEffect } from 'react';
import { userService, departmentService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "sonner";

const useEmployeeAdapter = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Charger tous les employés (pour les admins)
  const loadEmployees = async () => {
    if (!user || user.role !== 'admin') return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await userService.getAll();
      setEmployees(data);
    } catch (err) {
      console.error('Erreur lors du chargement des employés:', err);
      setError(err.message || 'Erreur lors du chargement des employés');
      toast.error('Erreur lors du chargement des employés');
    } finally {
      setIsLoading(false);
    }
  };

  // Charger tous les départements
  const loadDepartments = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await departmentService.getAll();
      setDepartments(data);
    } catch (err) {
      console.error('Erreur lors du chargement des départements:', err);
      setError(err.message || 'Erreur lors du chargement des départements');
      toast.error('Erreur lors du chargement des départements');
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les données au chargement et quand l'utilisateur change
  useEffect(() => {
    if (user && user.role === 'admin') {
      loadEmployees();
      loadDepartments();
    }
  }, [user]);

  // Créer un nouvel employé
  const createEmployee = async (employeeData) => {
    if (!user || user.role !== 'admin') return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const newEmployee = await userService.create(employeeData);
      setEmployees([...employees, newEmployee]);
      
      toast.success('Employé ajouté avec succès');
      return newEmployee;
    } catch (err) {
      console.error('Erreur lors de la création de l\'employé:', err);
      setError(err.message || 'Erreur lors de la création de l\'employé');
      toast.error('Erreur lors de la création de l\'employé');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Mettre à jour un employé
  const updateEmployee = async (id, employeeData) => {
    if (!user || user.role !== 'admin') return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedEmployee = await userService.update(id, employeeData);
      
      // Mettre à jour la liste des employés
      setEmployees(employees.map(employee => 
        employee.id === id ? updatedEmployee : employee
      ));
      
      toast.success('Employé modifié avec succès');
      return updatedEmployee;
    } catch (err) {
      console.error('Erreur lors de la mise à jour de l\'employé:', err);
      setError(err.message || 'Erreur lors de la mise à jour de l\'employé');
      toast.error('Erreur lors de la mise à jour de l\'employé');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Supprimer un employé
  const deleteEmployee = async (id) => {
    if (!user || user.role !== 'admin') return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await userService.delete(id);
      
      // Mettre à jour la liste des employés
      setEmployees(employees.filter(employee => employee.id !== id));
      
      toast.success('Employé supprimé avec succès');
      return true;
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'employé:', err);
      setError(err.message || 'Erreur lors de la suppression de l\'employé');
      toast.error('Erreur lors de la suppression de l\'employé');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Créer un nouveau département
  const createDepartment = async (departmentData) => {
    if (!user || user.role !== 'admin') return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const newDepartment = await departmentService.create(departmentData);
      setDepartments([...departments, newDepartment]);
      
      toast.success('Département ajouté avec succès');
      return newDepartment;
    } catch (err) {
      console.error('Erreur lors de la création du département:', err);
      setError(err.message || 'Erreur lors de la création du département');
      toast.error('Erreur lors de la création du département');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    employees,
    departments,
    isLoading,
    error,
    loadEmployees,
    loadDepartments,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    createDepartment
  };
};

export default useEmployeeAdapter;
