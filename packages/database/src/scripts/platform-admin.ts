import * as path from 'node:path';
import * as dotenv from 'dotenv';
import {
  generateTemporaryAdminPassword,
  sendSuperAdminCredentialsEmail,
} from '../admin-credentials-email';
import { provisionInternalAdminWorkspace } from '../internal-plan';
import {
  grantPlatformAdmin,
  listPlatformAdmins,
  normalizeAdminEmail,
  revokePlatformAdmin,
  VALID_PLATFORM_ADMIN_ROLES,
} from '../platform-admins';

const rootDir = path.resolve(process.cwd(), '../..');
dotenv.config({ path: path.join(rootDir, '.env.local') });
dotenv.config({ path: path.join(rootDir, '.env') });

interface SupabaseAuthUserRow {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
}

function getFlagValue(args: readonly string[], flag: string): string | undefined {
  const idx = args.indexOf(flag);
  return idx === -1 ? undefined : args[idx + 1];
}

async function findSupabaseUserByEmail(
  url: string,
  headers: Record<string, string>,
  email: string,
): Promise<SupabaseAuthUserRow | undefined> {
  const MAX_PAGES = 20;
  const PER_PAGE = 200;
  for (let page = 1; page <= MAX_PAGES; page++) {
    const res = await fetch(`${url}/auth/v1/admin/users?page=${page}&per_page=${PER_PAGE}`, { headers });
    if (!res.ok) throw new Error(`Supabase listUsers respondió ${res.status}: ${await res.text()}`);
    const json = (await res.json()) as { users?: SupabaseAuthUserRow[] };
    const users = json.users ?? [];
    const match = users.find((u) => u.email?.trim().toLowerCase() === email);
    if (match) return match;
    if (users.length < PER_PAGE) break;
  }
  return undefined;
}

async function upsertSupabaseAuthUser(params: {
  email: string;
  password: string;
  fullName: string;
  role: string;
  mustChangePassword: boolean;
}): Promise<{ userId: string; action: 'created' | 'updated' }> {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL)?.replace(/\/+$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL/SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.');
  const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
  const existing = await findSupabaseUserByEmail(url, headers, params.email);
  const metadataPatch = { full_name: params.fullName, must_change_password: params.mustChangePassword };

  if (existing) {
    const upd = await fetch(`${url}/auth/v1/admin/users/${existing.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        password: params.password,
        email_confirm: true,
        ban_duration: 'none',
        user_metadata: { ...(existing.user_metadata ?? {}), ...metadataPatch },
        app_metadata: { ...(existing.app_metadata ?? {}), platform_role: params.role },
      }),
    });
    if (!upd.ok) throw new Error(`Supabase updateUser respondió ${upd.status}: ${await upd.text()}`);
    return { userId: existing.id, action: 'updated' };
  }

  const crt = await fetch(`${url}/auth/v1/admin/users`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      email: params.email,
      password: params.password,
      email_confirm: true,
      user_metadata: metadataPatch,
      app_metadata: { platform_role: params.role },
    }),
  });
  if (!crt.ok) throw new Error(`Supabase createUser respondió ${crt.status}: ${await crt.text()}`);
  const created = (await crt.json()) as { id: string };
  return { userId: created.id, action: 'created' };
}

function printHelp(): void {
  console.log(`
Uso: pnpm admin:users <comando> [opciones]

Comandos:
  list
      Lista los correos administradores en platform_admins.
  provision <email> [--name "Nombre"] [--company "TariffOS"] [--role super_admin|ops_billing|support] [--password "..."]
      Crea/actualiza el usuario en Supabase Auth con clave temporal, asigna el plan infinito
      exclusivo "tariffos_internal" sin paso de pago y envía las credenciales por correo.
  grant <email> [--role ${VALID_PLATFORM_ADMIN_ROLES.join('|')}] [--notes "texto"]
      Registra o reactiva un correo en platform_admins.
  revoke <email> [--reason "texto"]
      Revoca el acceso de un correo administrador.
`);
}

async function main(): Promise<void> {
  const [, , command, ...rest] = process.argv;
  if (!command || command === '--help' || command === '-h') {
    printHelp();
    process.exit(command ? 0 : 1);
  }

  const { getUnscopedSystemPrisma } = await import('../client');
  const prisma = getUnscopedSystemPrisma();
  const actor = `cli:${process.env.USER ?? 'console'}`;

  try {
    if (command === 'list') {
      const rows = await listPlatformAdmins(prisma);
      if (rows.length === 0) return console.log('No hay administradores en platform_admins.');
      console.table(
        rows.map((r) => ({ email: r.email, role: r.role, estado: r.isActive ? 'ACTIVO' : 'REVOCADO', notas: r.notes ?? '—' })),
      );
      return;
    }

    if (command === 'provision' || command === 'create') {
      const rawEmail = rest[0];
      if (!rawEmail || rawEmail.startsWith('--')) throw new Error('Debes indicar el correo. Ej: pnpm admin:users provision admin@tariffos.app');
      const email = normalizeAdminEmail(rawEmail);
      const role = getFlagValue(rest, '--role') ?? 'super_admin';
      const fullName = getFlagValue(rest, '--name') ?? email.split('@')[0] ?? 'Super Admin';
      const companyName = getFlagValue(rest, '--company') ?? 'TariffOS';
      const explicitPassword = getFlagValue(rest, '--password');
      const temporaryPassword = explicitPassword ?? generateTemporaryAdminPassword();

      const auth = await upsertSupabaseAuthUser({
        email, password: temporaryPassword, fullName, role, mustChangePassword: !explicitPassword,
      });
      const ws = await prisma.$transaction((tx) =>
        provisionInternalAdminWorkspace(tx, { userId: auth.userId, email, fullName, companyName, role, actor }),
      );
      const mail = await sendSuperAdminCredentialsEmail({
        recipientEmail: email, recipientName: fullName, temporaryPassword, role,
      });

      console.log(JSON.stringify({ ok: true, email, userId: auth.userId, authAction: auth.action, temporaryPassword, ...ws, emailDelivery: mail }, null, 2));
      return;
    }

    if (command === 'grant') {
      const email = rest[0];
      if (!email || email.startsWith('--')) throw new Error('Debes indicar el correo.');
      const row = await grantPlatformAdmin(prisma, {
        email, role: getFlagValue(rest, '--role') ?? 'super_admin', notes: getFlagValue(rest, '--notes'), actor,
      });
      console.log(`✅ Admin activo: ${row.email} (rol: ${row.role})`);
      return;
    }

    if (command === 'revoke') {
      const email = rest[0];
      if (!email || email.startsWith('--')) throw new Error('Debes indicar el correo a revocar.');
      const row = await revokePlatformAdmin(prisma, { email, reason: getFlagValue(rest, '--reason'), actor });
      console.log(`🛑 Acceso admin revocado para: ${row.email}`);
      return;
    }

    printHelp();
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

void main()
  .then(() => process.exit(0))
  .catch((err: unknown) => {
    console.error('❌ Error:', err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
