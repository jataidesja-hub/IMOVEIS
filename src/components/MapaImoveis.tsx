'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

// Fix leaflet default icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export interface ImovelMapItem {
  id: string;
  titulo: string;
  preco: number;
  finalidade: string;
  latitude: number;
  longitude: number;
  slug_corretor: string;
  codigo: string;
  cidade: string;
  estado: string;
}

function criarIcone(finalidade: string) {
  const cor = finalidade === 'venda' ? '#2563eb' : '#16a34a';
  return L.divIcon({
    className: '',
    html: `<div style="
      width:28px;height:28px;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      background:${cor};
      border:3px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.35);
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -30],
  });
}

export default function MapaImoveis({ imoveis }: { imoveis: ImovelMapItem[] }) {
  const comCoordenadas = imoveis.filter(im => im.latitude && im.longitude);

  const centro: [number, number] = comCoordenadas.length > 0
    ? [
        comCoordenadas.reduce((s, im) => s + im.latitude, 0) / comCoordenadas.length,
        comCoordenadas.reduce((s, im) => s + im.longitude, 0) / comCoordenadas.length,
      ]
    : [-14.235, -51.9253]; // Centro do Brasil

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: 500 }}>
      {comCoordenadas.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center bg-gray-50 text-center p-8">
          <span className="text-4xl mb-3">🗺️</span>
          <p className="text-slate-500 font-medium">Nenhum imóvel com localização no mapa</p>
          <p className="text-slate-400 text-sm mt-1">Os imóveis aparecem no mapa após serem salvos com endereço completo</p>
        </div>
      ) : (
        <MapContainer
          center={centro}
          zoom={comCoordenadas.length === 1 ? 14 : 11}
          style={{ width: '100%', height: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {comCoordenadas.map(im => (
            <Marker
              key={im.id}
              position={[im.latitude, im.longitude]}
              icon={criarIcone(im.finalidade)}
            >
              <Popup>
                <div style={{ minWidth: 200 }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '2px 10px',
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 700,
                    marginBottom: 6,
                    background: im.finalidade === 'venda' ? '#2563eb' : '#16a34a',
                    color: 'white',
                  }}>
                    {im.finalidade === 'venda' ? 'Venda' : 'Aluguel'}
                  </span>
                  <p style={{ fontWeight: 700, fontSize: 14, margin: '4px 0' }}>{im.titulo}</p>
                  <p style={{ color: '#555', fontSize: 12, margin: '2px 0' }}>{im.cidade}/{im.estado}</p>
                  <p style={{ color: '#16a34a', fontWeight: 700, fontSize: 16, margin: '6px 0' }}>
                    {formatCurrency(im.preco)}
                    {im.finalidade === 'aluguel' && <span style={{ fontSize: 11, color: '#888', fontWeight: 400 }}>/mês</span>}
                  </p>
                  <a
                    href={`/c/${im.slug_corretor}/${im.codigo}`}
                    style={{
                      display: 'block',
                      textAlign: 'center',
                      background: '#16a34a',
                      color: 'white',
                      padding: '6px 0',
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      textDecoration: 'none',
                      marginTop: 8,
                    }}
                  >
                    Ver imóvel →
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  );
}
