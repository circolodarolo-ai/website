'use client';

import { useState, useEffect } from 'react';
import { Cookie, ExternalLink, Shield, Server, BarChart3, Target } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/restaurant/Header';
import Footer from '@/components/restaurant/Footer';
import { useI18n } from '@/lib/i18n-context';
import { useDbTranslation } from '@/hooks/useDbTranslation';

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
  const { t } = useI18n();
  const dbTr = useDbTranslation();
  const [data, setData] = useState<CompanyData | null>(null);

  useEffect(() => {
    fetch('/api/company-data-public')
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        // Registra contenuto custom per traduzione
        if (d.cookiesPolicy) {
          dbTr.register({ 'policy.cookiesPolicy': d.cookiesPolicy });
        }
      })
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
            <div className="flex items-center gap-2 text-sm text-[var(--primary)] mb-6">
              <Link href="/" className="hover:underline">{t('policyPage.home')}</Link>
              <span>/</span>
              <span>{t('policyPage.cookiePolicyTitle')}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('policyPage.cookiePolicyTitle')}</h1>
            <div
              className="prose prose-gray max-w-none"
              dangerouslySetInnerHTML={{ __html: dbTr.t('policy.cookiesPolicy', data.cookiesPolicy) }}
            />
            <p className="mt-12 text-sm text-gray-400">{t('policyPage.lastUpdate')} {updatedDate}</p>
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
          <div className="flex items-center gap-2 text-sm text-[var(--primary)] mb-6">
            <Link href="/" className="hover:underline">{t('policyPage.home')}</Link>
            <span>/</span>
            <span>{t('policyPage.cookiePolicyTitle')}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Cookie className="h-8 w-8 text-[var(--primary)]" />
            {t('policyPage.cookiePolicyTitle')}
          </h1>
          <p className="text-gray-500 mb-10">{t('policyPage.lastUpdate')} {updatedDate}</p>

          <div className="space-y-8 text-gray-700 leading-relaxed">
            {/* 1. Cosa sono i cookie */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">{t('policyPage.sec1Title')}</h2>
              <p>{t('policyPage.sec1Text')}</p>
            </section>

            {/* 2. Tipologie */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">{t('policyPage.sec2Title')}</h2>
              <p className="mb-4">{t('policyPage.sec2Intro')}</p>

              {/* Tecnici */}
              <div className="border rounded-xl p-5 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Server className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-bold text-gray-900">{t('policyPage.tecniciTitle')}</h3>
                  {data?.cookieTecnici !== false && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{t('policyPage.active')}</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3">{t('policyPage.tecniciDesc')}</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4 font-medium">{t('policyPage.cookie')}</th>
                        <th className="text-left py-2 pr-4 font-medium">{t('policyPage.purpose')}</th>
                        <th className="text-left py-2 pr-4 font-medium">{t('policyPage.duration')}</th>
                        <th className="text-left py-2 font-medium">{t('policyPage.type')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 pr-4 font-mono text-xs">admin_token</td>
                        <td className="py-2 pr-4">Autenticazione pannello admin</td>
                        <td className="py-2 pr-4">Sessione</td>
                        <td className="py-2"><span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{t('policyPage.own')}</span></td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 pr-4 font-mono text-xs">cookie-consent</td>
                        <td className="py-2 pr-4">Memorizzazione preferenze cookie</td>
                        <td className="py-2 pr-4">12 mesi</td>
                        <td className="py-2"><span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{t('policyPage.own')}</span></td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-mono text-xs">_analytics_sid</td>
                        <td className="py-2 pr-4">Identificazione sessione anonima</td>
                        <td className="py-2 pr-4">Sessione</td>
                        <td className="py-2"><span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{t('policyPage.own')}</span></td>
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
                    <h3 className="text-lg font-bold text-gray-900">{t('policyPage.analiticiTitle')}</h3>
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">{t('policyPage.consentRequired')}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{t('policyPage.analiticiDesc')}</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 pr-4 font-medium">{t('policyPage.cookie')}</th>
                          <th className="text-left py-2 pr-4 font-medium">{t('policyPage.purpose')}</th>
                          <th className="text-left py-2 pr-4 font-medium">{t('policyPage.duration')}</th>
                          <th className="text-left py-2 font-medium">{t('policyPage.type')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="py-2 pr-4 font-mono text-xs">analytics_anon</td>
                          <td className="py-2 pr-4">Statistiche di navigazione anonime</td>
                          <td className="py-2 pr-4">24 mesi</td>
                          <td className="py-2"><span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{t('policyPage.own')}</span></td>
                        </tr>
                        {data?.googleAnalyticsId && (
                          <tr>
                            <td className="py-2 pr-4 font-mono text-xs">_ga, _ga_*</td>
                            <td className="py-2 pr-4">Google Analytics 4</td>
                            <td className="py-2 pr-4">14 mesi</td>
                            <td className="py-2"><span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{t('policyPage.thirdParty')}</span></td>
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
                    <h3 className="text-lg font-bold text-gray-900">{t('policyPage.marketingTitle')}</h3>
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{t('policyPage.consentRequired')}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{t('policyPage.marketingDesc')}</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 pr-4 font-medium">{t('policyPage.cookie')}</th>
                          <th className="text-left py-2 pr-4 font-medium">{t('policyPage.purpose')}</th>
                          <th className="text-left py-2 pr-4 font-medium">{t('policyPage.duration')}</th>
                          <th className="text-left py-2 font-medium">{t('policyPage.type')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data?.adSenseId && (
                          <tr>
                            <td className="py-2 pr-4 font-mono text-xs">__gads, __gpi</td>
                            <td className="py-2 pr-4">Google AdSense - pubblicita personalizzata</td>
                            <td className="py-2 pr-4">13-24 mesi</td>
                            <td className="py-2"><span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">{t('policyPage.thirdParty')}</span></td>
                          </tr>
                        )}
                        {data?.facebookPixelId && (
                          <tr>
                            <td className="py-2 pr-4 font-mono text-xs">_fbp, _fbc</td>
                            <td className="py-2 pr-4">Meta Pixel - tracciamento conversioni</td>
                            <td className="py-2 pr-4">3-12 mesi</td>
                            <td className="py-2"><span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{t('policyPage.thirdParty')}</span></td>
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
              <h2 className="text-xl font-bold text-gray-900 mb-3">{t('policyPage.sec3Title')}</h2>
              <p className="mb-3">{t('policyPage.sec3Text')}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>{t('policyPage.sec3Banner')}</strong></li>
                <li><strong>{t('policyPage.sec3Browser')}</strong></li>
              </ul>
              <div className="mt-4 bg-gray-50 rounded-lg p-4 text-sm">
                <p className="font-medium mb-2">{t('policyPage.browserInstructions')}</p>
                <ul className="space-y-1 text-gray-600">
                  <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:underline">Chrome <ExternalLink className="h-3 w-3 inline" /></a></li>
                  <li><a href="https://support.mozilla.org/it/kb/eliminare-i-cookie" target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:underline">Firefox <ExternalLink className="h-3 w-3 inline" /></a></li>
                  <li><a href="https://support.apple.com/it-it/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:underline">Safari <ExternalLink className="h-3 w-3 inline" /></a></li>
                  <li><a href="https://support.microsoft.com/it-it/microsoft-edge/eliminare-i-cookie-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:underline">Edge <ExternalLink className="h-3 w-3 inline" /></a></li>
                </ul>
              </div>
            </section>

            {/* 4. Base giuridica */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">{t('policyPage.sec4Title')}</h2>
              <p>{t('policyPage.sec4Text')}</p>
            </section>

            {/* 5. Titolare */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">{t('policyPage.sec5Title')}</h2>
              <p>
                {t('policyPage.sec5Text')} <strong>{company}</strong>.
                {t('policyPage.sec5Contact')}{' '}
                <strong className="text-[var(--primary)]">{data?.email || '[email del titolare]'}</strong>.
              </p>
            </section>

            {/* 6. Aggiornamenti */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">{t('policyPage.sec6Title')}</h2>
              <p>{t('policyPage.sec6Text')}</p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t text-center">
            <Link href="/privacy-policy" className="text-[var(--primary)] hover:underline font-medium">
              <Shield className="h-4 w-4 inline mr-1" />
              {t('policyPage.consultPrivacy')}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}