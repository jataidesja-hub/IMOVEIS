'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { generateCodigo, estadosBrasil, tipoLabel } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Loader2, Save, ArrowLeft, Upload, X, Plus } from 'lucide-react';
import Link from 'next/link';

// Formata número como BRL ao digitar: "150000" → "1.500,00"
function formatMoeda(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  const num = parseInt(digits, 10) / 100;
  return num.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}
// Converte BRL formatado de volta para número puro
function parseMoeda(formatted: string): string {
  return formatted.replace(/\./g, '').replace(',', '.');
}

const CARACTERISTICAS_PADRAO = [
  'Piscina', 'Churrasqueira', 'Academia', 'Portaria 24h', 'Elevador',
  'Ar condicionado', 'Varanda', 'Quintal', 'Jardim', 'Gerador',
  'Interfone', 'Câmeras de segurança', 'Fibra óptica', 'Mobiliado',
  'Semi-mobiliado', 'Pet-friendly', 'Acessível PcD'
];

interface Props { modo: 'criar' | 'editar'; }

export default function ImovelFormPage({ modo }: Props) {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();
  const [salvando, setSalvando] = useState(false);
  const [uploadando, setUploadando] = useState(false);
  const [fotos, setFotos] = useState<string[]>([]);
  const [caracteristicasSelecionadas, setCaracteristicasSelecionadas] = useState<string[]>([]);
  const [caracteristicaCustom, setCaracteristicaCustom] = useState('');

  const [form, setForm] = useState({
    titulo: '', descricao: '', tipo: 'casa', finalidade: 'venda',
    preco: '', preco_condominio: '', preco_iptu: '', preco_calcao: '',
    tem_calcao: false,
    endereco: '', numero: '', complemento: '', bairro: '', cidade: '', estado: 'SP', cep: '', link_mapa: '',
    quartos: '0', suites: '0', banheiros: '0', vagas_garagem: '0',
    area_total: '', area_construida: '',
    publicado: false, destaque: false,
  });

  useEffect(() => {
    if (modo === 'editar' && params.id) {
      supabase.from('imoveis').select('*').eq('id', params.id).single().then(({ data }) => {
        const caracteristicas: string[] = data.caracteristicas || [];
        const calcaoItem = caracteristicas.find(c => c.startsWith('Calção:') || c === 'Calção exigido');
        const calcaoValor = calcaoItem?.startsWith('Calção: R$ ') ? calcaoItem.replace('Calção: R$ ', '') : '';

        setForm({
          titulo: data.titulo || '',
          descricao: data.descricao || '',
          tipo: data.tipo,
          finalidade: data.finalidade,
          preco: data.preco ? formatMoeda(String(Math.round(data.preco * 100))) : '',
          preco_condominio: data.preco_condominio ? formatMoeda(String(Math.round(data.preco_condominio * 100))) : '',
          preco_iptu: data.preco_iptu ? formatMoeda(String(Math.round(data.preco_iptu * 100))) : '',
          preco_calcao: calcaoValor,
          tem_calcao: !!calcaoItem,
          endereco: data.endereco || '',
          numero: data.numero || '',
          complemento: data.complemento || '',
          bairro: data.bairro || '',
          cidade: data.cidade || '',
          estado: data.estado || 'SP',
          cep: data.cep || '',
          link_mapa: data.link_mapa || '',
          quartos: String(data.quartos),
          suites: String(data.suites),
          banheiros: String(data.banheiros),
          vagas_garagem: String(data.vagas_garagem),
          area_total: data.area_total ? String(data.area_total) : '',
          area_construida: data.area_construida ? String(data.area_construida) : '',
          publicado: data.publicado,
          destaque: data.destaque,
        });
        setFotos(data.fotos || []);
        setCaracteristicasSelecionadas(caracteristicas.filter(c => !c.startsWith('Calção:')));
      });
    }
  }, [modo, params.id]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    setForm(p => ({
      ...p,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  async function handleFotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadando(true);
    try {
      const urls: string[] = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('pasta', 'imoveis');
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (data.url) {
          urls.push(data.url);
        } else {
          throw new Error(data.error || 'Falha ao receber URL da imagem');
        }
      }
      setFotos(p => [...p, ...urls]);
      toast.success(`${urls.length} foto(s) adicionada(s)`);
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao fazer upload das fotos');
    } finally {
      setUploadando(false);
      e.target.value = '';
    }
  }

  function removerFoto(idx: number) {
    setFotos(p => p.filter((_, i) => i !== idx));
  }

  function toggleCaracteristica(c: string) {
    setCaracteristicasSelecionadas(p =>
      p.includes(c) ? p.filter(x => x !== c) : [...p, c]
    );
  }

  function adicionarCustom() {
    if (!caracteristicaCustom.trim()) return;
    setCaracteristicasSelecionadas(p => [...p, caracteristicaCustom.trim()]);
    setCaracteristicaCustom('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      // Adiciona calção às caracteristicas se marcado
      let caracteristicasFinais = [...caracteristicasSelecionadas].filter(c => !c.startsWith('Calção:'));
      if (form.tem_calcao) {
        const valorCalcao = form.preco_calcao
          ? `Calção: R$ ${form.preco_calcao}`
          : 'Calção exigido';
        caracteristicasFinais.push(valorCalcao);
      }

      const payload = {
        corretor_id: user.id,
        titulo: form.titulo,
        descricao: form.descricao,
        tipo: form.tipo,
        finalidade: form.finalidade,
        preco: parseFloat(parseMoeda(form.preco)) || 0,
        preco_condominio: form.preco_condominio ? parseFloat(parseMoeda(form.preco_condominio)) : null,
        preco_iptu: form.preco_iptu ? parseFloat(parseMoeda(form.preco_iptu)) : null,
        endereco: form.endereco,
        numero: form.numero,
        complemento: form.complemento,
        bairro: form.bairro,
        cidade: form.cidade,
        estado: form.estado,
        cep: form.cep,
        quartos: Number(form.quartos),
        suites: Number(form.suites),
        banheiros: Number(form.banheiros),
        vagas_garagem: Number(form.vagas_garagem),
        area_total: form.area_total ? Number(form.area_total) : null,
        area_construida: form.area_construida ? Number(form.area_construida) : null,
        fotos,
        caracteristicas: caracteristicasFinais,
        publicado: form.publicado,
        destaque: form.destaque,
      };

      if (modo === 'criar') {
        const codigo = generateCodigo(form.tipo);
        const { error } = await supabase.from('imoveis').insert({ ...payload, codigo });
        if (error) throw error;
        toast.success('Imóvel publicado com sucesso!');
      } else {
        const { error } = await supabase.from('imoveis').update(payload).eq('id', params.id);
        if (error) throw error;
        toast.success('Imóvel atualizado!');
      }

      router.push('/corretor/imoveis');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSalvando(false);
    }
  }

  const estados = estadosBrasil();

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/corretor/imoveis" className="flex items-center gap-2 text-slate-500 hover:text-slate-700">
          <ArrowLeft size={18} /> Voltar
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">
          {modo === 'criar' ? 'Novo Imóvel' : 'Editar Imóvel'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tipo e Finalidade */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-slate-800 mb-4">Tipo e Finalidade</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Imóvel *</label>
              <select name="tipo" value={form.tipo} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
                {['casa','apartamento','terreno','comercial','chacara','outros'].map(t => (
                  <option key={t} value={t}>{tipoLabel(t)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Finalidade *</label>
              <select name="finalidade" value={form.finalidade} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
                <option value="venda">Venda</option>
                <option value="aluguel">Aluguel</option>
              </select>
            </div>
          </div>
        </div>

        {/* Informações básicas */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-slate-800 mb-4">Informações Básicas</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Título *</label>
              <input name="titulo" required value={form.titulo} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Casa com 3 quartos em condomínio fechado" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
              <textarea name="descricao" value={form.descricao} onChange={handleChange} rows={4}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                placeholder="Descreva o imóvel em detalhes..." />
            </div>
          </div>
        </div>

        {/* Preços */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-slate-800 mb-4">Preços</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {form.finalidade === 'aluguel' ? 'Valor do Aluguel (R$) *' : 'Preço de Venda (R$) *'}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">R$</span>
                <input
                  name="preco" required
                  value={form.preco}
                  onChange={e => setForm(p => ({ ...p, preco: formatMoeda(e.target.value) }))}
                  inputMode="numeric"
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0,00" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Condomínio (R$)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">R$</span>
                <input
                  name="preco_condominio"
                  value={form.preco_condominio}
                  onChange={e => setForm(p => ({ ...p, preco_condominio: formatMoeda(e.target.value) }))}
                  inputMode="numeric"
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0,00" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">IPTU anual (R$)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">R$</span>
                <input
                  name="preco_iptu"
                  value={form.preco_iptu}
                  onChange={e => setForm(p => ({ ...p, preco_iptu: formatMoeda(e.target.value) }))}
                  inputMode="numeric"
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0,00" />
              </div>
            </div>
          </div>

          {/* Calção — só aparece se finalidade for aluguel */}
          {form.finalidade === 'aluguel' && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <label className="flex items-center gap-3 cursor-pointer mb-3">
                <input type="checkbox" name="tem_calcao" checked={form.tem_calcao}
                  onChange={e => setForm(p => ({ ...p, tem_calcao: e.target.checked }))}
                  className="w-5 h-5 rounded accent-green-600" />
                <div>
                  <p className="font-medium text-slate-700">Exige calção</p>
                  <p className="text-xs text-slate-500">Marque se o imóvel exige calção (caução)</p>
                </div>
              </label>
              {form.tem_calcao && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Valor do Calção (R$)</label>
                  <div className="relative max-w-xs">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">R$</span>
                    <input
                      value={form.preco_calcao}
                      onChange={e => setForm(p => ({ ...p, preco_calcao: formatMoeda(e.target.value) }))}
                      inputMode="numeric"
                      className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0,00" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Localização */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-slate-800 mb-4">Localização</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Endereço (rua/av) *</label>
              <input name="endereco" required value={form.endereco} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Rua das Flores" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Número</label>
              <input name="numero" value={form.numero} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="123" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Complemento</label>
              <input name="complemento" value={form.complemento} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Apto 42" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Bairro</label>
              <input name="bairro" value={form.bairro} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Centro" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">CEP</label>
              <input name="cep" value={form.cep} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="00000-000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cidade *</label>
              <input name="cidade" required value={form.cidade} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="São Paulo" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Estado *</label>
              <select name="estado" value={form.estado} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
                {estados.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Link do Google Maps</label>
              <input name="link_mapa" value={form.link_mapa} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Cole o link do Google Maps (compartilhar > copiar link)" />
            </div>
          </div>
        </div>

        {/* Características físicas */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-slate-800 mb-4">Detalhes do Imóvel</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { l: 'Quartos', n: 'quartos' },
              { l: 'Suítes', n: 'suites' },
              { l: 'Banheiros', n: 'banheiros' },
              { l: 'Vagas de Garagem', n: 'vagas_garagem' },
              { l: 'Área Total (m²)', n: 'area_total' },
              { l: 'Área Construída (m²)', n: 'area_construida' },
            ].map(f => (
              <div key={f.n}>
                <label className="block text-sm font-medium text-slate-700 mb-1">{f.l}</label>
                <input name={f.n} type="number" min="0" value={form[f.n as keyof typeof form] as string}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0" />
              </div>
            ))}
          </div>
        </div>

        {/* Fotos */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-slate-800 mb-4">Fotos</h2>
          <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-colors ${
            uploadando ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-green-400 hover:bg-green-50'
          }`}>
            <Upload className={`w-8 h-8 mb-2 ${uploadando ? 'text-green-500 animate-bounce' : 'text-gray-400'}`} />
            <span className="text-sm text-slate-500">{uploadando ? 'Enviando...' : 'Clique ou arraste fotos aqui'}</span>
            <span className="text-xs text-slate-400 mt-1">JPG, PNG, WebP até 10MB cada</span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleFotoUpload} disabled={uploadando} />
          </label>

          {fotos.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
              {fotos.map((foto, i) => (
                <div key={i} className="relative group">
                  <img src={foto} alt="" className="w-full h-24 object-cover rounded-xl" />
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-green-600 text-white text-xs rounded">Capa</span>
                  )}
                  <button type="button" onClick={() => removerFoto(i)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Características */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-slate-800 mb-4">Características e Comodidades</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {CARACTERISTICAS_PADRAO.map(c => (
              <button
                key={c} type="button"
                onClick={() => toggleCaracteristica(c)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors border ${
                  caracteristicasSelecionadas.includes(c)
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-green-400'
                }`}>
                {c}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={caracteristicaCustom}
              onChange={e => setCaracteristicaCustom(e.target.value)}
              placeholder="Adicionar outra característica..."
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), adicionarCustom())}
            />
            <button type="button" onClick={adicionarCustom}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1 text-sm">
              <Plus size={14} /> Adicionar
            </button>
          </div>
          {caracteristicasSelecionadas.filter(c => !CARACTERISTICAS_PADRAO.includes(c)).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {caracteristicasSelecionadas.filter(c => !CARACTERISTICAS_PADRAO.includes(c)).map(c => (
                <span key={c} className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  {c}
                  <button type="button" onClick={() => toggleCaracteristica(c)}><X size={12} /></button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Publicação */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-slate-800 mb-4">Publicação</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="publicado" checked={form.publicado}
                onChange={handleChange} className="w-5 h-5 rounded accent-green-600" />
              <div>
                <p className="font-medium text-slate-700">Publicar imóvel</p>
                <p className="text-xs text-slate-500">O imóvel ficará visível no catálogo público</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="destaque" checked={form.destaque}
                onChange={handleChange} className="w-5 h-5 rounded accent-green-600" />
              <div>
                <p className="font-medium text-slate-700">Imóvel em destaque</p>
                <p className="text-xs text-slate-500">Aparece no topo do catálogo</p>
              </div>
            </label>
          </div>
        </div>

        <div className="flex gap-4 pb-8">
          <Link href="/corretor/imoveis"
            className="flex-1 py-3 border border-slate-200 text-slate-600 font-semibold rounded-xl text-center hover:bg-slate-50 transition-colors">
            Cancelar
          </Link>
          <button type="submit" disabled={salvando}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 transition-colors">
            {salvando ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {salvando ? 'Salvando...' : (modo === 'criar' ? 'Publicar Imóvel' : 'Salvar Alterações')}
          </button>
        </div>
      </form>
    </div>
  );
}
