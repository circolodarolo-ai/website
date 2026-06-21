/**
 * migrate-to-postgres.ts
 *
 * Script di migrazione dati SQLite → PostgreSQL per il progetto ristorante.
 * Utilizza due istanze PrismaClient con datasource diversi.
 *
 * Uso:  npx tsx scripts/migrate-to-postgres.ts
 *
 * Prerequisiti:
 *   1. PostgreSQL in esecuzione con database creato
 *   2. .env aggiornato con DATABASE_URL postgresql
 *   3. npm install tsx (devDependency)
 *   4. npx prisma generate (dopo aver cambiato il provider in schema.prisma)
 */

import { PrismaClient } from '@prisma/client';

// Istanza SQLite (legge i dati vecchi)
const sqlite = new PrismaClient({
  datasources: { db: { url: process.env.OLD_SQLITE_URL || 'file:./db/custom.db' } },
});

// Istanza PostgreSQL (scrive i nuovi dati)
const pg = new PrismaClient(); // usa DATABASE_URL da .env

type ModelName = 'Categoria' | 'Articolo' | 'Allergene' | 'AllergeneArticolo'
  | 'Evento' | 'Prenotazione' | 'SiteInfo' | 'FooterInfo' | 'SiteImage'
  | 'CompanyData' | 'User' | 'Permission';

// Ordine di migrazione (rispetta le foreign keys)
const MIGRATION_ORDER: ModelName[] = [
  'Categoria',
  'Allergene',
  'Articolo',
  'AllergeneArticolo',
  'Evento',
  'Prenotazione',
  'SiteInfo',
  'FooterInfo',
  'SiteImage',
  'CompanyData',
  'User',
  'Permission',
];

async function migrateTable(name: ModelName) {
  // @ts-expect-error dynamic model access
  const rows = await sqlite[name].findMany();
  if (rows.length === 0) {
    console.log(`  ✅ ${name}: 0 righe (vuoto, saltato)`);
    return;
  }

  for (const row of rows) {
    const { id, createdAt, updatedAt, ...data } = row;
    try {
      // @ts-expect-error dynamic model access
      await pg[name].create({ data: row });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      // Ignora duplicati (unique constraint)
      if (msg.includes('Unique constraint')) {
        console.log(`  ⚠️  ${name}: riga "${id}" già esistente, saltata`);
      } else {
        console.error(`  ❌ ${name}: errore su riga "${id}": ${msg}`);
      }
    }
  }

  console.log(`  ✅ ${name}: ${rows.length} righe migrate`);
}

async function main() {
  console.log('═'.repeat(50));
  console.log('Migrazione SQLite → PostgreSQL');
  console.log('═'.repeat(50));
  console.log('');

  // Verifica connessione PostgreSQL
  try {
    await pg.$connect();
    console.log('✅ Connessione PostgreSQL stabilita');
  } catch {
    console.error('❌ Impossibile connettersi a PostgreSQL.');
    console.error('   Verifica che il server sia attivo e DATABASE_URL in .env sia corretto.');
    process.exit(1);
  }

  // Verifica connessione SQLite
  try {
    await sqlite.$connect();
    console.log('✅ Connessione SQLite stabilita');
  } catch {
    console.error('❌ Impossibile connettersi al DB SQLite.');
    console.error('   Verifica che il file db/custom.db esista e OLD_SQLITE_URL sia corretto.');
    process.exit(1);
  }

  console.log('');
  console.log('Inizio migrazione tabelle:');
  console.log('');

  for (const table of MIGRATION_ORDER) {
    await migrateTable(table);
  }

  console.log('');
  console.log('═'.repeat(50));
  console.log('Migrazione completata!');
  console.log('═'.repeat(50));

  await sqlite.$disconnect();
  await pg.$disconnect();
}

main();