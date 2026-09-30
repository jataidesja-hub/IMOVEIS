'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import { Building2, PlusCircle, Share2, Eye, CheckCircle } from 'lucide-react';

export default function CorretorDashboard() {
  const supabase = createClient();
  const [stats, setStats] = useState({ total: 0, publicados: 0, rascunhos: 0 });
  const [slug, setSlug] = useState('');
  const [nome, setNome] = useState('');
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';

  useEffect(() => {
    async function carregar() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: perfil } = await supabase.from('perfis').select('nome').eq('id', user.id).single();
      const { data: corretor } = await supabase.from('corretores').select('slug').eq('id', user.id).single();
      const { data: imoveis } = await supabase.from('imoveis').select('publicado').eq('corretor_id', user.id);

      if (perfil) setNome(perfil.nome);
      if (corretor) setSlug(corretor.slug);
      if (imoveis) {
        setStats({
          total: imoveis.length,
          publicados: imoveis.filter(i => i.publicado).length,
          rascunhos: imoveis.filter(i => !i.publicado).length,
        });
      }
    }
    carregar();
  }, []);

  function copiarLink() {
    navigator.clipboard.writeText(`${siteUrl}/c/${slug}`);
    alert('Link copiado! Compartilhe com seus clientes.');
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Olá, {nome.split(' ')[0]}! 👋</h1>
        <p className="text-slate-500">Gerencie seus imóveis e compartilhe seu catálogo</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Total de Imóveis', value: stats.total, icon: Building2, color: 'bg-blue-500' },
          { label: 'Publicados', value: stats.publicados, icon: CheckCircle, color: 'bg-green-500' },
          { label: 'Rascunhos', value: stats.rascunhos, icon: Eye, color: 'bg-amber-500' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className={`w-12 h-12 ${s.color} rounded-xl flex items-center justify-center mb-4`}>
              <s.icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-3xl font-bold text-slate-800">{s.value}</p>
            <p className="text-slate-500 text-sm mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Meu Link de Catálogo</h2>
          <p className="text-slate-500 text-sm mb-4">Compartilhe este link com seus clientes para verem seus imóveis:</p>
          <div className="flex items-center gap-3">
            <input readOnly value={`${siteUrl}/c/${slug}`}
              className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-slate-700" />
            <button onClick={copiarLink}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl transition-colors">
              <Share2 size={14} />
              Copiar
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Ações Rápidas</h2>
          <div className="space-y-3">
            <Link href="/corretor/imoveis/novo"
              className="flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-xl transition-colors">
              <PlusCircle className="text-green-600" size={20} />
              <span className="text-green-700 font-medium text-sm">Publicar novo imóvel</span>
            </Link>
            <Link href="/corretor/imoveis"
              className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors">
              <Building2 className="text-blue-600" size={20} />
              <span className="text-blue-700 font-medium text-sm">Ver meus imóveis</span>
            </Link>
            <a href={`${siteUrl}/c/${slug}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">
              <Eye className="text-slate-600" size={20} />
              <span className="text-slate-700 font-medium text-sm">Ver meu catálogo público</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
