import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Phone, Mail, Building, Calendar, Clock, Save, Pencil } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { userService } from "@/services/api";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  joinDate: string;
  workSchedule: string;
}

const EmployeeProfile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    email: "",
    phone: "",
    department: "",
    position: "",
    joinDate: "",
    workSchedule: "8h00 - 16h00"
  });

  // Charger les données de l'utilisateur connecté
  useEffect(() => {
    const loadUserData = async () => {
      if (user && user.id) {
        setIsLoading(true);
        try {
          // Récupérer les données complètes de l'utilisateur depuis l'API
          const userData = await userService.getById(user.id);
          
          setProfile({
            name: userData.name || "",
            email: userData.email || "",
            phone: userData.phone || "",
            department: userData.department || "",
            position: userData.position || "",
            joinDate: userData.join_date ? new Date(userData.join_date).toLocaleDateString() : "",
            workSchedule: "8h00 - 16h00" // Valeur par défaut si non disponible
          });
        } catch (error) {
          console.error("Erreur lors du chargement des données utilisateur:", error);
          toast.error("Impossible de charger les données du profil");
          
          // Utiliser les données minimales du contexte d'authentification en cas d'erreur
          setProfile({
            name: user.name || "",
            email: user.email || "",
            phone: "",
            department: user.department || "",
            position: user.position || "",
            joinDate: user.join_date ? new Date(user.join_date).toLocaleDateString() : "",
            workSchedule: "8h00 - 16h00"
          });
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadUserData();
  }, [user]);

  const [editedProfile, setEditedProfile] = useState<ProfileData>({...profile});

  // Mettre à jour editedProfile lorsque profile change
  useEffect(() => {
    setEditedProfile({...profile});
  }, [profile]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile({...profile});
  };

  const handleSave = async () => {
    try {
      // Mettre à jour les données utilisateur via l'API
      if (user && user.id) {
        setIsLoading(true);
        
        // Validation des champs obligatoires
        if (!editedProfile.name || !editedProfile.email) {
          toast.error("Le nom et l'email sont obligatoires");
          return;
        }
        
        // Préparer les données à envoyer à l'API
        const userData = {
          name: editedProfile.name,
          email: editedProfile.email,
          department: editedProfile.department || user.department,
          position: editedProfile.position || user.position,
          phone: editedProfile.phone,
          // Gestion sécurisée de la date
          join_date: editedProfile.joinDate ? 
            (() => {
              try {
                const date = new Date(editedProfile.joinDate);
                if (isNaN(date.getTime())) {
                  return user.join_date; // Retourner la date existante si la conversion échoue
                }
                return date.toISOString().split('T')[0];
              } catch (error) {
                console.error("Erreur de conversion de date:", error);
                return user.join_date; // Retourner la date existante en cas d'erreur
              }
            })() : user.join_date,
          status: user.status // Conserver le statut actuel
        };
        
        // Appeler l'API pour mettre à jour l'utilisateur
        const updatedUser = await userService.update(user.id, userData);
        
        // Mettre à jour l'état local avec les données retournées par l'API
        setProfile({
          name: updatedUser.name,
          email: updatedUser.email,
          phone: editedProfile.phone,
          department: updatedUser.department,
          position: updatedUser.position,
          joinDate: updatedUser.join_date ? 
            (() => {
              try {
                return new Date(updatedUser.join_date).toLocaleDateString();
              } catch (error) {
                console.error("Erreur de formatage de date:", error);
                return updatedUser.join_date;
              }
            })() : "",
          workSchedule: profile.workSchedule
        });
        
        setIsEditing(false);
        
        toast.success("Profil mis à jour", {
          description: "Vos informations ont été mises à jour avec succès."
        });
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      toast.error(error.message || "Erreur lors de la mise à jour du profil");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile({...profile});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-2xl flex items-center gap-2">
          <User className="h-6 w-6 text-[#008000]" />
          Mon Profil
        </CardTitle>
        <CardDescription>
          Informations personnelles et professionnelles
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isEditing ? (
          // Mode édition
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <div className="relative">
                <User className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="name" 
                  name="name" 
                  className="pl-8" 
                  value={editedProfile.name} 
                  onChange={handleChange} 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email professionnel</Label>
              <div className="relative">
                <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  name="email" 
                  className="pl-8" 
                  value={editedProfile.email} 
                  onChange={handleChange} 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <div className="relative">
                <Phone className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="phone" 
                  name="phone" 
                  className="pl-8" 
                  value={editedProfile.phone} 
                  onChange={handleChange} 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">Département</Label>
              <div className="relative">
                <Building className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="department" 
                  name="department" 
                  className="pl-8" 
                  value={editedProfile.department} 
                  onChange={handleChange} 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="position">Poste</Label>
              <div className="relative">
                <User className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="position" 
                  name="position" 
                  className="pl-8" 
                  value={editedProfile.position} 
                  onChange={handleChange} 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="joinDate">Date d'embauche</Label>
              <div className="relative">
                <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="joinDate" 
                  name="joinDate" 
                  className="pl-8" 
                  value={editedProfile.joinDate} 
                  onChange={handleChange} 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="workSchedule">Horaires de travail</Label>
              <div className="relative">
                <Clock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="workSchedule" 
                  name="workSchedule" 
                  className="pl-8" 
                  value={editedProfile.workSchedule} 
                  onChange={handleChange} 
                />
              </div>
            </div>
          </div>
        ) : (
          // Mode affichage
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <User className="h-5 w-5 text-[#DAA520] mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Nom complet</p>
                  <p className="font-medium">{profile.name}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Mail className="h-5 w-5 text-[#DAA520] mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Email professionnel</p>
                  <p className="font-medium">{profile.email}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Phone className="h-5 w-5 text-[#DAA520] mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Téléphone</p>
                  <p className="font-medium">{profile.phone}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <Building className="h-5 w-5 text-[#DAA520] mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Département</p>
                  <p className="font-medium">{profile.department}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <User className="h-5 w-5 text-[#DAA520] mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Poste</p>
                  <p className="font-medium">{profile.position}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Calendar className="h-5 w-5 text-[#DAA520] mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Date d'embauche</p>
                  <p className="font-medium">{profile.joinDate}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Clock className="h-5 w-5 text-[#DAA520] mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Horaires de travail</p>
                  <p className="font-medium">{profile.workSchedule}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-5">
        {isEditing ? (
          <>
            <Button variant="outline" onClick={handleCancel}>Annuler</Button>
            <Button className="bg-[#008000] hover:bg-[#006400]" onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Enregistrer
            </Button>
          </>
        ) : (
          <Button variant="outline" className="ml-auto" onClick={handleEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            Modifier le profil
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default EmployeeProfile;
