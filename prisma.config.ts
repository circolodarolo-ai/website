import { readFileSync } from 'node:fs'
import { defineConfig } from 'prisma/config'

// Carica .env manualmente
try {
  const content = readFileSync('.env', 'utf-8')
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const eqIdx = trimmed.indexOf('=')
      const key = trimmed.slice(0, eqIdx).trim()
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
      if (!process.env[key]) process.env[key] = val
    }
  }
} catch {}

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL!,
  },
})