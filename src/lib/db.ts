import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  // Ensure SSL for remote connections (Prisma Cloud)
  const connectionString = databaseUrl.includes('?')
    ? databaseUrl
    : `${databaseUrl}?sslmode=require`

  const pool = new pg.Pool({
    connectionString,
    max: 5,
    idleTimeoutMillis: 30000,
  })

  const adapter = new PrismaPg(pool)

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error'] : [],
  })
}

/**
 * Lazy Prisma client.
 *
 * The client is NOT created at module-load time. This is critical because the
 * `layout.tsx` (a Server Component) imports `db` directly, and Next.js
 * evaluates that module during static generation / "Collecting page data".
 *
 * If `DATABASE_URL` is missing (e.g. during a Vercel build where the env var
 * isn't exposed to the build environment), eagerly creating the client would
 * throw at module-load — outside any try/catch — and abort the whole build.
 *
 * With this lazy Proxy:
 *   - `import { db } from '@/lib/db'` never throws (the Proxy is a deferred
 *     empty object).
 *   - The first actual DB call (e.g. `db.siteInfo.findFirst()` inside the
 *     try/catch in `layout.tsx`) triggers `getClient()`, which either returns
 *     the cached client or throws — and that throw is caught by the layout's
 *     try/catch, so the build continues with default values.
 */
function getClient(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma
  const client = createPrismaClient()
  globalForPrisma.prisma = client
  return client
}

export const db = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getClient()
    const value = Reflect.get(client, prop, receiver)
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  },
})
