export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatArea(value?: number): string {
  if (!value) return '-';
  return `${value.toLocaleString('pt-BR')} m²`;
}

export function generateSlug(nome: string): string {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function generateCodigo(tipo: string): string {
  const prefixos: Record<string, string> = {
    casa: 'CSA',
    apartamento: 'APT',
    terreno: 'TER',
    comercial: 'COM',
    chacara: 'CHA',
    outros: 'OUT',
  };
  const prefixo = prefixos[tipo] || 'IMO';
  const ano = new Date().getFullYear();
  const random = Math.floor(Math.random() * 90000) + 10000;
  return `${prefixo}-${ano}-${random}`;
}

export function formatWhatsApp(numero: string): string {
  return numero.replace(/\D/g, '');
}

export function buildWhatsAppLink(whatsapp: string, imovel: {
  codigo: string;
  titulo: string;
  preco: number;
  finalidade: string;
  cidade: string;
  estado: string;
  slug?: string;
}): string {
  const numero = formatWhatsApp(whatsapp);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://imoveis.vercel.app';
  const link = imovel.slug
    ? `${siteUrl}/c/${imovel.slug}/${imovel.codigo}`
    : `${siteUrl}/c`;
  const finalidade = imovel.finalidade === 'venda' ? 'Venda' : 'Aluguel';
  const mensagem = encodeURIComponent(
    `Olá! Tenho interesse no imóvel a seguir:\n\n` +
    `📋 Código: ${imovel.codigo}\n` +
    `🏠 ${imovel.titulo}\n` +
    `📍 ${imovel.cidade}/${imovel.estado}\n` +
    `💰 ${finalidade}: ${formatCurrency(imovel.preco)}\n` +
    `🔗 Ver imóvel: ${link}\n\n` +
    `Poderia me dar mais informações?`
  );
  return `https://wa.me/55${numero}?text=${mensagem}`;
}

export function tipoLabel(tipo: string): string {
  const labels: Record<string, string> = {
    casa: 'Casa',
    apartamento: 'Apartamento',
    terreno: 'Terreno',
    comercial: 'Comercial',
    chacara: 'Chácara',
    outros: 'Outros',
  };
  return labels[tipo] || tipo;
}

export function estadosBrasil(): string[] {
  return [
    'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA',
    'MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN',
    'RS','RO','RR','SC','SP','SE','TO'
  ];
}
