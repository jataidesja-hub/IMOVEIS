'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Search } from 'lucide-react';

// Correção dos ícones padrão do Leaflet no Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function ClickHandler({ setPos }: { setPos: (pos: L.LatLng) => void }) {
  useMapEvents({
    click(e) {
      setPos(e.latlng);
    },
  });
  return null;
}

function MapUpdater({ center, zoom }: { center: [number, number] | null, zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

interface Props {
  lat: string;
  lng: string;
  onChange: (lat: string, lng: string) => void;
  enderecoBusca?: string;
}

export default function FormMapa({ lat, lng, onChange, enderecoBusca }: Props) {
  const [pos, setPos] = useState<L.LatLng | null>(null);
  const [centro, setCentro] = useState<[number, number]>([-14.235, -51.9253]);
  const [zoom, setZoom] = useState(4);
  const [buscando, setBuscando] = useState(false);

  // Inicializa a posição se já vier preenchida (edição)
  useEffect(() => {
    if (lat && lng && !pos) {
      const p = new L.LatLng(parseFloat(lat), parseFloat(lng));
      setPos(p);
      setCentro([p.lat, p.lng]);
      setZoom(16);
    }
  }, [lat, lng]); // eslint-disable-line

  // Atualiza o formulário pai quando o pino muda
  useEffect(() => {
    if (pos) {
      onChange(pos.lat.toString(), pos.lng.toString());
    }
  }, [pos]); // eslint-disable-line

  function geolocate() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const p = new L.LatLng(position.coords.latitude, position.coords.longitude);
        setPos(p);
        setCentro([p.lat, p.lng]);
        setZoom(17);
      });
    }
  }

  async function buscarEnderecoNoMapa() {
    if (!enderecoBusca) return;
    setBuscando(true);
    try {
      // Faz uma busca genérica usando a rota que já criamos
      const res = await fetch('/api/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          // manda tudo num campo só para facilitar, ou divide se o chamador mandar formatado
          cidade: enderecoBusca 
        })
      });
      const data = await res.json();
      if (data.lat) {
        setCentro([data.lat, data.lon]);
        setZoom(14);
      }
    } catch {
      // ignora
    } finally {
      setBuscando(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <label className="block text-sm font-medium text-slate-700">
          📍 Localização Exata no Mapa
          <span className="block font-normal text-xs text-slate-500 mt-0.5">
            Clique no mapa para posicionar o pino exatamente onde fica o imóvel.
          </span>
        </label>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            type="button" 
            onClick={buscarEnderecoNoMapa} 
            disabled={!enderecoBusca || buscando}
            className="flex-1 sm:flex-none text-xs flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 px-3 py-2 rounded-lg font-medium transition-colors"
          >
            <Search size={14} /> Aproximar da Cidade
          </button>
          <button 
            type="button" 
            onClick={geolocate} 
            className="flex-1 sm:flex-none text-xs flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg font-medium transition-colors"
          >
            <Navigation size={14} /> Usar meu GPS
          </button>
        </div>
      </div>
      
      <div className="rounded-xl overflow-hidden border border-slate-200 shadow-inner relative z-0" style={{ height: 350 }}>
        <MapContainer center={centro} zoom={zoom} style={{ width: '100%', height: '100%' }}>
          <TileLayer 
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
          />
          <ClickHandler setPos={setPos} />
          <MapUpdater center={centro} zoom={zoom} />
          {pos && <Marker position={pos} />}
        </MapContainer>
        
        {!pos && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] bg-white/95 backdrop-blur px-5 py-2.5 rounded-full shadow-lg pointer-events-none border border-green-200 text-sm font-medium text-slate-700 flex items-center gap-2 whitespace-nowrap">
            <MapPin size={18} className="text-green-600 animate-bounce" /> 
            Clique no mapa para colocar o pino
          </div>
        )}
      </div>
    </div>
  );
}
