import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ALLOWED_EXTENSIONS = [".pdf", ".xlsx", ".xls", ".docx", ".doc", ".csv", ".jpg", ".jpeg", ".png"];
const BLOCKED_EXTENSIONS = [".exe", ".bat", ".sh", ".cmd", ".js", ".vbs"];
const MAX_FILE_SIZE_MB = 25;

export const requiredDocumentsList = [
  "KYC for the Company (PAN/Aadhaar)",
  "KYC for each Director (PAN/Aadhaar)",
  "Last 12 months Bank Statements (CSV/Spreadsheet)",
  "Sanction Letters",
  "Last 2 years Audited Financial Statements with Auditor's Report, Notes to Accounts and Tax Audit Report",
  "Provisional Balance Sheet and Profit & Loss Statement of the Enterprise",
  "Prospective Order Book",
  "Article of Association (AoA) & Memorandum of Association (MoA)",
  "Startup Certificate issued by DPIIT",
  "GST Certificate",
  "Certificate of Incorporation",
  "ISO Certificate",
  "Udyam Registration",
  "MIS",
];

function validateFile(file: File): string | null {
  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  if (BLOCKED_EXTENSIONS.includes(ext)) return `File type "${ext}" is not allowed.`;
  if (!ALLOWED_EXTENSIONS.includes(ext)) return `File type "${ext}" is not supported. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`;
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) return `File exceeds ${MAX_FILE_SIZE_MB}MB limit.`;
  return null;
}

interface Props {
  files: string[];
  onChange: (files: string[]) => void;
  readOnly?: boolean;
}

const DocumentUploadSection = ({ files, onChange, readOnly }: Props) => {
  const handleUpload = (fileList: FileList) => {
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
      onChange([...files, ...newFiles]);
      toast({ title: "Uploaded", description: `${newFiles.length} file(s) added successfully.` });
    }
  };

  const handleRemove = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Documents &amp; Due Diligence Submission
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Required documents info */}
        <div className="border border-border rounded-md p-4 bg-muted/30">
          <p className="text-sm font-semibold mb-3">Please upload the following relevant documents:</p>
          <ol className="list-decimal list-inside space-y-1.5 text-sm text-muted-foreground">
            {requiredDocumentsList.map((doc, i) => (
              <li key={i}>{doc}</li>
            ))}
            <li>Trade Receivables</li>
            <li>Trade Payables</li>
            <li>Valuation Reports</li>
            <li>
              Working Template{" "}
              <a href="/templates/working-template.xlsx" download className="text-primary underline hover:text-primary/80 font-medium">(Download Template)</a>
            </li>
            <li>
              Governance Scorecard{" "}
              <a href="/templates/governance-scorecard.xlsx" download className="text-primary underline hover:text-primary/80 font-medium">(Download Template)</a>
            </li>
          </ol>
        </div>

        {/* Single multi-file upload */}
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
                    handleUpload(e.target.files);
                  }
                  e.target.value = "";
                }}
              />
            </label>
          </div>
        )}

        {/* Uploaded files list */}
        {files.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Uploaded Files</p>
              <Badge variant="default" className="text-xs">{files.length} file(s)</Badge>
            </div>
            <div className="space-y-1.5">
              {files.map((name, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-md border border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="flex-1 truncate">{name}</span>
                  {!readOnly && (
                    <Button type="button" variant="ghost" size="sm" className="h-6 px-1.5 text-destructive hover:text-destructive" onClick={() => handleRemove(i)}>
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentUploadSection;
