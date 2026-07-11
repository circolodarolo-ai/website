'use client';

import { useState } from 'react';
import { ShieldCheck, Trash2, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function RichiestaCancellazioneDati() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [deletedCount, setDeletedCount] = useState(0);

  const handleDelete = async () => {
    if (!confirm('Sei sicuro di voler cancellare tutti i tuoi dati di navigazione raccolti da questo sito? Questa azione non puo essere annullata.')) {
      return;
    }

    setStatus('loading');

    // Recupera il sessionId dalla sessionStorage (stesso usato per analytics)
    const sessionId = sessionStorage.getItem('_analytics_sid');

    if (!sessionId) {
      setStatus('error');
      setMessage('Nessuna sessione attiva trovata. Non ci sono dati da cancellare.');
      return;
    }

    try {
      const res = await fetch('/api/privacy/delete-my-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setDeletedCount(data.deleted || 0);
        // Pulisci anche il cookie consent e la sessione
        localStorage.removeItem('cookie-consent');
        sessionStorage.removeItem('_analytics_sid');
        if (typeof window !== 'undefined') {
          window.__cookieConsent = { accepted: false, date: new Date().toISOString(), tecnici: true, analitici: false, marketing: false };
        }
      } else {
        setStatus('error');
        setMessage(data.error || 'Errore nella cancellazione');
      }
    } catch {
      setStatus('error');
      setMessage('Errore di connessione. Riprova.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-8"
        >
          <ArrowLeft className="h-4 w-4" /> Torna al sito
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <ShieldCheck className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Cancellazione Dati Personali</h1>
          <p className="text-gray-500 mt-2">Diritto alla cancellazione (Art. 17 GDPR)</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              I miei dati di navigazione
            </CardTitle>
            <CardDescription>
              Questa pagina ti permette di esercitare il tuo diritto alla cancellazione
              dei dati di navigazione e analisi raccolti da questo sito.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium mb-1">Prima di procedere</p>
                  <ul className="list-disc list-inside space-y-1 text-amber-700">
                    <li>Verranno cancellati <strong>tutti i dati di navigazione</strong> associati alla tua sessione corrente (pagine visitate, orari, dati geolocalizzati, dispositivo utilizzato).</li>
                    <li>L&apos;azione &egrave; <strong>irreversibile</strong> e i dati non potranno essere recuperati.</li>
                    <li>Dopo la cancellazione, i cookie analitici verranno disattivati.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
              <p className="font-medium mb-2">Quali dati vengono cancellati?</p>
              <ul className="space-y-1">
                <li>Pagine visitate e orari di navigazione</li>
                <li>Dati di geolocalizzazione IP (paese e citt&agrave;)</li>
                <li>Tipo di dispositivo e browser utilizzato</li>
                <li>Sorgente di traffico (referrer)</li>
                <li>Durata delle sessioni</li>
              </ul>
              <p className="mt-3 text-xs text-gray-400">
                I dati delle prenotazioni (nome, email, telefono) NON sono inclusi
                in questa cancellazione. Per richiedere la cancellazione anche di
                tali dati, contatta direttamente il titolare del trattamento
                tramite i riferimenti indicati nella <Link href="/privacy-policy" className="underline hover:text-gray-700">Privacy Policy</Link>.
              </p>
            </div>

            {status === 'idle' && (
              <Button
                onClick={handleDelete}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-base"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Cancella i miei dati di navigazione
              </Button>
            )}

            {status === 'loading' && (
              <div className="text-center py-4">
                <div className="animate-spin h-8 w-8 border-4 border-red-200 border-t-red-600 rounded-full mx-auto mb-2" />
                <p className="text-gray-500">Cancellazione in corso...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-lg font-semibold text-green-800">Dati cancellati con successo</p>
                <p className="text-sm text-green-600 mt-1">
                  Sono stati rimossi <strong>{deletedCount} record</strong> associati alla tua sessione di navigazione.
                </p>
                <p className="text-xs text-green-500 mt-3">
                  I cookie analitici sono stati disattivati. Puoi continuare a navigare sul sito.
                </p>
                <Link href="/" className="inline-block mt-4 text-sm text-green-700 hover:text-green-900 underline">
                  Torna al sito
                </Link>
              </div>
            )}

            {status === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700">{message}</p>
                <Button
                  variant="outline"
                  onClick={() => setStatus('idle')}
                  className="mt-3"
                  size="sm"
                >
                  Riprova
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-xs text-gray-400 text-center mt-6">
          Ai sensi dell&apos;Art. 17 del Regolamento (UE) 2016/679 (GDPR).
          Per assistenza, contatta il titolare del trattamento tramite la{' '}
          <Link href="/privacy-policy" className="underline hover:text-gray-600">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}