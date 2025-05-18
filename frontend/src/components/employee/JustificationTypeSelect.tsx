
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

interface JustificationTypeSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const JustificationTypeSelect = ({ value, onChange }: JustificationTypeSelectProps) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-2">
      <Label htmlFor="type">{t("justification.type")}</Label>
      <Select
        value={value}
        onValueChange={onChange}
      >
        <SelectTrigger id="type">
          <SelectValue placeholder={t("justification.selectType")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="absence">{t("justification.absence")}</SelectItem>
          <SelectItem value="delay">{t("justification.delay")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default JustificationTypeSelect;
