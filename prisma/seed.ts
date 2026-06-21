import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function seed() {
  const existing = await db.user.findFirst({ where: { email: 'admin@labellaitalia.it' } });
  if (existing) {
    console.log('Admin user already exists');
    return;
  }

  // bcrypt hash of "admin" - generated with bcryptjs hashSync("admin", 10)
  const passwordHash = '$2b$10$jx6WvZ/9mpDZWnYdxxQPhOH99Z2dqsVDShtoisy5Yg5IdF/KCMXl.';

  const user = await db.user.create({
    data: {
      email: 'admin@labellaitalia.it',
      nome: 'Admin',
      cognome: 'Ristorante',
      password: passwordHash,
      ruolo: 'superadmin',
      permessi: {
        create: {
          puoGestireMenu: true,
          puoGestireFooter: true,
          puoGestireTemi: true,
          puoGestirePrenotazioni: true,
          puoGestireDatiAzienda: true,
          puoGestireProfili: true,
          puoGestireAnalytics: true,
          puoGestireSito: true,
          puoGestireEventi: true,
        },
      },
    },
    include: { permessi: true },
  });

  console.log('Admin user created:', user.email);
}

seed()
  .catch(console.error)
  .finally(() => db.$disconnect());
