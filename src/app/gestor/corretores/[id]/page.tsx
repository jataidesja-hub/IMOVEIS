'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { CorretorComPerfil, Imovel } from '@/types';
import { formatCurrency, tipoLabel } from '@/lib/utils';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ArrowLeft, Building2, ExternalLink, Phone, Mail, Save, Loader2 } from 'lucide-react';

export default function GestorCorretorDetalhe() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();
  const [corretor, setCorretor] = useState<CorretorComPerfil | null>(null);
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({ nome: '', telefone: '', whatsapp: '', creci: '', bio: '', slug: '' });

  useEffect(() => {
    async function carregar() {
      const { data: c } = await supabase
        .from('corretores')
        .select('*, perfil:perfis(*)')
        .eq('id', id)
        .single();
      setCorretor(c as CorretorComPerfil);
      if (c) {
        setForm({
          nome: c.perfil.nome,
          telefone: c.perfil.telefone || '',
          whatsapp: c.whatsapp,
          creci: c.creci || '',
          bio: c.bio || '',
          slug: c.slug,
        });
      }
      const { data: im } = await supabase.from('imoveis').select('*').eq('corretor_id', id);
      setImoveis(im || []);
    }
    carregar();
  }, [id]);

  async function salvar() {
    setSalvando(true);
    try {
      await supabase.from('perfis').update({ nome: form.nome, telefone: form.telefone }).eq('id', id);
      await supabase.from('corretores').update({ whatsapp: form.whatsapp, creci: form.creci, bio: form.bio, slug: form.slug }).eq('id', id);
      toast.success('Informações salvas!');
      setEditando(false);
    } catch {
      toast.error('Erro ao salvar');
    } finally {
      setSalvando(false);
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';

  if (!corretor) return <div className="p-12 text-center text-slate-400">Carregando...</div>;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-slate-700">
          <ArrowLeft size={18} /> Voltar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800">Perfil</h2>
              <button onClick={() => setEditando(!editando)}
                className="text-sm text-green-600 hover:text-green-700 font-medium">
                {editando ? 'Cancelar' : 'Editar'}
              </button>
            </div>

            {editando ? (
              <div className="space-y-3">
                {[{l:'Nome',k:'nome'},{l:'Telefone',k:'telefone'},{l:'WhatsApp',k:'whatsapp'},{l:'CRECI',k:'creci'},{l:'Slug (URL)',k:'slug'}].map(f => (
                  <div key={f.k}>
                    <label className="text-xs text-slate-500">{f.l}</label>
                    <input value={form[f.k as keyof typeof form]}
                      onChange={e => setForm(p => ({...p, [f.k]: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 mt-1" />
                  </div>
                ))}
                <div>
                  <label className="text-xs text-slate-500">Bio</label>
                  <textarea value={form.bio}
                    onChange={e => setForm(p => ({...p, bio: e.target.value}))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 mt-1 resize-none" />
                </div>
                <button onClick={salvar} disabled={salvando}
                  className="w-full bg-green-600 text-white py-2 rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                  {salvando ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Salvar
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    {corretor.foto_perfil
                      ? <img src={corretor.foto_perfil} alt="" className="w-16 h-16 rounded-full object-cover" />
                      : <Building2 size={24} className="text-slate-400" />}
                  </div>
                  <h3 className="font-bold text-slate-800">{corretor.perfil.nome}</h3>
                  <p className="text-xs text-slate-500">@{corretor.slug}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail size={14} className="text-slate-400" />
                  {corretor.perfil.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone size={14} className="text-slate-400" />
                  {corretor.whatsapp}
                </div>
                {corretor.creci && <p className="text-sm text-slate-600">CRECI: {corretor.creci}</p>}
                {corretor.bio && <p className="text-sm text-slate-500 italic">{corretor.bio}</p>}
                <a
                  href={`/c/${corretor.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 mt-2"
                >
                  <ExternalLink size={14} />
                  Ver catálogo do corretor
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-slate-800 mb-4">Imóveis ({imoveis.length})</h2>
            {imoveis.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Building2 size={40} className="mx-auto mb-2 opacity-30" />
                <p>Nenhum imóvel cadastrado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {imoveis.map(im => (
                  <div key={im.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                    <div className="w-14 h-14 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {im.fotos[0]
                        ? <img src={im.fotos[0]} alt="" className="w-full h-full object-cover" />
                        : <Building2 size={20} className="m-auto mt-3 text-gray-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 text-sm truncate">{im.titulo}</p>
                      <p className="text-xs text-slate-500">{im.codigo} · {tipoLabel(im.tipo)} · {im.cidade}/{im.estado}</p>
                      <p className="text-sm font-semibold text-green-600">{formatCurrency(im.preco)}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      im.publicado ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {im.publicado ? 'Publicado' : 'Rascunho'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
