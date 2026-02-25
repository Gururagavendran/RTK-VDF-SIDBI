import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useGetApplicationByIdQuery } from "@/store/api";
import { getSession } from "@/lib/authStore";
import GovStatusBadge from "@/components/GovStatusBadge";
import DetailedDataView from "@/components/detailed-app/DetailedDataView";
import AppLayout from "@/components/layout/AppLayout";
import { prelimViewFields } from "@/lib/prelimConfig";
import StageComments from "@/components/review/StageComments";

const GovSectionHeader = ({ title }: { title: string }) => (
  <div className="gov-section-header bg-muted px-6 py-3 border-b border-border">
    <h2 className="font-bold text-foreground text-sm uppercase tracking-widest">{title}</h2>
  </div>
);

const ApplicationView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const session = getSession();
  const { data: app, isLoading } = useGetApplicationByIdQuery(id!, { skip: !id || !session });

  if (!session) { navigate("/login"); return null; }

  if (isLoading) {
    return (
      <AppLayout title="SIDBI — Applicant Portal" subtitle="Application View" backTo="/applicant/dashboard" backLabel="Back to Dashboard">
        <div className="flex-1 flex items-center justify-center py-20">
          <p className="text-muted-foreground">Loading application…</p>
        </div>
      </AppLayout>
    );
  }

  if (!app) {
    return <main className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Application not found.</p></main>;
  }

  const data = app.prelimData || {};
  const renderValue = (key: string) => { const val = data[key]; if (typeof val === "boolean") return val ? "Yes" : "No"; return val || "—"; };

  return (
    <AppLayout
      title="SIDBI — Applicant Portal"
      subtitle="Application View"
      backTo="/applicant/dashboard"
      backLabel="Back to Dashboard"
      breadcrumbs={[
        { label: "Dashboard", href: "/applicant/dashboard" },
        { label: `Application ${app.id.slice(0, 8)}` },
      ]}
      maxWidth="max-w-5xl"
    >
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="bg-card border border-border p-4 flex items-center justify-between">
          <span className="text-sm font-bold text-foreground">Application ID: <span className="font-mono">{app.id.slice(0, 8)}</span></span>
          <div className="flex items-center gap-2">
            <GovStatusBadge status={app.stage} />
            <GovStatusBadge status={app.status} stage={app.stage} />
          </div>
        </div>

        <StageComments auditTrail={app.auditTrail || []} stage={app.stage} />

        <div className="bg-card border border-border">
          <GovSectionHeader title="Preliminary Application" />
          <div className="p-6 space-y-0">
            {prelimViewFields.map((field) => (
              <div key={field.key} className="grid grid-cols-[200px_1fr] gap-2 py-2 border-b border-border last:border-0 text-sm">
                <span className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">{field.label}</span>
                <span className="text-foreground">{renderValue(field.key)}</span>
              </div>
            ))}
          </div>
        </div>

        {app.detailedData && <DetailedDataView data={app.detailedData} />}

        {(app.status === "pending_review" || app.status === "reverted") && (
          <div className="flex justify-center">
            <Button onClick={() => navigate(app.workflowStep === "detailed_revision" ? `/detailed-application?appId=${app.id}` : `/prelim-application?edit=${app.id}`)}
              className="font-bold uppercase tracking-wider px-8">
              Update Application
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ApplicationView;
