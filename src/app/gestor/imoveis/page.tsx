import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { formatCurrency, tipoLabel } from '@/lib/utils';
import { Imovel } from '@/types';
import { Building2 } from 'lucide-react';

export default async function GestorImoveisPage() {
  const supabase = await createServerSupabaseClient();
  const { data: imoveis } = await supabase
    .from('imoveis')
    .select('*, corretor:corretores(*, perfil:perfis(nome))')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Todos os Imóveis</h1>
        <p className="text-slate-500">{imoveis?.length || 0} imóveis no total</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {!imoveis || imoveis.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400">Nenhum imóvel cadastrado</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {(imoveis as (Imovel & { corretor: { perfil: { nome: string } } })[]).map(im => (
              <div key={im.id} className="p-4 flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                  {im.fotos[0]
                    ? <img src={im.fotos[0]} alt="" className="w-full h-full object-cover" />
                    : <Building2 size={24} className="m-auto mt-4 text-gray-300" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 truncate">{im.titulo}</p>
                  <p className="text-sm text-slate-500">
                    {im.codigo} · {tipoLabel(im.tipo)} · {im.cidade}/{im.estado}
                  </p>
                  <p className="text-xs text-slate-400">Corretor: {im.corretor?.perfil?.nome}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold text-green-600">{formatCurrency(im.preco)}</p>
                  <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    im.publicado ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {im.publicado ? 'Publicado' : 'Rascunho'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
