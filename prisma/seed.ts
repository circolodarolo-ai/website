import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Inizio seed del database...')

  // 1. Allergeni (normativa europea)
  console.log('📝 Creazione allergeni...')
  const allergeniMap: Record<string, string> = {}
  const allergeniData = [
    { nome: 'Glutine', icona: '🌾' },
    { nome: 'Crostacei', icona: '🦐' },
    { nome: 'Uova', icona: '🥚' },
    { nome: 'Pesce', icona: '🐟' },
    { nome: 'Arachidi', icona: '🥜' },
    { nome: 'Soia', icona: '🫘' },
    { nome: 'Latte', icona: '🥛' },
    { nome: 'Frutta a guscio', icona: '🌰' },
    { nome: 'Sedano', icona: '🌿' },
    { nome: 'Senape', icona: '🌾' },
    { nome: 'Sesamo', icona: '🌱' },
    { nome: 'Anidride solforosa', icona: '💨' },
    { nome: 'Lupini', icona: '🌱' },
    { nome: 'Molluschi', icona: '🦪' },
  ]

  for (const a of allergeniData) {
    const allergene = await prisma.allergene.upsert({
      where: { nome: a.nome },
      update: {},
      create: a,
    })
    allergeniMap[a.nome] = allergene.id
  }
  console.log(`✅ Creati ${allergeniData.length} allergeni`)

  // 2. Categorie
  console.log('📁 Creazione categorie...')
  const categorieData = [
    { nome: 'Antipasti', ordine: 1 },
    { nome: 'Primi Piatti', ordine: 2 },
    { nome: 'Secondi Piatti', ordine: 3 },
    { nome: 'Dolci', ordine: 4 },
    { nome: 'Bevande', ordine: 5 },
  ]

  const categorieMap: Record<string, string> = {}
  for (const c of categorieData) {
    const cat = await prisma.categoria.upsert({
      where: { nome: c.nome },
      update: {},
      create: c,
    })
    categorieMap[c.nome] = cat.id
  }
  console.log(`✅ Create ${categorieData.length} categorie`)

  // 3. Articoli con allergeni
  console.log('🍝 Creazione articoli...')

  const articoliData = [
    {
      nome: 'Bruschetta al Pomodoro',
      descrizione: 'Pane casereccio tostato con pomodorini freschi, basilico, aglio e olio EVO',
      categoria: 'Antipasti',
      prezzo: 7.50,
      bestChoice: false,
      allergeni: ['Glutine'],
    },
    {
      nome: 'Carpaccio di Manzo',
      descrizione: 'Fettine sottili di manzo con rucola, parmigiano e scorza di limone',
      categoria: 'Antipasti',
      prezzo: 13.00,
      bestChoice: true,
      allergeni: ['Latte', 'Uova'],
    },
    {
      nome: 'Spaghetti alla Carbonara',
      descrizione: 'Pasta fresca con guanciale croccante, pecorino romano DOP, tuorlo d\'uovo e pepe nero',
      categoria: 'Primi Piatti',
      prezzo: 14.00,
      prezzoPromo: 11.50,
      bestChoice: true,
      allergeni: ['Glutine', 'Uova', 'Latte'],
    },
    {
      nome: 'Risotto allo Zafferano',
      descrizione: 'Riso carnaroli con zafferano di qualità, burro e parmigiano reggiano 24 mesi',
      categoria: 'Primi Piatti',
      prezzo: 16.00,
      bestChoice: false,
      allergeni: ['Latte'],
    },
    {
      nome: 'Pappardelle al Ragù',
      descrizione: 'Pasta fatta in casa con ragù di cinghiale lento e pecorino grattugiato',
      categoria: 'Primi Piatti',
      prezzo: 15.00,
      bestChoice: false,
      allergeni: ['Glutine', 'Latte'],
    },
    {
      nome: 'Tagliata alla Fiorentina',
      descrizione: 'Bistecca di manzo alla griglia con rosmarino, olio EVO e sale grosso',
      categoria: 'Secondi Piatti',
      prezzo: 28.00,
      bestChoice: true,
      allergeni: [],
    },
    {
      nome: 'Branzino al Forno',
      descrizione: 'Branzino fresco al forno con patate, olive e capperi',
      categoria: 'Secondi Piatti',
      prezzo: 24.00,
      bestChoice: false,
      allergeni: ['Pesce'],
    },
    {
      nome: 'Ossobuco con Gremolata',
      descrizione: 'Stinco di vitello brasato con brodo, servito con gremolata e risotto',
      categoria: 'Secondi Piatti',
      prezzo: 26.00,
      bestChoice: false,
      allergeni: ['Sedano', 'Latte'],
    },
    {
      nome: 'Tiramisù Classico',
      descrizione: 'Savoiardi imbevuti nel caffè, crema al mascarpone con cacao amaro in polvere',
      categoria: 'Dolci',
      prezzo: 8.00,
      bestChoice: true,
      allergeni: ['Uova', 'Latte', 'Glutine'],
    },
    {
      nome: 'Panna Cotta',
      descrizione: 'Panna cotta della casa con coulis di frutti di bosco freschi',
      categoria: 'Dolci',
      prezzo: 7.00,
      bestChoice: false,
      allergeni: ['Latte'],
    },
    {
      nome: 'Cannolo Siciliano',
      descrizione: 'Cialda croccante ripiena di ricotta di pecora, gocce di cioccolato e pistacchi',
      categoria: 'Dolci',
      prezzo: 6.50,
      bestChoice: false,
      allergeni: ['Glutine', 'Latte', 'Frutta a guscio'],
    },
    {
      nome: 'Chianti Classico DOCG',
      descrizione: 'Vino rosso toscano, annata 2020, servito a temperatura ambiente',
      categoria: 'Bevande',
      prezzo: 24.00,
      prezzoPromo: 19.00,
      bestChoice: false,
      allergeni: ['Anidride solforosa'],
    },
    {
      nome: 'Limoncello della Casa',
      descrizione: 'Limoncello artigianale fatto con limoni di Sorrento',
      categoria: 'Bevande',
      prezzo: 6.00,
      bestChoice: false,
      allergeni: [],
    },
    {
      nome: 'Acqua Minerale 50cl',
      descrizione: 'Acqua minerale naturale o frizzante',
      categoria: 'Bevande',
      prezzo: 3.00,
      bestChoice: false,
      allergeni: [],
    },
  ]

  for (const art of articoliData) {
    await prisma.articolo.create({
      data: {
        nome: art.nome,
        descrizione: art.descrizione,
        categoriaId: categorieMap[art.categoria],
        prezzo: art.prezzo,
        prezzoPromozionale: art.prezzoPromo || null,
        eBestChoice: art.bestChoice,
        attivo: true,
        allergeni: {
          create: art.allergeni.map(nome => ({
            allergeneId: allergeniMap[nome],
          })),
        },
      },
    })
  }
  console.log(`✅ Creati ${articoliData.length} articoli`)

  // 4. Eventi di esempio
  console.log('📅 Creazione eventi...')
  const oggi = new Date()
  const eventiData = [
    {
      titolo: 'Serata Jazz & Cena',
      descrizione: 'Una serata indimenticabile con musica jazz dal vivo accompagnata da un menu degustazione speciale curato dal nostro chef. Il quartetto jazz suonerà classici italiani rivisitati in chiave moderna.',
      descrizioneBreve: 'Jazz dal vivo con menu degustazione',
      data: new Date(oggi.getFullYear(), oggi.getMonth(), oggi.getDate() + 14),
      oraInizio: '20:00',
      oraFine: '23:30',
      prezzo: 45.00,
      gratuito: false,
      graditaPrenotazione: true,
      capacita: 50,
      postiDisponibili: 50,
      inEvidenza: true,
    },
    {
      titolo: 'Laboratorio di Pasta Fresca',
      descrizione: 'Impara a fare la pasta fresca con le tue mani! Il nostro chef ti guiderà nella preparazione di tagliatelle e ravioli. Al termine, cena con i piatti preparati.',
      descrizioneBreve: 'Impara a fare la pasta con il nostro chef',
      data: new Date(oggi.getFullYear(), oggi.getMonth(), oggi.getDate() + 21),
      oraInizio: '16:00',
      oraFine: '19:00',
      prezzo: 35.00,
      gratuito: false,
      graditaPrenotazione: true,
      capacita: 20,
      postiDisponibili: 20,
      inEvidenza: true,
    },
    {
      titolo: 'Degustazione Vini Toscani',
      descrizione: 'Percorso guidato tra i migliori vini toscani con abbinamenti gastronomici studiati dal nostro sommelier. Cinque calici con assaggi di formaggi e salumi.',
      descrizioneBreve: 'Cinque vini toscani con abbinamenti',
      data: new Date(oggi.getFullYear(), oggi.getMonth(), oggi.getDate() + 28),
      oraInizio: '19:00',
      oraFine: '22:00',
      prezzo: 40.00,
      gratuito: false,
      graditaPrenotazione: true,
      capacita: 30,
      postiDisponibili: 30,
      inEvidenza: false,
    },
    {
      titolo: 'Apericena del Venerdì',
      descrizione: 'Ogni venerdì sera, stuzzichini e drink a volontà in un atmosfera rilassata. Perfetto per iniziare il weekend con gli amici.',
      descrizioneBreve: 'Stuzzichini e drink a volontà',
      data: new Date(oggi.getFullYear(), oggi.getMonth(), oggi.getDate() + 7),
      oraInizio: '18:30',
      oraFine: '21:30',
      prezzo: 0,
      gratuito: true,
      graditaPrenotazione: false,
      capacita: 0,
      postiDisponibili: 0,
      inEvidenza: false,
    },
  ]

  for (const ev of eventiData) {
    await prisma.evento.create({ data: ev })
  }
  console.log(`✅ Creati ${eventiData.length} eventi`)

  // 5. SiteInfo
  console.log('🏠 Creazione informazioni sito...')
  await prisma.siteInfo.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      nomeLocale: 'La Bella Tavola',
      slogan: 'Autentica Cucina Italiana dal 1985',
      chiSiamoTitolo: 'La Nostra Storia',
      chiSiamoTesto: 'Dal 1985, La Bella Tavola porta in tavola l\'autentica tradizione culinaria italiana. La nostra passione per la cucina e l\'amore per gli ingredienti freschi e di qualità si riflette in ogni piatto che prepariamo. Ogni giorno, il nostro chef seleziona personalmente i migliori prodotti locali per creare piatti che raccontano storie di gusto e tradizione. Il nostro locale, rinnovato nel 2020, unisce il calore della tradizione a un\'atmosfera contemporanea e accogliente, ideale per una cena romantica, una cena con amici o una celebrazione speciale.',
      telefono: '+39 02 1234 5678',
      email: 'info@labellatavola.it',
      indirizzo: 'Via Roma 123, 20121 Milano (MI)',
      orariApertura: 'Mar-Ven: 12:00-14:30 | 19:00-23:00 | Sab-Dom: 12:00-15:00 | 19:00-00:00',
      prenotazioniAttive: true,
      heroTitle: 'Autentica Cucina Italiana',
      heroSubtitle: 'Tradizione, passione e sapori genuini nel cuore di Milano',
      heroCTAText: 'Prenota un Tavolo',
      primaryColor: '#b91c1c',
    },
  })
  console.log('✅ Create informazioni sito')

  // 6. FooterInfo
  console.log('📍 Creazione informazioni footer...')
  await prisma.footerInfo.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      indirizzo: 'Via Roma 123, 20121 Milano (MI)',
      telefono: '+39 02 1234 5678',
      email: 'info@labellatavola.it',
      facebookUrl: 'https://facebook.com/labellatavola',
      instagramUrl: 'https://instagram.com/labellatavola',
      tiktokUrl: 'https://tiktok.com/@labellatavola',
      justeatUrl: 'https://www.justeat.it/ristoranti/labellatavola-milano',
      deliverooUrl: 'https://deliveroo.it/it/menu/milano/labellatavola',
      glovoUrl: 'https://glovoapp.com/it/it/milano/labellatavola',
    },
  })
  console.log('✅ Create informazioni footer')

  console.log('🎉 Seed completato con successo!')
}

main()
  .catch((e) => {
    console.error('❌ Errore durante il seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })