// prisma/config.ts
import { defineConfig } from '@prisma/internals'

export default defineConfig({
  datasource: {
    adapter: 'sqlite',
    connectionString: process.env.DATABASE_URL,
  },
})
