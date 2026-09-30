'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { Save, Loader2, Upload } from 'lucide-react';

export default function CorretorPerfilPage() {
  const supabase = createClient();
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [userId, setUserId] = useState('');
  const [form, setForm] = useState({
    nome: '', telefone: '', whatsapp: '', creci: '', bio: '', foto_perfil: ''
  });

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data: perfil } = await supabase.from('perfis').select('nome, telefone').eq('id', user.id).single();
      const { data: corretor } = await supabase.from('corretores').select('whatsapp, creci, bio, foto_perfil').eq('id', user.id).single();
      setForm({
        nome: perfil?.nome || '',
        telefone: perfil?.telefone || '',
        whatsapp: corretor?.whatsapp || '',
        creci: corretor?.creci || '',
        bio: corretor?.bio || '',
        foto_perfil: corretor?.foto_perfil || '',
      });
      setCarregando(false);
    }
    carregar();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function handleFotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('pasta', 'perfis');
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.url) setForm(p => ({ ...p, foto_perfil: data.url }));
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    try {
      await supabase.from('perfis').update({ nome: form.nome, telefone: form.telefone }).eq('id', userId);
      await supabase.from('corretores').update({ whatsapp: form.whatsapp, creci: form.creci, bio: form.bio, foto_perfil: form.foto_perfil }).eq('id', userId);
      toast.success('Perfil atualizado!');
    } catch {
      toast.error('Erro ao salvar perfil');
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) return <div className="p-12 text-center text-slate-400">Carregando...</div>;

  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Meu Perfil</h1>
        <p className="text-slate-500">Atualize suas informações de contato</p>
      </div>

      <form onSubmit={salvar} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-20 h-20 bg-slate-100 rounded-full overflow-hidden flex items-center justify-center">
            {form.foto_perfil
              ? <img src={form.foto_perfil} alt="" className="w-full h-full object-cover" />
              : <Upload size={24} className="text-slate-300" />}
          </div>
          <div>
            <label className="cursor-pointer">
              <span className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm rounded-lg transition-colors">
                Alterar foto
              </span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFotoUpload} />
            </label>
          </div>
        </div>

        {[
          { l: 'Nome completo', n: 'nome', type: 'text' },
          { l: 'Telefone', n: 'telefone', type: 'tel' },
          { l: 'WhatsApp (com DDD)', n: 'whatsapp', type: 'tel' },
          { l: 'CRECI', n: 'creci', type: 'text' },
        ].map(f => (
          <div key={f.n}>
            <label className="block text-sm font-medium text-slate-700 mb-1">{f.l}</label>
            <input name={f.n} type={f.type} value={form[f.n as keyof typeof form]}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Mini bio</label>
          <textarea name="bio" value={form.bio} onChange={handleChange} rows={3}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            placeholder="Fale um pouco sobre você..." />
        </div>

        <button type="submit" disabled={salvando}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 transition-colors">
          {salvando ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {salvando ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </form>
    </div>
  );
}
