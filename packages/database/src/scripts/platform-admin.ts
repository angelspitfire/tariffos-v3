import * as path from 'node:path';
import * as dotenv from 'dotenv';
import {
  grantPlatformAdmin,
  listPlatformAdmins,
  revokePlatformAdmin,
  VALID_PLATFORM_ADMIN_ROLES,
} from '../platform-admins';

const rootDir = path.resolve(process.cwd(), '../..');
dotenv.config({ path: path.join(rootDir, '.env.local') });
dotenv.config({ path: path.join(rootDir, '.env') });

function getFlagValue(args: readonly string[], flag: string): string | undefined {
  const idx = args.indexOf(flag);
  if (idx === -1) return undefined;
  return args[idx + 1];
}

function hasFlag(args: readonly string[], flag: string): boolean {
  return args.includes(flag);
}

async function sendSupabaseInvite(email: string): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.warn('⚠️  --invite omitido: falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.');
    return;
  }
  const res = await fetch(`${url}/auth/v1/invite`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const body = await res.text();
    console.warn(`⚠️  Invitación Supabase Auth respondió ${res.status}: ${body}`);
    return;
  }
  console.log(`✉️  Invitación Supabase Auth enviada a ${email}`);
}

function printHelp(): void {
  console.log(`
Uso: pnpm admin:users <comando> [opciones]

Comandos:
  list
      Lista todos los correos administradores registrados en platform_admins.

  grant <email> [--role super_admin|ops_billing|support] [--notes "texto"] [--invite]
      Crea o reactiva un correo administrador en la tabla platform_admins.
      Roles válidos: ${VALID_PLATFORM_ADMIN_ROLES.join(', ')}

  revoke <email> [--reason "texto"]
      Revoca el acceso de un correo administrador (is_active = false).
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
  try {
    if (command === 'list') {
      const rows = await listPlatformAdmins(prisma);
      if (rows.length === 0) {
        console.log('No hay administradores registrados en platform_admins.');
        return;
      }
      console.table(
        rows.map((r) => ({
          email: r.email,
          role: r.role,
          estado: r.isActive ? 'ACTIVO' : 'REVOCADO',
          notas: r.notes ?? '—',
          actualizado: r.updatedAt ? r.updatedAt.toISOString().slice(0, 19) : '—',
        })),
      );
      return;
    }

    if (command === 'grant') {
      const email = rest[0];
      if (!email || email.startsWith('--')) {
        console.error('Error: debes indicar el correo. Ej: pnpm admin:users grant usuario@dominio.com');
        process.exit(1);
      }
      const role = getFlagValue(rest, '--role') ?? 'super_admin';
      const notes = getFlagValue(rest, '--notes');
      const row = await grantPlatformAdmin(prisma, {
        email,
        role,
        notes,
        actor: `cli:${process.env.USER ?? 'console'}`,
      });
      console.log(`✅ Admin activo: ${row.email} (rol: ${row.role})`);
      if (hasFlag(rest, '--invite')) {
        await sendSupabaseInvite(row.email);
      }
      return;
    }

    if (command === 'revoke') {
      const email = rest[0];
      if (!email || email.startsWith('--')) {
        console.error('Error: debes indicar el correo a revocar.');
        process.exit(1);
      }
      const reason = getFlagValue(rest, '--reason');
      const row = await revokePlatformAdmin(prisma, {
        email,
        reason,
        actor: `cli:${process.env.USER ?? 'console'}`,
      });
      console.log(`🛑 Acceso admin revocado para: ${row.email}`);
      return;
    }

    console.error(`Comando desconocido: ${command}`);
    printHelp();
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch((err: unknown) => {
  console.error('❌ Error:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
