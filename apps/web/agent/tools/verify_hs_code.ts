import { defineTool } from 'eve/tools';
import { z } from 'zod';
import { createPrismaPipelinePorts } from '../../src/lib/agent/prisma-ports';

export default defineTool({
  description: 'Verify an exact 10-digit HS code against NationalTariff, returning official description, rates, and required OGA permits.',
  inputSchema: z.object({
    countryCode: z.string().default('VE'),
    hsCode: z.string().min(4),
  }),
  async execute({ countryCode, hsCode }) {
    const ports = createPrismaPipelinePorts();
    const verified = await ports.verifyHsCode(countryCode, hsCode);
    return { verified: Boolean(verified), tariff: verified };
  },
});
