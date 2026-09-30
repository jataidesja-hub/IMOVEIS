'use client';

import Link from 'next/link';
import { Building2 } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-6">
            <Building2 className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Ops! Algo deu errado</h2>
          <p className="text-slate-500 mb-6 max-w-md">
            Ocorreu um erro inesperado no servidor. Isso geralmente acontece por um link quebrado ou informações faltando.
          </p>
          <p className="text-xs text-slate-400 mb-8 font-mono">Erro: {error.message || error.digest}</p>
          <div className="flex gap-4">
            <button onClick={() => reset()} className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-slate-700 font-semibold rounded-xl transition-colors">
              Tentar novamente
            </button>
            <Link href="/" className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors">
              Voltar ao Início
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
