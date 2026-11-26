import { getUnscopedSystemPrisma } from '../client';
import { seedCommercialPlans } from '../seeds/plans';

async function main(): Promise<void> {
  const prisma = getUnscopedSystemPrisma();
  const count = await seedCommercialPlans(prisma);
  console.log(`Synced ${count} commercial B2B plans (legacy plans hidden).`);
}

main().catch((err: unknown) => {
  console.error('Failed to seed commercial plans:', err);
  process.exit(1);
});
