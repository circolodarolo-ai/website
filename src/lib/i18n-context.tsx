'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

type Locale = 'it' | 'en' | 'fr' | 'de' | 'es';

// Messaggi di default (italiano) inline come fallback — deve essere completo come it.json
const defaultMessages: Record<string, Record<string, string>> = {
  nav: {
    home: 'Home', menu: 'Menu', eventi: 'Eventi', chiSiamo: 'Chi Siamo',
    contatti: 'Contatti', prenota: 'Prenota', prenotaTavolo: 'Prenota un Tavolo',
    mobileMenu: 'Menu',
  },
  hero: {
    defaultTitle: 'Autentica Cucina Italiana', defaultSubtitle: 'Tradizione, passione e sapori genuini nel cuore di Milano',
    defaultCTA: 'Prenota un Tavolo', scopriMenu: 'Scopri il Menu', badge: 'Dal 1985 nel cuore di Milano',
    scrollDown: 'Scorri verso il basso',
  },
  chiSiamo: {
    subtitle: 'La Nostra Storia', defaultTitle: 'Chi Siamo',
    defaultText: "Dal 1985, La Bella Tavola porta in tavola i sapori autentici della tradizione culinaria italiana. Ogni piatto racconta una storia di passione, ingredienti selezionati e ricette tramandate con cura.",
    galleria: 'La Nostra Galleria',
    valore1Titolo: 'Passione', valore1Desc: 'Ogni piatto è preparato con amore e dedizione, seguendo le tradizioni italiane',
    valore2Titolo: 'Ingredienti Freschi', valore2Desc: 'Selezioniamo ogni giorno i migliori prodotti dai mercati locali',
    valore3Titolo: 'Tradizione dal 1985', valore3Desc: 'Quasi 40 anni di storia culinaria al servizio dei nostri ospiti',
    valore4Titolo: 'Ricette Autentiche', valore4Desc: 'Rispettiamo le ricette originali italiane con un tocco di creatività',
  },
  menuSection: {
    subtitle: 'Il Nostro Menu', title: 'I Piatti della Tradizione',
    description: 'Ogni piatto racconta la storia della nostra terra, con ingredienti freschi e di stagione',
    consigliato: 'Consigliato', surgelato: 'Surgelato', promo: 'Promo',
  },
  specialita: {
    subtitle: 'Da non perdere', title: 'Le Nostre Specialità',
    description: 'Scopri i piatti più amati dai nostri clienti',
    bestChoice: 'Best Choice', promo: 'Promo',
    precedente: 'Precedente', successivo: 'Successivo', vaiAllaSlide: 'Vai alla slide {n}',
  },
  eventiSection: {
    subtitle: 'Non perderti', title: 'Eventi in Evidenza',
    description: 'Scopri gli eventi, le serate speciali e le degustazioni che organizziamo',
    inEvidenza: 'In evidenza', nuovo: 'Nuovo', gratuito: 'Gratuito',
    ogni: 'Ogni {giorni}', postiRimasti: 'posti rimasti', vediTutti: 'Vedi tutti gli eventi',
    precedente: 'Precedente', successivo: 'Successivo', vaiAllEvento: "Vai all'evento {n}",
  },
  eventiPage: {
    backHome: 'Torna alla Home', title: 'Eventi e Serate Speciali',
    description: 'Scopri le serate tematiche, le degustazioni e gli eventi speciali del nostro ristorante',
    ricorrenti: 'Eventi Ricorrenti', prossimi: 'Prossimi Eventi', passati: 'Eventi Passati',
    nessunEvento: 'Nessun evento programmato',
    nessunEventoDesc: 'Al momento non ci sono eventi in programma. Torna più tardi per scoprire le novità!',
    concluso: 'Concluso', prenotazioneConsigliata: 'Prenotazione consigliata',
    ingressoLibero: 'Ingresso libero', laQuotaInclude: 'La quota include:',
    infoAggiuntive: 'Informazioni aggiuntive:', mostraMeno: 'Mostra meno',
    dettagli: 'Dettagli', prenota: 'Prenota', posti: 'posti',
  },
  menuPage: {
    backHome: 'Torna alla Home', title: 'Il Nostro Menu',
    description: 'Ogni piatto racconta la storia della nostra terra, con ingredienti freschi e di stagione',
    piattiDisponibili: 'piatti disponibili', offertaSpeciale: 'offerta speciale',
    offerteSpeciali: 'offerte speciali attive', cerca: 'Cerca un piatto...', tutti: 'Tutti',
    risultato: 'risultato', risultati: 'risultati per "{query}"',
    nessunPiattoRicerca: 'Nessun piatto trovato per questa ricerca',
    nessunPiattoCategoria: 'Nessun piatto in questa categoria',
    consigliato: 'Consigliato', surgelato: 'Surgelato', promo: 'Promo',
    allergeni: 'Informazioni Allergeni',
    allergeniDesc: 'Per qualsiasi informazione sugli allergeni, contattaci direttamente. Saremo felici di aiutarti.',
    prezzoDa: 'da',
  },
  prenotazione: {
    ctaTitle: 'Prenota il Tuo Tavolo', ctaDescription: "Riserviamo il tuo posto per un'esperienza indimenticabile",
    ctaButton: 'Prenota Ora', dialogTitle: 'Prenota un Tavolo',
    dialogDescription: 'Compila i dati sotto e ti confermeremo la prenotazione via email',
    nome: 'Nome *', nomePlaceholder: 'Mario', cognome: 'Cognome *', cognomePlaceholder: 'Rossi',
    email: 'Email *', emailPlaceholder: 'mario@email.com',
    telefono: 'Telefono *', telefonoPlaceholder: '+39 333 1234567',
    data: 'Data *', selezionaData: 'Seleziona data', ora: 'Ora *', selezionaOrario: 'Seleziona orario',
    numeroPersone: 'Numero di persone *', persona: 'persona', persone: 'persone',
    piuDi10: 'Più di 10 (specificare nelle note)',
    tipologia: 'Tipologia *', ristorante: 'Ristorante', aperitivo: 'Aperitivo', evento: 'Evento',
    note: 'Note (opzionale)', notePlaceholder: 'Allergie, esigenze particolari...',
    annulla: 'Annulla', invioInCorso: 'Invio in corso...', conferma: 'Conferma Prenotazione',
    errore: 'Errore nella prenotazione',
    successo: 'Prenotazione inviata con successo! Ti contatteremo a breve per la conferma.',
  },
  footer: {
    mappaTitolo: 'Posizione del ristorante', giorniChiusura: 'Giorni di chiusura:',
    social: 'Social', ordinaOnline: 'Ordina Online', diritti: 'Tutti i diritti riservati.',
    privacy: 'Privacy Policy', cookie: 'Cookie Policy', termini: 'Termini di Servizio',
  },
  cookie: {
    title: 'Gestione Cookie', description: 'Questo sito utilizza cookie per migliorare la tua esperienza di navigazione.',
    tecnici: 'Cookie Tecnici', tecniciDesc: 'Necessari al funzionamento del sito',
    analitici: 'Cookie Analitici', analiticiDesc: 'Ci aiutano a capire come usi il sito',
    marketing: 'Cookie Marketing', marketingDesc: 'Utilizzati per mostrarti contenuti pertinenti',
    acceptAll: 'Salva preferenze', rejectAll: 'Rifiuta tutto', savePreferences: 'Salva preferenze',
  },
  social: {
    share: 'Condividi', shareText: "Ti consiglio di dare un'occhiata!",
    defaultShareText: 'Ti consiglio questo ristorante!',
    condividiWhatsApp: 'Condividi su WhatsApp', condividiTelegram: 'Condividi su Telegram',
    condividiFacebook: 'Condividi su Facebook', condividiX: 'Condividi su X',
    copiaLinkInstagram: 'Copia link per Instagram', linkCopiato: 'Link copiato!',
    condividiEmail: 'Condividi via Email', emailSubject: 'Ti consiglio questo ristorante',
    emailBody: "Ciao!\n\nVolevo condividere con te questo ristorante che ho trovato.\n\nEcco il link:",
    chiudi: 'Chiudi',
  },
  banners: { pubblicita: 'Pubblicità', sponsor: 'Sponsor' },
  policyPage: {
    home: 'Home',
    cookiePolicyTitle: 'Cookie Policy',
    privacyPolicyTitle: 'Privacy Policy',
    lastUpdate: 'Ultimo aggiornamento:',
    active: 'Attivo',
    consentRequired: 'Consenso richiesto',
    cookie: 'Cookie',
    purpose: 'Finalità',
    duration: 'Durata',
    type: 'Tipo',
    own: 'Primo piano',
    thirdParty: 'Terze parti',
    consultPrivacy: 'Vedi anche la Privacy Policy',
    consultCookie: 'Vedi anche la Cookie Policy',
    sec1Title: '1. Cosa sono i Cookie',
    sec1Text: 'I cookie sono piccoli file di testo memorizzati sul dispositivo dell\'utente durante la visita a un sito web. Essi permettono al sito di ricordare le azioni e le preferenze dell\'utente per un determinato periodo di tempo.',
    sec2Title: '2. Tipologie di Cookie Utilizzati',
    sec2Intro: 'Questo sito utilizza le seguenti categorie di cookie, nel rispetto della normativa europea e delle linee guida del Garante per la protezione dei dati personali:',
    tecniciTitle: 'Cookie Tecnici (necessari)',
    tecniciDesc: 'Questi cookie sono essenziali per il corretto funzionamento del sito e non possono essere disabilitati. Non raccolgono informazioni di identificazione personale.',
    analiticiTitle: 'Cookie Analitici',
    analiticiDesc: 'Questi cookie raccolgono informazioni anonime su come gli utenti utilizzano il sito (pagine visitate, durata della visita, sorgente di traffico). I dati vengono raccolti in forma aggregata e non identificano l\'utente.',
    marketingTitle: 'Cookie di Profilazione / Marketing',
    marketingDesc: 'Questi cookie vengono utilizzati per fornire contenuti pubblicitari personalizzati e per mostrare banner pertinenti. Vengono attivati solo con il consenso esplicito dell\'utente.',
    sec3Title: '3. Come Gestire i Cookie',
    sec3Text: 'L\'utente può gestire le preferenze relative ai cookie in diversi modi:',
    sec3Banner: 'Banner dei cookie: al primo accesso al sito, l\'utente può accettare o rifiutare i cookie non essenziali tramite il banner dedicato.',
    sec3Browser: 'Impostazioni del browser: l\'utente può configurare il proprio browser per bloccare o eliminare i cookie.',
    browserInstructions: 'Istruzioni per i principali browser:',
    sec4Title: '4. Base Giuridica',
    sec4Text: 'I cookie tecnici sono installati in base al legittimo interesse del Titolare del Trattamento e non richiedono consenso. I cookie analitici e di profilazione sono installati solo previo consenso dell\'utente, ai sensi dell\'articolo 6 del GDPR e dell\'articolo 122 del Codice della Privacy.',
    sec5Title: '5. Titolare del Trattamento',
    sec5Text: 'Il Titolare del Trattamento dei dati raccolti tramite cookie è',
    sec5Contact: 'Per qualsiasi domanda relativa alla presente Cookie Policy, è possibile contattare il Titolare del Trattamento all\'indirizzo email',
    sec6Title: '6. Aggiornamenti della Cookie Policy',
    sec6Text: 'Il Titolare del Trattamento si riserva il diritto di modificare la presente Cookie Policy in qualsiasi momento. Le modifiche saranno pubblicate su questa pagina.',
    pSec1Title: '1. Titolare del Trattamento',
    pSec1Text: 'Il Titolare del Trattamento dei dati personali è',
    pSec1Sede: 'con sede legale in',
    pSec1Piva: 'Partita IVA:',
    pSec1Cf: 'Codice Fiscale:',
    pSec2Title: '2. Responsabile della Protezione dei Dati (DPO)',
    pSec2Text: 'Il Titolare del Trattamento ha nominato un Responsabile della Protezione dei Dati contattabile all\'indirizzo:',
    pSec3Title: '3. Categorie di Dati Raccolti',
    pSec3Intro: 'Questo sito raccoglie le seguenti tipologie di dati personali:',
    pSec3Nav: 'Dati di navigazione: indirizzo IP (anonimizzato), tipo di browser, sistema operativo, pagine visitate, data e ora di accesso, durata della sessione. Questi dati sono raccolti in forma aggregata e anonima.',
    pSec3Vol: 'Dati forniti voluntaryamente: nome, cognome, indirizzo email, numero di telefono, dati della prenotazione. Questi dati sono forniti esclusivamente dall\'utente tramite il modulo di prenotazione.',
    pSec3Cookie: 'Cookie tecnici e analitici: come dettagliato nella',
    pSec4Title: '4. Finalità del Trattamento',
    pSec4Intro: 'I dati personali sono trattati per le seguenti finalità:',
    pSec4Pren: 'Gestione prenotazioni: ricezione, conferma e gestione delle richieste di prenotazione inviate tramite il sito.',
    pSec4Stats: 'Analisi statistiche anonime: raccolta e analisi di dati aggregati e anonimi per comprendere l\'utilizzo del sito.',
    pSec4Law: 'Adempimenti normativi: obblighi previsti dalla normativa vigente.',
    pSec5Title: '5. Base Giuridica del Trattamento',
    pSec5Text: 'Il trattamento dei dati personali si basa sulle seguenti basi giuridiche, come previsto dall\'articolo 6 del GDPR:',
    pSec6Title: '6. Periodo di Conservazione',
    pSec6Text: 'I dati personali saranno conservati per il tempo necessario al conseguimento delle finalità per le quali sono stati raccolti.',
    pSec6Pren: 'Dati delle prenotazioni: conservati per 12 mesi dalla data della prenotazione.',
    pSec6Nav: 'Dati di navigazione anonimizzati: conservati per un massimo di 24 mesi.',
    pSec6Analytics: 'Dati analitici aggregati: conservati per un massimo di 36 mesi.',
    pSec7Title: '7. Condivisione dei Dati',
    pSec7Text: 'I dati personali non vengono ceduti a terze parti a scopi commerciali. I dati possono essere condivisi con:',
    pSec7Tech: 'Fornitori di servizi tecnici (hosting, database) necessari al funzionamento del sito;',
    pSec7Auth: 'Autorità competenti, quando richiesto dalla legge.',
    pSec7List: 'L\'elenco completo dei responsabili esterni del trattamento è disponibile su richiesta al Titolare del Trattamento.',
    pSec8Title: '8. Diritti dell\'Interessato',
    pSec8Intro: 'Ai sensi degli articoli 15-22 del GDPR, l\'interessato ha diritto di:',
    pSec8Access: 'Accesso (Art. 15): ottenere la conferma del trattamento e una copia dei dati personali;',
    pSec8Rect: 'Rettifica (Art. 16): ottenere la correzione di dati inesatti o incompleti;',
    pSec8Cancel: 'Cancellazione (Art. 17): ottenere la cancellazione dei dati non più necessari;',
    pSec8Limit: 'Limitazione (Art. 18): richiedere la limitazione del trattamento;',
    pSec8Port: 'Portabilità (Art. 20): ricevere i dati in formato strutturato e trasferirli a un altro titolare;',
    pSec8Oppose: 'Opposizione (Art. 21): opporsi al trattamento basato sul legittimo interesse;',
    pSec8Revoke: 'Revoca del consenso (Art. 7, comma 3): revocare il consenso in qualsiasi momento.',
    pSec8Contact: 'Per esercitare i tuoi diritti, puoi contattare il Titolare del Trattamento all\'indirizzo email',
    pSec8Dpo: 'o il DPO all\'indirizzo',
    pSec9Title: '9. Diritto di Reclamo',
    pSec9Text: 'L\'interessato ha diritto di presentare un reclamo all\'autorità di controllo competente:',
    pSec10Title: '10. Modifiche alla presente Informativa',
    pSec10Text: 'Il Titolare del Trattamento si riserva il diritto di apportare modifiche alla presente informativa, che saranno pubblicate su questa pagina con la data dell\'ultimo aggiornamento.',
  },
};

