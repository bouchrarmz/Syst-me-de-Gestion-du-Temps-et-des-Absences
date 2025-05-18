
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Mail, Phone } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Données fictives pour les collègues
const colleaguesData = [
  {
    id: 1,
    name: "Ahmed Benani",
    position: "Ingénieur Process",
    department: "Production",
    email: "ahmed.benani@example.com",
    phone: "+212 612 345 678",
    avatar: null,
  },
  {
    id: 2,
    name: "Fatima Zahra",
    position: "Responsable RH",
    department: "Ressources Humaines",
    email: "fatima.zahra@example.com",
    phone: "+212 623 456 789",
    avatar: null,
  },
  {
    id: 3,
    name: "Karim Idrissi",
    position: "Technicien Maintenance",
    department: "Maintenance",
    email: "karim.idrissi@example.com",
    phone: "+212 634 567 890",
    avatar: null,
  },
  {
    id: 4,
    name: "Nadia Berrada",
    position: "Analyste Financier",
    department: "Finance",
    email: "nadia.berrada@example.com",
    phone: "+212 645 678 901",
    avatar: null,
  },
  {
    id: 5,
    name: "Omar Tazi",
    position: "Ingénieur Qualité",
    department: "Qualité",
    email: "omar.tazi@example.com",
    phone: "+212 656 789 012",
    avatar: null,
  },
  {
    id: 6,
    name: "Samira Alaoui",
    position: "Responsable Marketing",
    department: "Marketing",
    email: "samira.alaoui@example.com",
    phone: "+212 667 890 123",
    avatar: null,
  },
];

const ColleaguesList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  
  // Extraire les départements uniques pour le filtre
  const departments = [...new Set(colleaguesData.map(c => c.department))];
  
  // Filtrer les collègues en fonction de la recherche et du filtre de département
  const filteredColleagues = colleaguesData.filter(colleague => {
    const matchesSearch = colleague.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          colleague.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = departmentFilter === "all" || colleague.department === departmentFilter;
    
    return matchesSearch && matchesDepartment;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un collègue..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Département" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les départements</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredColleagues.length > 0 ? (
          filteredColleagues.map((colleague) => (
            <Card key={colleague.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center text-center">
                <Avatar className="w-24 h-24 mb-4">
                  <AvatarImage src={colleague.avatar || ""} />
                  <AvatarFallback className="bg-primary text-white text-xl">
                    {colleague.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                
                <h3 className="text-lg font-semibold">{colleague.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{colleague.position}</p>
                <p className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 py-1 px-2 rounded-full mb-4">
                  {colleague.department}
                </p>
                
                <div className="flex flex-col w-full space-y-2">
                  <Button variant="outline" className="w-full flex justify-center items-center gap-2" asChild>
                    <a href={`mailto:${colleague.email}`}>
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </a>
                  </Button>
                  
                  <Button variant="outline" className="w-full flex justify-center items-center gap-2" asChild>
                    <a href={`tel:${colleague.phone.replace(/\s+/g, '')}`}>
                      <Phone className="h-4 w-4" />
                      <span>Téléphone</span>
                    </a>
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-muted-foreground">Aucun collègue trouvé.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColleaguesList;
