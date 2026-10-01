import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { Imovel, CorretorComPerfil } from '@/types';
import { formatCurrency, tipoLabel } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { Building2, MapPin, Bed, Bath, Car, Ruler, Phone, ArrowLeft, Map } from 'lucide-react';
import MapaImoveisWrapper from '@/components/MapaImoveisWrapper';

export const dynamic = 'force-dynamic';

export default async function CatalogoCorretorPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ finalidade?: string; mapa?: string }>;
}) {
  try {
    const { slug } = await params;
    const { finalidade, mapa } = await searchParams;
    const visuMapa = mapa === '1';
    const supabase = await createServerSupabaseClient();

    const { data: corretor, error } = await supabase
      .from('corretores')
      .select('*, perfil:perfis(*)')
      .eq('slug', slug)
      .eq('ativo', true)
      .eq('status', 'aprovado')
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error('Supabase error: ' + error.message);
    }

    if (!corretor) return (
      <div className="p-10 text-center">
        <h2>Corretor não encontrado: {slug}</h2>
        <Link href="/c" className="text-blue-500">Voltar</Link>
      </div>
    );

    let query = supabase
      .from('imoveis')
      .select('*')
      .eq('corretor_id', corretor.id)
      .eq('publicado', true)
      .order('destaque', { ascending: false })
      .order('created_at', { ascending: false });

    if (finalidade) query = query.eq('finalidade', finalidade);

    const { data: imoveis } = await query;
    const c = corretor as CorretorComPerfil;

    const total = (imoveis || []).length;

    const dadosMapa = (imoveis || [])
      .filter((im: any) => im.latitude && im.longitude)
      .map((im: any) => ({
        id: im.id, titulo: im.titulo, preco: im.preco, finalidade: im.finalidade,
        latitude: Number(im.latitude), longitude: Number(im.longitude),
        slug_corretor: slug, codigo: im.codigo, cidade: im.cidade, estado: im.estado,
      }));

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <Link href="/c" className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm mb-4">
            <ArrowLeft size={16} /> Ver todos os imóveis
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full overflow-hidden flex-shrink-0">
              {c.foto_perfil
                ? <img src={c.foto_perfil} alt="" className="w-full h-full object-cover" />
                : <Building2 size={24} className="m-auto mt-4 text-slate-400" />}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">{c.perfil?.nome || 'Corretor'}</h1>
              {c.creci && <p className="text-sm text-slate-500">CRECI: {c.creci}</p>}
              {c.bio && <p className="text-sm text-slate-500 mt-1">{c.bio}</p>}
            </div>
            <a
              href={`https://wa.me/55${(c.whatsapp || '').replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl transition-colors"
            >
              <Phone size={16} /> WhatsApp
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Quick filter buttons + Map toggle */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <a href={`/c/${slug}${visuMapa ? '?mapa=1' : ''}`} className={`px-5 py-2 rounded-full font-semibold text-sm transition-colors border ${!finalidade ? 'bg-green-600 text-white border-green-600' : 'bg-white text-slate-600 border-slate-200 hover:border-green-400'}`}>
            Todos
          </a>
          <a href={`/c/${slug}?finalidade=venda${visuMapa ? '&mapa=1' : ''}`} className={`px-5 py-2 rounded-full font-semibold text-sm transition-colors border ${finalidade === 'venda' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400'}`}>
            Venda
          </a>
          <a href={`/c/${slug}?finalidade=aluguel${visuMapa ? '&mapa=1' : ''}`} className={`px-5 py-2 rounded-full font-semibold text-sm transition-colors border ${finalidade === 'aluguel' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-slate-600 border-slate-200 hover:border-green-400'}`}>
            Aluguel
          </a>
          <div className="flex-1" />
          <a href={`/c/${slug}?${finalidade ? `finalidade=${finalidade}&` : ''}${visuMapa ? '' : 'mapa=1'}`}
            className={`flex items-center gap-2 px-5 py-2 rounded-full font-semibold text-sm transition-colors border ${visuMapa ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}>
            <Map size={15} />
            {visuMapa ? 'Ver Lista' : 'Ver Mapa'}
          </a>
        </div>

        <h2 className="text-lg font-semibold text-slate-700 mb-6">
          {total} {finalidade ? (finalidade === 'venda' ? 'imóveis à venda' : 'imóveis para aluguel') : 'imóveis disponíveis'}
        </h2>

        {visuMapa ? (
          <MapaImoveisWrapper imoveis={dadosMapa} />
        ) : !imoveis || imoveis.length === 0 ? (
          <div className="text-center py-16">
            <Building2 className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400">Nenhum imóvel disponível no momento</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(imoveis as Imovel[]).map(im => (
              <Link key={im.id} href={`/c/${slug}/${im.codigo}`}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
                <div className="relative h-48 bg-gray-100">
                  {(im.fotos || [])[0] ? (
                    <Image src={(im.fotos || [])[0]} alt={im.titulo} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Building2 className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      im.finalidade === 'venda' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
                    }`}>
                      {im.finalidade === 'venda' ? 'Venda' : 'Aluguel'}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs text-slate-400 font-mono mb-1">{im.codigo}</p>
                  <h3 className="font-semibold text-slate-800 text-sm line-clamp-2 mb-2">{im.titulo}</h3>
                  <div className="flex items-center gap-1 text-slate-400 text-xs mb-2">
                    <MapPin size={12} />
                    <span>{im.cidade}/{im.estado}</span>
                  </div>
                  <p className="font-bold text-green-600">
                    {formatCurrency(im.preco)}
                    {im.finalidade === 'aluguel' && <span className="text-xs font-normal text-slate-400">/mês</span>}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                    {im.quartos > 0 && <span className="flex items-center gap-1"><Bed size={12} />{im.quartos}</span>}
                    {im.banheiros > 0 && <span className="flex items-center gap-1"><Bath size={12} />{im.banheiros}</span>}
                    {im.vagas_garagem > 0 && <span className="flex items-center gap-1"><Car size={12} />{im.vagas_garagem}</span>}
                    {im.area_total && <span className="flex items-center gap-1"><Ruler size={12} />{im.area_total}m²</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
  } catch (err: any) {
    return (
      <div className="p-10 text-center">
        <h2>Erro na Renderização</h2>
        <p className="text-red-500 font-mono text-xs">{err.message}</p>
      </div>
    );
  }
}
