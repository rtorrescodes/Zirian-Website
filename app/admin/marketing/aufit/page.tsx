import { AppShell } from '@/components/panel/app-shell';
import { AufitCampaignHub } from '@/components/marketing/aufit-campaign-hub';

export const dynamic = 'force-dynamic';

export default function AufitMarketingPage() {
  return (
    <AppShell
      title="Marketing / AUFIT Climas"
      subtitle="Campañas de WhatsApp, creativos gráficos oficiales y argumentario comercial para distribuidores."
    >
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <AufitCampaignHub />
      </div>
    </AppShell>
  );
}
