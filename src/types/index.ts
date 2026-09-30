export type Papel = 'gestor' | 'corretor';
export type StatusCorretor = 'pendente' | 'aprovado' | 'rejeitado';
export type FinalidadeImovel = 'venda' | 'aluguel';
export type TipoImovel = 'casa' | 'apartamento' | 'terreno' | 'comercial' | 'chacara' | 'outros';

export interface Perfil {
  id: string;
  papel: Papel;
  nome: string;
  email: string;
  telefone?: string;
  created_at: string;
}

export interface Corretor {
  id: string;
  perfil?: Perfil;
  cpf?: string;
  creci?: string;
  status: StatusCorretor;
  ativo: boolean;
  slug: string;
  whatsapp: string;
  foto_perfil?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface CorretorComPerfil extends Corretor {
  perfil: Perfil;
}

export interface Imovel {
  id: string;
  corretor_id: string;
  corretor?: CorretorComPerfil;
  codigo: string;
  titulo: string;
  descricao?: string;
  tipo: TipoImovel;
  finalidade: FinalidadeImovel;
  preco: number;
  preco_condominio?: number;
  preco_iptu?: number;
  endereco: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade: string;
  estado: string;
  cep?: string;
  link_mapa?: string;
  latitude?: number;
  longitude?: number;
  quartos: number;
  suites: number;
  banheiros: number;
  vagas_garagem: number;
  area_total?: number;
  area_construida?: number;
  fotos: string[];
  caracteristicas: string[];
  publicado: boolean;
  destaque: boolean;
  created_at: string;
  updated_at: string;
}

export interface ImovelFormData {
  titulo: string;
  descricao: string;
  tipo: TipoImovel;
  finalidade: FinalidadeImovel;
  preco: number;
  preco_condominio?: number;
  preco_iptu?: number;
  endereco: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade: string;
  estado: string;
  cep?: string;
  link_mapa?: string;
  quartos: number;
  suites: number;
  banheiros: number;
  vagas_garagem: number;
  area_total?: number;
  area_construida?: number;
  caracteristicas: string[];
  publicado: boolean;
  destaque: boolean;
}
