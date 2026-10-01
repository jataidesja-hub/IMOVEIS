'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Imovel } from '@/types';
import { formatCurrency, tipoLabel } from '@/lib/utils';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { PlusCircle, Building2, Edit, Trash2, Eye, EyeOff, Share2, Copy } from 'lucide-react';

export default function CorretorImoveisPage() {
  const supabase = createClient();
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [slug, setSlug] = useState('');
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';

  async function carregar() {
    setCarregando(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: corretor } = await supabase.from('corretores').select('slug').eq('id', user.id).single();
    if (corretor) setSlug(corretor.slug);
    const { data } = await supabase.from('imoveis').select('*').eq('corretor_id', user.id).order('created_at', { ascending: false });
    setImoveis(data || []);
    setCarregando(false);
  }

  useEffect(() => { carregar(); }, []);

  async function togglePublicado(imovel: Imovel) {
    const { error } = await supabase.from('imoveis').update({ publicado: !imovel.publicado }).eq('id', imovel.id);
    if (error) { toast.error('Erro ao atualizar'); return; }
    toast.success(imovel.publicado ? 'Imóvel despublicado' : 'Imóvel publicado!');
    carregar();
  }

  async function excluir(id: string) {
    if (!confirm('Deseja realmente excluir este imóvel?')) return;
    const { error } = await supabase.from('imoveis').delete().eq('id', id);
    if (error) { toast.error('Erro ao excluir'); return; }
    toast.success('Imóvel excluído');
    carregar();
  }

  function copiarLink(codigo: string) {
    navigator.clipboard.writeText(`${siteUrl}/c/${slug}/${codigo}`);
    toast.success('Link do imóvel copiado!');
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Meus Imóveis</h1>
          <p className="text-slate-500">{imoveis.length} imóveis cadastrados</p>
        </div>
        <Link href="/corretor/imoveis/novo"
          className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors">
          <PlusCircle size={18} />
          Novo Imóvel
        </Link>
      </div>

      {carregando ? (
        <div className="text-center py-12 text-slate-400">Carregando...</div>
      ) : imoveis.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <Building2 className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="font-semibold text-slate-700 mb-2">Nenhum imóvel cadastrado</h3>
          <p className="text-slate-400 mb-4">Comece publicando seu primeiro imóvel</p>
          <Link href="/corretor/imoveis/novo"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700">
            <PlusCircle size={16} /> Publicar Imóvel
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {imoveis.map(im => (
            <div key={im.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex gap-4">
              <div className="w-24 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                {im.fotos?.[0]
                  ? <img src={im.fotos[0]} alt="" className="w-full h-full object-cover" />
                  : <Building2 size={24} className="m-auto mt-4 text-gray-300" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-800 truncate">{im.titulo}</p>
                    <p className="text-xs text-slate-400 font-mono">{im.codigo}</p>
                    <p className="text-sm text-slate-500">{tipoLabel(im.tipo)} · {im.cidade}/{im.estado}</p>
                  </div>
                  <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${
                    im.publicado ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {im.publicado ? 'Publicado' : 'Rascunho'}
                  </span>
                </div>
                <p className="font-bold text-green-600 mt-1">
                  {formatCurrency(im.preco)}{im.finalidade === 'aluguel' ? '/mês' : ''}
                </p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Link href={`/corretor/imoveis/${im.id}/editar`}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 text-xs rounded-lg hover:bg-blue-100">
                    <Edit size={12} /> Editar
                  </Link>
                  <button onClick={() => togglePublicado(im)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 text-slate-600 text-xs rounded-lg hover:bg-slate-100">
                    {im.publicado ? <EyeOff size={12} /> : <Eye size={12} />}
                    {im.publicado ? 'Despublicar' : 'Publicar'}
                  </button>
                  <button onClick={() => copiarLink(im.codigo)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 text-xs rounded-lg hover:bg-green-100">
                    <Copy size={12} /> Copiar link
                  </button>
                  <button onClick={() => excluir(im.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-500 text-xs rounded-lg hover:bg-red-100">
                    <Trash2 size={12} /> Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
