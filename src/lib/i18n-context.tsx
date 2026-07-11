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
};

interface I18nContextType {
  locale: Locale;
  messages: Record<string, Record<string, string>>;
  t: (key: string, replacements?: Record<string, string>) => string;
  isMultilingual: boolean;
}

const I18nContext = createContext<I18nContextType>({
  locale: 'it',
  messages: defaultMessages,
  t: (key: string) => key,
  isMultilingual: false,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('it');
  const [messages, setMessages] = useState(defaultMessages);
  const [isMultilingual, setIsMultilingual] = useState(false);

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
    <I18nContext.Provider value={{ locale, messages, t, isMultilingual }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}