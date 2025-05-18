import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { 
  Search, Download, Printer, MoreHorizontal, Edit, Trash2, 
  UserPlus, Eye, Check, X, FileText, RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { userService } from "@/services/api";

const EmployeeTable = () => {
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
    department: "",
    position: "",
    status: "active",
    joinDate: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Charger les employés depuis la base de données au chargement du composant
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Fonction pour récupérer les employés depuis l'API
  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const data = await userService.getAll();
      console.log("Données brutes reçues de l'API:", data);
      
      // Formater les données pour correspondre à la structure attendue
      const formattedEmployees = data.map(user => {
        console.log("Traitement de l'utilisateur:", user);
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          // Vérifier si department est un objet ou une chaîne
          department: typeof user.department === 'object' ? user.department.name : user.department,
          position: user.position || "",
          status: user.status || "active",
          joinDate: user.join_date || new Date().toISOString().split('T')[0],
          avatar: user.avatar,
          role: user.role
        };
      });
      
      console.log("Données formatées:", formattedEmployees);
      setEmployees(formattedEmployees);
    } catch (error) {
      console.error("Erreur lors de la récupération des employés:", error);
      toast.error("Erreur lors du chargement des employés");
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrer les employés selon la recherche
  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (employee.position && employee.position.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Récupérer le statut avec le style approprié
  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-green-500">Actif</Badge>;
      case "inactive":
        return <Badge variant="outline" className="text-red-500 border-red-500">Inactif</Badge>;
      case "vacation":
        return <Badge variant="secondary" className="bg-yellow-500 text-white">En congé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Supprimer un employé
  const handleDeleteEmployee = async () => {
    if (employeeToDelete !== null) {
      setIsSubmitting(true);
      try {
        await userService.delete(employeeToDelete);
        setEmployees(employees.filter((emp) => emp.id !== employeeToDelete));
        toast.success("Employé supprimé avec succès");
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        toast.error("Erreur lors de la suppression de l'employé");
      } finally {
        setIsSubmitting(false);
        setDeleteDialogOpen(false);
        setEmployeeToDelete(null);
      }
    }
  };

  // Ouvrir le dialogue de suppression
  const openDeleteDialog = (id) => {
    setEmployeeToDelete(id);
    setDeleteDialogOpen(true);
  };

  // Ouvrir le dialogue de modification
  const openEditDialog = (employee) => {
    setCurrentEmployee(employee);
    setFormData({
      name: employee.name || "",
      email: employee.email || "",
      password: "", // Champ vide pour la modification
      role: employee.role || "employee",
      department: employee.department || "",
      position: employee.position || "",
      status: employee.status || "active",
      joinDate: employee.joinDate || new Date().toISOString().split('T')[0],
    });
    setEditDialogOpen(true);
  };

  // Ouvrir le dialogue d'ajout
  const openAddDialog = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "employee",
      department: "",
      position: "",
      status: "active",
      joinDate: new Date().toISOString().split('T')[0],
    });
    setAddDialogOpen(true);
  };

  // Ouvrir le dialogue de visualisation
  const openViewDialog = (employee) => {
    setCurrentEmployee(employee);
    setViewDialogOpen(true);
  };

  // Modifier un employé
  const handleEditEmployee = async () => {
    if (currentEmployee) {
      setIsSubmitting(true);
      try {
        // Préparer les données pour l'API
        const userData: {
          name: string;
          email: string;
          role: string;
          department: string;
          position: string;
          status: string;
          join_date: string;
          password?: string;
        } = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          department: formData.department,
          position: formData.position,
          status: formData.status,
          join_date: formData.joinDate
        };
        
        // Ajouter le mot de passe seulement s'il est fourni
        if (formData.password) {
          userData.password = formData.password;
        }
        
        // Appel à l'API pour mettre à jour l'employé
        const updatedUser = await userService.update(currentEmployee.id, userData);
        
        // Mettre à jour l'état local
        setEmployees(
          employees.map((emp) =>
            emp.id === currentEmployee.id ? {
              ...emp,
              name: formData.name,
              email: formData.email,
              role: formData.role,
              department: formData.department,
              position: formData.position,
              status: formData.status,
              joinDate: formData.joinDate
            } : emp
          )
        );
        
        toast.success("Employé modifié avec succès");
      } catch (error) {
        console.error("Erreur lors de la modification:", error);
        toast.error("Erreur lors de la modification de l'employé: " + (error.message || "Erreur inconnue"));
      } finally {
        setIsSubmitting(false);
        setEditDialogOpen(false);
      }
    }
  };

  // Ajouter un employé
  const handleAddEmployee = async () => {
    // Validation des champs obligatoires
    if (!formData.name || !formData.email || !formData.password || !formData.department) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Appel à l'API pour ajouter l'employé dans la base de données
      const response = await userService.create({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        department: formData.department,
        position: formData.position,
        join_date: formData.joinDate,
        status: formData.status
      });
      
      console.log("Réponse API:", response);
      
      // Ajouter l'employé à l'état local
      const newEmployee = {
        id: response.id,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        department: formData.department,
        position: formData.position,
        status: formData.status,
        joinDate: formData.joinDate,
        avatar: null,
      };
      
      setEmployees([...employees, newEmployee]);
      toast.success("Employé ajouté avec succès dans la base de données");
      setAddDialogOpen(false);
      
      // Rafraîchir la liste des employés pour s'assurer que les données sont à jour
      fetchEmployees();
      
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'employé:", error);
      toast.error("Erreur lors de l'ajout de l'employé: " + (error.message || "Erreur inconnue"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Exporter la liste des employés
  const handleExport = () => {
    toast.success("Export en cours...");
    
    // Simulation d'un export
    setTimeout(() => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(employees));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "employees.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      
      toast.success("Export réussi", {
        description: "Le fichier a été téléchargé."
      });
    }, 1000);
  };

  // Imprimer la liste des employés
  const handlePrint = () => {
    toast.info("Préparation de l'impression...");
    window.print();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un employé..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button onClick={openAddDialog} className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Ajouter un employé</span>
            <span className="sm:hidden">Ajouter</span>
          </Button>
          
          <Button variant="outline" onClick={fetchEmployees} className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </Button>
          
          <Button variant="outline" onClick={handleExport} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Exporter</span>
          </Button>
          
          <Button variant="outline" onClick={handlePrint} className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Imprimer</span>
          </Button>
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Nom</TableHead>
              <TableHead>Département</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Date d'arrivée</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex justify-center items-center">
                    <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                    Chargement des employés...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee) => (
                <TableRow key={employee.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={employee.avatar || ""} />
                        <AvatarFallback>
                          {employee.name?.split(" ").map((n) => n[0]).join("") || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div>{employee.name}</div>
                        <div className="text-sm text-muted-foreground">{employee.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>{employee.joinDate ? new Date(employee.joinDate).toLocaleDateString("fr-FR") : "-"}</TableCell>
                  <TableCell>{getStatusBadge(employee.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Ouvrir le menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openViewDialog(employee)} className="cursor-pointer">
                          <Eye className="mr-2 h-4 w-4" />
                          Voir le profil
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditDialog(employee)} className="cursor-pointer">
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => openDeleteDialog(employee.id)} className="text-red-600 cursor-pointer">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Aucun résultat trouvé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialogue de suppression */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cet employé ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row justify-end gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteEmployee} disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="animate-spin mr-2">⏳</span>
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue d'édition */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Modifier un employé</DialogTitle>
            <DialogDescription>
              Modifiez les informations de l'employé et cliquez sur Enregistrer.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="password">Mot de passe (laisser vide pour ne pas modifier)</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="role">Rôle</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger id="role" className="mt-1">
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrateur</SelectItem>
                    <SelectItem value="employee">Employé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="department">Département</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="status">Statut</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger id="status" className="mt-1">
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                    <SelectItem value="vacation">En congé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="joinDate">Date d'arrivée</Label>
                <Input
                  id="joinDate"
                  type="date"
                  value={formData.joinDate}
                  onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-row justify-end gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button onClick={handleEditEmployee} disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="animate-spin mr-2">⏳</span>
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue d'ajout */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Ajouter un employé</DialogTitle>
            <DialogDescription>
              Saisissez les informations du nouvel employé et cliquez sur Ajouter.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="add-name">Nom complet <span className="text-red-500">*</span></Label>
                <Input
                  id="add-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="add-email">Email <span className="text-red-500">*</span></Label>
                <Input
                  id="add-email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="add-password">Mot de passe <span className="text-red-500">*</span></Label>
                <Input
                  id="add-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="add-role">Rôle <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger id="add-role" className="mt-1">
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrateur</SelectItem>
                    <SelectItem value="employee">Employé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="add-department">Département <span className="text-red-500">*</span></Label>
                <Input
                  id="add-department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="add-position">Position</Label>
                <Input
                  id="add-position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="add-status">Statut</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger id="add-status" className="mt-1">
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                    <SelectItem value="vacation">En congé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="add-joinDate">Date d'arrivée</Label>
                <Input
                  id="add-joinDate"
                  type="date"
                  value={formData.joinDate}
                  onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-row justify-end gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setAddDialogOpen(false)} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button onClick={handleAddEmployee} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Traitement...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Ajouter
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue de visualisation du profil */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Profil de l'employé</DialogTitle>
            <DialogDescription>
              Détails complets du profil employé
            </DialogDescription>
          </DialogHeader>
          {currentEmployee && (
            <div className="grid gap-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={currentEmployee.avatar || ""} />
                  <AvatarFallback className="text-2xl">
                    {currentEmployee.name?.split(" ").map((n) => n[0]).join("") || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="text-xl font-bold">{currentEmployee.name}</h3>
                  <p className="text-muted-foreground">{currentEmployee.position}</p>
                  {getStatusBadge(currentEmployee.status)}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Informations personnelles</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex flex-row justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{currentEmployee.email}</span>
                    </div>
                    <div className="flex flex-row justify-between">
                      <span className="text-muted-foreground">Département:</span>
                      <span className="font-medium">{currentEmployee.department}</span>
                    </div>
                    <div className="flex flex-row justify-between">
                      <span className="text-muted-foreground">Rôle:</span>
                      <span className="font-medium">{currentEmployee.role === "admin" ? "Administrateur" : "Employé"}</span>
                    </div>
                    <div className="flex flex-row justify-between">
                      <span className="text-muted-foreground">Date d'arrivée:</span>
                      <span className="font-medium">
                        {currentEmployee.joinDate ? new Date(currentEmployee.joinDate).toLocaleDateString("fr-FR") : "-"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex flex-row justify-between">
                      <span className="text-muted-foreground">Retards:</span>
                      <span className="font-medium">-</span>
                    </div>
                    <div className="flex flex-row justify-between">
                      <span className="text-muted-foreground">Absences:</span>
                      <span className="font-medium">-</span>
                    </div>
                    <div className="flex flex-row justify-between">
                      <span className="text-muted-foreground">Heures trav.:</span>
                      <span className="font-medium">-</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeTable;
