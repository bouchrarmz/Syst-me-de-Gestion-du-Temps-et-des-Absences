
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUp, ArrowDown, Clock } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

// Données de test pour les heures de travail
const weeklyData = [
  { name: "Lun", heures: 8 },
  { name: "Mar", heures: 8.5 },
  { name: "Mer", heures: 7 },
  { name: "Jeu", heures: 9 },
  { name: "Ven", heures: 8 },
  { name: "Sam", heures: 0 },
  { name: "Dim", heures: 0 },
];

const monthlyData = [
  { name: "Semaine 1", heures: 40 },
  { name: "Semaine 2", heures: 42 },
  { name: "Semaine 3", heures: 38 },
  { name: "Semaine 4", heures: 41 },
];

const WorkHoursStats = () => {
  const [period, setPeriod] = useState<"week" | "month">("week");
  
  // Calculer le total des heures
  const totalHours = period === "week" 
    ? weeklyData.reduce((total, day) => total + day.heures, 0)
    : monthlyData.reduce((total, week) => total + week.heures, 0);
  
  // Déterminer si le nombre d'heures est supérieur ou inférieur à la moyenne
  const expectedWeeklyHours = 40;
  const expectedMonthlyHours = 160;
  const expectedHours = period === "week" ? expectedWeeklyHours : expectedMonthlyHours;
  const difference = totalHours - expectedHours;
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Clock className="h-6 w-6 text-[#008000]" />
              Mes heures de travail
            </CardTitle>
            <CardDescription>
              Suivi de votre temps de travail
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-md">
            <div className="text-right">
              <p className="text-2xl font-bold">{totalHours}h</p>
              <div className="flex items-center justify-end text-sm">
                {difference > 0 ? (
                  <>
                    <ArrowUp className="h-3 w-3 text-green-500" />
                    <span className="text-green-600">+{difference}h</span>
                  </>
                ) : difference < 0 ? (
                  <>
                    <ArrowDown className="h-3 w-3 text-red-500" />
                    <span className="text-red-600">{difference}h</span>
                  </>
                ) : (
                  <span className="text-muted-foreground">Conforme</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="week" value={period} onValueChange={(v) => setPeriod(v as "week" | "month")}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="week">Cette semaine</TabsTrigger>
            <TabsTrigger value="month">Ce mois</TabsTrigger>
          </TabsList>
          <TabsContent value="week" className="space-y-4">
            <div className="h-[200px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    formatter={(value) => [`${value} heures`, 'Temps de travail']}
                    contentStyle={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}
                  />
                  <Bar dataKey="heures" fill="#008000" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-center text-muted-foreground">
              Objectif hebdomadaire: {expectedWeeklyHours} heures
            </p>
          </TabsContent>
          <TabsContent value="month" className="space-y-4">
            <div className="h-[200px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    formatter={(value) => [`${value} heures`, 'Temps de travail']}
                    contentStyle={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}
                  />
                  <Bar dataKey="heures" fill="#DAA520" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-center text-muted-foreground">
              Objectif mensuel: {expectedMonthlyHours} heures
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default WorkHoursStats;
