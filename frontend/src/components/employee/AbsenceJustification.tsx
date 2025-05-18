import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Send, FileUp } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { absenceService } from "@/services/api";

const AbsenceJustification = () => {
  const { user } = useAuth();
  const [date, setDate] = useState<Date>();
  const [absenceType, setAbsenceType] = useState("");
  const [reason, setReason] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !absenceType || !reason) {
      toast.error("Formulaire incomplet", {
        description: "Veuillez remplir tous les champs obligatoires."
      });
      return;
    }

    if (!user || !user.id) {
      toast.error("Erreur d'authentification", {
        description: "Vous devez être connecté pour soumettre une justification."
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Création d'un FormData pour l'envoi
      const formData = new FormData();
      formData.append('user_id', user.id.toString());
      formData.append('start_date', date.toISOString().split('T')[0]);
      formData.append('end_date', date.toISOString().split('T')[0]);
      formData.append('type', absenceType);
      formData.append('reason', reason);
      
      // Ajout du fichier si présent
      if (file) {
        formData.append('attachment', file);
      }

      // Envoi du FormData via le service API modifié
      const response = await absenceService.create(formData);

      toast.success("Justification envoyée", {
        description: "Votre justification a été soumise avec succès et est en attente d'approbation."
      });

      // Réinitialisation du formulaire
      setDate(undefined);
      setAbsenceType("");
      setReason("");
      setFile(null);
    } catch (error: any) {
      console.error("Erreur lors de l'envoi de la justification:", error);
      toast.error("Erreur lors de l'envoi", {
        description: error.message || "Une erreur est survenue lors de l'envoi de votre justification. Veuillez réessayer."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Justification d'absence</CardTitle>
        <CardDescription>
          Complétez ce formulaire pour justifier une absence ou un retard
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date d'absence</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd/MM/yyyy") : <span>Sélectionnez une date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="absenceType">Type d'absence</Label>
              <Select value={absenceType} onValueChange={setAbsenceType}>
                <SelectTrigger id="absenceType">
                  <SelectValue placeholder="Sélectionnez le type d'absence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sick">Maladie</SelectItem>
                  <SelectItem value="vacation">Congé</SelectItem>
                  <SelectItem value="personal">Motif personnel</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reason">Motif détaillé</Label>
            <Textarea
              id="reason"
              placeholder="Veuillez expliquer la raison de votre absence..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="document">Document justificatif (optionnel)</Label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                id="document"
                onChange={handleFileChange}
                className="hidden"
              />
              <Label 
                htmlFor="document"
                className="cursor-pointer flex items-center gap-2 text-sm bg-muted hover:bg-muted/80 px-4 py-2 rounded-md"
              >
                <FileUp className="h-4 w-4" />
                {file ? file.name : "Choisir un fichier"}
              </Label>
              {file && (
                <span className="text-sm text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Formats acceptés : PDF, JPG, PNG. Taille max : 5 MB
            </p>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-5">
          <Button 
            type="submit" 
            className="ml-auto bg-[#008000] hover:bg-[#006400]"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>Envoi en cours...</>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Envoyer la justification
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AbsenceJustification;