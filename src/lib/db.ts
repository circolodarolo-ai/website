import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let cachedClient: PrismaClient | null = null

function getClient(): PrismaClient {
  if (cachedClient) return cachedClient

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

  const client = globalForPrisma.prisma ?? new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error'] : [],
  })

  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = client

  cachedClient = client
  return client
}

// Lazy proxy: il modulo si valuta senza connettersi.
// Il client Prisma viene creato solo al primo accesso (es. db.siteInfo.findFirst()),
// dove il try/catch del layout può catturare l'errore e usare i default.
export const db = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getClient()
    return Reflect.get(client, prop, receiver)
  },
})