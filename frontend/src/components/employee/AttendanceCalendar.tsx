
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import JustificationForm from "./JustificationForm";

// Définir les types pour les événements de présence
type AttendanceStatus = "present" | "absent" | "late" | "none";

interface AttendanceDay {
  date: Date;
  status: AttendanceStatus;
  hours?: number;
  notes?: string;
}

const AttendanceCalendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [justificationFormOpen, setJustificationFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  
  // Données fictives pour l'exemple - à remplacer par des données réelles de l'API
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  
  const attendanceData: AttendanceDay[] = [
    { date: new Date(currentYear, currentMonth, 1), status: "present", hours: 8, notes: "Arrivée à l'heure" },
    { date: new Date(currentYear, currentMonth, 2), status: "present", hours: 8.5, notes: "Départ tardif" },
    { date: new Date(currentYear, currentMonth, 3), status: "late", hours: 7, notes: "Retard de 30 minutes" },
    { date: new Date(currentYear, currentMonth, 4), status: "present", hours: 8, notes: "Normal" },
    { date: new Date(currentYear, currentMonth, 5), status: "present", hours: 8, notes: "Normal" },
    { date: new Date(currentYear, currentMonth, 8), status: "present", hours: 8, notes: "Normal" },
    { date: new Date(currentYear, currentMonth, 9), status: "present", hours: 8, notes: "Normal" },
    { date: new Date(currentYear, currentMonth, 10), status: "present", hours: 8, notes: "Normal" },
    { date: new Date(currentYear, currentMonth, 11), status: "absent", hours: 0, notes: "Absence non justifiée" },
    { date: new Date(currentYear, currentMonth, 12), status: "absent", hours: 0, notes: "Congé maladie" },
    { date: new Date(currentYear, currentMonth, 15), status: "present", hours: 8, notes: "Normal" },
    { date: new Date(currentYear, currentMonth, 16), status: "late", hours: 7.5, notes: "Retard de 15 minutes" },
  ];
  
  // Fonction pour personnaliser l'apparence des jours en fonction du statut de présence
  const getDayClass = (day: Date): string => {
    const attendance = attendanceData.find(
      (a) => a.date.toDateString() === day.toDateString()
    );
    
    if (!attendance) return "";
    
    switch (attendance.status) {
      case "present":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 rounded-full";
      case "absent":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 rounded-full";
      case "late":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 rounded-full";
      default:
        return "";
    }
  };

  // Fonction pour afficher les détails d'une journée
  const showDayDetails = (day: Date) => {
    const attendance = attendanceData.find(
      (a) => a.date.toDateString() === day.toDateString()
    );

    if (!attendance) return;

    // Si c'est une absence ou un retard, ouvrir directement le formulaire de justification
    if (attendance.status === "absent" || attendance.status === "late") {
      setSelectedDate(day);
      setSelectedStatus(attendance.status);
      setJustificationFormOpen(true);
      return;
    }

    // Sinon, afficher juste un toast informatif pour les jours présents
    let title = "";
    let description = "";

    if (attendance.status === "present") {
      title = "Présence confirmée";
      description = `${attendance.hours}h travaillées. ${attendance.notes}`;
      
      toast.info(title, {
        description,
        duration: 3000,
      });
    }
  };

  // Fonction pour justifier une absence
  const handleJustifyAbsence = (date: Date) => {
    setSelectedDate(date);
    setSelectedStatus("absent");
    setJustificationFormOpen(true);
  };

  // Fonction pour justifier un retard
  const handleJustifyLate = (date: Date) => {
    setSelectedDate(date);
    setSelectedStatus("late");
    setJustificationFormOpen(true);
  };

  // Fonction pour gérer la soumission du formulaire de justification
  const handleJustificationSubmit = (data: any) => {
    const existing = JSON.parse(localStorage.getItem("justifications") || "[]");
    localStorage.setItem("justifications", JSON.stringify([
      ...existing,
      { ...data, submittedAt: new Date().toISOString(), status: selectedStatus, date: selectedDate }
    ]));
    setJustificationFormOpen(false);
    
    toast.success("Justificatif envoyé", {
      description: "Votre justificatif a été envoyé avec succès à l'administrateur."
    });
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium">Calendrier de pointage</h3>
      </div>
      
      <Calendar
        mode="single"
        selected={date}
        onSelect={(newDate) => {
          setDate(newDate);
          if (newDate) {
            showDayDetails(newDate);
          }
        }}
        className="mx-auto"
        modifiers={{
          customModifier: (date) => {
            const found = attendanceData.find(
              (a) => a.date.toDateString() === date.toDateString()
            );
            return Boolean(found);
          },
        }}
        modifiersClassNames={{
          customModifier: "day-with-attendance" // Use a fixed class name instead of a function
        }}
        components={{
          DayContent: (props) => {
            // Custom day content to apply specific classes based on attendance
            const dayClass = getDayClass(props.date);
            return (
              <div className={`w-full h-full flex items-center justify-center ${dayClass}`}>
                {props.date.getDate()}
              </div>
            );
          }
        }}
      />
      <div className="mt-4 flex justify-center gap-4">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <span className="text-sm">Présent</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
          <span className="text-sm">En retard</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
          <span className="text-sm">Absent</span>
        </div>
      </div>
      
      <JustificationForm 
        isOpen={justificationFormOpen} 
        onClose={() => setJustificationFormOpen(false)}
        selectedDate={selectedDate}
        defaultType={selectedStatus === "absent" ? "absence" : "delay"}
        onSubmit={handleJustificationSubmit}
      />
    </div>
  );
};

export default AttendanceCalendar;
