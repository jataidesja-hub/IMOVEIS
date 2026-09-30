'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { CorretorComPerfil } from '@/types';
import { Users, Search, CheckCircle, XCircle, Clock, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GestorCorretoresPage() {
  const supabase = createClient();
  const [corretores, setCorretores] = useState<CorretorComPerfil[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');

  async function carregarCorretores() {
    setCarregando(true);
    const { data } = await supabase
      .from('corretores')
      .select('*, perfil:perfis(*)')
      .order('created_at', { ascending: false });
    setCorretores((data as CorretorComPerfil[]) || []);
    setCarregando(false);
  }

  useEffect(() => { carregarCorretores(); }, []);

  async function aprovar(id: string) {
    const { error } = await supabase.from('corretores').update({ status: 'aprovado' }).eq('id', id);
    if (error) { toast.error('Erro ao aprovar'); return; }
    toast.success('Corretor aprovado!');
    // Send notification via API
    const corretor = corretores.find(c => c.id === id);
    if (corretor) {
      await fetch('/api/notificar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'aprovacao',
          email: corretor.perfil.email,
          nome: corretor.perfil.nome,
          whatsapp: corretor.whatsapp,
        }),
      });
    }
    carregarCorretores();
  }

  async function rejeitar(id: string) {
    const { error } = await supabase.from('corretores').update({ status: 'rejeitado' }).eq('id', id);
    if (error) { toast.error('Erro ao rejeitar'); return; }
    toast.success('Corretor rejeitado');
    carregarCorretores();
  }

  async function toggleAtivo(id: string, ativo: boolean) {
    const { error } = await supabase.from('corretores').update({ ativo: !ativo }).eq('id', id);
    if (error) { toast.error('Erro ao atualizar'); return; }
    toast.success(ativo ? 'Corretor desativado' : 'Corretor ativado');
    carregarCorretores();
  }

  const filtrados = corretores.filter(c => {
    const matchBusca = !busca ||
      c.perfil.nome.toLowerCase().includes(busca.toLowerCase()) ||
      c.perfil.email.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === 'todos' || c.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  const statusBadge = (status: string) => {
    if (status === 'aprovado') return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"><CheckCircle size={12} /> Aprovado</span>;
    if (status === 'rejeitado') return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700"><XCircle size={12} /> Rejeitado</span>;
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700"><Clock size={12} /> Pendente</span>;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Corretores</h1>
          <p className="text-slate-500">{corretores.length} corretores cadastrados</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              value={busca} onChange={e => setBusca(e.target.value)}
              placeholder="Buscar por nome ou email..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <select
            value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          >
            <option value="todos">Todos</option>
            <option value="pendente">Pendentes</option>
            <option value="aprovado">Aprovados</option>
            <option value="rejeitado">Rejeitados</option>
          </select>
        </div>

        {carregando ? (
          <div className="p-12 text-center text-slate-400">Carregando...</div>
        ) : filtrados.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400">Nenhum corretor encontrado</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtrados.map(corretor => (
              <div key={corretor.id} className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                  {corretor.foto_perfil
                    ? <img src={corretor.foto_perfil} alt="" className="w-10 h-10 rounded-full object-cover" />
                    : <Users size={18} className="text-slate-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-slate-800">{corretor.perfil.nome}</p>
                    {statusBadge(corretor.status)}
                    {!corretor.ativo && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Desativado</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">{corretor.perfil.email} · {corretor.whatsapp}</p>
                  {corretor.creci && <p className="text-xs text-slate-400">CRECI: {corretor.creci}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {corretor.status === 'pendente' && (
                    <>
                      <button onClick={() => aprovar(corretor.id)}
                        className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700">
                        Aprovar
                      </button>
                      <button onClick={() => rejeitar(corretor.id)}
                        className="px-3 py-1.5 bg-red-100 text-red-600 text-xs rounded-lg hover:bg-red-200">
                        Rejeitar
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => toggleAtivo(corretor.id, corretor.ativo)}
                    className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg ${
                      corretor.ativo
                        ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                    }`}
                  >
                    {corretor.ativo ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                    {corretor.ativo ? 'Desativar' : 'Ativar'}
                  </button>
                  <Link href={`/gestor/corretores/${corretor.id}`}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 text-xs rounded-lg hover:bg-blue-100">
                    <Eye size={14} />
                    Ver
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
