
import { useState } from "react";
import { Calendar, Clock, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface AttendanceFilterProps {
  onFilterChange: (filters: {
    startDate: Date | null;
    endDate: Date | null;
    timeFrom: string;
    timeTo: string;
  }) => void;
  onReset: () => void;
}

const AttendanceFilter = ({ onFilterChange, onReset }: AttendanceFilterProps) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [timeFrom, setTimeFrom] = useState("07:00");
  const [timeTo, setTimeTo] = useState("18:00");

  const handleApplyFilter = () => {
    onFilterChange({
      startDate,
      endDate,
      timeFrom,
      timeTo
    });
  };

  const handleResetFilter = () => {
    setStartDate(null);
    setEndDate(null);
    setTimeFrom("07:00");
    setTimeTo("18:00");
    onReset();
  };

  return (
    <div className="w-full flex flex-col sm:flex-row gap-2 mb-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              {startDate ? (
                endDate ? (
                  `${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`
                ) : (
                  format(startDate, 'dd/MM/yyyy')
                )
              ) : (
                "Sélectionner date(s)"
              )}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
          <div className="p-4 space-y-4">
            <div>
              <Label htmlFor="start-date">Date de début</Label>
              <CalendarComponent
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                className="rounded-md border p-3 pointer-events-auto"
                locale={fr}
              />
            </div>
            <div>
              <Label htmlFor="end-date">Date de fin</Label>
              <CalendarComponent
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                disabled={(date) => {
                  if (!startDate) return false;
                  return date < startDate;
                }}
                className="rounded-md border p-3 pointer-events-auto"
                locale={fr}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{`${timeFrom} - ${timeTo}`}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4 pointer-events-auto" align="start">
          <div className="space-y-4">
            <div>
              <Label htmlFor="time-from">Heure d'entrée</Label>
              <Input
                id="time-from"
                type="time"
                value={timeFrom}
                onChange={(e) => setTimeFrom(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="time-to">Heure de sortie</Label>
              <Input
                id="time-to"
                type="time"
                value={timeTo}
                onChange={(e) => setTimeTo(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Button onClick={handleApplyFilter} className="flex items-center gap-2">
        <Filter className="h-4 w-4" />
        <span className="hidden sm:inline">Appliquer les filtres</span>
        <span className="sm:hidden">Filtrer</span>
      </Button>
      <Button variant="outline" onClick={handleResetFilter}>
        <span className="hidden sm:inline">Réinitialiser</span>
        <span className="sm:hidden">Effacer</span>
      </Button>
    </div>
  );
};

export default AttendanceFilter;
