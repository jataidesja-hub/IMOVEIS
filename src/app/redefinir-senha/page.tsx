'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { KeyRound, Loader2 } from 'lucide-react';

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const supabase = createClient();
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: senha });
      if (error) throw error;
      toast.success('Senha atualizada com sucesso!');
      router.push('/login');
    } catch (error: any) {
      toast.error('Erro ao atualizar a senha');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 to-green-900">
      <form onSubmit={handleReset} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
            <KeyRound className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Criar nova senha</h2>
        <p className="text-slate-500 text-center text-sm mb-6">Digite sua nova senha abaixo.</p>
        
        <input type="password" required minLength={6} value={senha} onChange={e => setSenha(e.target.value)}
          className="w-full px-4 py-3 border border-slate-200 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Nova senha" />
        
        <button type="submit" disabled={carregando} className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-xl font-semibold flex justify-center items-center gap-2 transition-colors">
          {carregando && <Loader2 className="animate-spin w-4 h-4" />}
          {carregando ? 'Salvando...' : 'Atualizar Senha'}
        </button>
      </form>
    </div>
  );
}
