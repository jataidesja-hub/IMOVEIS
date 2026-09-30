'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import {
  Building2, Users, Home, LogOut, Menu, X, Globe
} from 'lucide-react';

export default function GestorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [menuAberto, setMenuAberto] = useState(false);
  const [nomeGestor, setNomeGestor] = useState('');

  useEffect(() => {
    supabase.from('perfis').select('nome').then(({ data }) => {
      if (data?.[0]) setNomeGestor(data[0].nome);
    });
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';

  const navItems = [
    { href: '/gestor', label: 'Dashboard', icon: Home },
    { href: '/gestor/corretores', label: 'Corretores', icon: Users },
    { href: '/gestor/imoveis', label: 'Todos os Imóveis', icon: Building2 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 transform transition-transform duration-300
        ${menuAberto ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex-shrink-0`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">ImóveisApp</p>
                <p className="text-slate-400 text-xs">Painel Gestor</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map(item => (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors
                  ${pathname === item.href
                    ? 'bg-green-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-700 space-y-2">
            <a
              href="/c"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Globe size={16} />
              Ver catálogo público
            </a>
            <div className="px-4 py-2">
              <p className="text-slate-400 text-xs">Gestor</p>
              <p className="text-white text-sm font-medium truncate">{nomeGestor}</p>
            </div>
            <button onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-900/20 transition-colors">
              <LogOut size={16} />
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {menuAberto && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMenuAberto(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between lg:hidden">
          <button onClick={() => setMenuAberto(!menuAberto)} className="text-slate-600">
            {menuAberto ? <X size={24} /> : <Menu size={24} />}
          </button>
          <span className="font-bold text-slate-800">ImóveisApp</span>
          <div className="w-6" />
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
