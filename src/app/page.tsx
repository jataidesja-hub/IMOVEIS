import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabaseServer';

export default async function HomePage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: perfil } = await supabase
    .from('perfis')
    .select('papel')
    .eq('id', user.id)
    .single();

  if (perfil?.papel === 'gestor') redirect('/gestor');
  if (perfil?.papel === 'corretor') redirect('/corretor');

  redirect('/login');
}
