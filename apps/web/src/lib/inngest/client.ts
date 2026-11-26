import { Inngest } from 'inngest';

const isDev = process.env.INNGEST_DEV
  ? undefined
  : process.env.NODE_ENV !== 'production';

export const inngest = new Inngest({ id: 'tariffos-v3', isDev });
