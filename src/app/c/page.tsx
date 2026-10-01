import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { Imovel, CorretorComPerfil } from '@/types';
import { formatCurrency, tipoLabel } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { Building2, MapPin, Bed, Bath, Car, Ruler, Phone } from 'lucide-react';

export default async function CatalogoGeralPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; finalidade?: string; cidade?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createServerSupabaseClient();

  let query = supabase
    .from('imoveis')
    .select('*, corretor:corretores(*, perfil:perfis(nome, email))')
    .eq('publicado', true)
    .order('destaque', { ascending: false })
    .order('created_at', { ascending: false });

  if (params.tipo) query = query.eq('tipo', params.tipo);
  if (params.finalidade) query = query.eq('finalidade', params.finalidade);
  if (params.cidade) query = query.ilike('cidade', `%${params.cidade}%`);

  const { data: imoveis } = await query;
  const ativos = (imoveis || []).filter((im: Imovel & { corretor: { ativo: boolean; status: string } }) =>
    im.corretor?.ativo && im.corretor?.status === 'aprovado'
  ) as (Imovel & { corretor: CorretorComPerfil })[]; 

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-800">ImóveisApp</span>
          </div>
          <p className="text-slate-500 text-sm hidden sm:block">{ativos.length} imóveis disponíveis</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Quick filter buttons */}
        <div className="flex gap-3 mb-4">
          <a href="/c" className={`px-5 py-2 rounded-full font-semibold text-sm transition-colors border ${!params.finalidade ? 'bg-green-600 text-white border-green-600' : 'bg-white text-slate-600 border-slate-200 hover:border-green-400'}`}>
            Todos
          </a>
          <a href="/c?finalidade=venda" className={`px-5 py-2 rounded-full font-semibold text-sm transition-colors border ${params.finalidade === 'venda' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400'}`}>
            Venda
          </a>
          <a href="/c?finalidade=aluguel" className={`px-5 py-2 rounded-full font-semibold text-sm transition-colors border ${params.finalidade === 'aluguel' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-slate-600 border-slate-200 hover:border-green-400'}`}>
            Aluguel
          </a>
        </div>

        {/* Filters */}
        <form className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <select name="finalidade" defaultValue={params.finalidade || ''}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">Venda ou Aluguel</option>
              <option value="venda">Venda</option>
              <option value="aluguel">Aluguel</option>
            </select>
            <select name="tipo" defaultValue={params.tipo || ''}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">Todos os tipos</option>
              {['casa','apartamento','terreno','comercial','chacara','outros'].map(t => (
                <option key={t} value={t}>{tipoLabel(t)}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <input name="cidade" defaultValue={params.cidade || ''} placeholder="Cidade..."
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              <button type="submit"
                className="px-5 py-2.5 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700">
                Filtrar
              </button>
            </div>
          </div>
        </form>

        {/* Grid */}
        {ativos.length === 0 ? (
          <div className="text-center py-20">
            <Building2 className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600">Nenhum imóvel encontrado</h3>
            <p className="text-slate-400">Tente ajustar os filtros de busca</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {ativos.map(im => (
              <ImovelCard key={im.id} imovel={im} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ImovelCard({ imovel }: { imovel: Imovel & { corretor: CorretorComPerfil } }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
  return (
    <Link href={`/c/${imovel.corretor.slug}/${imovel.codigo}`}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
      <div className="relative h-48 bg-gray-100">
        {imovel.fotos[0] ? (
          <Image src={imovel.fotos[0]} alt={imovel.titulo} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Building2 className="w-12 h-12 text-gray-300" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
            imovel.finalidade === 'venda' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
          }`}>
            {imovel.finalidade === 'venda' ? 'Venda' : 'Aluguel'}
          </span>
        </div>
        {imovel.destaque && (
          <div className="absolute top-3 right-3">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500 text-white">Destaque</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs text-slate-400 font-mono mb-1">{imovel.codigo}</p>
        <h3 className="font-semibold text-slate-800 text-sm line-clamp-2 mb-2">{imovel.titulo}</h3>
        <div className="flex items-center gap-1 text-slate-400 text-xs mb-3">
          <MapPin size={12} />
          <span>{imovel.bairro ? `${imovel.bairro}, ` : ''}{imovel.cidade}/{imovel.estado}</span>
        </div>
        <p className="font-bold text-green-600 text-lg">
          {formatCurrency(imovel.preco)}
          {imovel.finalidade === 'aluguel' && <span className="text-sm font-normal text-slate-400">/mês</span>}
        </p>
        <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
          {imovel.quartos > 0 && <span className="flex items-center gap-1"><Bed size={12} />{imovel.quartos}</span>}
          {imovel.banheiros > 0 && <span className="flex items-center gap-1"><Bath size={12} />{imovel.banheiros}</span>}
          {imovel.vagas_garagem > 0 && <span className="flex items-center gap-1"><Car size={12} />{imovel.vagas_garagem}</span>}
          {imovel.area_total && <span className="flex items-center gap-1"><Ruler size={12} />{imovel.area_total}m²</span>}
        </div>
      </div>
    </Link>
  );
}
