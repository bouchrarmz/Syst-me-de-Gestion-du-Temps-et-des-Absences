
import { CalendarIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { fr, enUS, ar } from "date-fns/locale";

interface Props {
  date: Date;
  language: string;
}

function getLocale(language: string) {
  switch (language) {
    case "fr":
      return fr;
    case "en":
      return enUS;
    case "ar":
      return ar;
    default:
      return fr;
  }
}

const JustificationDateDisplay = ({ date, language }: Props) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-2">
      <Label>{t("justification.date")}</Label>
      <div className="relative">
        <div className="flex items-center border rounded-md p-2">
          <CalendarIcon className="h-4 w-4 mr-2" />
          <span>
            {format(date, "P", { locale: getLocale(language) })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default JustificationDateDisplay;
