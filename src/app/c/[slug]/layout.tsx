import { Metadata } from 'next';
import { createServerSupabaseClient } from '@/lib/supabaseServer';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: corretor } = await supabase
    .from('corretores')
    .select('foto_perfil, perfil:perfis(nome)')
    .eq('slug', slug)
    .single();

  const corretorData = corretor as any;
  const nome = corretorData?.perfil?.nome || 'Corretor';
  const iconUrl = corretorData?.foto_perfil || '/icon-192x192.png';

  return {
    title: `${nome} | Imóveis`,
    description: `Catálogo de imóveis de ${nome}`,
    manifest: `/api/manifest/${slug}`,
    icons: {
      apple: iconUrl,
      icon: iconUrl,
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: nome,
    },
  };
}

export default function CorretorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
