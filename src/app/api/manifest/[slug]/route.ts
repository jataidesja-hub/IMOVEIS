import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServer';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: corretor } = await supabase
    .from('corretores')
    .select('foto_perfil, perfil:perfis(nome)')
    .eq('slug', slug)
    .single();

  const nome = corretor?.perfil?.nome || 'Imóveis';
  const shortName = nome.split(' ')[0] || 'Imóveis';
  const iconUrl = corretor?.foto_perfil || '/icon-192x192.png'; // fallback se não tiver

  const manifest = {
    name: `Imóveis - ${nome}`,
    short_name: shortName,
    description: `Catálogo de imóveis de ${nome}`,
    start_url: `/c/${slug}`,
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: '#16a34a',
    icons: [
      {
        src: iconUrl,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: iconUrl,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ]
  };

  return new NextResponse(JSON.stringify(manifest), {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
