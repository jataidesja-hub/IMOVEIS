'use client';

import dynamic from 'next/dynamic';

const FormMapa = dynamic(() => import('./FormMapa'), {
  ssr: false,
  loading: () => (
    <div className="h-[350px] w-full bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-slate-400">
      <span className="text-3xl mb-2">🗺️</span>
      <span className="text-sm font-medium">Carregando mapa interativo...</span>
    </div>
  )
});

export default function FormMapaWrapper(props: any) {
  return <FormMapa {...props} />;
}
