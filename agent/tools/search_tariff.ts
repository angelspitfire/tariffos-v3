import { defineTool } from 'eve/tools';
import { z } from 'zod';

export default defineTool({
  description: 'Search candidate tariff codes in the official NationalTariff database for a country and product description.',
  inputSchema: z.object({
    countryCode: z.string().default('VE'),
    query: z.string().min(2),
  }),
  async execute({ countryCode, query }) {
    const { createPrismaPipelinePorts } = await import('../../apps/web/src/lib/agent/prisma-ports');
    const ports = createPrismaPipelinePorts();
    const candidates = await ports.searchTariffCandidates(countryCode, query);
    return { candidates };
  },
});
