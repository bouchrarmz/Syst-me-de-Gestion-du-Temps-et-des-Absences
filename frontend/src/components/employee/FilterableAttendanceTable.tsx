import { useState, useEffect } from "react";
import AttendanceFilter from "./AttendanceFilter";
import { Button } from "@/components/ui/button";
import { Download, Printer, DollarSign, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { timeEntryService } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

// Interface pour les données de pointage
interface TimeEntry {
  id: number;
  date: string;
  time_in: string;
  time_out: string;
  period: "morning" | "afternoon";
  status: string;
  total_hours?: string;
  hourly_rate?: number;
  salary?: number | string; // Allow string for potential API inconsistencies
  notes?: string;
  user_id: number;
}

const FilterableAttendanceTable = () => {
  const { user } = useAuth();
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [filteredData, setFilteredData] = useState<TimeEntry[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<TimeEntry | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [noteInput, setNoteInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Charger les données depuis l'API
  useEffect(() => {
    const fetchTimeEntries = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        const entries = await timeEntryService.getAll({ user_id: user.id });
        setTimeEntries(entries);
        setFilteredData(entries);
      } catch (error) {
        console.error("Erreur lors du chargement des pointages:", error);
        toast.error("Erreur lors du chargement des pointages");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimeEntries();
  }, [user]);

  const handleFilterChange = (filters: any) => {
    let filtered = [...timeEntries];

    // Filter by date range
    if (filters.startDate) {
      const startTimestamp = new Date(filters.startDate).getTime();
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.date).getTime();
        return itemDate >= startTimestamp;
      });
    }

    if (filters.endDate) {
      const endTimestamp = new Date(filters.endDate).getTime();
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.date).getTime();
        return itemDate <= endTimestamp;
      });
    }

    // Filter by time range
    if (filters.timeFrom && filters.timeTo) {
      filtered = filtered.filter((item) => {
        // Skip items with no time data
        if (!item.time_in || !item.time_out) return true;

        return item.time_in >= filters.timeFrom && item.time_out <= filters.timeTo;
      });
    }

    setFilteredData(filtered);
    toast.success("Filtres appliqués avec succès", {
      description: "Les données ont été filtrées selon vos critères",
    });
  };

  const handleResetFilters = () => {
    setFilteredData(timeEntries);
    toast.info("Filtres réinitialisés", {
      description: "Affichage de toutes les données",
    });
  };

  const handleRefresh = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const entries = await timeEntryService.getAll({ user_id: user.id });
      setTimeEntries(entries);
      setFilteredData(entries);
      toast.success("Données actualisées avec succès");
    } catch (error) {
      console.error("Erreur lors de l'actualisation des pointages:", error);
      toast.error("Erreur lors de l'actualisation des pointages");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    toast.success("Téléchargement du rapport en cours...", {
      description: "Le rapport sera disponible dans quelques instants",
    });

    // Simulation du téléchargement
    setTimeout(() => {
      const element = document.createElement("a");
      const file = new Blob([JSON.stringify(filteredData, null, 2)], {
        type: "application/json",
      });
      element.href = URL.createObjectURL(file);
      element.download = "pointages.json";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }, 1500);
  };

  const handlePrint = () => {
    toast.info("Préparation de l'impression...");
    window.print();
  };

  const handleRowClick = (record: TimeEntry) => {
    setSelectedRecord(record);
    setNoteInput(record.notes || "");
    setDialogOpen(true);
  };

  const handleSaveNote = async () => {
    if (!selectedRecord) return;

    setIsLoading(true);
    try {
      // Envoyer les données à l'API
      const updatedEntry = await timeEntryService.update(selectedRecord.id, {
        notes: noteInput,
      });

      // Mise à jour des données locales
      const updatedEntries = timeEntries.map((item) =>
        item.id === selectedRecord.id ? { ...item, notes: noteInput } : item
      );
      setTimeEntries(updatedEntries);

      // Mise à jour des données filtrées
      const updatedFilteredEntries = filteredData.map((item) =>
        item.id === selectedRecord.id ? { ...item, notes: noteInput } : item
      );
      setFilteredData(updatedFilteredEntries);

      toast.success("Note enregistrée avec succès", {
        description: "Les détails ont été mis à jour",
      });

      setDialogOpen(false);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la note:", error);
      toast.error("Erreur lors de la mise à jour de la note");
    } finally {
      setIsLoading(false);
    }
  };

  // Classes pour les statuts
  const getStatusClass = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-[#33C3F0]/20 text-[#33C3F0] dark:bg-[#6E59A5]/20 dark:text-[#6E59A5]";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  // Formater le statut pour l'affichage
  const formatStatus = (status: string) => {
    switch (status) {
      case "completed":
        return "Terminé";
      case "in_progress":
        return "En cours";
      default:
        return status;
    }
  };

  // Calcul du total des salaires (fonction corrigée)
  const calculateTotalSalary = (): number => {
    if (!Array.isArray(filteredData)) {
      console.error(
        "calculateTotalSalary called with non-array filteredData:",
        filteredData
      );
      return 0; // Retourne 0 si les données ne sont pas prêtes ou invalides
    }
    return filteredData.reduce((total: number, entry: TimeEntry) => {
      // Assure que entry.salary est traité comme un nombre, retourne 0 si invalide
      const salaryValue = Number(entry.salary); // Convertit undefined/null en 0, string non numérique en NaN
      return total + (isNaN(salaryValue) ? 0 : salaryValue);
    }, 0);
  };

  // Fonction pour afficher le salaire total de manière sécurisée
  const displayTotalSalary = (): string => {
    const total = calculateTotalSalary();
    // Vérifie si total est un nombre valide avant d'appeler toFixed
    if (typeof total === 'number' && !isNaN(total)) {
      return total.toFixed(2);
    }
    // Retourne une valeur par défaut ou un indicateur si le calcul échoue
    return 'N/A'; 
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <AttendanceFilter onFilterChange={handleFilterChange} onReset={handleResetFilters} />

        <div className="flex gap-2 ml-auto">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </Button>

          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleDownload}
            disabled={isLoading}
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Exporter</span>
          </Button>

          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handlePrint}
            disabled={isLoading}
          >
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Imprimer</span>
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-md border flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium mb-1">Total des salaires</h3>
          <p className="text-xs text-muted-foreground">Basé sur les filtres appliqués</p>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-[#33C3F0] dark:text-[#6E59A5]" />
          {/* Utilise la fonction d'affichage sécurisée */}
          <span className="text-xl font-bold">{displayTotalSalary()} DH</span>
        </div>
      </div>

      <div className="overflow-x-auto print:overflow-visible rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Période</TableHead>
              <TableHead>Arrivée</TableHead>
              <TableHead>Départ</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Salaire</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  <div className="flex flex-col items-center justify-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-[#33C3F0] mb-2" />
                    <p>Chargement des données...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredData.length > 0 ? (
              filteredData
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((record) => (
                  <TableRow
                    key={record.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(record)}
                  >
                    <TableCell>
                      {new Date(record.date).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell>
                      {record.period === "morning" ? "Matin" : "Après-midi"}
                    </TableCell>
                    <TableCell>{record.time_in || "--"}</TableCell>
                    <TableCell>{record.time_out || "--"}</TableCell>
                    <TableCell>{record.total_hours || "--"}</TableCell>
                    {/* Affichage sécurisé du salaire individuel */}
                    <TableCell>
                      {typeof record.salary === 'number' && !isNaN(Number(record.salary))
                        ? `${Number(record.salary).toFixed(2)} DH`
                        : typeof record.salary === 'string' && !isNaN(parseFloat(record.salary))
                        ? `${parseFloat(record.salary).toFixed(2)} DH`
                        : "--"}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusClass(record.status)}`}>
                        {formatStatus(record.status)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  Aucun résultat trouvé pour les filtres sélectionnés.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialogue de détails du pointage */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Détails du pointage</DialogTitle>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date</Label>
                  <p className="text-sm font-medium">
                    {new Date(selectedRecord.date).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div>
                  <Label>Période</Label>
                  <p className="text-sm font-medium">
                    {selectedRecord.period === "morning" ? "Matin" : "Après-midi"}
                  </p>
                </div>
                <div>
                  <Label>Statut</Label>
                  <p className="text-sm font-medium">
                    <Badge className={getStatusClass(selectedRecord.status)}>
                      {formatStatus(selectedRecord.status)}
                    </Badge>
                  </p>
                </div>
                <div>
                  <Label>Heures travaillées</Label>
                  <p className="text-sm font-medium">
                    {selectedRecord.total_hours || "--"}
                  </p>
                </div>
                <div>
                  <Label>Heure d'arrivée</Label>
                  <p className="text-sm font-medium">
                    {selectedRecord.time_in || "--"}
                  </p>
                </div>
                <div>
                  <Label>Heure de départ</Label>
                  <p className="text-sm font-medium">
                    {selectedRecord.time_out || "--"}
                  </p>
                </div>
                <div className="col-span-2">
                  <Label>Salaire</Label>
                  <p className="text-sm font-medium flex items-center">
                    <DollarSign className="h-4 w-4 text-[#33C3F0] dark:text-[#6E59A5] mr-1" />
                    {/* Affichage sécurisé du salaire individuel */}
                    {typeof selectedRecord.salary === 'number' && !isNaN(Number(selectedRecord.salary))
                      ? `${Number(selectedRecord.salary).toFixed(2)} DH`
                      : typeof selectedRecord.salary === 'string' && !isNaN(parseFloat(selectedRecord.salary))
                      ? `${parseFloat(selectedRecord.salary).toFixed(2)} DH`
                      : "--"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Ajouter des commentaires ou notes concernant ce pointage"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isLoading}>
              Annuler
            </Button>
            <Button
              onClick={handleSaveNote}
              className="bg-[#33C3F0] hover:bg-[#33C3F0]/90 dark:bg-[#6E59A5] dark:hover:bg-[#6E59A5]/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                "Enregistrer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FilterableAttendanceTable;

