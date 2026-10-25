import { redirect } from "next/navigation";
import { BrainCircuit } from "lucide-react";
import { getOrganizationContext } from "@/lib/organization-context";
import { PageHeader } from "@/components/dashboard/dashboard-primitives";
import AiWorkspace from "@/components/dashboard/ai/ai-workspace";

export default async function AiPage() {
  const { user, organization } = await getOrganizationContext();
  if (!user) redirect("/auth/login");
  if (!organization) redirect("/onboarding");

  return <div className="sg-page-shell"><div className="sg-page">
    <PageHeader title="KenvoryX AI" eyebrow="IT assistant"
      icon={<BrainCircuit size={22} />}
      description="Investigate device issues, inspect your infrastructure and approve safe maintenance actions." />
    <AiWorkspace organizationId={organization.id} />
  </div></div>;
}
