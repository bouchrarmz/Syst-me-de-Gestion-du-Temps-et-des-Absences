import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Download, FileText, Check, X, Eye, Printer, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { useTranslation } from "react-i18next";
import { absenceService } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Textarea } from "@/components/ui/textarea";

const AbsenceJustificationList = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [justifications, setJustifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [currentJustification, setCurrentJustification] = useState(null);
  const [activeOperation, setActiveOperation] = useState(null);

  useEffect(() => {
    const loadJustifications = async () => {
      if (!user || user.role !== "admin") {
        setError("Accès non autorisé");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await absenceService.getAll();
        const formattedData = data.map((absence) => ({
          id: absence.id,
          employee: {
            id: absence.user_id,
            name: absence.user?.name || "Employé inconnu",
            email: absence.user?.email || "",
            avatar: absence.user?.avatar || null,
          },
          type: absence.type,
          date: absence.start_date,
          reason: absence.reason,
          description: absence.reason,
          status: absence.status,
          document: absence.attachment,
          comments: absence.comments,
          approved_by: absence.approved_by,
          approved_at: absence.approved_at,
        }));

        setJustifications(formattedData);
      } catch (err) {
        console.error("Erreur lors du chargement des justificatifs:", err);
        setError("Erreur lors du chargement des justificatifs");
        toast.error("Erreur lors du chargement des justificatifs");
      } finally {
        setIsLoading(false);
      }
    };

    loadJustifications();
  }, [user]);

  const filteredJustifications = justifications.filter((justif) => {
    const matchesSearch =
      (justif.employee?.name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (justif.reason || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || justif.status === statusFilter;
    const matchesType = typeFilter === "all" || justif.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="default" className="bg-green-500">
            {t("justification.approved")}
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="text-red-500 border-red-500">
            {t("justification.rejected")}
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-500 text-white">
            {t("justification.pending")}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleViewJustification = (justification) => {
    if (activeOperation && activeOperation !== "view") {
      setActiveOperation(null);
    }

    setCurrentJustification(justification);
    setViewDialogOpen(true);
    setActiveOperation("view");
  };

  const handleApproveJustification = async (id) => {
    if (!user || user.role !== "admin") {
      toast.error("Vous n'avez pas les droits pour approuver des justificatifs");
      return;
    }

    setActiveOperation("approving");

    try {
      await absenceService.approve(id, {
        admin_id: Number(user.id),
        comments: comments,
      });

      setJustifications(
        justifications.map((j) =>
          j.id === id
            ? {
                ...j,
                status: "approved",
                comments: comments,
                approved_by: user.id,
                approved_at: new Date().toISOString(),
              }
            : j
        )
      );

      setViewDialogOpen(false);
      setActiveOperation(null);
      setComments("");
      toast.success(t("justification.approvedSuccess"));
    } catch (error) {
      console.error("Erreur lors de l'approbation du justificatif:", error);
      toast.error(`Erreur: ${error.message || "Erreur lors de l'approbation du justificatif"}`);
    } finally {
      setActiveOperation(null);
    }
  };

  const handleRejectJustification = async (id) => {
    if (!user || user.role !== "admin") {
      toast.error("Vous n'avez pas les droits pour rejeter des justificatifs");
      return;
    }

    if (!comments.trim()) {
      toast.error("Veuillez fournir un commentaire pour le rejet");
      return;
    }

    setActiveOperation("rejecting");

    try {
      await absenceService.reject(id, {
        admin_id: Number(user.id),
        rejection_reason: comments,
      });

      setJustifications(
        justifications.map((j) =>
          j.id === id
            ? {
                ...j,
                status: "rejected",
                comments: comments,
                approved_by: user.id,
                approved_at: new Date().toISOString(),
              }
            : j
        )
      );

      setViewDialogOpen(false);
      setActiveOperation(null);
      setComments("");
      toast.success(t("justification.rejectedSuccess"));
    } catch (error) {
      console.error("Erreur lors du rejet du justificatif:", error);
      let errorMessage = "Erreur lors du rejet du justificatif";
      if (error.errors) {
        errorMessage = Object.values(error.errors)
          .flat()
          .join(", ");
      }
      toast.error(`Erreur: ${errorMessage}`);
    } finally {
      setActiveOperation(null);
    }
  };

  const handleDownloadDocument = (document) => {
    if (!document) {
      toast.error(t("justification.noDocument"));
      return;
    }

    toast.success(t("justification.downloading"));

    setTimeout(() => {
      toast.success(t("justification.downloadComplete"));
    }, 1000);
  };

  const handlePrintDocument = (document) => {
    if (!document) {
      toast.error(t("justification.noDocument"));
      return;
    }

    toast.success(t("justification.preparingPrint"));

    setTimeout(() => {
      toast.success(t("justification.printComplete"));
      window.print();
    }, 500);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("justification.searchPlaceholder")}
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={t("justification.status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("justification.allStatuses")}</SelectItem>
              <SelectItem value="pending">{t("justification.pending")}</SelectItem>
              <SelectItem value="approved">{t("justification.approved")}</SelectItem>
              <SelectItem value="rejected">{t("justification.rejected")}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={t("justification.type")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("justification.allTypes")}</SelectItem>
              <SelectItem value="absence">{t("justification.absence")}</SelectItem>
              <SelectItem value="retard">{t("justification.delay")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="cards" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="cards">{t("justification.cardView")}</TabsTrigger>
          <TabsTrigger value="list">{t("justification.listView")}</TabsTrigger>
        </TabsList>

        <TabsContent value="cards">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJustifications.length > 0 ? (
              filteredJustifications.map((justif) => (
                <Card
                  key={justif.id}
                  className={`overflow-hidden hover:shadow-md transition-shadow ${
                    justif.status === "pending"
                      ? "border-yellow-200 dark:border-yellow-800"
                      : ""
                  }`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={justif.employee.avatar || ""} />
                          <AvatarFallback>
                            {justif.employee.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-md">
                            {justif.employee.name}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {justif.employee.email}
                          </CardDescription>
                        </div>
                      </div>
                      {getStatusBadge(justif.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2 space-y-2">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <div className="text-muted-foreground">
                        {t("justification.date")}:
                      </div>
                      <div className="font-medium">
                        {new Date(justif.date).toLocaleDateString("fr-FR")}
                      </div>

                      <div className="text-muted-foreground">
                        {t("justification.type")}:
                      </div>
                      <div className="font-medium capitalize">
                        {t(`justification.${justif.type}`)}
                      </div>

                      <div className="text-muted-foreground">
                        {t("justification.reason")}:
                      </div>
                      <div className="font-medium">{justif.reason}</div>
                    </div>

                    <p className="text-sm mt-2 line-clamp-2 text-muted-foreground">
                      {justif.description}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewJustification(justif)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      {t("general.view")}
                    </Button>

                    {justif.document && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadDocument(justif.document)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        {t("general.download")}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-muted-foreground">
                  {t("justification.noResults")}
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="list">
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="py-3 px-4 text-left font-medium">
                    {t("employee.name")}
                  </TableHead>
                  <TableHead className="py-3 px-4 text-left font-medium">
                    {t("justification.date")}
                  </TableHead>
                  <TableHead className="py-3 px-4 text-left font-medium">
                    {t("justification.type")}
                  </TableHead>
                  <TableHead className="py-3 px-4 text-left font-medium">
                    {t("justification.reason")}
                  </TableHead>
                  <TableHead className="py-3 px-4 text-left font-medium">
                    {t("justification.status")}
                  </TableHead>
                  <TableHead className="py-3 px-4 text-center font-medium">
                    {t("general.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJustifications.length > 0 ? (
                  filteredJustifications.map((justif) => (
                    <TableRow key={justif.id} className="hover:bg-muted/50">
                      <TableCell className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={justif.employee.avatar || ""} />
                            <AvatarFallback className="text-xs">
                              {justif.employee.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span>{justif.employee.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        {new Date(justif.date).toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell className="py-3 px-4 capitalize">
                        {t(`justification.${justif.type}`)}
                      </TableCell>
                      <TableCell className="py-3 px-4">{justif.reason}</TableCell>
                      <TableCell className="py-3 px-4">
                        {getStatusBadge(justif.status)}
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <div className="flex justify-center items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewJustification(justif)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {justif.document && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleDownloadDocument(justif.document)
                                }
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePrintDocument(justif.document)}
                              >
                                <Printer className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-10 text-center text-muted-foreground"
                    >
                      {t("justification.noResults")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t("justification.details")}</DialogTitle>
            <DialogDescription>
              {t("justification.detailsDescription")}
            </DialogDescription>
          </DialogHeader>

          {currentJustification && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={currentJustification.employee.avatar || ""} />
                  <AvatarFallback>
                    {currentJustification.employee.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">
                    {currentJustification.employee.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {currentJustification.employee.email}
                  </p>
                </div>
                <div className="ml-auto">
                  {getStatusBadge(currentJustification.status)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      {t("justification.date")}
                    </h4>
                    <p className="font-medium">
                      {new Date(currentJustification.date).toLocaleDateString(
                        "fr-FR"
                      )}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      {t("justification.type")}
                    </h4>
                    <p className="font-medium capitalize">
                      {t(`justification.${currentJustification.type}`)}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      {t("justification.reason")}
                    </h4>
                    <p className="font-medium">{currentJustification.reason}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      {t("justification.description")}
                    </h4>
                    <p className="text-sm">{currentJustification.description}</p>
                  </div>

                  {currentJustification.document && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">
                        {t("justification.document")}
                      </h4>
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm">Document justificatif</span>
                        <div className="flex gap-2 ml-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleDownloadDocument(currentJustification.document)
                            }
                          >
                            <Download className="mr-2 h-4 w-4" />
                            {t("general.download")}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handlePrintDocument(currentJustification.document)
                            }
                          >
                            <Printer className="mr-2 h-4 w-4" />
                            {t("general.print")}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentJustification.status !== "pending" && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">
                        {currentJustification.status === "approved"
                          ? t("justification.approvedBy")
                          : t("justification.rejectedBy")}
                      </h4>
                      <p className="text-sm">
                        Admin #{currentJustification.approved_by} -{" "}
                        {new Date(currentJustification.approved_at).toLocaleString(
                          "fr-FR"
                        )}
                      </p>
                      {currentJustification.comments && (
                        <div className="mt-2">
                          <h5 className="text-xs font-medium text-muted-foreground">
                            {t("justification.comments")}
                          </h5>
                          <p className="text-sm mt-1 p-2 bg-muted rounded-md">
                            {currentJustification.comments}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {currentJustification.status === "pending" &&
                user?.role === "admin" && (
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <Label htmlFor="comments">
                        {t("justification.addComments")}
                      </Label>
                      <Textarea
                        id="comments"
                        placeholder={t("justification.commentsPlaceholder")}
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() =>
                          handleRejectJustification(currentJustification.id)
                        }
                        disabled={activeOperation === "rejecting"}
                      >
                        {activeOperation === "rejecting" ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t("general.processing")}
                          </>
                        ) : (
                          <>
                            <X className="mr-2 h-4 w-4" />
                            {t("justification.reject")}
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() =>
                          handleApproveJustification(currentJustification.id)
                        }
                        className="bg-green-600 hover:bg-green-700"
                        disabled={activeOperation === "approving"}
                      >
                        {activeOperation === "approving" ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t("general.processing")}
                          </>
                        ) : (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            {t("justification.approve")}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              {t("general.close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">{t("general.loading")}</span>
        </div>
      )}

      {error && (
        <div className="text-center py-10">
          <p className="text-red-500">{error}</p>
        </div>
      )}
    </div>
  );
};

export default AbsenceJustificationList;