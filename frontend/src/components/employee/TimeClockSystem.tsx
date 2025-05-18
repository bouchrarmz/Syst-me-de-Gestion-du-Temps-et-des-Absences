import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, Clock, LogIn, LogOut, DollarSign, RefreshCw } from "lucide-react";
import RealTimeClock from './RealTimeClock';
import { Badge } from "@/components/ui/badge";
import useTimeClockAdapter from '@/hooks/use-time-clock-adapter';

const TimeClockSystem = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activePeriod, setActivePeriod] = useState('morning');
  
  const {
    timeEntries,
    isLoading,
    error,
    loadTimeEntries,
    clockIn,
    clockOut,
    getTodayEntries,
    getMorningEntry,
    getAfternoonEntry,
    getTodayTotalSalary
  } = useTimeClockAdapter();

  useEffect(() => {
    loadTimeEntries();
  }, []);

  const handleClockIn = async () => {
    await clockIn(activePeriod);
    await loadTimeEntries();
  };

  const handleClockOut = async () => {
    const entry = activePeriod === 'morning' ? getMorningEntry() : getAfternoonEntry();
    if (entry && entry.id) {
      await clockOut(entry.id);
      await loadTimeEntries();
    }
  };

  const handleRefresh = () => {
    loadTimeEntries();
  };

  const getStatusBadge = (period: 'morning' | 'afternoon') => {
    const entry = period === 'morning' ? getMorningEntry() : getAfternoonEntry();
    if (!entry) {
      return <Badge variant="outline" className="bg-gray-100">Non pointé</Badge>;
    }
    if (entry.time_in && !entry.time_out) {
      return <Badge className="bg-amber-500">En cours</Badge>;
    }
    return <Badge className="bg-[#33C3F0] dark:bg-[#6E59A5]">Terminé</Badge>;
  };

  // Calcul du salaire journalier avec gestion d'erreur améliorée
  const todaySalary = getTodayTotalSalary();
  const formattedSalary = typeof todaySalary === 'number' ? todaySalary.toFixed(2) : '0.00';

  // Fonction pour formater la durée en heures et minutes
  const formatDuration = (duration) => {
    if (!duration) return "--";
    return duration;
  };

  // Fonction pour formater le salaire - FIXED
  const formatSalary = (salary) => {
    // First convert to a number if it's a string
    const numericSalary = typeof salary === 'string' ? parseFloat(salary) : salary;
    
    // Check if it's actually a valid number
    if (numericSalary === null || numericSalary === undefined || 
        typeof numericSalary !== 'number' || isNaN(numericSalary)) {
      return "--";
    }
    
    return `${numericSalary.toFixed(2)} DH`;
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center text-[#33C3F0] dark:text-[#6E59A5]">
            <Clock className="mr-2 h-5 w-5" />
            Système de Pointage
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            disabled={isLoading}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </Button>
        </div>
        <CardDescription>
          Enregistrez vos heures d'entrée et de sortie
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col space-y-4">
            {/* Horloge en temps réel */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border">
              <RealTimeClock />
            </div>

            {/* Onglets pour le matin et l'après-midi */}
            <Tabs defaultValue="morning" onValueChange={(v) => setActivePeriod(v as 'morning' | 'afternoon')}>
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="morning" className="flex items-center gap-2">
                  Matin {getStatusBadge('morning')}
                </TabsTrigger>
                <TabsTrigger value="afternoon" className="flex items-center gap-2">
                  Après-midi {getStatusBadge('afternoon')}
                </TabsTrigger>
              </TabsList>

              {/* Contenu de l'onglet Matin */}
              <TabsContent value="morning" className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Période du matin</p>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Entrée</p>
                        <p className="font-medium">{getMorningEntry()?.time_in || "--:--"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Sortie</p>
                        <p className="font-medium">{getMorningEntry()?.time_out || "--:--"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClockIn}
                      disabled={isLoading || Boolean(getMorningEntry()?.time_in && !getMorningEntry()?.time_out)}
                      className="flex items-center"
                    >
                      {isLoading ? (
                        <RefreshCw className="mr-1 h-4 w-4 animate-spin" />
                      ) : (
                        <LogIn className="mr-1 h-4 w-4 text-[#33C3F0]" />
                      )}
                      <span>Entrée</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClockOut}
                      disabled={isLoading || !Boolean(getMorningEntry()?.time_in) || Boolean(getMorningEntry()?.time_out)}
                      className="flex items-center"
                    >
                      {isLoading ? (
                        <RefreshCw className="mr-1 h-4 w-4 animate-spin" />
                      ) : (
                        <LogOut className="mr-1 h-4 w-4 text-red-500" />
                      )}
                      <span>Sortie</span>
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Contenu de l'onglet Après-midi */}
              <TabsContent value="afternoon" className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Période de l'après-midi</p>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Entrée</p>
                        <p className="font-medium">{getAfternoonEntry()?.time_in || "--:--"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Sortie</p>
                        <p className="font-medium">{getAfternoonEntry()?.time_out || "--:--"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClockIn}
                      disabled={isLoading || Boolean(getAfternoonEntry()?.time_in && !getAfternoonEntry()?.time_out)}
                      className="flex items-center"
                    >
                      {isLoading ? (
                        <RefreshCw className="mr-1 h-4 w-4 animate-spin" />
                      ) : (
                        <LogIn className="mr-1 h-4 w-4 text-[#33C3F0]" />
                      )}
                      <span>Entrée</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClockOut}
                      disabled={isLoading || !Boolean(getAfternoonEntry()?.time_in) || Boolean(getAfternoonEntry()?.time_out)}
                      className="flex items-center"
                    >
                      {isLoading ? (
                        <RefreshCw className="mr-1 h-4 w-4 animate-spin" />
                      ) : (
                        <LogOut className="mr-1 h-4 w-4 text-red-500" />
                      )}
                      <span>Sortie</span>
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Affichage du salaire journalier */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Salaire journalier:</span>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-[#33C3F0] dark:text-[#6E59A5]" />
                  <span className="text-xl font-bold">{formattedSalary} DH</span>
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                <p>Taux horaire: 50 DH/heure</p>
                <p>Journée standard: 8 heures</p>
              </div>
            </div>

            {/* Sélecteur de date */}
            <div className="flex flex-col space-y-2">
              <div className="flex items-center">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP", { locale: fr }) : <span>Sélectionner une date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Tableau récapitulatif */}
          <div className="rounded-lg border shadow-sm">
            <div className="p-4 border-b">
              <h3 className="text-lg font-medium">Récapitulatif des pointages récents</h3>
              <p className="text-sm text-muted-foreground">Derniers pointages enregistrés</p>
            </div>
            <div className="overflow-auto max-h-[300px]">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-2 text-left font-medium">Date</th>
                    <th className="p-2 text-left font-medium">Période</th>
                    <th className="p-2 text-left font-medium">Entrée</th>
                    <th className="p-2 text-left font-medium">Sortie</th>
                    <th className="p-2 text-left font-medium">Durée</th>
                    <th className="p-2 text-left font-medium">Salaire</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center">
                        <RefreshCw className="h-5 w-5 animate-spin mx-auto" />
                        <p className="mt-2 text-muted-foreground">Chargement des données...</p>
                      </td>
                    </tr>
                  ) : timeEntries.length > 0 ? (
                    [...timeEntries]
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .slice(0, 5)
                      .map(entry => (
                        <tr key={entry.id} className="border-b">
                          <td className="p-2">{format(new Date(entry.date), 'dd/MM/yyyy')}</td>
                          <td className="p-2">{entry.period === 'morning' ? 'Matin' : 'Après-midi'}</td>
                          <td className="p-2">{entry.time_in}</td>
                          <td className="p-2">{entry.time_out || '--'}</td>
                          <td className="p-2">{formatDuration(entry.total_hours)}</td>
                          <td className="p-2">{formatSalary(entry.salary)}</td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-muted-foreground">
                        Aucun pointage enregistré
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeClockSystem;