import { createServerSupabaseClient } from '@/lib/supabaseServer';
import ImovelFormPage from '@/components/ImovelFormPage';
import { redirect } from 'next/navigation';

export default async function GestorNovoImovel() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Garante que o gestor também tenha um registro na tabela "corretores" para poder adicionar imóveis
  const { data: corretor } = await supabase.from('corretores').select('id').eq('id', user.id).single();
  
  if (!corretor) {
    const { data: perfil } = await supabase.from('perfis').select('nome, telefone').eq('id', user.id).single();
    await supabase.from('corretores').insert({
      id: user.id,
      slug: 'imobiliaria-' + Math.floor(Math.random() * 9999),
      whatsapp: perfil?.telefone || '00000000000',
      status: 'aprovado',
      ativo: true,
      bio: 'Imóveis diretos da Imobiliária'
    });
  }

  return (
    <div className="p-2 sm:p-6">
      <ImovelFormPage modo="criar" retornoUrl="/gestor/imoveis" />
    </div>
  );
}
