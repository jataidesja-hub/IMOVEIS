'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { Building2, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
      if (error) throw error;

      const { data: perfil } = await supabase
        .from('perfis')
        .select('papel')
        .eq('id', data.user.id)
        .single();

      if (perfil?.papel === 'gestor') router.push('/gestor');
      else if (perfil?.papel === 'corretor') {
        const { data: corretor } = await supabase
          .from('corretores')
          .select('status, ativo')
          .eq('id', data.user.id)
          .single();

        if (corretor?.status === 'pendente') {
          await supabase.auth.signOut();
          toast.error('Seu cadastro ainda não foi aprovado pelo gestor.');
        } else if (corretor?.status === 'rejeitado') {
          await supabase.auth.signOut();
          toast.error('Seu cadastro foi rejeitado. Entre em contato.');
        } else {
          router.push('/corretor');
        }
      } else {
        toast.error('Perfil não encontrado no banco! Verifique se a linha em perfis tem o mesmo ID do seu usuário.');
        await supabase.auth.signOut();
      }
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : 'Erro ao fazer login';
      toast.error(msg === 'Invalid login credentials' ? 'Email ou senha incorretos' : msg);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-green-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-4">
            <Building2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">ImóveisApp</h1>
          <p className="text-slate-500 mt-1">Faça login para continuar</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
            <div className="relative">
              <input
                type={mostrarSenha ? 'text' : 'password'}
                value={senha}
                onChange={e => setSenha(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="text-right">
            <Link href="/esqueci-senha" className="text-sm text-green-600 hover:text-green-700">
              Esqueci minha senha
            </Link>
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {carregando && <Loader2 className="w-4 h-4 animate-spin" />}
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-slate-500 text-sm mt-6">
          Não tem conta?{' '}
          <Link href="/cadastro" className="text-green-600 font-semibold hover:text-green-700">
            Cadastre-se como corretor
          </Link>
        </p>
      </div>
    </div>
  );
}
