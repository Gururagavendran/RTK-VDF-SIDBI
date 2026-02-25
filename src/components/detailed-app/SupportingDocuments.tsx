import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ALLOWED_EXTENSIONS = [".pdf", ".xlsx", ".xls", ".docx", ".doc", ".csv", ".jpg", ".jpeg", ".png"];
const MAX_FILE_SIZE_MB = 25;

const LABELED_FIELDS = [
  "Pitch Deck",
  "Balance Sheet — Year 1 (Latest)",
  "Balance Sheet — Year 2",
  "Balance Sheet — Year 3",
  "Auditors Note",
];

function validateFile(file: File): string | null {
  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) return `File type "${ext}" is not supported.`;
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) return `File exceeds ${MAX_FILE_SIZE_MB}MB limit.`;
  return null;
}

interface Props {
  labeledFiles: Record<string, string>;
  onLabeledChange: (files: Record<string, string>) => void;
  additionalFiles: string[];
  onAdditionalChange: (files: string[]) => void;
  readOnly?: boolean;
}

const SupportingDocuments = ({ labeledFiles, onLabeledChange, additionalFiles, onAdditionalChange, readOnly }: Props) => {
  const handleLabeledFile = (label: string, file: File) => {
    const error = validateFile(file);
    if (error) {
      toast({ title: "Upload Error", description: `${file.name}: ${error}`, variant: "destructive" });
      return;
    }
    onLabeledChange({ ...labeledFiles, [label]: file.name });
    toast({ title: "Uploaded", description: `${label}: ${file.name}` });
  };

  const handleBrowseUpload = (fileList: FileList) => {
    const newFiles: string[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const error = validateFile(file);
      if (error) {
        toast({ title: "Upload Error", description: `${file.name}: ${error}`, variant: "destructive" });
        continue;
      }
      newFiles.push(file.name);
    }
    if (newFiles.length > 0) {
      onAdditionalChange([...additionalFiles, ...newFiles]);
      toast({ title: "Uploaded", description: `${newFiles.length} file(s) added successfully.` });
    }
  };

  const handleRemoveAdditional = (index: number) => {
    onAdditionalChange(additionalFiles.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Supporting Documents
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Individual labeled fields */}
        {LABELED_FIELDS.map((label) => (
          <div key={label}>
            <p className="text-sm font-semibold mb-1.5 uppercase tracking-wide">{label}</p>
            {readOnly ? (
              <p className="text-sm text-muted-foreground">{labeledFiles[label] || "No file uploaded"}</p>
            ) : (
              <div className="flex items-center gap-2 border border-border rounded-md px-3 py-2 bg-muted/20">
                <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
                <label className="cursor-pointer flex items-center gap-2 text-sm flex-1">
                  <span className="font-medium text-primary">Choose File</span>
                  <span className="text-muted-foreground truncate">
                    {labeledFiles[label] || "No file chosen"}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept={ALLOWED_EXTENSIONS.join(",")}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleLabeledFile(label, f);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
            )}
          </div>
        ))}

        {/* Multi-file browse for additional documents */}
        <div className="pt-2">
          <p className="text-sm font-semibold mb-3 uppercase tracking-wide">Additional Documents</p>

          {!readOnly && (
            <div className="border-2 border-dashed border-border rounded-md p-6 text-center">
              <label className="cursor-pointer flex flex-col items-center gap-3">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm font-medium">Browse Documents</span>
                <span className="text-xs text-muted-foreground">
                  Allowed: PDF, Excel, Word, CSV, JPG, PNG — Max {MAX_FILE_SIZE_MB}MB per file
                </span>
                <input
                  type="file"
                  className="hidden"
                  multiple
                  accept={ALLOWED_EXTENSIONS.join(",")}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleBrowseUpload(e.target.files);
                    }
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          )}

          {additionalFiles.length > 0 && (
            <div className="space-y-2 mt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Uploaded Files</p>
                <Badge variant="default" className="text-xs">{additionalFiles.length} file(s)</Badge>
              </div>
              <div className="space-y-1.5">
                {additionalFiles.map((name, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-md border border-border bg-muted/30 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="flex-1 truncate">{name}</span>
                    {!readOnly && (
                      <Button type="button" variant="ghost" size="sm" className="h-6 px-1.5 text-destructive hover:text-destructive" onClick={() => handleRemoveAdditional(i)}>
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SupportingDocuments;
