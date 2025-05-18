import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, Calendar, Download, Printer } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { debounce } from "lodash";
import { timeEntryService } from "@/services/api";

// Interface pour les enregistrements de présence
interface AttendanceRecord {
  id: number;
  user: {
    id: number;
    name: string;
  };
  employee: { name: string };
  date: string;
  time_in: string;
  time_out: string | null;
  period: "morning" | "afternoon" | null;
  status: "in_progress" | "completed";
  total_hours: string | null;
  salary: number | null;
}

const AttendanceRegister = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "in_progress" | "completed">("all");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const debouncedSetSearchQuery = useMemo(
    () =>
      debounce((value: string) => {
        setSearchQuery(value);
        setCurrentPage(1);
      }, 300),
    []
  );

  useEffect(() => {
    const fetchAttendanceData = async () => {
      setIsLoading(true);
      try {
        const response = await timeEntryService.getAll({
          page: currentPage,
          startDate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
          endDate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
          status: statusFilter === "all" ? undefined : statusFilter,
          search: searchQuery || undefined,
        });

        if (!Array.isArray(response)) {
          throw new Error("Format de données inattendu");
        }

        setAttendanceData(response);
        setTotalPages(1);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
        toast.error(`Erreur lors du chargement des données: ${errorMessage}`);
        setAttendanceData([]);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendanceData();
  }, [currentPage, startDate, endDate, statusFilter, searchQuery]);

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      const response = await timeEntryService.generateReport({
        startDate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
        endDate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        search: searchQuery || undefined,
      });

      if (!(response.data instanceof Blob)) {
        throw new Error("Format de rapport invalide");
      }

      const fileName = `rapport_presence_${format(new Date(), "yyyy-MM-dd")}${
        startDate ? `_du_${format(startDate, "yyyy-MM-dd")}` : ""
      }${endDate ? `_au_${format(endDate, "yyyy-MM-dd")}` : ""}.xlsx`;

      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Rapport généré avec succès");
    } catch (error) {
      toast.error("Erreur lors de la génération du rapport");
      console.error("Erreur:", error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handlePrint = () => {
    toast.info("Préparation de l'impression...");
    window.print();
  };

  const getStatusBadge = (status: AttendanceRecord["status"]) => {
    switch (status) {
      case "in_progress":
        return (
          <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 text-xs font-medium px-2.5 py-0.5 rounded">
            En cours
          </span>
        );
      case "completed":
        return (
          <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs font-medium px-2.5 py-0.5 rounded">
            Terminé
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300 text-xs font-medium px-2.5 py-0.5 rounded">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row gap-4">
  <Input
    placeholder="Rechercher par nom..."
    onChange={(e) => debouncedSetSearchQuery(e.target.value)}
    className="w-full md:w-64"
  />
  
  <Select
    value={statusFilter}
    onValueChange={(value) =>
      setStatusFilter(value as "all" | "in_progress" | "completed")
    }
  >
    <SelectTrigger className="w-full md:w-48">
      <SelectValue placeholder="Statut" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">Tous</SelectItem>
      <SelectItem value="in_progress">En cours</SelectItem>
      <SelectItem value="completed">Terminé</SelectItem>
    </SelectContent>
  </Select>

  <Popover>
    <PopoverTrigger asChild>
      <Button variant="outline" className="w-full md:w-48 justify-start text-left">
        <Calendar className="mr-2 h-4 w-4" />
        {startDate ? format(startDate, "dd/MM/yyyy") : "Date début"}
      </Button>
    </PopoverTrigger>
    <PopoverContent align="start" className="w-auto p-0">
      <CalendarComponent
        mode="single"
        selected={startDate}
        onSelect={setStartDate}
        locale={fr}
      />
    </PopoverContent>
  </Popover>

  <Popover>
    <PopoverTrigger asChild>
      <Button variant="outline" className="w-full md:w-48 justify-start text-left">
        <Calendar className="mr-2 h-4 w-4" />
        {endDate ? format(endDate, "dd/MM/yyyy") : "Date fin"}
      </Button>
    </PopoverTrigger>
    <PopoverContent align="start" className="w-auto p-0">
      <CalendarComponent
        mode="single"
        selected={endDate}
        onSelect={setEndDate}
        locale={fr}
      />
    </PopoverContent>
  </Popover>

  <Button onClick={handleGenerateReport} disabled={isGeneratingReport}>
    <Download className="mr-2 h-4 w-4" />
    Exporter
  </Button>

  <Button variant="outline" onClick={handlePrint}>
    <Printer className="mr-2 h-4 w-4" />
    Imprimer
  </Button>
</div>


          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employé</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Entrée</TableHead>
                  <TableHead>Sortie</TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Heures totales</TableHead>
                  <TableHead>Salaire</TableHead> 

                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceData.length > 0 ? (
                  attendanceData.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.user?.name || "-"}</TableCell>
                      <TableCell>{format(new Date(record.date), "dd/MM/yyyy")}</TableCell>
                      <TableCell>{record.time_in}</TableCell>
                      <TableCell>{record.time_out || "-"}</TableCell>
                      <TableCell>{record.period || "-"}</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>{record.total_hours || "-"}</TableCell>
                      <TableCell>{record.salary !== null ? `${record.salary} DH` : "-"}</TableCell>
                      


                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      {searchQuery || statusFilter !== "all" || startDate || endDate
                        ? "Aucun résultat trouvé pour les filtres appliqués"
                        : "Aucune donnée disponible"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center">
             <Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious
        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
        className={currentPage === 1 ? 'cursor-not-allowed opacity-50' : ''}
      />
    </PaginationItem>
    {[...Array(totalPages)].map((_, i) => (
      <PaginationItem key={i + 1}>
        <PaginationLink
          onClick={() => setCurrentPage(i + 1)}
          isActive={currentPage === i + 1}
        >
          {i + 1}
        </PaginationLink>
      </PaginationItem>
    ))}
    <PaginationItem>
      <PaginationNext
        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
        className={currentPage === totalPages ? 'cursor-not-allowed opacity-50' : ''}
      />
    </PaginationItem>
  </PaginationContent>
</Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AttendanceRegister;
