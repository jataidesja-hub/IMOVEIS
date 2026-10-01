'use client';

import dynamic from 'next/dynamic';
import type { ImovelMapItem } from './MapaImoveis';

const MapaImoveis = dynamic(() => import('./MapaImoveis'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] bg-gray-100 rounded-2xl flex items-center justify-center">
      <div className="text-center">
        <span className="text-3xl block mb-2">🗺️</span>
        <span className="text-slate-400">Carregando mapa...</span>
      </div>
    </div>
  ),
});

export default function MapaImoveisWrapper({ imoveis }: { imoveis: ImovelMapItem[] }) {
  return <MapaImoveis imoveis={imoveis} />;
}
