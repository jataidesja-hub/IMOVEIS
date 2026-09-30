import Link from 'next/link';
import { Building2 } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 text-center">
      <div className="w-16 h-16 bg-slate-200 rounded-2xl flex items-center justify-center mb-6">
        <Building2 className="w-8 h-8 text-slate-500" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Página não encontrada</h2>
      <p className="text-slate-500 mb-8">
        Não conseguimos encontrar o que você estava procurando. O link pode estar quebrado ou o corretor/imóvel foi desativado.
      </p>
      <Link href="/c" className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors">
        Ver catálogo de imóveis
      </Link>
    </div>
  );
}
