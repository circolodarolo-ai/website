const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const pg = require("pg");

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString, max: 5, idleTimeoutMillis: 30000 });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

async function seed() {
  const existing = await db.user.findFirst({ where: { email: "admin@labellaitalia.it" } });
  if (existing) { console.log("Admin already exists"); return; }

  const passwordHash = "$2b$10$jx6WvZ/9mpDZWnYdxxQPhOH99Z2dqsVDShtoisy5Yg5IdF/KCMXl.";

  const user = await db.user.create({
    data: {
      email: "admin@labellaitalia.it",
      nome: "Admin",
      cognome: "Ristorante",
      password: passwordHash,
      ruolo: "superadmin",
      permessi: {
        create: {
          puoGestireMenu: true, puoGestireFooter: true, puoGestireTemi: true,
          puoGestirePrenotazioni: true, puoGestireDatiAzienda: true, puoGestireProfili: true,
          puoGestireAnalytics: true, puoGestireSito: true, puoGestireEventi: true,
        },
      },
    },
    include: { permessi: true },
  });

  console.log("Admin created:", user.email);
}

seed().catch(console.error).finally(() => db.$disconnect());
