'use client';

import { useState, useEffect } from 'react';
import { Shield, Building, Mail, Phone, FileText, Scale } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/restaurant/Header';
import Footer from '@/components/restaurant/Footer';
import { useI18n } from '@/lib/i18n-context';
import { useDbTranslation } from '@/hooks/useDbTranslation';

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
  const { t } = useI18n();
  const dbTr = useDbTranslation();
  const [data, setData] = useState<CompanyData | null>(null);

  useEffect(() => {
    fetch('/api/company-data-public')
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        if (d.privacyPolicy) {
          dbTr.register({ 'policy.privacyPolicy': d.privacyPolicy });
        }
      })
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
            <div className="flex items-center gap-2 text-sm text-[var(--primary)] mb-6">
              <Link href="/" className="hover:underline">{t('policyPage.home')}</Link>
              <span>/</span>
              <span>{t('policyPage.privacyPolicyTitle')}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('policyPage.privacyPolicyTitle')}</h1>
            <div
              className="prose prose-gray max-w-none"
              dangerouslySetInnerHTML={{ __html: dbTr.t('policy.privacyPolicy', data.privacyPolicy) }}
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
            <span>{t('policyPage.privacyPolicyTitle')}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Shield className="h-8 w-8 text-[var(--primary)]" />
            {t('policyPage.privacyPolicyTitle')}
          </h1>
          <p className="text-gray-500 mb-10">{t('policyPage.lastUpdate')} {updatedDate}</p>

          <div className="space-y-8 text-gray-700 leading-relaxed">
            {/* 1. Titolare */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">{t('policyPage.pSec1Title')}</h2>
              <p>
                {t('policyPage.pSec1Text')} <strong>{company}</strong>, {t('policyPage.pSec1Sede')} {address || '[indirizzo]'}.
                {data?.partitaIva && <> {t('policyPage.pSec1Piva')} {data.partitaIva}.</>}
                {data?.codiceFiscale && <> {t('policyPage.pSec1Cf')} {data.codiceFiscale}.</>}
              </p>
              <div className="mt-3 grid sm:grid-cols-2 gap-2 text-sm">
                {data?.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <a href={`mailto:${data.email}`} className="text-[var(--primary)] hover:underline">{data.email}</a>
                  </div>
                )}
                {data?.telefono && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <a href={`tel:${data.telefono}`} className="text-[var(--primary)] hover:underline">{data.telefono}</a>
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
                <h2 className="text-xl font-bold text-gray-900 mb-3">{t('policyPage.pSec2Title')}</h2>
                <p>
                  {t('policyPage.pSec2Text')}
                  <strong> {data.dpoNome}</strong>
                  {data.dpoEmail && <> — <a href={`mailto:${data.dpoEmail}`} className="text-[var(--primary)] hover:underline">{data.dpoEmail}</a></>}
                  {data.dpoIndirizzo && <> — {data.dpoIndirizzo}</>}.
                </p>
              </section>
            )}

            {/* 3. Dati raccolti */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">{t('policyPage.pSec3Title')}</h2>
              <p className="mb-3">{t('policyPage.pSec3Intro')}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>{t('policyPage.pSec3Nav')}</strong></li>
                <li><strong>{t('policyPage.pSec3Vol')}</strong></li>
                <li><strong>{t('policyPage.pSec3Cookie')}</strong> <Link href="/cookie-policy" className="text-[var(--primary)] hover:underline font-medium">{t('policyPage.cookiePolicyTitle')}</Link>.</li>
              </ul>
            </section>

            {/* 4. Finalità */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">{t('policyPage.pSec4Title')}</h2>
              <p className="mb-3">{t('policyPage.pSec4Intro')}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>{t('policyPage.pSec4Pren')}</strong></li>
                <li><strong>{t('policyPage.pSec4Stats')}</strong></li>
                <li><strong>{t('policyPage.pSec4Law')}</strong></li>
              </ul>
            </section>

            {/* 5. Base giuridica */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">{t('policyPage.pSec5Title')}</h2>
              <p>{t('policyPage.pSec5Text')}</p>
            </section>

            {/* 6. Conservazione */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">{t('policyPage.pSec6Title')}</h2>
              <p>{t('policyPage.pSec6Text')}</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>{t('policyPage.pSec6Pren')}</li>
                <li>{t('policyPage.pSec6Nav')}</li>
                <li>{t('policyPage.pSec6Analytics')}</li>
              </ul>
            </section>

            {/* 7. Condivisione */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">{t('policyPage.pSec7Title')}</h2>
              <p>{t('policyPage.pSec7Text')}</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>{t('policyPage.pSec7Tech')}</li>
                <li>{t('policyPage.pSec7Auth')}</li>
              </ul>
              <p className="mt-3">{t('policyPage.pSec7List')}</p>
            </section>

            {/* 8. Diritti */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">{t('policyPage.pSec8Title')}</h2>
              <p className="mb-3">{t('policyPage.pSec8Intro')}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>{t('policyPage.pSec8Access')}</strong></li>
                <li><strong>{t('policyPage.pSec8Rect')}</strong></li>
                <li><strong>{t('policyPage.pSec8Cancel')}</strong></li>
                <li><strong>{t('policyPage.pSec8Limit')}</strong></li>
                <li><strong>{t('policyPage.pSec8Port')}</strong></li>
                <li><strong>{t('policyPage.pSec8Oppose')}</strong></li>
                <li><strong>{t('policyPage.pSec8Revoke')}</strong></li>
              </ul>
              <p className="mt-3">
                {t('policyPage.pSec8Contact')}{' '}
                <strong className="text-[var(--primary)]">{data?.email || '[email del titolare]'}</strong>
                {data?.dpoEmail && <> {t('policyPage.pSec8Dpo')} <strong className="text-[var(--primary)]">{data.dpoEmail}</strong></>}.
              </p>
              <p className="mt-3">
                Per la <strong>cancellazione immediata dei dati di navigazione e analisi</strong> (cookie analitici),
                puoi utilizzare lo strumento dedicato:{' '}
                <Link href="/richiesta-cancellazione-dati" className="text-[var(--primary)] underline hover:opacity-80">
                  Richiedi la cancellazione dei tuoi dati di navigazione
                </Link>.
              </p>
            </section>

            {/* 9. Reclamo */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">{t('policyPage.pSec9Title')}</h2>
              <p>
                {t('policyPage.pSec9Text')} <strong>Garante per la protezione dei dati personali</strong>, Piazza Venezia 11, 00187 Roma, www.garanteprivacy.it.
              </p>
            </section>

            {/* 10. Modifiche */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">{t('policyPage.pSec10Title')}</h2>
              <p>{t('policyPage.pSec10Text')}</p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t text-center">
            <Link href="/cookie-policy" className="text-[var(--primary)] hover:underline font-medium">
              <Scale className="h-4 w-4 inline mr-1" />
              {t('policyPage.consultCookie')}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}