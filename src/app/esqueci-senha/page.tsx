'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { Building2, Loader2, Mail } from 'lucide-react';

export default function EsqueciSenhaPage() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/redefinir-senha`,
      });
      if (error) throw error;
      setEnviado(true);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao enviar email');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-green-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-4">
            {enviado ? <Mail className="w-8 h-8 text-green-600" /> : <Building2 className="w-8 h-8 text-green-600" />}
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            {enviado ? 'Email enviado!' : 'Esqueci minha senha'}
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            {enviado
              ? 'Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.'
              : 'Digite seu email e enviaremos um link para redefinir sua senha.'}
          </p>
        </div>

        {!enviado && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="seu@email.com"
              />
            </div>
            <button type="submit" disabled={carregando}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
              {carregando && <Loader2 className="w-4 h-4 animate-spin" />}
              {carregando ? 'Enviando...' : 'Enviar link'}
            </button>
          </form>
        )}

        <p className="text-center text-slate-500 text-sm mt-6">
          <Link href="/login" className="text-green-600 font-semibold hover:text-green-700">← Voltar ao login</Link>
        </p>
      </div>
    </div>
  );
}
