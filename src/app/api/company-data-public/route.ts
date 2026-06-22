import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const data = await db.companyData.findFirst({
      select: {
        showCookieBanner: true,
        cookieBannerText: true,
        cookieAcceptText: true,
        cookieDeclineText: true,
        cookieTecnici: true,
        cookieAnalitici: true,
        cookieMarketing: true,
        privacyEnabled: true,
        privacyPolicy: true,
        privacyUrl: true,
        cookiesEnabled: true,
        cookiesPolicy: true,
        cookiesUrl: true,
        ragioneSociale: true,
        partitaIva: true,
        codiceFiscale: true,
        indirizzo: true,
        citta: true,
        cap: true,
        provincia: true,
        paese: true,
        telefono: true,
        email: true,
        pec: true,
        dpoNome: true,
        dpoEmail: true,
        dpoIndirizzo: true,
        terminiServizio: true,
        terminiUrl: true,
        thirdPartyScriptsEnabled: true,
        googleAnalyticsId: true,
        facebookPixelId: true,
        adSenseId: true,
        adSenseSlotHorizontal: true,
        adSenseSlotRectangle: true,
        adSenseSlotTop: true,
        adSenseSlotInline: true,
      },
    });
    return NextResponse.json(data || {});
  } catch (error) {
    console.error('CompanyData public GET error:', error);
    return NextResponse.json({}, { status: 200 });
  }
}