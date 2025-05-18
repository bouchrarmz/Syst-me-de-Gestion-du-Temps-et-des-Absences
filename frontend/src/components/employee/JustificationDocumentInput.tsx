
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Props {
  document: File | null;
  onFileChange: (file: File | null) => void;
}

const JustificationDocumentInput = ({ document, onFileChange }: Props) => {
  const { t } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileChange(e.target.files[0]);
    }
  };

  // Create a reference to avoid name collision with the document prop
  const fileInputRef = React.createRef<HTMLInputElement>();

  const handleButtonClick = () => {
    // Use the ref to access the file input element
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="document">{t("justification.document")}</Label>
      <div className="flex items-center gap-2">
        <Input
          id="document"
          type="file"
          onChange={handleChange}
          className="hidden"
          ref={fileInputRef}
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleButtonClick}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          {document ? document.name : t("justification.uploadDocument")}
        </Button>
      </div>
      {document && (
        <p className="text-sm text-muted-foreground mt-1">
          {t("justification.fileSelected")}: {document.name}
        </p>
      )}
    </div>
  );
};

export default JustificationDocumentInput;
