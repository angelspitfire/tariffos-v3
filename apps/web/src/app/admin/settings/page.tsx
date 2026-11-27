import { BcvRatesAdminPanel } from '@/components/admin/organisms/BcvRatesAdminPanel';
import { LlmSettingsPanel } from '@/components/admin/organisms/LlmSettingsPanel';
import { PlatformAdminsPanel } from '@/components/admin/organisms/PlatformAdminsPanel';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold text-ink-primary">Configuración de Plataforma</h1>
        <p className="text-xs text-ink-muted">
          Gestión del equipo administrador, modelo de razonamiento RGI en caliente y tasas oficiales BCV.
        </p>
      </div>
      <PlatformAdminsPanel />
      <LlmSettingsPanel />
      <BcvRatesAdminPanel />
    </div>
  );
}
