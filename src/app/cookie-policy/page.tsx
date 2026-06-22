'use client';

import { useState, useEffect } from 'react';
import { Cookie, ExternalLink, Shield, Server, BarChart3, Target } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/restaurant/Header';
import Footer from '@/components/restaurant/Footer';

interface CompanyData {
  ragioneSociale: string | null;
  email: string | null;
  cookiesPolicy: string | null;
  cookiesPolicyUpdate: string | null;
  cookieTecnici: boolean;
  cookieAnalitici: boolean;
  cookieMarketing: boolean;
  googleAnalyticsId: string | null;
  facebookPixelId: string | null;
  adSenseId: string | null;
  privacyUrl: string | null;
}

export default function CookiePolicyPage() {
  const [data, setData] = useState<CompanyData | null>(null);

  useEffect(() => {
    fetch('/api/company-data-public')
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  const company = data?.ragioneSociale || 'Il Titolare del Trattamento';
  const updatedDate = data?.cookiesPolicyUpdate
    ? new Date(data.cookiesPolicyUpdate).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });

  // If admin has written a custom policy, show it
  if (data?.cookiesPolicy) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-white">
          <div className="max-w-3xl mx-auto px-4 py-16">
            <div className="flex items-center gap-2 text-sm text-red-700 mb-6">
              <Link href="/" className="hover:underline">Home</Link>
              <span>/</span>
              <span>Cookie Policy</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Cookie Policy</h1>
            <div
              className="prose prose-gray max-w-none"
              dangerouslySetInnerHTML={{ __html: data.cookiesPolicy }}
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
            <span>Cookie Policy</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Cookie className="h-8 w-8 text-red-700" />
            Cookie Policy
          </h1>
          <p className="text-gray-500 mb-10">Ultimo aggiornamento: {updatedDate}</p>

          <div className="space-y-8 text-gray-700 leading-relaxed">
            {/* 1. Cosa sono i cookie */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. Cosa sono i Cookie</h2>
              <p>
                I cookie sono piccoli file di testo che vengono memorizzati sul dispositivo dell&apos;utente quando visita un sito web. Essi permettono al sito di ricordare le azioni e le preferenze dell&apos;utente (come lingua, dimensione del carattere, login) per un periodo di tempo determinato, in modo da non doverle indicare nuovamente ad ogni visita o navigazione tra le pagine.
              </p>
            </section>

            {/* 2. Tipologie */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. Tipologie di Cookie utilizzati</h2>
              <p className="mb-4">Il presente sito utilizza le seguenti categorie di cookie, in conformità con la normativa europea e le linee guida del Garante per la protezione dei dati personali (Provvedimento dell&apos;8 maggio 2014):</p>

              {/* Tecnici */}
              <div className="border rounded-xl p-5 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Server className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-bold text-gray-900">Cookie Tecnici (necessari)</h3>
                  {data?.cookieTecnici !== false && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Attivi</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Questi cookie sono essenziali per il corretto funzionamento del sito e non possono essere disabilitati. Non raccolgono informazioni personali identificabili.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4 font-medium">Cookie</th>
                        <th className="text-left py-2 pr-4 font-medium">Scopo</th>
                        <th className="text-left py-2 pr-4 font-medium">Durata</th>
                        <th className="text-left py-2 font-medium">Tipo</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 pr-4 font-mono text-xs">admin_token</td>
                        <td className="py-2 pr-4">Autenticazione pannello admin</td>
                        <td className="py-2 pr-4">Sessione</td>
                        <td className="py-2"><span className="text-xs bg-gray-100 px-2 py-0.5 rounded">Proprio</span></td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 pr-4 font-mono text-xs">cookie-consent</td>
                        <td className="py-2 pr-4">Memorizzazione preferenze cookie</td>
                        <td className="py-2 pr-4">12 mesi</td>
                        <td className="py-2"><span className="text-xs bg-gray-100 px-2 py-0.5 rounded">Proprio</span></td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-mono text-xs">_analytics_sid</td>
                        <td className="py-2 pr-4">Identificazione sessione anonima</td>
                        <td className="py-2 pr-4">Sessione</td>
                        <td className="py-2"><span className="text-xs bg-gray-100 px-2 py-0.5 rounded">Proprio</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Analitici */}
              {data?.cookieAnalitici !== false && (
                <div className="border rounded-xl p-5 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-bold text-gray-900">Cookie Analitici</h3>
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Subordinati a consenso</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Questi cookie raccolgono informazioni anonime sul modo in cui gli utenti utilizzano il sito (pagine visitate, durata della visita, fonte di traffico). I dati sono raccolti in forma aggregata e non permettono di identificare l&apos;utente.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 pr-4 font-medium">Cookie</th>
                          <th className="text-left py-2 pr-4 font-medium">Scopo</th>
                          <th className="text-left py-2 pr-4 font-medium">Durata</th>
                          <th className="text-left py-2 font-medium">Tipo</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="py-2 pr-4 font-mono text-xs">analytics_anon</td>
                          <td className="py-2 pr-4">Statistiche di navigazione anonime</td>
                          <td className="py-2 pr-4">24 mesi</td>
                          <td className="py-2"><span className="text-xs bg-gray-100 px-2 py-0.5 rounded">Proprio</span></td>
                        </tr>
                        {data?.googleAnalyticsId && (
                          <tr>
                            <td className="py-2 pr-4 font-mono text-xs">_ga, _ga_*</td>
                            <td className="py-2 pr-4">Google Analytics 4</td>
                            <td className="py-2 pr-4">14 mesi</td>
                            <td className="py-2"><span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Terze parti</span></td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Marketing/Profilazione */}
              {data?.cookieMarketing !== false && (
                <div className="border rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="h-5 w-5 text-orange-600" />
                    <h3 className="text-lg font-bold text-gray-900">Cookie di Profilazione / Marketing</h3>
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Subordinati a consenso</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Questi cookie vengono utilizzati per fornire contenuti pubblicitari personalizzati e per mostrare banner pubblicitari pertinenti. Vengono attivati solo previo consenso esplicito dell&apos;utente.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 pr-4 font-medium">Cookie</th>
                          <th className="text-left py-2 pr-4 font-medium">Scopo</th>
                          <th className="text-left py-2 pr-4 font-medium">Durata</th>
                          <th className="text-left py-2 font-medium">Tipo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data?.adSenseId && (
                          <tr>
                            <td className="py-2 pr-4 font-mono text-xs">__gads, __gpi</td>
                            <td className="py-2 pr-4">Google AdSense - pubblicità personalizzata</td>
                            <td className="py-2 pr-4">13-24 mesi</td>
                            <td className="py-2"><span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">Terze parti</span></td>
                          </tr>
                        )}
                        {data?.facebookPixelId && (
                          <tr>
                            <td className="py-2 pr-4 font-mono text-xs">_fbp, _fbc</td>
                            <td className="py-2 pr-4">Meta Pixel - tracciamento conversioni</td>
                            <td className="py-2 pr-4">3-12 mesi</td>
                            <td className="py-2"><span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Terze parti</span></td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>

            {/* 3. Gestione */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. Come Gestire i Cookie</h2>
              <p className="mb-3">
                L&apos;utente può gestire le proprie preferenze sui cookie in diversi modi:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Banner dei cookie:</strong> al primo accesso al sito, l&apos;utente può accettare o rifiutare i cookie non necessari tramite il banner apposito.</li>
                <li><strong>Impostazioni del browser:</strong> l&apos;utente può configurare il proprio browser per bloccare o cancellare i cookie. Si ricorda che la disabilitazione di alcuni cookie potrebbe compromettere la funzionalità del sito.</li>
              </ul>
              <div className="mt-4 bg-gray-50 rounded-lg p-4 text-sm">
                <p className="font-medium mb-2">Istruzioni per i browser principali:</p>
                <ul className="space-y-1 text-gray-600">
                  <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-red-700 hover:underline">Chrome <ExternalLink className="h-3 w-3 inline" /></a></li>
                  <li><a href="https://support.mozilla.org/it/kb/eliminare-i-cookie" target="_blank" rel="noopener noreferrer" className="text-red-700 hover:underline">Firefox <ExternalLink className="h-3 w-3 inline" /></a></li>
                  <li><a href="https://support.apple.com/it-it/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-red-700 hover:underline">Safari <ExternalLink className="h-3 w-3 inline" /></a></li>
                  <li><a href="https://support.microsoft.com/it-it/microsoft-edge/eliminare-i-cookie-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-red-700 hover:underline">Edge <ExternalLink className="h-3 w-3 inline" /></a></li>
                </ul>
              </div>
            </section>

            {/* 4. Base giuridica */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Base Giuridica</h2>
              <p>
                I cookie tecnici sono installati in base al legittimo interesse del Titolare e non richiedono consenso (art. 122, comma 1, del Codice della Privacy e Provvedimento del Garante 8/5/2014). I cookie analitici e di profilazione sono installati solo previo consenso dell&apos;utente, ai sensi dell&apos;art. 6, par. 1, lett. a) del GDPR e dell&apos;art. 122, comma 2, del Codice della Privacy.
              </p>
            </section>

            {/* 5. Titolare */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. Titolare del Trattamento</h2>
              <p>
                Il Titolare del trattamento dei dati raccolti tramite cookie è <strong>{company}</strong>.
                Per qualsiasi domanda inerente la presente Cookie Policy, è possibile contattare il Titolare all&apos;indirizzo email{' '}
                <strong className="text-red-700">{data?.email || '[email del titolare]'}</strong>.
              </p>
            </section>

            {/* 6. Aggiornamenti */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">6. Aggiornamenti della Cookie Policy</h2>
              <p>
                Il Titolare si riserva il diritto di modificare la presente Cookie Policy in qualsiasi momento. Le modifiche saranno pubblicate su questa pagina. Si invita l&apos;utente a consultare periodicamente questa pagina per verificare eventuali aggiornamenti.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t text-center">
            <Link href="/privacy-policy" className="text-red-700 hover:underline font-medium">
              <Shield className="h-4 w-4 inline mr-1" />
              Consulta anche l&apos;Informativa sulla Privacy
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}