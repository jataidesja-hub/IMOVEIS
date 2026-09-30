import { createServerSupabaseClient } from '@/lib/supabaseServer';
import Link from 'next/link';
import { Users, Building2, Clock, CheckCircle } from 'lucide-react';

export default async function GestorDashboard() {
  const supabase = await createServerSupabaseClient();

  const [{ count: totalCorretores }, { count: corretoresPendentes }, { count: totalImoveis }, { count: imoveisPublicados }] = await Promise.all([
    supabase.from('corretores').select('*', { count: 'exact', head: true }),
    supabase.from('corretores').select('*', { count: 'exact', head: true }).eq('status', 'pendente'),
    supabase.from('imoveis').select('*', { count: 'exact', head: true }),
    supabase.from('imoveis').select('*', { count: 'exact', head: true }).eq('publicado', true),
  ]);

  const stats = [
    { label: 'Total de Corretores', value: totalCorretores ?? 0, icon: Users, color: 'bg-blue-500', href: '/gestor/corretores' },
    { label: 'Pendentes de Aprovação', value: corretoresPendentes ?? 0, icon: Clock, color: 'bg-amber-500', href: '/gestor/corretores?status=pendente' },
    { label: 'Total de Imóveis', value: totalImoveis ?? 0, icon: Building2, color: 'bg-green-500', href: '/gestor/imoveis' },
    { label: 'Imóveis Publicados', value: imoveisPublicados ?? 0, icon: CheckCircle, color: 'bg-emerald-500', href: '/gestor/imoveis' },
  ];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500">Visão geral da plataforma</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map(stat => (
          <Link key={stat.label} href={stat.href}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
            <p className="text-slate-500 text-sm mt-1">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Link do Catálogo Público</h2>
        <p className="text-slate-500 text-sm mb-3">Compartilhe este link para que clientes vejam todos os imóveis de todos os corretores:</p>
        <div className="flex items-center gap-3">
          <input
            readOnly
            value={`${siteUrl}/c`}
            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-slate-700"
          />
          <a
            href={`${siteUrl}/c`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl transition-colors"
          >
            Abrir
          </a>
        </div>
      </div>
    </div>
  );
}
