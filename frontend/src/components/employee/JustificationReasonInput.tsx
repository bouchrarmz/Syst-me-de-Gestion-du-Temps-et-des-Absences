
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

const JustificationReasonInput = ({ value, onChange }: Props) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-2">
      <Label htmlFor="reason">{t("justification.reason")}</Label>
      <Input
        id="reason"
        value={value}
        onChange={e => onChange(e.target.value)}
        required
      />
    </div>
  );
};

export default JustificationReasonInput;
