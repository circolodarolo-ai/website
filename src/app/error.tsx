'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[ErrorBoundary]', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Errore di caricamento</h2>
        <p className="text-gray-500 text-sm mb-4">Si è verificato un errore. Prova a ricaricare la pagina.</p>

        <details className="text-left mb-4">
          <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">Dettagli errore</summary>
          <div className="mt-2 p-3 bg-red-50 rounded-lg overflow-auto max-h-40">
            <p className="text-xs text-red-700 font-mono break-all">{error.message}</p>
            {error.stack && (
              <pre className="text-[10px] text-red-400 mt-2 whitespace-pre-wrap break-all max-h-32 overflow-auto">{error.stack}</pre>
            )}
            {error.digest && <p className="text-xs text-gray-400 mt-1">Digest: {error.digest}</p>}
          </div>
        </details>

        <button
          onClick={reset}
          className="px-6 py-2.5 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          Riprova
        </button>
      </div>
    </div>
  );
}