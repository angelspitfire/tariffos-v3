import { BcvRatesAdminPanel } from '@/components/admin/organisms/BcvRatesAdminPanel';
import { LlmSettingsPanel } from '@/components/admin/organisms/LlmSettingsPanel';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold text-ink-primary">Configuración de Plataforma</h1>
        <p className="text-xs text-ink-muted">
          Control del modelo de razonamiento RGI en caliente y sincronización interna de tasas oficiales BCV.
        </p>
      </div>
      <LlmSettingsPanel />
      <BcvRatesAdminPanel />
    </div>
  );
}
