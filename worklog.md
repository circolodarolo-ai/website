---
Task ID: 1
Agent: main
Task: Implementare 4 feature mancanti (Analytics, Banner AdSense, SiteImage→frontend, Cookie/Privacy Policy)

Work Log:
- Analizzato lo stato del codice: Task 4 (CookieBanner+policy) e Task 3 (SiteImage→frontend) erano GIÀ implementati nella sessione precedente
- Fix API analytics: corretto filtro weekly (usava dateFilter.weekStartDate errato), aggiunto filtro orario (hourly) con breakdown per 24 ore
- Aggiornato AdminAnalytics.tsx: nuovo tipo 'hourly' con tabella visite per fascia oraria, barra di distribuzione, ora di punta evidenziata
- Fix API banner pubblico: campo 'pagina' non esiste nello schema, corretto con 'pagine' usando operatore 'contains' per matching comma-separated
- Creata pagina dedicata /eventi con BannerContainer (top/inline/bottom), card espandibili, sezione eventi passati
- Fix API eventi: rimosso campo 'attivo' inesistente nel modello Evento
- Fix API articoli: corretto 'categoria' → 'Categoria', 'allergeni' → 'AllergeneArticolo' per naming Prisma
- Fix db.ts: aggiunto passaggio esplicito datasources per workaround bug Prisma 6.19.2 WASM env loading
- Aggiunto allowedDevOrigins in next.config.ts per preview CORS

Stage Summary:
- Tutte le 4 feature sono ora implementate e funzionanti
- Bug preesistenti corretti (Evento.attivo, Articolo.categoria)
- Tutti gli endpoint testati e rispondono 200
- Preview attivo su https://preview-c174503d-cd77-4cd5-97c8-bb723ad656cb.space-z.ai/