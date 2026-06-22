'use client';

import { useState, useEffect } from 'react';
import { Shield, Building, Mail, Phone, FileText, Scale } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/restaurant/Header';
import Footer from '@/components/restaurant/Footer';

interface CompanyData {
  ragioneSociale: string | null;
  partitaIva: string | null;
  codiceFiscale: string | null;
  indirizzo: string | null;
  citta: string | null;
  cap: string | null;
  provincia: string | null;
  paese: string | null;
  telefono: string | null;
  email: string | null;
  pec: string | null;
  dpoNome: string | null;
  dpoEmail: string | null;
  dpoIndirizzo: string | null;
  privacyPolicy: string | null;
  privacyPolicyUpdate: string | null;
}

export default function PrivacyPolicyPage() {
  const [data, setData] = useState<CompanyData | null>(null);

  useEffect(() => {
    fetch('/api/company-data-public')
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  const company = data?.ragioneSociale || 'Il Titolare del Trattamento';
  const address = [data?.indirizzo, data?.cap, data?.citta, data?.provincia, data?.paese].filter(Boolean).join(', ');
  const updatedDate = data?.privacyPolicyUpdate
    ? new Date(data.privacyPolicyUpdate).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });

  // If admin has written a custom policy, show it; otherwise show GDPR template
  if (data?.privacyPolicy) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-white">
          <div className="max-w-3xl mx-auto px-4 py-16">
            <div className="flex items-center gap-2 text-sm text-red-700 mb-6">
              <Link href="/" className="hover:underline">Home</Link>
              <span>/</span>
              <span>Privacy Policy</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Informativa sulla Privacy</h1>
            <div
              className="prose prose-gray max-w-none"
              dangerouslySetInnerHTML={{ __html: data.privacyPolicy }}
            />
            <p className="mt-12 text-sm text-gray-400">Ultimo aggiornamento: {updatedDate}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-white">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="flex items-center gap-2 text-sm text-red-700 mb-6">
            <Link href="/" className="hover:underline">Home</Link>
            <span>/</span>
            <span>Privacy Policy</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Shield className="h-8 w-8 text-red-700" />
            Informativa sulla Privacy
          </h1>
          <p className="text-gray-500 mb-10">Ultimo aggiornamento: {updatedDate}</p>

          <div className="space-y-8 text-gray-700 leading-relaxed">
            {/* 1. Titolare */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. Titolare del Trattamento</h2>
              <p>
                Il Titolare del trattamento dei dati personali è <strong>{company}</strong>, con sede legale in {address || '[indirizzo]'}.
                {data?.partitaIva && <> Partita IVA: {data.partitaIva}.</>}
                {data?.codiceFiscale && <> Codice Fiscale: {data.codiceFiscale}.</>}
              </p>
              <div className="mt-3 grid sm:grid-cols-2 gap-2 text-sm">
                {data?.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <a href={`mailto:${data.email}`} className="text-red-700 hover:underline">{data.email}</a>
                  </div>
                )}
                {data?.telefono && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <a href={`tel:${data.telefono}`} className="text-red-700 hover:underline">{data.telefono}</a>
                  </div>
                )}
                {data?.pec && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span>PEC: {data.pec}</span>
                  </div>
                )}
              </div>
            </section>

            {/* 2. DPO */}
            {data?.dpoNome && (
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">2. Data Protection Officer (DPO)</h2>
                <p>
                  Il Titolare ha nominato un Data Protection Officer contattabile al seguente indirizzo:
                  <strong> {data.dpoNome}</strong>
                  {data.dpoEmail && <> — <a href={`mailto:${data.dpoEmail}`} className="text-red-700 hover:underline">{data.dpoEmail}</a></>}
                  {data.dpoIndirizzo && <> — {data.dpoIndirizzo}</>}.
                </p>
              </section>
            )}

            {/* 3. Dati raccolti */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. Categorie di Dati Raccolti</h2>
              <p className="mb-3">Il presente sito raccoglie i seguenti tipi di dati personali:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Dati di navigazione:</strong> indirizzo IP (in forma anonimizzata), tipo di browser, sistema operativo, pagine visitate, data e ora di accesso, durata della sessione. Questi dati sono raccolti in forma aggregata e anonima tramite il sistema di analytics interno.</li>
                <li><strong>Dati forniti volontariamente:</strong> nome, cognome, indirizzo email, numero di telefono, dati relativi alle prenotazioni (data, ora, numero di persone, note). Questi dati sono forniti esclusivamente dall&apos;utente tramite il modulo di prenotazione.</li>
                <li><strong>Cookie tecnici e analitici:</strong> come dettagliato nella <Link href="/cookie-policy" className="text-red-700 hover:underline font-medium">Cookie Policy</Link>.</li>
              </ul>
            </section>

            {/* 4. Finalità */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Finalità del Trattamento</h2>
              <p className="mb-3">I dati personali sono trattati per le seguenti finalità:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Gestione delle prenotazioni:</strong> ricezione, conferma e gestione delle richieste di prenotazione inviate tramite il sito. Base giuridica: esecuzione di un contratto o misure precontrattuali (Art. 6, par. 1, lett. b) GDPR).</li>
                <li><strong>Analisi statistiche anonime:</strong> raccolta e analisi di dati aggregati e anonimi per comprendere l&apos;utilizzo del sito e migliorare l&apos;esperienza utente. Base giuridica: legittimo interesse del Titolare (Art. 6, par. 1, lett. f) GDPR).</li>
                <li><strong>Adempimenti di legge:</strong> obblighi previsti dalla normativa vigente. Base giuridica: obbligo legale (Art. 6, par. 1, lett. c) GDPR).</li>
              </ul>
            </section>

            {/* 5. Base giuridica */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. Base Giuridica del Trattamento</h2>
              <p>
                Il trattamento dei dati personali si basa sulle seguenti basi giuridiche, come previsto dall&apos;articolo 6 del Regolamento (UE) 2016/679 (GDPR):
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Consenso dell&apos;interessato (Art. 6, par. 1, lett. a), per i cookie analitici e di profilazione;</li>
                <li>Esecuzione di un contratto o misure precontrattuali (Art. 6, par. 1, lett. b), per la gestione delle prenotazioni;</li>
                <li>Legittimo interesse del Titolare (Art. 6, par. 1, lett. f), per l&apos;analisi statistica anonima e la sicurezza del sito;</li>
                <li>Obbligo legale (Art. 6, par. 1, lett. c), per gli adempimenti fiscali e contabili.</li>
              </ul>
            </section>

            {/* 6. Conservazione */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">6. Periodo di Conservazione</h2>
              <p>
                I dati personali saranno conservati per il tempo strettamente necessario al raggiungimento delle finalità per cui sono stati raccolti. In particolare:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Dati di prenotazione: conservati per 12 mesi dalla data della prenotazione, salvo obblighi di legge diversi;</li>
                <li>Dati di navigazione anonimizzati: conservati per un massimo di 24 mesi;</li>
                <li>Dati di analytics aggregati: conservati per un massimo di 36 mesi.</li>
              </ul>
            </section>

            {/* 7. Condivisione */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">7. Condivisione dei Dati</h2>
              <p>
                I dati personali non sono ceduti a terzi a fini commerciali. I dati possono essere condivisi con:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Provider di servizi tecnici (hosting, database) necessari al funzionamento del sito;</li>
                <li>Autorità competenti, qualora richiesto dalla legge.</li>
              </ul>
              <p className="mt-3">
                L&apos;elenco completo dei responsabili esterni del trattamento è disponibile su richiesta al Titolare.
              </p>
            </section>

            {/* 8. Diritti */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">8. Diritti dell&apos;Interessato</h2>
              <p className="mb-3">
                Ai sensi degli articoli 15-22 del GDPR, l&apos;interessato ha diritto di:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Accesso</strong> (Art. 15): ottenere conferma del trattamento e copia dei dati personali;</li>
                <li><strong>Rettifica</strong> (Art. 16): ottenere la correzione di dati inesatti o incompleti;</li>
                <li><strong>Cancellazione</strong> (Art. 17): ottenere la cancellazione dei dati non più necessari (&quot;diritto all&apos;oblio&quot;);</li>
                <li><strong>Limitazione</strong> (Art. 18): richiedere la limitazione del trattamento in determinate circostanze;</li>
                <li><strong>Portabilità</strong> (Art. 20): ricevere i dati in formato strutturato e trasferirli a un altro titolare;</li>
                <li><strong>Opposizione</strong> (Art. 21): opporsi al trattamento basato sul legittimo interesse;</li>
                <li><strong>Revoca del consenso</strong> (Art. 7, par. 3): revocare il consenso in qualsiasi momento senza pregiudicare la liceità del trattamento precedente.</li>
              </ul>
              <p className="mt-3">
                Per esercitare i propri diritti, l&apos;interessato può contattare il Titolare all&apos;indirizzo email{' '}
                <strong className="text-red-700">{data?.email || '[email del titolare]'}</strong>
                {data?.dpoEmail && <> o il DPO all&apos;indirizzo <strong className="text-red-700">{data.dpoEmail}</strong></>}.
              </p>
            </section>

            {/* 9. Reclamo */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">9. Diritto di Reclamo</h2>
              <p>
                L&apos;interessato ha il diritto di proporre reclamo all&apos;autorità di controllo competente: <strong>Garante per la protezione dei dati personali</strong>, Piazza Venezia 11, 00187 Roma, www.garanteprivacy.it.
              </p>
            </section>

            {/* 10. Modifiche */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">10. Modifiche alla presente Informativa</h2>
              <p>
                Il Titolare si riserva il diritto di apportare modifiche alla presente informativa, che saranno pubblicate su questa pagina con indicazione della data di ultimo aggiornamento. Si consiglia di consultare periodicamente questa pagina.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t text-center">
            <Link href="/cookie-policy" className="text-red-700 hover:underline font-medium">
              <Scale className="h-4 w-4 inline mr-1" />
              Consulta anche la Cookie Policy
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}