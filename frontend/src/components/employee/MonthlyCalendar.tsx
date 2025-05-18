
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import JustificationForm from "./JustificationForm";

const calendarData = [
  { date: "2025-04-01", status: "present" },
  { date: "2025-04-02", status: "present" },
  { date: "2025-04-03", status: "present" },
  { date: "2025-04-04", status: "late" },
  { date: "2025-04-05", status: "weekend" },
  { date: "2025-04-06", status: "weekend" },
  { date: "2025-04-07", status: "present" },
  { date: "2025-04-08", status: "present" },
  { date: "2025-04-09", status: "present" },
  { date: "2025-04-10", status: "present" },
  { date: "2025-04-11", status: "absent" },
  { date: "2025-04-12", status: "weekend" },
  { date: "2025-04-13", status: "weekend" },
  { date: "2025-04-14", status: "present" },
  { date: "2025-04-15", status: "present" },
  { date: "2025-04-16", status: "absent" },
  { date: "2025-04-17", status: "present" },
  { date: "2025-04-18", status: "present" },
  { date: "2025-04-19", status: "weekend" },
  { date: "2025-04-20", status: "weekend" },
  { date: "2025-04-21", status: "present" },
  { date: "2025-04-22", status: "present" },
  { date: "2025-04-23", status: "late" },
  { date: "2025-04-24", status: "present" },
  { date: "2025-04-25", status: "present" },
  { date: "2025-04-26", status: "weekend" },
  { date: "2025-04-27", status: "weekend" },
  { date: "2025-04-28", status: "present" },
  { date: "2025-04-29", status: "present" },
  { date: "2025-04-30", status: "present" },
];

const MonthlyCalendar = () => {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [justificationFormOpen, setJustificationFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const goToPrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  function handleJustificationSubmit(data: any) {
    const existing = JSON.parse(localStorage.getItem("justifications") || "[]");
    localStorage.setItem("justifications", JSON.stringify([
      ...existing,
      { ...data, submittedAt: new Date().toISOString(), status: selectedStatus, date: selectedDate }
    ]));
    setJustificationFormOpen(false);
  }

  const generateDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 rounded-md" />);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dayData = calendarData.find(d => d.date === dateString);
      const status = dayData ? dayData.status : "present";
      const isWeekend = status === "weekend";
      const isAbsent = status === "absent";
      const isLate = status === "late";
      days.push(
        <div
          key={day}
          onClick={() => {
            if (isAbsent || isLate) {
              const clickedDate = new Date(year, month, day);
              setSelectedDate(clickedDate);
              setSelectedStatus(status);
              setJustificationFormOpen(true);
            }
          }}
          className={`h-10 rounded-md flex items-center justify-center p-2 text-sm font-medium hover:bg-primary/5 transition-colors ${
            isWeekend ? "text-muted-foreground bg-muted/30" : ""
          } ${isAbsent || isLate ? "cursor-pointer" : ""}`}
        >
          <div className="relative">
            <span>{day}</span>
            {isAbsent && (
              <Badge className="absolute -top-2 -right-2 h-2 w-2 p-0 bg-red-500 rounded-full" />
            )}
            {isLate && (
              <Badge className="absolute -top-2 -right-2 h-2 w-2 p-0 bg-yellow-500 rounded-full" />
            )}
          </div>
        </div>
      );
    }
    return days;
  };

  const getMonthName = () => {
    return currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  };
  const daysOfWeek = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

  return (
    <>
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-md flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{getMonthName()}</span>
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={goToPrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="grid grid-cols-7 gap-1 mb-1">
            {daysOfWeek.map((day, index) => (
              <div key={day} className="text-center text-sm text-muted-foreground font-medium">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {generateDays()}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center">
              <Badge className="h-2 w-2 mr-1 bg-red-500 rounded-full" />
              <span>{t("attendance.absent")}</span>
            </div>
            <div className="flex items-center">
              <Badge className="h-2 w-2 mr-1 bg-yellow-500 rounded-full" />
              <span>{t("attendance.late")}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      <JustificationForm 
        isOpen={justificationFormOpen} 
        onClose={() => setJustificationFormOpen(false)} 
        selectedDate={selectedDate}
        defaultType={selectedStatus === "absent" ? "absence" : "delay"}
        onSubmit={handleJustificationSubmit}
      />
    </>
  );
};

export default MonthlyCalendar;
