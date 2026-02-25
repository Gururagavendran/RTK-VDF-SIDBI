import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGetApplicationByIdQuery, useCreatePrelimApplicationMutation, useUpdatePrelimDataMutation } from "@/store/api";
import { getSession } from "@/lib/authStore";
import { useEffect, useMemo, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import GovStatusBadge from "@/components/GovStatusBadge";
import { eligibilityParams, type EligibilityKey, type EligibilityRemarksKey, prelimDocumentSlots, type DocSlotKey } from "@/lib/prelimConfig";
import { MessageSquare, Upload, FileText, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// ── Schema ───────────────────────────────────────────────────────────────────
const eligibilitySchemaFields = Object.fromEntries(
  eligibilityParams.map((p) => [p.key, z.boolean().default(false)])
) as Record<EligibilityKey, z.ZodDefault<z.ZodBoolean>>;

const eligibilityRemarksFields = Object.fromEntries(
  eligibilityParams.map((p) => [`${p.key}Remarks`, z.string().max(1500, "Max 250 words").optional()])
) as Record<EligibilityRemarksKey, z.ZodOptional<z.ZodString>>;

const docSlotFields = Object.fromEntries(
  prelimDocumentSlots.map((d) => [d.key, z.string().optional()])
) as Record<DocSlotKey, z.ZodOptional<z.ZodString>>;

const prelimSchema = z.object({
  aifName: z.string().min(1, "AIF / IM name is required").max(250, "Max 250 characters"),
  businessCompanyName: z.string().max(250, "Max 250 characters").optional(),
  businessModel: z.string().max(1500, "Max 250 words").optional(),
  otherParticulars: z.string().max(250, "Max 250 characters").optional(),
  otherParticularsAmt: z.string().optional(),
  amountInvestedPast: z.string().min(1, "This field is required"),
  investmentAsOnDate: z.string().min(1, "This field is required"),
  additionalInvestment: z.string().min(1, "This field is required"),
  ...eligibilitySchemaFields,
  ...eligibilityRemarksFields,
  ...docSlotFields,
});

type PrelimFormValues = z.infer<typeof prelimSchema>;

const defaultValues: Partial<PrelimFormValues> = {
  aifName: "", businessCompanyName: "", businessModel: "", otherParticulars: "", otherParticularsAmt: "",
  amountInvestedPast: "", investmentAsOnDate: "", additionalInvestment: "",
  ...Object.fromEntries(eligibilityParams.map((p) => [p.key, false])),
  ...Object.fromEntries(eligibilityParams.map((p) => [`${p.key}Remarks`, ""])),
  ...Object.fromEntries(prelimDocumentSlots.map((d) => [d.key, ""])),
};

// ── Mode detection ───────────────────────────────────────────────────────────
type FormMode = "fill" | "edit" | "view";

function deriveMode(app: any | null, isOwner: boolean): FormMode {
  if (!app) return "fill";
  if (isOwner) {
    const editableSteps = ["prelim_revision"];
    if (editableSteps.includes(app.workflowStep)) return "edit";
  }
  return "view";
}

// ── Component ────────────────────────────────────────────────────────────────
const PrelimApplication = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const viewId = searchParams.get("view");
  const appId = editId || viewId;
  const session = getSession();

  const { data: app = null } = useGetApplicationByIdQuery(appId!, { skip: !appId });
  const [createPrelim] = useCreatePrelimApplicationMutation();
  const [updatePrelim] = useUpdatePrelimDataMutation();
  const [additionalDocs, setAdditionalDocs] = useState<string[]>([]);

  const isOwner = !!session && !!app && app.applicantEmail === session.email;
  const isSidbi = session?.userType === "sidbi";

  const mode: FormMode = useMemo(() => {
    if (viewId) return "view";
    if (editId && app) {
      if (isOwner && (app.workflowStep === "prelim_revision")) return "edit";
      if (isOwner && !app.workflowStep) return "edit"; // legacy
      return "view";
    }
    if (!appId) return "fill";
    return "view";
  }, [viewId, editId, app, isOwner, appId]);

  const isReadOnly = mode === "view";

  const form = useForm<PrelimFormValues>({
    resolver: zodResolver(prelimSchema),
    defaultValues: defaultValues as PrelimFormValues,
  });

  useEffect(() => {
    if (app?.prelimData) {
      form.reset(app.prelimData as PrelimFormValues);
    }
  }, [app]);

  const backTo = isSidbi ? "/sidbi/dashboard" : "/applicant/dashboard";
  const backLabel = isSidbi ? "Back to Dashboard" : "Back to Dashboard";

  function onSubmit(data: PrelimFormValues) {
    if (!session) { toast({ title: "Error", description: "Please login first.", variant: "destructive" }); navigate("/login"); return; }
    const allTogglesMet = eligibilityParams.every((p) => data[p.key as EligibilityKey] === true);
    if (!allTogglesMet) { toast({ title: "Eligibility Not Met", description: "All eligibility parameters must be set to Yes before submitting.", variant: "destructive" }); return; }
    if (editId && app) {
      updatePrelim({ id: editId, prelimData: data });
      toast({ title: "Application Updated", description: "Your application has been updated successfully." });
    } else {
      createPrelim({ email: session.email, prelimData: data });
      toast({ title: "Preliminary Application Submitted", description: "Your application has been saved successfully." });
    }
    form.reset(defaultValues as PrelimFormValues);
    navigate("/applicant/dashboard");
  }

  const globalComment = app?.comments?.["_global"];

  return (
    <AppLayout
      title={isSidbi ? "SIDBI — Application Review" : "SIDBI — Applicant Portal"}
      subtitle="Preliminary Application"
      backTo={backTo}
      backLabel={backLabel}
      breadcrumbs={[
        { label: "Dashboard", href: backTo },
        { label: app ? `Application ${app.id.slice(0, 8)}` : "New Application" },
        { label: "Preliminary Application" },
      ]}
      maxWidth="max-w-4xl"
    >
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Mode / Status indicator */}
        <div className="bg-card border border-border p-4 flex items-center justify-between">
          <p className="text-sm font-bold text-foreground uppercase tracking-wide">
            {mode === "fill" && "Stage: New Preliminary Application"}
            {mode === "edit" && "Stage: Revise Preliminary Application"}
            {mode === "view" && `Application ID: ${app?.id.slice(0, 8) ?? "—"}`}
          </p>
          {app && (
            <div className="flex items-center gap-2">
              <GovStatusBadge status={app.workflowStep} />
              <GovStatusBadge status={app.status} stage={app.stage} />
            </div>
          )}
        </div>

        {/* SIDBI / Review comment banner */}
        {isReadOnly && globalComment?.comment && (
          <div className="bg-card border-l-4 border-warning border border-border p-4">
            <div className="flex items-start gap-3">
              <MessageSquare className="h-5 w-5 mt-0.5 shrink-0 text-warning" />
              <div>
                <p className="font-bold text-xs uppercase tracking-wide text-warning mb-1">SIDBI Review Comment</p>
                <p className="text-sm text-foreground whitespace-pre-wrap">{globalComment.comment}</p>
              </div>
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Section: AIF */}
            <div className="bg-card border border-border">
              <div className="gov-section-header bg-muted px-6 py-3 border-b border-border">
                <h2 className="font-bold text-foreground text-sm uppercase tracking-widest">AIF / Investment Manager (IM) — Partner for the Investment</h2>
              </div>
              <div className="px-6 py-6 space-y-5">
                <FormField control={form.control} name="aifName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-xs uppercase tracking-wide">Name of AIF / IM {!isReadOnly && <span className="text-destructive">*</span>}</FormLabel>
                    {isReadOnly
                      ? <p className="text-sm text-foreground py-2 border-b border-border">{field.value || "—"}</p>
                      : <FormControl><Input placeholder="Enter AIF or Investment Manager name" {...field} /></FormControl>
                    }
                    <FormMessage />
                  </FormItem>
                )} />
                <Separator />
                <FormField control={form.control} name="businessCompanyName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-xs uppercase tracking-wide">Business / Company Name</FormLabel>
                    {isReadOnly
                      ? <p className="text-sm text-foreground py-2 border-b border-border">{field.value || "—"}</p>
                      : <FormControl><Input placeholder="Enter business or company name" {...field} /></FormControl>
                    }
                    <FormMessage />
                  </FormItem>
                )} />
                <Separator />
                <FormField control={form.control} name="businessModel" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-xs uppercase tracking-wide">Business Model</FormLabel>
                    {isReadOnly
                      ? <p className="text-sm text-foreground py-2 border-b border-border whitespace-pre-wrap">{field.value || "—"}</p>
                      : <FormControl><Textarea placeholder="Describe the business model (max 250 words)" className="min-h-[80px]" {...field} /></FormControl>
                    }
                    <FormMessage />
                  </FormItem>
                )} />
                <Separator />
                <p className="text-sm font-bold text-foreground uppercase tracking-wide">Other Particulars</p>
                <p className="text-xs text-muted-foreground -mt-3">Amt (in ₹ Cr)</p>
                {([
                  { name: "amountInvestedPast" as const, label: "Amount invested in the past 12-15 months by IM" },
                  { name: "investmentAsOnDate" as const, label: "Investment as on date" },
                  { name: "additionalInvestment" as const, label: "Additional investment being considered" },
                ] as const).map((f) => (
                  <FormField key={f.name} control={form.control} name={f.name} render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-xs uppercase tracking-wide">{f.label} {!isReadOnly && <span className="text-destructive">*</span>}</FormLabel>
                      {isReadOnly
                        ? <p className="text-sm text-foreground py-2 border-b border-border">{field.value || "—"}</p>
                        : <FormControl><Input type="text" inputMode="decimal" placeholder="0.00" {...field} /></FormControl>
                      }
                      <FormMessage />
                    </FormItem>
                  )} />
                ))}
              </div>
            </div>

            {/* Section: Eligibility */}
            <div className="bg-card border border-border">
              <div className="gov-section-header bg-muted px-6 py-3 border-b border-border">
                <h2 className="font-bold text-foreground text-sm uppercase tracking-widest">Eligibility Parameters</h2>
              </div>
              <div className="px-6 py-4">
                <table className="gov-table">
                  <thead>
                    <tr>
                      <th className="w-16">S.NO</th>
                      <th>PARAMETER</th>
                      <th className="hidden md:table-cell">REQUIREMENT</th>
                      <th className="w-20 text-center">MET?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eligibilityParams.map((param) => {
                      const remarksKey = `${param.key}Remarks` as EligibilityRemarksKey;
                      const toggleValue = form.watch(param.key as EligibilityKey);
                      return (
                        <FormField key={param.key} control={form.control} name={param.key as EligibilityKey} render={({ field }) => (
                          <>
                            <tr>
                              <td className="font-medium text-muted-foreground">{param.sno}</td>
                              <td>
                                <span className="font-semibold text-foreground">{param.label}</span>
                                <span className="block text-xs text-muted-foreground md:hidden">{param.requirement}</span>
                              </td>
                              <td className="hidden md:table-cell text-xs text-muted-foreground">{param.requirement}</td>
                              <td className="text-center">
                                {isReadOnly ? (
                                  <span className={`text-xs font-bold uppercase ${field.value ? "text-green-700" : "text-destructive"}`}>
                                    {field.value ? "Yes" : "No"}
                                  </span>
                                ) : (
                                  <FormControl>
                                    <Switch checked={field.value as boolean} onCheckedChange={field.onChange} />
                                  </FormControl>
                                )}
                              </td>
                            </tr>
                            {toggleValue && (
                              <tr>
                                <td></td>
                                <td colSpan={isReadOnly ? 2 : 3}>
                                  <FormField control={form.control} name={remarksKey} render={({ field: remarksField }) => (
                                    <FormItem className="py-1">
                                      {isReadOnly ? (
                                        remarksField.value ? <p className="text-xs text-muted-foreground italic whitespace-pre-wrap">{remarksField.value}</p> : null
                                      ) : (
                                        <FormControl>
                                          <Textarea
                                            placeholder="Remarks (optional, max 250 words)"
                                            className="min-h-[60px] text-xs"
                                            {...remarksField}
                                          />
                                        </FormControl>
                                      )}
                                      <FormMessage />
                                    </FormItem>
                                  )} />
                                </td>
                              </tr>
                            )}
                          </>
                        )} />
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section: Document Uploads */}
            <div className="bg-card border border-border">
              <div className="gov-section-header bg-muted px-6 py-3 border-b border-border">
                <h2 className="font-bold text-foreground text-sm uppercase tracking-widest">Supporting Documents</h2>
              </div>
              <div className="px-6 py-6 space-y-4">
                {prelimDocumentSlots.map((slot) => (
                  <FormField key={slot.key} control={form.control} name={slot.key as DocSlotKey} render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-xs uppercase tracking-wide">{slot.label}</FormLabel>
                      {isReadOnly ? (
                        <p className="text-sm text-foreground py-2 border-b border-border">{field.value || "— No file uploaded"}</p>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
                          <Input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                            className="h-9 text-xs"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) field.onChange(file.name);
                            }}
                          />
                          {field.value && <span className="text-xs text-muted-foreground truncate max-w-[200px]">{field.value}</span>}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )} />
                ))}

                {/* Additional multi-file browse */}
                <div className="pt-2">
                  <p className="text-xs font-semibold uppercase tracking-wide mb-3">Additional Documents</p>
                  {!isReadOnly && (
                    <div className="border-2 border-dashed border-border rounded-md p-6 text-center">
                      <label className="cursor-pointer flex flex-col items-center gap-3">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm font-medium">Browse Documents</span>
                        <span className="text-xs text-muted-foreground">
                          Allowed: PDF, Excel, Word, CSV, JPG, PNG — Max 25MB per file
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          multiple
                          accept=".pdf,.xlsx,.xls,.docx,.doc,.csv,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              const names: string[] = [];
                              for (let i = 0; i < e.target.files.length; i++) {
                                names.push(e.target.files[i].name);
                              }
                              setAdditionalDocs((prev) => [...prev, ...names]);
                              toast({ title: "Uploaded", description: `${names.length} file(s) added.` });
                            }
                            e.target.value = "";
                          }}
                        />
                      </label>
                    </div>
                  )}
                  {additionalDocs.length > 0 && (
                    <div className="space-y-2 mt-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">Uploaded Files</p>
                        <Badge variant="default" className="text-xs">{additionalDocs.length} file(s)</Badge>
                      </div>
                      <div className="space-y-1.5">
                        {additionalDocs.map((name, i) => (
                          <div key={i} className="flex items-center gap-2 p-2 rounded-md border border-border bg-muted/30 text-sm">
                            <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="flex-1 truncate">{name}</span>
                            {!isReadOnly && (
                              <Button type="button" variant="ghost" size="sm" className="h-6 px-1.5 text-destructive hover:text-destructive" onClick={() => setAdditionalDocs((prev) => prev.filter((_, idx) => idx !== i))}>
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {!isReadOnly && (
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => navigate(backTo)} className="font-bold uppercase tracking-wider">
                  Cancel
                </Button>
                <Button type="submit" className="font-bold uppercase tracking-wider px-8">
                  {mode === "edit" ? "Resubmit Application" : "Submit Preliminary Application"}
                </Button>
              </div>
            )}

            {/* View-mode back button */}
            {isReadOnly && (
              <div className="flex justify-center">
                <Button type="button" variant="outline" onClick={() => navigate(backTo)} className="font-bold uppercase tracking-wider px-8">
                  Back to Dashboard
                </Button>
              </div>
            )}
          </form>
        </Form>
      </div>
    </AppLayout>
  );
};

export default PrelimApplication;
