import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { Imovel, CorretorComPerfil } from '@/types';
import { formatCurrency, tipoLabel, buildWhatsAppLink, formatArea } from '@/lib/utils';
import Image from 'next/image';
import ImageGallery from '@/components/ImageGallery';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft, MapPin, Bed, Bath, Car, Ruler, Phone, Building2,
  CheckCircle, Home, Share2
} from 'lucide-react';

export default async function ImovelPublicoPage({
  params,
}: {
  params: Promise<{ slug: string; codigo: string }>;
}) {
  const { slug, codigo } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: corretor } = await supabase
    .from('corretores')
    .select('*, perfil:perfis(*)')
    .eq('slug', slug)
    .single();

  const { data: imovel } = await supabase
    .from('imoveis')
    .select('*')
    .eq('codigo', codigo)
    .eq('publicado', true)
    .single();

  if (!corretor || !imovel) notFound();

  const c = corretor as CorretorComPerfil;
  const im = imovel as Imovel;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';

  const wppLink = buildWhatsAppLink(c.whatsapp, {
    codigo: im.codigo,
    titulo: im.titulo,
    preco: im.preco,
    finalidade: im.finalidade,
    cidade: im.cidade,
    estado: im.estado,
    slug: c.slug,
  });

  const detalhes = [
    { label: 'Tipo', value: tipoLabel(im.tipo) },
    { label: 'Finalidade', value: im.finalidade === 'venda' ? 'Venda' : 'Aluguel' },
    { label: 'Quartos', value: im.quartos > 0 ? im.quartos : null },
    { label: 'Suítes', value: im.suites > 0 ? im.suites : null },
    { label: 'Banheiros', value: im.banheiros > 0 ? im.banheiros : null },
    { label: 'Vagas', value: im.vagas_garagem > 0 ? im.vagas_garagem : null },
    { label: 'Área Total', value: im.area_total ? formatArea(im.area_total) : null },
    { label: 'Área Construída', value: im.area_construida ? formatArea(im.area_construida) : null },
    { label: 'CEP', value: im.cep || null },
    ...(im.preco_condominio ? [{ label: 'Condomínio', value: formatCurrency(im.preco_condominio) }] : []),
    ...(im.preco_iptu ? [{ label: 'IPTU/ano', value: formatCurrency(im.preco_iptu) }] : []),
  ].filter(d => d.value !== null);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href={`/c/${slug}`} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm">
            <ArrowLeft size={16} /> Voltar
          </Link>
          <div className="flex items-center gap-2">
            <a href={wppLink} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl transition-colors">
              <Phone size={16} /> Falar com Corretor
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Photo Gallery */}
            <ImageGallery fotos={im.fotos} titulo={im.titulo} />

            {/* Title & Price */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      im.finalidade === 'venda' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
                    }`}>
                      {im.finalidade === 'venda' ? 'Venda' : 'Aluguel'}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      {tipoLabel(im.tipo)}
                    </span>
                    {im.destaque && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500 text-white">Destaque</span>
                    )}
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-800">{im.titulo}</h1>
                  <p className="text-xs text-slate-400 font-mono mt-1">Ref: {im.codigo}</p>
                </div>
              </div>

              <p className="text-3xl font-bold text-green-600 mb-1">
                {formatCurrency(im.preco)}
                {im.finalidade === 'aluguel' && <span className="text-lg font-normal text-slate-400">/mês</span>}
              </p>

              {(im.preco_condominio || im.preco_iptu) && (
                <div className="flex gap-4 mt-1">
                  {im.preco_condominio && <p className="text-sm text-slate-500">+ Cond: {formatCurrency(im.preco_condominio)}</p>}
                  {im.preco_iptu && <p className="text-sm text-slate-500">+ IPTU: {formatCurrency(im.preco_iptu)}/ano</p>}
                </div>
              )}

              <div className="flex items-center gap-1 text-slate-500 mt-4">
                <MapPin size={16} className="text-green-600" />
                <span className="text-sm">
                  {[im.endereco, im.numero, im.complemento, im.bairro, im.cidade, im.estado, im.cep]
                    .filter(Boolean).join(', ')}
                </span>
              </div>

              {/* Key features */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-4 border-t border-gray-100">
                {im.quartos > 0 && (
                  <div className="text-center">
                    <Bed className="w-5 h-5 text-green-600 mx-auto mb-1" />
                    <p className="font-bold text-slate-800">{im.quartos}</p>
                    <p className="text-xs text-slate-500">Quartos</p>
                  </div>
                )}
                {im.banheiros > 0 && (
                  <div className="text-center">
                    <Bath className="w-5 h-5 text-green-600 mx-auto mb-1" />
                    <p className="font-bold text-slate-800">{im.banheiros}</p>
                    <p className="text-xs text-slate-500">Banheiros</p>
                  </div>
                )}
                {im.vagas_garagem > 0 && (
                  <div className="text-center">
                    <Car className="w-5 h-5 text-green-600 mx-auto mb-1" />
                    <p className="font-bold text-slate-800">{im.vagas_garagem}</p>
                    <p className="text-xs text-slate-500">Vagas</p>
                  </div>
                )}
                {im.area_total && (
                  <div className="text-center">
                    <Ruler className="w-5 h-5 text-green-600 mx-auto mb-1" />
                    <p className="font-bold text-slate-800">{im.area_total}m²</p>
                    <p className="text-xs text-slate-500">Área total</p>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {im.descricao && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                <h2 className="font-semibold text-slate-800 mb-3">Descrição</h2>
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{im.descricao}</p>
              </div>
            )}

            {/* Features */}
            {(im.caracteristicas || []).length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                <h2 className="font-semibold text-slate-800 mb-4">Características</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(im.caracteristicas || []).map((c, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                      {c}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Details Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-slate-800 mb-4">Detalhes do Imóvel</h2>
              <div className="grid grid-cols-2 gap-3">
                {detalhes.map(d => (
                  <div key={d.label} className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-sm text-slate-500">{d.label}</span>
                    <span className="text-sm font-medium text-slate-800">{String(d.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-20">
              <h3 className="font-semibold text-slate-800 mb-4">Corretor Responsável</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-slate-100 rounded-full overflow-hidden flex-shrink-0">
                  {c.foto_perfil
                    ? <img src={c.foto_perfil} alt="" className="w-full h-full object-cover" />
                    : <Building2 size={20} className="m-auto mt-4 text-slate-400" />}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{c.perfil?.nome || 'Corretor'}</p>
                  {c.creci && <p className="text-xs text-slate-500">CRECI: {c.creci}</p>}
                  {c.bio && <p className="text-xs text-slate-400 mt-1">{c.bio}</p>}
                </div>
              </div>
              <a
                href={wppLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors mb-3"
              >
                <Phone size={18} />
                Falar no WhatsApp
              </a>
              <p className="text-xs text-slate-400 text-center">
                A mensagem será enviada com os dados deste imóvel
              </p>
              <div className="border-t border-gray-100 mt-4 pt-4">
                <Link href={`/c/${slug}`}
                  className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700">
                  <Home size={14} /> Ver todos os imóveis do corretor
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