interface I18nContextType {
  locale: Locale;
  messages: Record<string, Record<string, string>>;
  t: (key: string, replacements?: Record<string, string>) => string;
  isMultilingual: boolean;
  /** Register DB-sourced overrides — these take priority over defaults */
  registerOverrides: (overrides: Record<string, string | null | undefined>) => void;
}

const I18nContext = createContext<I18nContextType>({
  locale: 'it',
  messages: defaultMessages,
  t: (key: string) => key,
  isMultilingual: false,
  registerOverrides: () => {},
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('it');
  const [messages, setMessages] = useState(defaultMessages);
  const [isMultilingual, setIsMultilingual] = useState(false);
  // DB overrides: flat key → value map. Components register their DB content here.
  // These ALWAYS take priority over both messages and defaultMessages.
  const [dbOverrides, setDbOverrides] = useState<Record<string, string>>({});

  const registerOverrides = useCallback((overrides: Record<string, string | null | undefined>) => {
    setDbOverrides(prev => {
      const next = { ...prev };
      for (const [key, val] of Object.entries(overrides)) {
        if (val && val.trim()) {
          next[key] = val;
        } else {
          delete next[key];
        }
      }
      return next;
    });
  }, []);

  const loadMessages = useCallback(async (loc: Locale) => {
    if (loc === 'it') {
      setMessages(defaultMessages);
      return;
    }
    try {
      const res = await fetch(`/api/translations?locale=${loc}`);
      if (res.ok) {
        const data = await res.json();
        if (Object.keys(data).length > 0) {
          setMessages(data);
        } else {
          setMessages(defaultMessages);
        }
      } else {
        setMessages(defaultMessages);
      }
    } catch {
      setMessages(defaultMessages);
    }
  }, []);

  useEffect(() => {
    fetch('/api/i18n-settings')
      .then(r => r.json())
      .then(data => {
        if (data.active) {
          setIsMultilingual(true);
          const saved = localStorage.getItem('user-locale') || 'it';
          if (saved !== 'it') {
            const isValid = data.languages?.some((l: { code: string }) => l.code === saved);
            if (isValid) {
              setLocale(saved as Locale);
              loadMessages(saved as Locale);
            }
          }
        }
      })
      .catch(() => {});
  }, [loadMessages]);

  useEffect(() => {
    const handler = (e: Event) => {
      const newLocale = (e as CustomEvent).detail?.locale || localStorage.getItem('user-locale') || 'it';
      setLocale(newLocale as Locale);
      if (newLocale === 'it') {
        setMessages(defaultMessages);
      } else {
        loadMessages(newLocale as Locale);
      }
    };
    window.addEventListener('locale-change', handler);
    return () => window.removeEventListener('locale-change', handler);
  }, [loadMessages]);

  const t = (key: string, replacements?: Record<string, string>): string => {
    // Priority: dbOverrides → messages → defaultMessages → key
    if (dbOverrides[key]) {
      let text = dbOverrides[key];
      if (replacements) {
        Object.entries(replacements).forEach(([k, v]) => {
          text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
        });
      }
      return text;
    }

    const parts = key.split('.');
    let text: string;
    if (parts.length === 2) {
      text = messages[parts[0]]?.[parts[1]] || defaultMessages[parts[0]]?.[parts[1]] || key;
    } else {
      text = key;
    }
    // Sostituzione variabili tipo {n}, {query}, {giorni}
    if (replacements) {
      Object.entries(replacements).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
      });
    }
    return text;
  };

  return (
    <I18nContext.Provider value={{ locale, messages, t, isMultilingual, registerOverrides }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

/**
 * Convenience hook: registers DB fields into i18n overrides so t() prioritizes them.
 * Usage: useSiteOverrides({ 'hero.defaultTitle': siteInfo.heroTitle, 'hero.defaultSubtitle': siteInfo.heroSubtitle })
 */
export function useSiteOverrides(overrides: Record<string, string | null | undefined>) {
  const { registerOverrides } = useI18n();
  useEffect(() => {
    if (overrides) registerOverrides(overrides);
  }, [overrides, registerOverrides]);
}