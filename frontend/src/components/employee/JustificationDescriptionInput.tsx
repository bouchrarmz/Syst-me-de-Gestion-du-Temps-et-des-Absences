
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

const JustificationDescriptionInput = ({ value, onChange }: Props) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-2">
      <Label htmlFor="description">{t("justification.description")}</Label>
      <Textarea
        id="description"
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={3}
      />
    </div>
  );
};

export default JustificationDescriptionInput;
