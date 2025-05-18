import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import JustificationTypeSelect from "./JustificationTypeSelect";
import JustificationDateDisplay from "./JustificationDateDisplay";
import JustificationReasonInput from "./JustificationReasonInput";
import JustificationDescriptionInput from "./JustificationDescriptionInput";
import JustificationDocumentInput from "./JustificationDocumentInput";
import { CalendarIcon, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { fr, enUS, ar } from "date-fns/locale";
import { usePreferences } from "@/contexts/PreferencesContext";

interface JustificationFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date | null;
  defaultType?: string;
  onSubmit?: (formData: any) => void;
}

const JustificationForm = ({
  isOpen,
  onClose,
  selectedDate = null,
  defaultType = "absence",
  onSubmit
}: JustificationFormProps) => {
  const { t } = useTranslation();
  const { preferences } = usePreferences();
  
  const getLocale = () => {
    switch (preferences.language) {
      case "fr":
        return fr;
      case "en":
        return enUS;
      case "ar":
        return ar;
      default:
        return fr;
    }
  };

  const [formData, setFormData] = useState({
    type: defaultType,
    date: selectedDate || new Date(),
    reason: "",
    description: "",
    document: null as File | null,
  });

  useEffect(() => {
    if (selectedDate) {
      setFormData(prev => ({ ...prev, date: selectedDate }));
    }
  }, [selectedDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.reason) {
      toast.error(t("justification.errorReason"));
      return;
    }
    
    console.log("Justification soumise:", formData);
    
    toast.success(t("justification.success"), {
      description: t("justification.successDescription"),
    });
    
    if (onSubmit) onSubmit(formData);
    
    onClose();
    
    setFormData({
      type: "absence",
      date: new Date(),
      reason: "",
      description: "",
      document: null,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("justification.title")}</DialogTitle>
          <DialogDescription>
            {t("justification.description")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <JustificationTypeSelect
                value={formData.type}
                onChange={value => setFormData({ ...formData, type: value })}
              />
              <JustificationDateDisplay
                date={formData.date}
                language={preferences?.language || "fr"}
              />
            </div>
            <JustificationReasonInput
              value={formData.reason}
              onChange={value => setFormData({ ...formData, reason: value })}
            />
            <JustificationDescriptionInput
              value={formData.description}
              onChange={value => setFormData({ ...formData, description: value })}
            />
            <JustificationDocumentInput
              document={formData.document}
              onFileChange={file => setFormData({ ...formData, document: file })}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t("general.cancel")}
            </Button>
            <Button type="submit">{t("justification.submit")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JustificationForm;
