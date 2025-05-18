import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Download, FileBarChart, Filter, RefreshCw, Printer, Loader2 } from "lucide-react";
import { toast } from "sonner";
import AttendanceChart from "@/components/charts/AttendanceChart";
import AttendanceDistribution from "@/components/charts/AttendanceDistribution";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { timeEntryService } from "@/services/api"; // Importer le service API

// Interface pour les données de rapport (exemple)
interface ReportDataRow {
  date: string;
  presenceCount: number;
  absenceCount: number;
  delayCount: number;
  percentage: string;
}

const ReportGenerator = () => {
  const { t } = useTranslation();
  const [reportType, setReportType] = useState("presence");
  const [reportPeriod, setReportPeriod] = useState("week");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedView, setSelectedView] = useState("chart");
  const [reportData, setReportData] = useState<ReportDataRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chartKey, setChartKey] = useState(0); // Clé pour forcer le re-rendu des graphiques

  // Fonction pour récupérer les données du rapport (simulation)
  const fetchReportData = async () => {
    setIsLoading(true);
    console.log("Fetching report data with filters:", { reportType, reportPeriod, startDate, endDate });
    try {
      // Construire les filtres pour l'API
      const filters: any = {
        type: reportType,
        period: reportPeriod,
      };
      if (reportPeriod === "custom" && startDate && endDate) {
        filters.startDate = startDate;
        filters.endDate = endDate;
      }

      // **Simulation d'appel API**
      // Remplacer par: const data = await timeEntryService.getReportData(filters);
      // L'API /time-entries-report (ou similaire) doit être créée côté backend
      // pour retourner les données agrégées selon les filtres.
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simuler la latence réseau
      
      // Données simulées basées sur les filtres (exemple simple)
      let simulatedData: ReportDataRow[] = [];
      if (reportType === "presence" || reportType === "summary") {
         simulatedData = [
          { date: "01/05/2025", presenceCount: 38, absenceCount: 2, delayCount: 5, percentage: "84%" },
          { date: "30/04/2025", presenceCount: 40, absenceCount: 2, delayCount: 3, percentage: "89%" },
          { date: "29/04/2025", presenceCount: 41, absenceCount: 2, delayCount: 2, percentage: "91%" },
        ];
      } else if (reportType === "absence") {
         simulatedData = [
          { date: "01/05/2025", presenceCount: 38, absenceCount: 2, delayCount: 5, percentage: "4%" },
          { date: "30/04/2025", presenceCount: 40, absenceCount: 2, delayCount: 3, percentage: "4%" },
          { date: "29/04/2025", presenceCount: 41, absenceCount: 2, delayCount: 2, percentage: "4%" },
        ];
      } else { // delay
         simulatedData = [
          { date: "01/05/2025", presenceCount: 38, absenceCount: 2, delayCount: 5, percentage: "11%" },
          { date: "30/04/2025", presenceCount: 40, absenceCount: 2, delayCount: 3, percentage: "7%" },
          { date: "29/04/2025", presenceCount: 41, absenceCount: 2, delayCount: 2, percentage: "4%" },
        ];
      }
      
      // Simuler un filtrage par période (très basique)
      if (reportPeriod === "day") simulatedData = simulatedData.slice(0, 1);
      else if (reportPeriod === "week") simulatedData = simulatedData.slice(0, 7); // Notre simu n'a que 3 jours

      setReportData(simulatedData);
      setChartKey(prevKey => prevKey + 1); // Changer la clé pour forcer le re-rendu des graphiques
      toast.success(t("reports.reportGenerated"), {
        description: t("reports.dataLoaded"),
      });

    } catch (error) {
      console.error("Erreur lors de la génération du rapport:", error);
      toast.error(t("reports.errorGenerating"));
      setReportData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Déclencher la récupération des données lorsque les filtres changent
  useEffect(() => {
    // Ne pas lancer si la période est custom et que les dates ne sont pas définies
    if (reportPeriod === "custom" && (!startDate || !endDate)) {
      setReportData([]); // Vider les données si les dates custom sont incomplètes
      return;
    }
    fetchReportData();
  }, [reportType, reportPeriod, startDate, endDate]);

  const generateReport = () => {
    // La génération est maintenant déclenchée par useEffect, mais on garde le bouton pour la période custom
    if (reportPeriod === "custom" && (!startDate || !endDate)) {
      toast.warning(t("reports.selectDates"));
      return;
    }
    // On peut forcer un re-fetch si nécessaire, même si useEffect le fait déjà
    fetchReportData(); 
  };

  const exportReport = (format: string) => {
    if (reportData.length === 0) {
      toast.warning(t("reports.noDataToExport"));
      return;
    }
    toast.info(`${t("reports.exportingTo")} ${format.toUpperCase()}...`, {
      description: t("reports.downloadWillStart"),
    });
    // Logique d'exportation (à implémenter, ex: jsPDF, xlsx)
  };

  const printReport = () => {
    if (reportData.length === 0 && selectedView === 'table') {
       toast.warning(t("reports.noDataToPrint"));
       return;
    }
    toast.info(t("reports.preparingPrint"));
    // On pourrait cibler plus spécifiquement la section à imprimer
    window.print(); 
  };

  const refreshData = () => {
    toast.info(t("reports.refreshingData"));
    fetchReportData();
  };

  // Passer la clé aux graphiques pour forcer le re-rendu
  const renderReportChart = () => {
    switch (reportType) {
      case "presence":
        return <AttendanceChart key={chartKey} type="presence" />;
      case "absence":
        return <AttendanceChart key={chartKey} type="absence" />;
      case "delay":
        return <AttendanceChart key={chartKey} type="delay" />;
      case "summary":
        return <AttendanceDistribution key={chartKey} />;
      default:
        return <AttendanceChart key={chartKey} type="presence" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Filtres */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-wrap gap-2">
          {/* Select Type */}
          <Select onValueChange={setReportType} value={reportType}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder={t("reports.type")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="presence">{t("reports.presence")}</SelectItem>
              <SelectItem value="absence">{t("reports.absence")}</SelectItem>
              <SelectItem value="delay">{t("reports.delay")}</SelectItem>
              <SelectItem value="summary">{t("reports.summary")}</SelectItem>
            </SelectContent>
          </Select>

          {/* Select Période */}
          <Select onValueChange={setReportPeriod} value={reportPeriod}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder={t("reports.period")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">{t("reports.today")}</SelectItem>
              <SelectItem value="week">{t("reports.thisWeek")}</SelectItem>
              <SelectItem value="month">{t("reports.thisMonth")}</SelectItem>
              {/* <SelectItem value="quarter">{t("reports.thisQuarter")}</SelectItem> */}
              {/* <SelectItem value="year">{t("reports.thisYear")}</SelectItem> */}
              <SelectItem value="custom">{t("reports.custom")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Boutons Actions */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshData} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            {t("reports.refresh")}
          </Button>
          {/* <Button variant="outline" onClick={printReport}>
            <Printer className="h-4 w-4 mr-2" />
            {t("general.print")}
          </Button> */} 
        </div>
      </div>

      {/* Filtres Date Custom */}
      {reportPeriod === "custom" && (
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex flex-col gap-1 flex-grow">
            <span className="text-sm text-muted-foreground">{t("reports.startDate")}</span>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full"
              disabled={isLoading}
            />
          </div>
          <div className="flex flex-col gap-1 flex-grow">
            <span className="text-sm text-muted-foreground">{t("reports.endDate")}</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full"
              disabled={isLoading}
            />
          </div>
          {/* Le bouton Générer n'est plus strictement nécessaire car useEffect s'en charge */}
          {/* <Button className="bg-[#008000] hover:bg-[#006400]" onClick={generateReport} disabled={isLoading || !startDate || !endDate}>
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Filter className="h-4 w-4 mr-2" />}
            {t("reports.generate")}
          </Button> */} 
        </div>
      )}

      {/* Onglets Graphique / Tableau */}
      <Tabs value={selectedView} onValueChange={setSelectedView} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4 w-full sm:w-[250px]">
          <TabsTrigger value="chart">{t("reports.chart")}</TabsTrigger>
          <TabsTrigger value="table">{t("reports.table")}</TabsTrigger>
        </TabsList>

        {/* Contenu Graphique */}
        <TabsContent value="chart">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileBarChart className="mr-2 h-5 w-5 text-[#008000]" />
                {/* Titre dynamique basé sur le type */} 
                {reportType === "presence" && t("reports.presenceEvolution")}
                {reportType === "absence" && t("reports.absenceEvolution")}
                {reportType === "delay" && t("reports.delayEvolution")}
                {reportType === "summary" && t("reports.statusDistribution")}
              </CardTitle>
              <CardDescription>
                {t("reports.chartDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="min-h-[300px]">
              {isLoading ? (
                <div className="flex justify-center items-center h-[300px]">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : reportData.length > 0 || reportType === 'summary' ? (
                 renderReportChart()
              ) : (
                <div className="text-center h-[300px] flex items-center justify-center text-muted-foreground">{t("reports.noDataForChart")}</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contenu Tableau */}
        <TabsContent value="table">
          <Card>
            <CardHeader>
              <CardTitle>{t("reports.detailedData")}</CardTitle>
              <CardDescription>{t("reports.tableDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-[150px]">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50 hover:bg-muted/60">
                        <th className="p-3 text-left font-medium">{t("reports.date")}</th>
                        <th className="p-3 text-left font-medium">{t("reports.presenceCount")}</th>
                        <th className="p-3 text-left font-medium">{t("reports.absenceCount")}</th>
                        <th className="p-3 text-left font-medium">{t("reports.delayCount")}</th>
                        <th className="p-3 text-left font-medium">{t("reports.percentage")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.length > 0 ? (
                        reportData.map((row, index) => (
                          <tr key={index} className="border-b hover:bg-muted/40">
                            <td className="p-3">{row.date}</td>
                            <td className="p-3">{row.presenceCount}</td>
                            <td className="p-3">{row.absenceCount}</td>
                            <td className="p-3">{row.delayCount}</td>
                            <td className="p-3">{row.percentage}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-muted-foreground">{t("reports.noDataAvailable")}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Boutons Export / Imprimer */}
      <div className="flex justify-end space-x-2 mt-6">
        <Button variant="outline" onClick={() => exportReport("pdf")} disabled={isLoading || reportData.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          {t("reports.exportPDF")}
        </Button>
        <Button variant="outline" onClick={() => exportReport("excel")} disabled={isLoading || reportData.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          {t("reports.exportExcel")}
        </Button>
         <Button className="bg-[#008000] hover:bg-[#006400]" onClick={printReport} disabled={isLoading}>
          <Printer className="mr-2 h-4 w-4" />
          {t("general.print")}
        </Button>
      </div>
    </div>
  );
};

export default ReportGenerator;

