'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { Building2, Loader2, CheckCircle } from 'lucide-react';
import { generateSlug } from '@/lib/utils';

export default function CadastroPage() {
  const router = useRouter();
  const supabase = createClient();
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    telefone: '',
    whatsapp: '',
    cpf: '',
    creci: '',
    bio: '',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);

    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.senha,
        options: {
          data: {
            papel: 'corretor',
            nome: form.nome,
            telefone: form.telefone,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Erro ao criar usuário');

      // 2. Create corretor record
      const slug = generateSlug(form.nome) + '-' + Math.floor(Math.random() * 999);
      const { error: corretorError } = await supabase
        .from('corretores')
        .insert({
          id: authData.user.id,
          slug,
          whatsapp: form.whatsapp || form.telefone,
          cpf: form.cpf,
          creci: form.creci,
          bio: form.bio,
          status: 'pendente',
        });

      if (corretorError) throw corretorError;

      await supabase.auth.signOut();
      setSucesso(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao cadastrar';
      if (msg.includes('already registered')) {
        toast.error('Este email já está cadastrado');
      } else {
        toast.error(msg);
      }
    } finally {
      setCarregando(false);
    }
  }

  if (sucesso) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-green-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Cadastro enviado!</h2>
          <p className="text-slate-500 mb-6">
            Seu cadastro foi recebido e está aguardando aprovação do gestor.
            Você receberá uma notificação quando for aprovado.
          </p>
          <Link
            href="/login"
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-xl transition-colors"
          >
            Voltar ao Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-green-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-2xl mb-3">
            <Building2 className="w-7 h-7 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Cadastro de Corretor</h1>
          <p className="text-slate-500 text-sm mt-1">Preencha seus dados para solicitar acesso</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome completo *</label>
              <input name="nome" required value={form.nome} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="João Silva" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                <input name="email" type="email" required value={form.email} onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="joao@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Senha *</label>
                <input name="senha" type="password" required minLength={6} value={form.senha} onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Mín. 6 caracteres" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Telefone *</label>
                <input name="telefone" required value={form.telefone} onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="(11) 99999-9999" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp *</label>
                <input name="whatsapp" required value={form.whatsapp} onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="(11) 99999-9999" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">CPF</label>
                <input name="cpf" value={form.cpf} onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="000.000.000-00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">CRECI</label>
                <input name="creci" value={form.creci} onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="12345-F" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mini bio / Apresentação</label>
              <textarea name="bio" value={form.bio} onChange={handleChange} rows={2}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                placeholder="Corretor com 10 anos de experiência..." />
            </div>
          </div>

          <button type="submit" disabled={carregando}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
            {carregando && <Loader2 className="w-4 h-4 animate-spin" />}
            {carregando ? 'Enviando...' : 'Solicitar Cadastro'}
          </button>
        </form>

        <p className="text-center text-slate-500 text-sm mt-4">
          Já tem conta?{' '}
          <Link href="/login" className="text-green-600 font-semibold hover:text-green-700">Fazer login</Link>
        </p>
      </div>
    </div>
  );
}
