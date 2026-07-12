import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    let info = await db.siteInfo.findFirst();
    if (!info) {
      info = await db.siteInfo.create({
        data: { id: 'default', updatedAt: new Date() },
      });
    }
    return NextResponse.json(info);
  } catch (error) {
    return NextResponse.json(
      { error: 'Errore nel recupero delle informazioni' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const id = body.id || 'default';

    // Estrae solo i campi validi del modello SiteInfo
    const {
      nomeLocale, slogan, chiSiamoTitolo, chiSiamoSubtitle, chiSiamoTesto,
      chiSiamoImageUrl, valore1Titolo, valore1Desc,
      valore2Titolo, valore2Desc, valore3Titolo, valore3Desc,
      valore4Titolo, valore4Desc,
      logoUrl, faviconUrl, telefono, email,
      prenotazioniAttive, heroTitle, heroSubtitle, heroCTAText,
      heroImageUrl, heroOverlayOpacity, specialitaTitle, specialitaSubtitle,
      seoCanonical, seoDescription, seoKeywords, seoOgDescription,
      seoOgImage, seoOgTitle, seoRobots, seoTitle, seoTwitterCard,
      primaryColor, primaryForeground, secondaryColor,
      footerBgColor, footerTextColor, sectionBgColor,
      socialBtnColor, settingsBtnColor, prenotaBtnColor, prenotaSectionBgColor,
      orarioPranzoInizio, orarioPranzoFine, orarioCenaInizio, orarioCenaFine,
      headingFont, bodyFont,
      ...rest
    } = body;
    const data = {
      nomeLocale, slogan, chiSiamoTitolo, chiSiamoSubtitle, chiSiamoTesto,
      chiSiamoImageUrl, valore1Titolo, valore1Desc,
      valore2Titolo, valore2Desc, valore3Titolo, valore3Desc,
      valore4Titolo, valore4Desc,
      logoUrl, faviconUrl, telefono, email,
      prenotazioniAttive, heroTitle, heroSubtitle, heroCTAText,
      heroImageUrl, heroOverlayOpacity, specialitaTitle, specialitaSubtitle,
      seoCanonical, seoDescription, seoKeywords, seoOgDescription,
      seoOgImage, seoOgTitle, seoRobots, seoTitle, seoTwitterCard,
      primaryColor, primaryForeground, secondaryColor,
      footerBgColor, footerTextColor, sectionBgColor,
      socialBtnColor, settingsBtnColor, prenotaBtnColor, prenotaSectionBgColor,
      orarioPranzoInizio, orarioPranzoFine, orarioCenaInizio, orarioCenaFine,
      headingFont, bodyFont,
    };

    const info = await db.siteInfo.upsert({
      where: { id },
      update: data,
      create: { id: 'default', ...data, updatedAt: new Date() },
    });
    return NextResponse.json(info);
  } catch (error) {
    console.error('site-info PUT error:', error);
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento' },
      { status: 500 }
    );
  }
}